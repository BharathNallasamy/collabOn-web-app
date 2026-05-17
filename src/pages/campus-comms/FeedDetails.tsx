import { useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";

// ── Animation styles (GIF-like) ───────────────────────────────────────────────
const ANIM_STYLES = `
  @keyframes fd-bounce-warn { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.22);opacity:1} 70%{transform:scale(0.88)} 85%{transform:scale(1.06)} 100%{transform:scale(1)} }
  @keyframes fd-pulse-excl  { 0%,100%{transform:scaleY(1)} 30%{transform:scaleY(1.18)} 60%{transform:scaleY(0.88)} }
  @keyframes fd-pop-in      { 0%{transform:scale(0);opacity:0} 55%{transform:scale(1.18);opacity:1} 75%{transform:scale(0.92)} 100%{transform:scale(1)} }
  @keyframes fd-draw-check  { 0%{stroke-dashoffset:60;opacity:0} 25%{opacity:1} 100%{stroke-dashoffset:0;opacity:1} }
  @keyframes fd-pop-reject  { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.2);opacity:1} 75%{transform:scale(0.9)} 100%{transform:scale(1)} }
`;

import { type FeedData, type FeedStatus } from "../../types/interfaces";

// ── Mock Feed Data ─────────────────────────────────────────────────────────────
const MOCK_FEEDS: Record<string, FeedData> = {
  "1": { id:"1", title:"Cyber Security Awareness",  date:"22/04/2026", author:"Karthik",  status:"Pending",  description:"A Seminar On The Importance Of Cyber Security In The Modern World, All Students Requested To Attend.", audience:"Department", department:"Computer Science", visibility:"Inactive", schedule:"Immediate" },
  "2": { id:"2", title:"Republic Day Celebration",   date:"15/04/2026", author:"Jagadeesh",status:"Rejected", description:"Republic Day Celebration for all staff and students. Attendance is mandatory.", audience:"Department", department:"Chemistry",       visibility:"Inactive", schedule:"Immediate" },
  "3": { id:"3", title:"Workshop on AI",             date:"06/06/2026", author:"Derik",    status:"Approved", description:"An interactive workshop on Artificial Intelligence trends and tools.", audience:"Department", department:"Statistics",       visibility:"Active",   schedule:"Immediate" },
  "4": { id:"4", title:"Results Annoucements",       date:"25/05/2026", author:"Admin",    status:"Approved", description:"Final semester results will be announced on the portal. Students are requested to check.", audience:"Department", department:"All Departments",  visibility:"Active",   schedule:"Immediate" },
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: FeedStatus }) => {
  const map: Record<FeedStatus, string> = {
    Pending:  "bg-orange-50 text-orange-500 border border-orange-200",
    Approved: "bg-green-50 text-green-600 border border-green-200",
    Rejected: "bg-red-50 text-red-500 border border-red-200",
  };
  const labels: Record<FeedStatus, string> = { Pending:"Pending Review", Approved:"Approved", Rejected:"Rejected" };
  return <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>{labels[status]}</span>;
};

// ── Animated Warning Dialog ───────────────────────────────────────────────────
const WarnDialog = ({
  title, message, onNo, onYes,
}: { title: string; message: string; onNo: () => void; onYes: () => void }) =>
  createPortal(
    <>
      <style>{ANIM_STYLES}</style>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-[14px] font-bold text-gray-900">{title}</h3>
            <button onClick={onNo} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Body */}
          <div className="flex flex-col items-center py-8 px-5 gap-4">
            {/* Animated ! circle */}
            <div
              className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30"
              style={{ animation: "fd-bounce-warn 0.55s cubic-bezier(0.36,0.07,0.19,0.97) both" }}
            >
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"
                style={{ animation: "fd-pulse-excl 1.2s ease-in-out 0.6s infinite" }}>
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5a1 1 0 011 1v5a1 1 0 01-2 0V8a1 1 0 011-1zm0 10a1.25 1.25 0 110-2.5A1.25 1.25 0 0112 17z" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-gray-700 text-center">{message}</p>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-gray-100">
            <button onClick={onNo}
              className="h-9 px-5 rounded-lg border border-gray-300 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              No
            </button>
            <button onClick={onYes}
              className="h-9 px-5 rounded-lg bg-[#1D6BA3] text-white text-[12px] font-semibold hover:bg-[#1558a0] transition-colors">
              Yes
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );

// ── Approve Success Dialog ────────────────────────────────────────────────────
const ApproveSuccessDialog = ({ onClose }: { onClose: () => void }) =>
  createPortal(
    <>
      <style>{ANIM_STYLES}</style>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-[14px] font-bold text-gray-900">Approve Feed?</h3>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center py-8 px-5 gap-3">
            <div
              className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
              style={{ animation: "fd-pop-in 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both" }}
            >
              <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                style={{ strokeDasharray: 60, animation: "fd-draw-check 0.45s ease 0.3s both" }}>
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">Feed Approved Successfully</p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );

// ── Reject Reason Dialog ──────────────────────────────────────────────────────
const RejectReasonDialog = ({
  value, onChange, onCancel, onSubmit,
}: { value: string; onChange: (v: string) => void; onCancel: () => void; onSubmit: () => void }) =>
  createPortal(
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
          <textarea
            placeholder="Enter reason for rejection..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] resize-none"
          />
        </div>
        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onCancel}
            className="h-9 px-5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!value.trim()}
            className="h-9 px-5 rounded-lg bg-red-500 text-white text-[12px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

// ── Reject Success Dialog ─────────────────────────────────────────────────────
const RejectSuccessDialog = ({ onClose }: { onClose: () => void }) =>
  createPortal(
    <>
      <style>{ANIM_STYLES}</style>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-[14px] font-bold text-gray-900">Reject Feed?</h3>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center py-8 px-5 gap-3">
            <div
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30"
              style={{ animation: "fd-pop-reject 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both" }}
            >
              <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">Feed Rejected Successfully</p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );

// ── Main Component ─────────────────────────────────────────────────────────────
const FeedDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const feed = MOCK_FEEDS[id ?? "1"] ?? MOCK_FEEDS["1"];

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Approve flow
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);

  // Reject flow
  const [rejectConfirm, setRejectConfirm]   = useState(false);
  const [rejectReason,  setRejectReason]    = useState(false);
  const [rejectText,    setRejectText]      = useState("");
  const [rejectSuccess, setRejectSuccess]   = useState(false);

  const resetAll = () => {
    setApproveConfirm(false); setApproveSuccess(false);
    setRejectConfirm(false);  setRejectReason(false);
    setRejectSuccess(false);  setRejectText("");
  };

  const handleApproveYes = () => {
    setApproveConfirm(false);
    setApproveSuccess(true);
    setTimeout(() => { setApproveSuccess(false); navigate("/layout/campus-comms/feed-management"); }, 1800);
  };

  const handleRejectConfirmYes = () => {
    setRejectConfirm(false);
    setRejectReason(true);
  };

  const handleRejectSubmit = () => {
    setRejectReason(false);
    setRejectSuccess(true);
    setTimeout(() => { setRejectSuccess(false); setRejectText(""); navigate("/layout/campus-comms/feed-management"); }, 1800);
  };

  return (
    <div className="space-y-4">
      <Card noPadding className="border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">Feed Details</h1>
        </div>

        {/* Photo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-3">Upload Feed Photo</p>
          <div
            className="w-64 h-44 rounded-xl overflow-hidden bg-gradient-to-br from-[#0F2460] via-[#1D6BA3] to-[#1A3A8A] flex items-center justify-center relative cursor-pointer border border-gray-200"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file"; input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
                reader.readAsDataURL(file);
              };
              input.click();
            }}
          >
            {uploadedImage ? (
              <img src={uploadedImage} alt="Feed" className="w-full h-full object-cover" />
            ) : (
              <>
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 256 176" preserveAspectRatio="none">
                  <defs><pattern id="fgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.3" />
                  </pattern></defs>
                  <rect width="100%" height="100%" fill="url(#fgrid)" />
                </svg>
                <svg className="w-14 h-14 text-blue-200/70 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </>
            )}
          </div>
        </div>

        {/* Title + Status */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <h2 className="text-xl font-black text-gray-900">{feed.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {feed.date}</span>
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {feed.author}</span>
            </div>
          </div>
          <StatusBadge status={feed.status} />
        </div>

        {/* Description */}
        <div className="mx-6 my-4 border border-gray-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 mb-2">Description</p>
          <p className="text-sm font-bold text-gray-800">{feed.description}</p>
        </div>

        {/* Info grid */}
        <div className="mx-6 mb-4 border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-5"><p className="text-xs font-semibold text-gray-400 mb-1">Audience</p><p className="text-sm font-bold text-gray-900">{feed.audience}</p></div>
            <div className="p-5"><p className="text-xs font-semibold text-gray-400 mb-1">Department</p><p className="text-sm font-bold text-gray-900">{feed.department}</p></div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
            <div className="p-5"><p className="text-xs font-semibold text-gray-400 mb-1">Visibility</p><p className="text-sm font-bold text-gray-900">{feed.visibility}</p></div>
            <div className="p-5"><p className="text-xs font-semibold text-gray-400 mb-1">Schedule</p><p className="text-sm font-bold text-gray-900">{feed.schedule}</p></div>
          </div>
        </div>

        {/* Footer — shown for Pending feeds only */}
        {feed.status === "Pending" && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="ghost" className="border border-gray-200 text-gray-700 h-9 px-5 text-sm"
              onClick={() => setRejectConfirm(true)}>Reject</Button>
            <Button variant="primary" className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-9 px-5 text-sm"
              onClick={() => setApproveConfirm(true)}>Approve</Button>
          </div>
        )}
      </Card>

      {/* ── Approve flow ── */}
      {approveConfirm && (
        <WarnDialog
          title="Approve Feed?"
          message="Are You Sure Do You Want To Approve This Feed."
          onNo={resetAll}
          onYes={handleApproveYes}
        />
      )}
      {approveSuccess && <ApproveSuccessDialog onClose={resetAll} />}

      {/* ── Reject flow ── */}
      {rejectConfirm && (
        <WarnDialog
          title="Reject Feed?"
          message="Are You Sure Do You Want To Reject This Feed."
          onNo={resetAll}
          onYes={handleRejectConfirmYes}
        />
      )}
      {rejectReason && (
        <RejectReasonDialog
          value={rejectText}
          onChange={setRejectText}
          onCancel={resetAll}
          onSubmit={handleRejectSubmit}
        />
      )}
      {rejectSuccess && <RejectSuccessDialog onClose={resetAll} />}
    </div>
  );
};

export default FeedDetails;
