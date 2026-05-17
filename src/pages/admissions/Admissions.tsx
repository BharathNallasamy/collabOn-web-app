import { useState } from "react";
import { createPortal } from "react-dom";
import { ITEMS_PER_PAGE, INSTITUTIONS } from "../../constants";
import {
  EditIcon, PlusIcon, ChevronDown, XIcon, CheckIcon,
} from "../../components/common/Icons/PageIcons";
import Pagination from "../../components/common/Pagination/Pagination";

// ── Constants ─────────────────────────────────────────────────────────────────
const COURSES = [
  "Computer Application", "Computer Science", "Commerce", "Mathematics",
  "Physics", "Chemistry", "Tamil", "English", "Statistics",
  "Electronics", "Biology", "MBA", "MCA", "BCA",
] as const;

const SOURCES = ["Walk-in", "Online", "Phone", "Referral", "Social Media", "Agent"] as const;
const ENQUIRY_TYPES = ["Admission", "General", "Scholarship", "Transfer"] as const;
const ENQUIRY_STATUS = ["Open", "Closed", "Follow-up", "Converted"] as const;
const WHOM_TO_MEET = ["Principal", "HoD", "Admission Officer", "Professor", "Registrar"] as const;

import { type AdmissionEntry, type GeneralEntry } from "../../types/interfaces";
import { SEED_ADMISSIONS, SEED_GENERAL_ENQUIRIES as SEED_GENERAL } from "../../types/mockData";

type MainTab = "admission" | "general";

interface AdmissionForm {
  name: string; phone: string; email: string; enquiryDate: string;
  interestedCourse: string; source: string; institution: string;
  status: string; comments: string;
}

interface GeneralForm {
  name: string; phone: string; email: string; visitsDate: string;
  whomToMeet: string; others: string; visitPurpose: string;
  institution: string; comments: string;
}

const BLANK_ADM: AdmissionForm = {
  name: "", phone: "", email: "", enquiryDate: "",
  interestedCourse: "", source: "", institution: "", status: "Open", comments: "",
};

const BLANK_GEN: GeneralForm = {
  name: "", phone: "", email: "", visitsDate: "",
  whomToMeet: "", others: "", visitPurpose: "", institution: "", comments: "",
};

// ── SuccessPopup ───────────────────────────────────────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Saved</h3>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>
        <div className="flex flex-col items-center py-8 px-5 gap-3">
          <div className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30">
            <CheckIcon />
          </div>
          <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">{message}</p>
        </div>
      </div>
    </div>,
    document.body
  );

// ── SelectField helper ─────────────────────────────────────────────────────────
const SelectField = ({
  label, value, onChange, options, placeholder, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: readonly string[]; placeholder?: string; required?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={[
          "w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors",
          !value ? "text-gray-400" : "text-gray-700",
        ].join(" ")}>
        <option value="">{placeholder ?? "Select"}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <ChevronDown />
      </div>
    </div>
  </div>
);

// ── TextField helper ───────────────────────────────────────────────────────────
const TextField = ({
  label, value, onChange, placeholder, required, type,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      type={type ?? "text"}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? "Enter"}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors placeholder-gray-400"
    />
  </div>
);

// ── Add / Edit Enquiry Modal ───────────────────────────────────────────────────
interface EnquiryModalProps {
  mode: "add" | "edit";
  defaultTab: MainTab;
  initialAdm?: AdmissionEntry;
  initialGen?: GeneralEntry;
  onClose: () => void;
  onSave: (type: MainTab, adm: AdmissionForm, gen: GeneralForm) => void;
}

const EnquiryModal = ({ mode, defaultTab, initialAdm, initialGen, onClose, onSave }: EnquiryModalProps) => {
  const [modalTab, setModalTab] = useState<MainTab>(defaultTab);
  const [admForm, setAdmForm] = useState<AdmissionForm>(
    initialAdm
      ? { name: initialAdm.name, phone: initialAdm.phone, email: initialAdm.email,
          enquiryDate: initialAdm.date, interestedCourse: initialAdm.interestedCourse,
          source: initialAdm.source, institution: initialAdm.institution,
          status: initialAdm.status, comments: initialAdm.comments }
      : { ...BLANK_ADM }
  );
  const [genForm, setGenForm] = useState<GeneralForm>(
    initialGen
      ? { name: initialGen.name, phone: initialGen.phone, email: initialGen.email,
          visitsDate: initialGen.date, whomToMeet: initialGen.whomToMeet,
          others: initialGen.others, visitPurpose: initialGen.visitPurpose,
          institution: initialGen.institution, comments: initialGen.comments }
      : { ...BLANK_GEN }
  );

  const setAdm = (p: Partial<AdmissionForm>) => setAdmForm(f => ({ ...f, ...p }));
  const setGen = (p: Partial<GeneralForm>)   => setGenForm(f => ({ ...f, ...p }));

  const handleSave = () => onSave(modalTab, admForm, genForm);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">
            {mode === "edit" ? "Edit Enquiry" : "Add New Enquiry"}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Modal tab toggle — hidden in edit mode (type is fixed) */}
        <div className={["flex gap-2 px-6 pt-5", mode === "edit" ? "hidden" : ""].join(" ")}>
          <button
            onClick={() => setModalTab("admission")}
            className={[
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold border transition-colors",
              modalTab === "admission"
                ? "bg-[#1D6BA3] text-white border-[#1D6BA3]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
            ].join(" ")}>
            {/* graduation cap icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0121 21H3a12.083 12.083 0 012.84-10.422L12 14z" />
            </svg>
            Admission
          </button>
          <button
            onClick={() => setModalTab("general")}
            className={[
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold border transition-colors",
              modalTab === "general"
                ? "bg-[#1D6BA3] text-white border-[#1D6BA3]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
            ].join(" ")}>
            {/* person icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            General
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-4">
          {modalTab === "admission" ? (
            <>
              <div className="grid grid-cols-4 gap-4">
                <TextField label="Full Name"     value={admForm.name}  onChange={v => setAdm({ name: v })}  required />
                <TextField label="Mobile Number" value={admForm.phone} onChange={v => setAdm({ phone: v })} required />
                <TextField label="Email ID"      value={admForm.email} onChange={v => setAdm({ email: v })} required />
                <TextField label="Enquiry Date"  value={admForm.enquiryDate} onChange={v => setAdm({ enquiryDate: v })} type="date" placeholder="dd/mm/yyyy" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <SelectField label="Interested Course" value={admForm.interestedCourse} onChange={v => setAdm({ interestedCourse: v })} options={COURSES}     required />
                <SelectField label="Source"            value={admForm.source}           onChange={v => setAdm({ source: v })}           options={SOURCES}     required />
                <SelectField label="Institution"       value={admForm.institution}      onChange={v => setAdm({ institution: v })}      options={INSTITUTIONS} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <SelectField label="Status" value={admForm.status} onChange={v => setAdm({ status: v })} options={ENQUIRY_STATUS} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Comments/Remarks</label>
                <textarea
                  value={admForm.comments}
                  onChange={e => setAdm({ comments: e.target.value })}
                  placeholder="Enter"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors resize-none placeholder-gray-400"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                <TextField label="Full Name"     value={genForm.name}       onChange={v => setGen({ name: v })}       required />
                <TextField label="Mobile Number" value={genForm.phone}      onChange={v => setGen({ phone: v })}      required />
                <TextField label="Email ID"      value={genForm.email}      onChange={v => setGen({ email: v })}      required />
                <TextField label="Visits Date"   value={genForm.visitsDate} onChange={v => setGen({ visitsDate: v })} type="date" placeholder="dd/mm/yyyy" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <SelectField label="Whom to Meet"    value={genForm.whomToMeet}   onChange={v => setGen({ whomToMeet: v })}   options={WHOM_TO_MEET} required />
                <TextField   label="Others"          value={genForm.others}       onChange={v => setGen({ others: v })}       placeholder="Enter" />
                <TextField   label="Purpose Of Visit" value={genForm.visitPurpose} onChange={v => setGen({ visitPurpose: v })} required />
                <SelectField label="Institution"     value={genForm.institution}  onChange={v => setGen({ institution: v })}  options={INSTITUTIONS} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Comments/Remarks</label>
                <textarea
                  value={genForm.comments}
                  onChange={e => setGen({ comments: e.target.value })}
                  placeholder="Enter"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors resize-none placeholder-gray-400"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── SearchFilterRow ────────────────────────────────────────────────────────────
const SearchFilterRow = ({
  search, onSearchChange, onSearch, onClear, filterType, onFilterType,
  filterStatus, onFilterStatus, onAdd,
}: {
  search: string; onSearchChange: (v: string) => void;
  onSearch: () => void; onClear: () => void;
  filterType: string; onFilterType: (v: string) => void;
  filterStatus: string; onFilterStatus: (v: string) => void;
  onAdd: () => void;
}) => (
  <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 border-b border-gray-100">
    <div className="relative w-52">
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSearch()}
        placeholder="Search by Enquiries"
        className="w-full px-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] transition-colors"
      />
      {search && (
        <button onClick={() => onSearchChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <XIcon />
        </button>
      )}
    </div>
    <button onClick={onSearch}
      className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors">
      Search
    </button>
    <button onClick={onClear}
      className="px-4 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      Clear
    </button>
    {/* Enquiry Type */}
    <div className="relative">
      <select value={filterType} onChange={e => onFilterType(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none min-w-[120px]">
        <option value="">Enquiry Type</option>
        {ENQUIRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown /></div>
    </div>
    {/* Status */}
    <div className="relative">
      <select value={filterStatus} onChange={e => onFilterStatus(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none min-w-[100px]">
        <option value="">Status</option>
        {ENQUIRY_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown /></div>
    </div>
    <button onClick={onAdd}
      className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors">
      <PlusIcon />
      Add
    </button>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const Admissions = () => {
  const [activeTab, setActiveTab] = useState<MainTab>("admission");

  // Admission tab state
  const [admissions, setAdmissions] = useState<AdmissionEntry[]>(SEED_ADMISSIONS);
  const [admSearch, setAdmSearch]   = useState("");
  const [admApplied, setAdmApplied] = useState("");
  const [admType, setAdmType]       = useState("");
  const [admStatus, setAdmStatus]   = useState("");
  const [admPage, setAdmPage]       = useState(1);

  // General tab state
  const [generals, setGenerals]       = useState<GeneralEntry[]>(SEED_GENERAL);
  const [genSearch, setGenSearch]     = useState("");
  const [genApplied, setGenApplied]   = useState("");
  const [genType, setGenType]         = useState("");
  const [genStatus, setGenStatus]     = useState("");
  const [genPage, setGenPage]         = useState(1);

  // Modal
  const [showModal, setShowModal]     = useState(false);
  const [modalMode, setModalMode]     = useState<"add" | "edit">("add");
  const [editAdmRow, setEditAdmRow]   = useState<AdmissionEntry | null>(null);
  const [editGenRow, setEditGenRow]   = useState<GeneralEntry | null>(null);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);

  const openAdd = () => {
    setModalMode("add"); setEditAdmRow(null); setEditGenRow(null); setShowModal(true);
  };
  const openEditAdm = (row: AdmissionEntry) => {
    setModalMode("edit"); setEditAdmRow(row); setEditGenRow(null); setShowModal(true);
  };
  const openEditGen = (row: GeneralEntry) => {
    setModalMode("edit"); setEditGenRow(row); setEditAdmRow(null); setShowModal(true);
  };

  // ── Today's date display ─────────────────────────────────────────────────
  const today = new Date();
  const displayDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  // ── Filtered lists ───────────────────────────────────────────────────────
  const filteredAdm = admissions.filter(r => {
    const s = admApplied.toLowerCase();
    return (!s || r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s))
      && (!admStatus || r.status === admStatus);
  });

  const filteredGen = generals.filter(r => {
    const s = genApplied.toLowerCase();
    return (!s || r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s))
      && (!genStatus || r.visitPurpose.toLowerCase().includes(genStatus.toLowerCase()));
  });

  // Admission pagination
  const admTotal  = Math.max(1, Math.ceil(filteredAdm.length / ITEMS_PER_PAGE));
  const admSafe   = Math.min(admPage, admTotal);
  const admStart  = (admSafe - 1) * ITEMS_PER_PAGE;
  const admRows   = filteredAdm.slice(admStart, admStart + ITEMS_PER_PAGE);

  // General pagination
  const genTotal  = Math.max(1, Math.ceil(filteredGen.length / ITEMS_PER_PAGE));
  const genSafe   = Math.min(genPage, genTotal);
  const genStart  = (genSafe - 1) * ITEMS_PER_PAGE;
  const genRows   = filteredGen.slice(genStart, genStart + ITEMS_PER_PAGE);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSave = (type: MainTab, adm: AdmissionForm, gen: GeneralForm) => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "/");

    if (modalMode === "edit") {
      if (type === "admission" && editAdmRow) {
        setAdmissions(p => p.map(r => r.id === editAdmRow.id
          ? { ...r, name: adm.name, phone: adm.phone, email: adm.email,
              interestedCourse: adm.interestedCourse, source: adm.source,
              institution: adm.institution, status: adm.status, comments: adm.comments }
          : r));
        setSuccessMsg("Admission Enquiry Updated Successfully");
      } else if (type === "general" && editGenRow) {
        setGenerals(p => p.map(r => r.id === editGenRow.id
          ? { ...r, name: gen.name, phone: gen.phone, email: gen.email,
              visitPurpose: gen.visitPurpose, whomToMeet: gen.whomToMeet,
              others: gen.others, institution: gen.institution, comments: gen.comments }
          : r));
        setSuccessMsg("General Enquiry Updated Successfully");
      }
    } else {
      if (type === "admission") {
        const e: AdmissionEntry = {
          id: Date.now(), name: adm.name || "New Enquiry", phone: adm.phone,
          email: adm.email, interestedCourse: adm.interestedCourse, source: adm.source,
          date: today, status: adm.status || "Open", institution: adm.institution, comments: adm.comments,
        };
        setAdmissions(p => [e, ...p]);
        setSuccessMsg("Admission Enquiry Added Successfully");
      } else {
        const e: GeneralEntry = {
          id: Date.now(), name: gen.name || "New Visitor", phone: gen.phone,
          email: gen.email, visitPurpose: gen.visitPurpose, date: today,
          whomToMeet: gen.whomToMeet, others: gen.others, institution: gen.institution, comments: gen.comments,
        };
        setGenerals(p => [e, ...p]);
        setSuccessMsg("General Enquiry Added Successfully");
      }
    }
    setShowModal(false);
  };

  // Stats
  const totalVisitors   = admissions.length + generals.length;
  const admissionLeads  = admissions.filter(a => a.status === "Open" || a.status === "Follow-up").length;
  const pendingFollowUp = admissions.filter(a => a.status === "Follow-up").length;

  return (
    <div className="space-y-4">

      {/* ── Stats cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Visitor */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Visitor / Enquiry</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{totalVisitors}</p>
          </div>
        </div>

        {/* Admission Lead */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Admission Lead</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{admissionLeads}</p>
          </div>
        </div>

        {/* Pending Follow-Ups */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending Follow - Ups</p>
            <p className="text-2xl font-bold text-orange-500 mt-0.5">{pendingFollowUp}</p>
          </div>
        </div>
      </div>

      {/* ── Main card ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 px-5 pt-4 gap-6">
          {(["admission", "general"] as MainTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "pb-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px",
                activeTab === tab
                  ? "text-[#1D6BA3] border-[#1D6BA3]"
                  : "text-gray-500 border-transparent hover:text-gray-700",
              ].join(" ")}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Section title + date */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Visitor &amp; Admission Enquiries</h2>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {displayDate}
          </div>
        </div>

        {/* ── Admission tab content ── */}
        {activeTab === "admission" && (
          <>
            <SearchFilterRow
              search={admSearch} onSearchChange={setAdmSearch}
              onSearch={() => { setAdmApplied(admSearch); setAdmPage(1); }}
              onClear={() => { setAdmSearch(""); setAdmApplied(""); setAdmType(""); setAdmStatus(""); setAdmPage(1); }}
              filterType={admType} onFilterType={v => { setAdmType(v); setAdmPage(1); }}
              filterStatus={admStatus} onFilterStatus={v => { setAdmStatus(v); setAdmPage(1); }}
              onAdd={openAdd}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EFF6FF] border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Phone Number</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Interested Course</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {admRows.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No enquiries found.</td></tr>
                  ) : admRows.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-800 font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.phone}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.email}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{r.interestedCourse}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{r.source}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button title="Edit" onClick={() => openEditAdm(r)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#1D6BA3] hover:bg-[#1D6BA3]/10 transition-colors">
                            <EditIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={admSafe} totalPages={admTotal}
              totalItems={filteredAdm.length} startIdx={admStart}
              itemsPerPage={ITEMS_PER_PAGE} onPageChange={setAdmPage}
            />
          </>
        )}

        {/* ── General tab content ── */}
        {activeTab === "general" && (
          <>
            <SearchFilterRow
              search={genSearch} onSearchChange={setGenSearch}
              onSearch={() => { setGenApplied(genSearch); setGenPage(1); }}
              onClear={() => { setGenSearch(""); setGenApplied(""); setGenType(""); setGenStatus(""); setGenPage(1); }}
              filterType={genType} onFilterType={v => { setGenType(v); setGenPage(1); }}
              filterStatus={genStatus} onFilterStatus={v => { setGenStatus(v); setGenPage(1); }}
              onAdd={openAdd}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EFF6FF] border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Visitor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Phone Number</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Visit Purpose</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {genRows.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No visitors found.</td></tr>
                  ) : genRows.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-800 font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.phone}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.email}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{r.visitPurpose}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button title="Edit" onClick={() => openEditGen(r)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#1D6BA3] hover:bg-[#1D6BA3]/10 transition-colors">
                            <EditIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={genSafe} totalPages={genTotal}
              totalItems={filteredGen.length} startIdx={genStart}
              itemsPerPage={ITEMS_PER_PAGE} onPageChange={setGenPage}
            />
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <EnquiryModal
          mode={modalMode}
          defaultTab={editGenRow ? "general" : "admission"}
          initialAdm={editAdmRow ?? undefined}
          initialGen={editGenRow ?? undefined}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {/* Success popup */}
      {successMsg && (
        <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
    </div>
  );
};

export default Admissions;
