import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Upload, ChevronDown, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";
import { addEvent } from "./eventStore";

// ── Edit seeds (mirrors eventStore seeds) ─────────────────────────────────────
const EDIT_SEEDS: Record<string, {
  eventTitle: string; eventType: string; department: string;
  startDate: string; endDate: string; eventMode: "Offline" | "Online";
  location: string; description: string; chiefGuest: string;
  targetAudience: string; audienceDept: string;
  enableRegistration: boolean; notifyUsers: boolean;
}> = {
  "1": { eventTitle:"Generative AI Workshop",   eventType:"Workshop",       department:"Computer Science",      startDate:"22/04/2026", endDate:"22/04/2026", eventMode:"Offline", location:"Auditorium A",           description:"A Workshop On Generative AI And Its Applications In The Modern World. All Students Are Requested To Attend.", chiefGuest:"Dr. Alan Turing (AI Persona)", targetAudience:"Students", audienceDept:"Computer Science",      enableRegistration:true,  notifyUsers:false },
  "2": { eventTitle:"Data Engineer Bootcamp",   eventType:"Seminar",        department:"Information Technology", startDate:"22/04/2026", endDate:"22/04/2026", eventMode:"Online",  location:"https://zoom.us/j/8644675", description:"A Comprehensive Bootcamp On Data Engineering Pipelines And Tools.",                                        chiefGuest:"",                            targetAudience:"Students", audienceDept:"Information Technology", enableRegistration:false, notifyUsers:false },
  "3": { eventTitle:"Republic Day Celebration", eventType:"Cultural Event", department:"All Departments",        startDate:"22/04/2026", endDate:"22/04/2026", eventMode:"Offline", location:"Main Ground",              description:"Republic Day Celebration For All Staff And Students. Attendance Is Mandatory.",                              chiefGuest:"",                            targetAudience:"All",      audienceDept:"All Departments",        enableRegistration:false, notifyUsers:true  },
  "4": { eventTitle:"AI Conference",            eventType:"Conference",     department:"Computer Science",       startDate:"22/04/2026", endDate:"22/04/2026", eventMode:"Online",  location:"https://zoom.us/j/9988776", description:"An International Conference On Artificial Intelligence And Machine Learning.",                               chiefGuest:"",                            targetAudience:"Faculty",  audienceDept:"Computer Science",       enableRegistration:false, notifyUsers:false },
};

// ── Success Popup ─────────────────────────────────────────────────────────────
const ANIM_STYLES = `
  @keyframes ce-pop-in     { 0%{transform:scale(0);opacity:0} 55%{transform:scale(1.18);opacity:1} 75%{transform:scale(0.92)} 100%{transform:scale(1)} }
  @keyframes ce-draw-check { 0%{stroke-dashoffset:60;opacity:0} 25%{opacity:1} 100%{stroke-dashoffset:0;opacity:1} }
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
            <div className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30"
              style={{ animation: "ce-pop-in 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both" }}>
              <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                style={{ strokeDasharray: 60, animation: "ce-draw-check 0.45s ease 0.3s both" }}>
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
    <button type="button" onClick={onChange} className={`w-10 h-5 rounded-full relative transition-colors ${value ? "bg-[#1D6BA3]" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const CreateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const seed   = id ? EDIT_SEEDS[id] : undefined;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bannerPreview,       setBannerPreview]       = useState<string | null>(null);
  const [eventTitle,          setEventTitle]          = useState(seed?.eventTitle          ?? "");
  const [eventType,           setEventType]           = useState(seed?.eventType           ?? "");
  const [department,          setDepartment]          = useState(seed?.department          ?? "");
  const [startDate,           setStartDate]           = useState(seed?.startDate           ?? "19/03/2026");
  const [endDate,             setEndDate]             = useState(seed?.endDate             ?? "19/03/2026");
  const [eventMode,           setEventMode]           = useState<"Offline" | "Online">(seed?.eventMode ?? "Offline");
  const [location,            setLocation]            = useState(seed?.location            ?? "");
  const [description,         setDescription]         = useState(seed?.description         ?? "");
  const [chiefGuest,          setChiefGuest]          = useState(seed?.chiefGuest          ?? "");
  const [targetAudience,      setTargetAudience]      = useState(seed?.targetAudience      ?? "");
  const [audienceDept,        setAudienceDept]        = useState(seed?.audienceDept        ?? "");
  const [enableRegistration,  setEnableRegistration]  = useState(seed?.enableRegistration  ?? false);
  const [notifyUsers,         setNotifyUsers]         = useState(seed?.notifyUsers         ?? false);
  const [successMsg,          setSuccessMsg]          = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBannerPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2,"0")}/${String(today.getMonth()+1).padStart(2,"0")}/${today.getFullYear()}`;

  const handleSubmit = () => {
    if (isEdit) {
      setSuccessMsg("Event updated successfully.");
    } else {
      addEvent({
        image:        "event",
        eventTitle:   eventTitle || "Untitled Event",
        type:         eventType  || "Workshop",
        department:   department || "All Departments",
        mode:         eventMode,
        date:         startDate  || formattedDate,
        registration: enableRegistration ? "Open" : "Not required",
        status:       "Pending",
        visibility:   0,
        activeStatus: "Active",
      });
      setSuccessMsg("Event created successfully.");
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Card noPadding className="border-gray-200 overflow-visible">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            {isEdit && (
              <button onClick={() => navigate("/layout/campus-comms/event-management")}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Event" : "Create New Event"}
            </h1>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Banner Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Upload Event Banner</label>
              <div onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#1D6BA3]/40 hover:bg-gray-50/50 transition-colors">
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner" className="max-h-32 rounded-lg object-contain" />
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
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Event Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Title</label>
              <input type="text" placeholder="Select" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)}
                className="w-full max-w-xs px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50" />
            </div>

            {/* Event Type / Dept / Start Date / End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Type</label>
                <FormDropdown label="Select" value={eventType} onChange={setEventType}
                  options={["Workshop", "Seminar", "Conference", "Cultural Event", "Academic Event"]} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Organizing Department</label>
                <FormDropdown label="Select" value={department} onChange={setDepartment}
                  options={["Computer Science", "Information Technology", "All Departments"]} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Start Date & Time</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event End Date & Time</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30" />
                </div>
              </div>
            </div>

            {/* Event Mode + Location */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Event Mode</label>
                <div className="flex items-center gap-6">
                  {(["Offline", "Online"] as const).map((m) => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="eventMode" value={m} checked={eventMode === m}
                        onChange={() => setEventMode(m)} className="w-4 h-4 accent-[#1D6BA3]" />
                      <span className="text-sm text-gray-700 font-medium">
                        {m === "Offline" ? "Offline (In-Campus)" : "Online (Virtual)"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex-1 max-w-xs">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Location/Venue</label>
                <input type="text" placeholder="Select" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50" />
              </div>
            </div>

            {/* Content/Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Content /Description</label>
              <textarea placeholder="Enter" value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 resize-none" />
            </div>

            {/* Chief Guest / Target Audience / Department */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Chief Guest (Optional)</label>
                <input type="text" placeholder="Select" value={chiefGuest} onChange={(e) => setChiefGuest(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Target Audience</label>
                <FormDropdown label="Select" value={targetAudience} onChange={setTargetAudience}
                  options={["All", "Students", "Faculty", "Parents", "Staff"]} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Department</label>
                <FormDropdown label="Select" value={audienceDept} onChange={setAudienceDept}
                  options={["Computer Science", "Information Technology", "All Departments"]} />
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
              <Toggle label="Enable Registration" value={enableRegistration} onChange={() => setEnableRegistration(v => !v)} />
              <Toggle label="Notify Users" value={notifyUsers} onChange={() => setNotifyUsers(v => !v)} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="ghost" className="border border-gray-200 text-gray-700 h-9 px-5 text-sm"
              onClick={() => navigate("/layout/campus-comms/event-management")}>Cancel</Button>
            <Button variant="primary" className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-9 px-5 text-sm"
              onClick={handleSubmit}>
              {isEdit ? "Save Changes" : "Submit"}
            </Button>
          </div>
        </Card>
      </div>

      {successMsg && (
        <SuccessPopup
          message={successMsg}
          onClose={() => {
            setSuccessMsg(null);
            navigate("/layout/campus-comms/event-management");
          }}
        />
      )}
    </>
  );
};

export default CreateEvent;
