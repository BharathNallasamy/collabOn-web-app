import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Upload, ChevronDown, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";

// ── Edit seeds ────────────────────────────────────────────────────────────────
const EDIT_SEEDS: Record<string, {
  circularTitle: string; circularMode: "Normal" | "Urgent" | "Emergency";
  department: string; targetAudience: string;
  issueDate: string; expiryDate: string;
  description: string; notifyUsers: boolean; activeStatus: boolean;
}> = {
  "1": { circularTitle:"Emergency : Campus Closure Due To Heavy Rain",    circularMode:"Emergency", department:"All Departments",        targetAudience:"All",      issueDate:"22/04/2026", expiryDate:"25/04/2026", description:"Campus will remain closed today due to heavy rain forecast. All classes and activities are suspended.",                   notifyUsers:true,  activeStatus:true  },
  "2": { circularTitle:"Revised Guidelines For End Semester Examinations", circularMode:"Urgent",    department:"Academic",               targetAudience:"Faculty",   issueDate:"22/04/2026", expiryDate:"30/04/2026", description:"Please note the revised examination guidelines effective immediately. Faculty are requested to follow the updated norms.", notifyUsers:true,  activeStatus:true  },
  "3": { circularTitle:"Faculty Development Program On AI Integration",    circularMode:"Normal",    department:"Computer Science",        targetAudience:"Students",  issueDate:"22/04/2026", expiryDate:"30/04/2026", description:"A Faculty Development Program on AI Integration will be held this month. All interested staff may register online.",         notifyUsers:false, activeStatus:true  },
};

// ── Animated Success Popup ─────────────────────────────────────────────────────
const ANIM_STYLES = `
  @keyframes cc-pop-in     { 0%{transform:scale(0);opacity:0} 55%{transform:scale(1.18);opacity:1} 75%{transform:scale(0.92)} 100%{transform:scale(1)} }
  @keyframes cc-draw-check { 0%{stroke-dashoffset:60;opacity:0} 25%{opacity:1} 100%{stroke-dashoffset:0;opacity:1} }
`;
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) =>
  createPortal(
    <>
      <style>{ANIM_STYLES}</style>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-[14px] font-bold text-gray-900">Success</h3>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center py-8 px-5 gap-3">
            <div
              className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30"
              style={{ animation: "cc-pop-in 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both" }}
            >
              <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                style={{ strokeDasharray: 60, animation: "cc-draw-check 0.45s ease 0.3s both" }}>
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">{message}</p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );

// ── Form Dropdown ─────────────────────────────────────────────────────────────
const FormDropdown = ({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={["w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg bg-gray-50 transition-colors focus:outline-none",
          open ? "border-[#1D6BA3] ring-2 ring-[#1D6BA3]/20" : "border-gray-200"].join(" ")}>
        <span className={value ? "text-gray-700 font-medium" : "text-gray-400"}>{value || label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
          <ul className="py-1">
            {options.map(opt => (
              <li key={opt}>
                <button type="button" onClick={() => { onChange(opt); setOpen(false); }}
                  className={["w-full text-left px-4 py-2.5 text-sm transition-colors",
                    opt === value ? "text-[#1D6BA3] font-semibold bg-[#EFF6FF]" : "text-gray-700 hover:bg-gray-50"].join(" ")}>
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ── Toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) => (
  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4">
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    <button type="button" onClick={onChange}
      className={`w-10 h-5 rounded-full relative transition-colors ${value ? "bg-[#1D6BA3]" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  </div>
);

// ── Circular Mode Badge ───────────────────────────────────────────────────────
const MODE_COLORS: Record<"Normal" | "Urgent" | "Emergency", string> = {
  Normal:    "border-[#1D6BA3] bg-[#EFF6FF] text-[#1D6BA3]",
  Urgent:    "border-orange-300 bg-orange-50 text-orange-600",
  Emergency: "border-red-300 bg-red-50 text-red-600",
};

// ── Main Component ─────────────────────────────────────────────────────────────
const CreateCircular = () => {
  const navigate  = useNavigate();
  const { id }    = useParams<{ id?: string }>();
  const isEdit    = !!id;
  const seed      = id ? EDIT_SEEDS[id] : undefined;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bannerPreview,   setBannerPreview]   = useState<string | null>(null);
  const [circularTitle,   setCircularTitle]   = useState(seed?.circularTitle   ?? "");
  const [circularMode,    setCircularMode]    = useState<"Normal" | "Urgent" | "Emergency">(seed?.circularMode ?? "Normal");
  const [department,      setDepartment]      = useState(seed?.department      ?? "");
  const [targetAudience,  setTargetAudience]  = useState(seed?.targetAudience  ?? "");
  const [issueDate,       setIssueDate]       = useState(seed?.issueDate       ?? "");
  const [expiryDate,      setExpiryDate]      = useState(seed?.expiryDate      ?? "");
  const [description,     setDescription]     = useState(seed?.description     ?? "");
  const [notifyUsers,     setNotifyUsers]     = useState(seed?.notifyUsers     ?? false);
  const [activeStatus,    setActiveStatus]    = useState(seed?.activeStatus    ?? false);
  const [successMsg,      setSuccessMsg]      = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBannerPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const isValid = circularTitle.trim() && description.trim();

  const handleSubmit = () => {
    if (!isValid) return;
    setSuccessMsg(isEdit ? "Circular updated successfully." : "Circular sent successfully.");
  };

  return (
    <>
      <div className="space-y-4">
        <Card noPadding className="border-gray-200 overflow-visible">

          {/* ── Header ── */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            {isEdit && (
              <button
                onClick={() => navigate("/layout/campus-comms/circulars")}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Circular" : "Create New Circular"}
            </h1>
          </div>

          <div className="px-6 py-6 space-y-6">

            {/* ── Upload Banner ── */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Upload Circular Banner</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#1D6BA3]/40 hover:bg-gray-50/50 transition-colors"
              >
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner preview" className="max-h-32 rounded-lg object-contain" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#1D6BA3]" />
                    <p className="text-sm text-gray-500">
                      Drop Files here or{" "}
                      <span className="text-[#1D6BA3] font-semibold underline">Choose file</span>
                    </p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
            </div>

            {/* ── Circular Title ── */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Circular Title</label>
              <input
                type="text"
                placeholder="Enter circular title"
                value={circularTitle}
                onChange={(e) => setCircularTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50"
              />
            </div>

            {/* ── Circular Mode / Department / Issue Date / Expiry Date ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Circular Mode</label>
                <FormDropdown
                  label="Select"
                  value={circularMode}
                  onChange={(v) => setCircularMode(v as "Normal" | "Urgent" | "Emergency")}
                  options={["Normal", "Urgent", "Emergency"]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Issuing Department</label>
                <FormDropdown
                  label="Select"
                  value={department}
                  onChange={setDepartment}
                  options={["All Departments", "Academic", "Computer Science", "Information Technology", "Administration", "HR", "Finance"]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Issue Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Expiry Date (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30"
                  />
                </div>
              </div>
            </div>

            {/* ── Priority Mode Indicator ── */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Priority:</span>
              <div className="flex items-center gap-2">
                {(["Normal", "Urgent", "Emergency"] as const).map((m) => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="circularMode"
                      value={m}
                      checked={circularMode === m}
                      onChange={() => setCircularMode(m)}
                      className="w-4 h-4 accent-[#1D6BA3] cursor-pointer"
                    />
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${MODE_COLORS[m]}`}>
                      {m}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Target Audience / Department ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Target Audience</label>
                <FormDropdown
                  label="Select"
                  value={targetAudience}
                  onChange={setTargetAudience}
                  options={["All", "Students", "Faculty", "Parents", "Staff", "Both Staff and Students"]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Addressed Department</label>
                <FormDropdown
                  label="Select"
                  value={department}
                  onChange={setDepartment}
                  options={["All Departments", "Academic", "Computer Science", "Information Technology", "Administration"]}
                />
              </div>
            </div>

            {/* ── Content / Message ── */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Message Content <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Enter circular message..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 resize-none"
              />
            </div>

            {/* ── Toggles ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
              <Toggle label="Notify Users" value={notifyUsers} onChange={() => setNotifyUsers(v => !v)} />
              <Toggle label="Active Status" value={activeStatus} onChange={() => setActiveStatus(v => !v)} />
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button
              variant="ghost"
              className="border border-gray-200 text-gray-700 h-9 px-5 text-sm"
              onClick={() => navigate("/layout/campus-comms/circulars")}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className={`bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-9 px-5 text-sm ${!isValid ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleSubmit}
              disabled={!isValid}
            >
              {isEdit ? "Save Changes" : "Send Circular"}
            </Button>
          </div>

        </Card>
      </div>

      {successMsg && (
        <SuccessPopup
          message={successMsg}
          onClose={() => {
            setSuccessMsg(null);
            navigate("/layout/campus-comms/circulars");
          }}
        />
      )}
    </>
  );
};

export default CreateCircular;
