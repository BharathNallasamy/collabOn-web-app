import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Calendar, User, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";

// ── Animation styles ──────────────────────────────────────────────────────────
const ANIM_STYLES = `
  @keyframes ed-bounce-warn { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.22);opacity:1} 70%{transform:scale(0.88)} 85%{transform:scale(1.06)} 100%{transform:scale(1)} }
  @keyframes ed-pulse-excl  { 0%,100%{transform:scaleY(1)} 30%{transform:scaleY(1.18)} 60%{transform:scaleY(0.88)} }
  @keyframes ed-pop-in      { 0%{transform:scale(0);opacity:0} 55%{transform:scale(1.18);opacity:1} 75%{transform:scale(0.92)} 100%{transform:scale(1)} }
  @keyframes ed-draw-check  { 0%{stroke-dashoffset:60;opacity:0} 25%{opacity:1} 100%{stroke-dashoffset:0;opacity:1} }
  @keyframes ed-pop-reject  { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.2);opacity:1} 75%{transform:scale(0.9)} 100%{transform:scale(1)} }
`;

// ── Types ─────────────────────────────────────────────────────────────────────
type EventStatus = "Pending" | "Approved" | "Rejected";

interface EventData {
  id: string;
  title: string;
  type: string;
  date: string;
  author: string;
  status: EventStatus;
  description: string;
  department: string;
  mode: "Offline" | "Online";
  location: string;
  isLink?: boolean;
  chiefGuest?: string;
  moderatorComment?: string;
}

// ── Mock Event Data keyed by ID ───────────────────────────────────────────────
const MOCK_EVENTS: Record<string, EventData> = {
  "1": {
    id: "1", title: "Generative AI Workshop", type: "Workshop", date: "22/04/2026",
    author: "Karthik", status: "Pending",
    description: "A Workshop On Generative AI And Its Applications In The Modern World. All Students Are Requested To Attend.",
    department: "Computer Science", mode: "Offline", location: "Auditorium A",
    chiefGuest: "Dr. Alan Turing (AI Persona)",
  },
  "2": {
    id: "2", title: "Data Engineer Bootcamp", type: "Seminar", date: "22/04/2026",
    author: "Karthik", status: "Approved",
    description: "A Comprehensive Bootcamp On Data Engineering Pipelines And Tools.",
    department: "Information Technology", mode: "Online", location: "https://zoom.us/j/8644675", isLink: true,
  },
  "3": {
    id: "3", title: "Republic Day Celebration", type: "Cultural Event", date: "22/04/2026",
    author: "Admin", status: "Approved",
    description: "Republic Day Celebration For All Staff And Students. Attendance Is Mandatory.",
    department: "All Departments", mode: "Offline", location: "Main Ground",
  },
  "4": {
    id: "4", title: "AI Conference", type: "Conference", date: "22/04/2026",
    author: "Karthik", status: "Pending",
    description: "An International Conference On Artificial Intelligence And Machine Learning.",
    department: "Computer Science", mode: "Online", location: "https://zoom.us/j/9988776", isLink: true,
  },
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: EventStatus }) => {
  const map: Record<EventStatus, string> = {
    Pending:  "bg-orange-50 text-orange-500 border border-orange-200",
    Approved: "bg-green-50 text-green-600 border border-green-200",
    Rejected: "bg-red-50 text-red-500 border border-red-200",
  };
  const labels: Record<EventStatus, string> = {
    Pending: "Pending Review", Approved: "Approved", Rejected: "Rejected",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {labels[status]}
    </span>
  );
};

// ── Warn Dialog (approve / reject / cancel confirmations) ─────────────────────
const WarnDialog = ({ title, message, onNo, onYes }: {
  title: string; message: string; onNo: () => void; onYes: () => void;
}) => createPortal(
  <>
    <style>{ANIM_STYLES}</style>
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">{title}</h3>
          <button onClick={onNo} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center py-8 px-5 gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30"
            style={{ animation: "ed-bounce-warn 0.55s cubic-bezier(0.36,0.07,0.19,0.97) both" }}>
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"
              style={{ animation: "ed-pulse-excl 1.2s ease-in-out 0.6s infinite" }}>
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5a1 1 0 011 1v5a1 1 0 01-2 0V8a1 1 0 011-1zm0 10a1.25 1.25 0 110-2.5A1.25 1.25 0 0112 17z" />
            </svg>
          </div>
          <p className="text-[13px] font-medium text-gray-700 text-center">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-gray-100">
          <button onClick={onNo} className="h-9 px-5 rounded-lg border border-gray-300 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">No</button>
          <button onClick={onYes} className="h-9 px-5 rounded-lg bg-[#1D6BA3] text-white text-[12px] font-semibold hover:bg-[#1558a0] transition-colors">Yes</button>
        </div>
      </div>
    </div>
  </>,
  document.body
);

// ── Approve Success Dialog ─────────────────────────────────────────────────────
const ApproveSuccessDialog = ({ onClose }: { onClose: () => void }) => createPortal(
  <>
    <style>{ANIM_STYLES}</style>
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Approve Event?</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center py-8 px-5 gap-3">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
            style={{ animation: "ed-pop-in 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both" }}>
            <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
              style={{ strokeDasharray: 60, animation: "ed-draw-check 0.45s ease 0.3s both" }}>
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">Event Approved Successfully</p>
        </div>
      </div>
    </div>
  </>,
  document.body
);

// ── Reject Reason Dialog ──────────────────────────────────────────────────────
const RejectReasonDialog = ({ value, onChange, onCancel, onSubmit }: {
  value: string; onChange: (v: string) => void; onCancel: () => void; onSubmit: () => void;
}) => createPortal(
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-96 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-[14px] font-bold text-gray-900">Reason for Rejection</h3>
        <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="px-5 py-5">
        <label className="block text-[12px] font-semibold text-gray-600 mb-2">Reason <span className="text-red-400">*</span></label>
        <textarea placeholder="Enter reason for rejection..." value={value} onChange={(e) => onChange(e.target.value)} rows={4}
          className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] resize-none" />
      </div>
      <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
        <button onClick={onCancel} className="h-9 px-5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
        <button onClick={onSubmit} disabled={!value.trim()}
          className="h-9 px-5 rounded-lg bg-red-500 text-white text-[12px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          Submit
        </button>
      </div>
    </div>
  </div>,
  document.body
);

// ── Reject Success Dialog ─────────────────────────────────────────────────────
const RejectSuccessDialog = ({ onClose }: { onClose: () => void }) => createPortal(
  <>
    <style>{ANIM_STYLES}</style>
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Reject Event?</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center py-8 px-5 gap-3">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30"
            style={{ animation: "ed-pop-reject 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both" }}>
            <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">Event Rejected Successfully</p>
        </div>
      </div>
    </div>
  </>,
  document.body
);

// ── Cancel Reason Dialog ──────────────────────────────────────────────────────
const CancelReasonDialog = ({ value, onChange, notify, onNotifyToggle, onCancel, onSubmit }: {
  value: string; onChange: (v: string) => void;
  notify: boolean; onNotifyToggle: () => void;
  onCancel: () => void; onSubmit: () => void;
}) => createPortal(
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-96 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-[14px] font-bold text-gray-900">Cancellation Reason</h3>
        <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="px-5 py-5 space-y-4">
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-2">Reason for Cancel Event</label>
          <textarea placeholder="Enter" value={value} onChange={(e) => onChange(e.target.value)} rows={4}
            className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] resize-none" />
        </div>
        <div className="flex items-center justify-between bg-[#EFF6FF] border border-blue-100 rounded-lg px-4 py-3">
          <span className="text-sm font-semibold text-[#1D6BA3]">Notify Users</span>
          <button type="button" onClick={onNotifyToggle}
            className={`w-10 h-5 rounded-full relative transition-colors ${notify ? "bg-[#1D6BA3]" : "bg-gray-300"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notify ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
        <button onClick={onCancel} className="h-9 px-5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors">No</button>
        <button onClick={onSubmit} disabled={!value.trim()}
          className="h-9 px-5 rounded-lg bg-[#1D6BA3] text-white text-[12px] font-semibold hover:bg-[#1558a0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          Yes
        </button>
      </div>
    </div>
  </div>,
  document.body
);

// ── Cancel Success Dialog ─────────────────────────────────────────────────────
const CancelSuccessDialog = ({ onClose }: { onClose: () => void }) => createPortal(
  <>
    <style>{ANIM_STYLES}</style>
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Event Cancelled</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center py-8 px-5 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-500 flex items-center justify-center shadow-lg shadow-gray-500/30"
            style={{ animation: "ed-pop-in 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both" }}>
            <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">Event Canceled Successfully</p>
        </div>
      </div>
    </div>
  </>,
  document.body
);

// ── Main Component ─────────────────────────────────────────────────────────────
const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const event = MOCK_EVENTS[id ?? "1"] ?? MOCK_EVENTS["1"];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Approve flow
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);

  // Reject flow
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [rejectReason,  setRejectReason]  = useState(false);
  const [rejectText,    setRejectText]    = useState("");
  const [rejectSuccess, setRejectSuccess] = useState(false);

  // Cancel flow
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelReason,  setCancelReason]  = useState(false);
  const [cancelText,    setCancelText]    = useState("");
  const [cancelNotify,  setCancelNotify]  = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const resetAll = () => {
    setApproveConfirm(false); setApproveSuccess(false);
    setRejectConfirm(false);  setRejectReason(false);  setRejectSuccess(false); setRejectText("");
    setCancelConfirm(false);  setCancelReason(false);  setCancelSuccess(false);
    setCancelText(""); setCancelNotify(false);
  };

  const handleApproveYes = () => {
    setApproveConfirm(false);
    setApproveSuccess(true);
    setTimeout(() => { setApproveSuccess(false); navigate("/layout/campus-comms/event-management"); }, 1800);
  };

  const handleRejectConfirmYes = () => { setRejectConfirm(false); setRejectReason(true); };
  const handleRejectSubmit = () => {
    setRejectReason(false);
    setRejectSuccess(true);
    setTimeout(() => { setRejectSuccess(false); setRejectText(""); navigate("/layout/campus-comms/event-management"); }, 1800);
  };

  const handleCancelConfirmYes = () => { setCancelConfirm(false); setCancelReason(true); };
  const handleCancelSubmit = () => {
    setCancelReason(false);
    setCancelSuccess(true);
    setTimeout(() => { setCancelSuccess(false); setCancelText(""); setCancelNotify(false); navigate("/layout/campus-comms/event-management"); }, 1800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const BANNER_GRADIENT: Record<string, string> = {
    Workshop:       "from-[#1a0533] via-[#6B27C2] to-[#C0098C]",
    Seminar:        "from-[#0F2460] via-[#1D6BA3] to-[#1A3A8A]",
    Conference:     "from-[#1a0533] via-[#6B27C2] to-[#C0098C]",
    "Cultural Event": "from-[#0F4C1F] via-[#1D9A50] to-[#0D7A40]",
  };
  const gradient = BANNER_GRADIENT[event.type] ?? "from-[#0F2460] via-[#1D6BA3] to-[#1A3A8A]";

  return (
    <div className="space-y-4">
      <Card noPadding className="border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <button onClick={() => navigate("/layout/campus-comms/event-management")}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Event Details</h1>
        </div>

        {/* Banner */}
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-3">Upload Feed Photo</p>
          <div
            className={`w-64 h-44 rounded-xl overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center relative cursor-pointer border border-gray-200`}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadedImage ? (
              <img src={uploadedImage} alt="Event banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 256 176" preserveAspectRatio="none">
                  <defs>
                    <pattern id="egrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.3" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#egrid)" />
                </svg>
                {event.type === "Workshop" || event.type === "Conference" ? (
                  <div className="z-10 flex flex-col items-center opacity-80">
                    <span className="text-5xl font-black text-white/90 tracking-tighter" style={{ fontStyle: "italic" }}>AI</span>
                  </div>
                ) : (
                  <svg className="w-14 h-14 text-blue-200/70 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Event info */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="mb-3">
            <span className="px-4 py-1 bg-[#1D6BA3] text-white text-xs font-semibold rounded-md">{event.type}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <h2 className="text-xl font-black text-gray-900">{event.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {event.date}</span>
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {event.author}</span>
            </div>
          </div>
          <StatusBadge status={event.status} />
        </div>

        {/* Description */}
        <div className="mx-6 my-4 border border-gray-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 mb-2">Description</p>
          <p className="text-sm font-bold text-gray-800">{event.description}</p>
        </div>

        {/* Department / Mode / Location */}
        <div className="mx-6 mb-4 border border-gray-100 rounded-xl p-5 flex flex-wrap gap-8">
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">Department</p>
            <p className="text-sm font-bold text-gray-900">{event.department}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">Mode</p>
            <p className="text-sm font-bold text-gray-900">{event.mode}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">Location/Link</p>
            {event.isLink ? (
              <a href="#" className="text-sm font-bold text-[#1D6BA3] underline underline-offset-2">{event.location}</a>
            ) : (
              <p className="text-sm font-bold text-gray-900">{event.location}</p>
            )}
          </div>
        </div>

        {/* Chief Guest */}
        {event.chiefGuest && (
          <div className="mx-6 mb-4 border border-gray-100 rounded-xl p-5">
            <p className="text-xs font-semibold text-gray-400 mb-1">Chief Guest</p>
            <p className="text-sm font-bold text-gray-900">{event.chiefGuest}</p>
          </div>
        )}

        {/* Moderator Comment (Rejected only) */}
        {event.status === "Rejected" && event.moderatorComment && (
          <div className="mx-6 mb-4 border border-red-100 bg-red-50 rounded-xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-600 mb-1">Moderator Comment</p>
              <p className="text-sm text-red-500 font-medium">{event.moderatorComment}</p>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        {event.status === "Pending" && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="ghost" className="border border-gray-200 text-gray-700 h-9 px-5 text-sm"
              onClick={() => setRejectConfirm(true)}>Reject</Button>
            <Button variant="primary" className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-9 px-5 text-sm"
              onClick={() => setApproveConfirm(true)}>Approve</Button>
          </div>
        )}
        {event.status === "Approved" && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <Button variant="primary" className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-9 px-5 text-sm"
              onClick={() => setCancelConfirm(true)}>Cancel Event</Button>
          </div>
        )}
      </Card>

      {/* ── Approve flow ── */}
      {approveConfirm && (
        <WarnDialog title="Approve Event?" message="Are You Sure Do You Want To Approve This Event."
          onNo={resetAll} onYes={handleApproveYes} />
      )}
      {approveSuccess && <ApproveSuccessDialog onClose={resetAll} />}

      {/* ── Reject flow ── */}
      {rejectConfirm && (
        <WarnDialog title="Reject Event?" message="Are You Sure Do You Want To Reject This Event."
          onNo={resetAll} onYes={handleRejectConfirmYes} />
      )}
      {rejectReason && (
        <RejectReasonDialog value={rejectText} onChange={setRejectText}
          onCancel={resetAll} onSubmit={handleRejectSubmit} />
      )}
      {rejectSuccess && <RejectSuccessDialog onClose={resetAll} />}

      {/* ── Cancel flow ── */}
      {cancelConfirm && (
        <WarnDialog title="Cancel Event?" message="Are You Sure Do You Want To Cancel This Event."
          onNo={resetAll} onYes={handleCancelConfirmYes} />
      )}
      {cancelReason && (
        <CancelReasonDialog value={cancelText} onChange={setCancelText}
          notify={cancelNotify} onNotifyToggle={() => setCancelNotify(v => !v)}
          onCancel={resetAll} onSubmit={handleCancelSubmit} />
      )}
      {cancelSuccess && <CancelSuccessDialog onClose={resetAll} />}
    </div>
  );
};

export default EventDetails;
