import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { type Lead, type InstitutionStructure, type PlanType, type CRMStatus } from "../../../types/interfaces";
import { SEED_LEADS, SEED_CRM_METRICS, SEED_ALL_STRUCTURES, SEED_ALL_PLANS, SEED_ALL_STATUSES, SEED_LEAD_SOURCES, SEED_ENGAGEMENT_MODELS, SEED_ACTION_TYPES } from "../../../types/mockData";

// ── Shared CRM Components ───────────────────────────────────────────────────

interface FieldProps {
  label: string;
  fkey: keyof Omit<Lead, "id">;
  errors: Partial<Record<keyof Omit<Lead, "id">, string>>;
  form: Omit<Lead, "id">;
  set: (k: keyof Omit<Lead, "id">, v: string) => void;
  required?: boolean;
}

const TextField = ({
  label, fkey, type = "text", placeholder = "Enter", required,
  errors, form, set
}: FieldProps & { type?: string; placeholder?: string }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      value={form[fkey] as string}
      onChange={e => set(fkey, e.target.value)}
      placeholder={placeholder}
      className={`h-9 px-3 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] transition-all bg-white ${
        errors[fkey] ? "border-red-400 bg-red-50" : "border-gray-200"
      }`}
    />
    {errors[fkey] && <p className="text-[10px] text-red-500">{errors[fkey]}</p>}
  </div>
);

const SelectField = ({
  label, fkey, options, placeholder = "Select", required,
  errors, form, set
}: FieldProps & { options: string[]; placeholder?: string }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <CustomDropdown
      value={form[fkey] as string}
      onChange={v => set(fkey, v)}
      options={options}
      placeholder={placeholder}
      hasError={!!errors[fkey]}
    />
    {errors[fkey] && <p className="text-[10px] text-red-500">{errors[fkey]}</p>}
  </div>
);

const DateField = ({ label, fkey, form, set }: Omit<FieldProps, "errors">) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    <div className="relative">
      <input
        type="date"
        value={form[fkey] as string}
        onChange={e => set(fkey, e.target.value)}
        placeholder="dd/mm/yyyy"
        className="w-full h-9 pl-3 pr-10 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] bg-white text-gray-700"
      />
      <svg
        className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  </div>
);


// ── Empty form ────────────────────────────────────────────────────────────────
const emptyForm = (): Omit<Lead, "id"> => ({
  institutionName: "", email: "", institutionPhone: "",
  contactPersonName: "", designation: "", phone: "",
  institutionStructure: "Single", leadSource: "",
  engagementModel: "", planType: "Starter",
  leadGeneratedBy: "", status: "New",
  nextAction: "", actionType: "", notes: "",
});

// ── Chevron used by native selects in the list/filter bar ────────────────────
const ChevronDown = () => (
  <svg
    className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// ── Custom picklist dropdown (form use only) ──────────────────────────────────
interface CustomDropdownProps {
  value:       string;
  onChange:    (v: string) => void;
  options:     string[];
  placeholder?: string;
  hasError?:   boolean;
}

const CustomDropdown = ({
  value, onChange, options, placeholder = "Select", hasError = false,
}: CustomDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full h-9 pl-3 pr-8 border rounded-lg text-xs text-left flex items-center bg-white transition-all focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] ${
          hasError ? "border-red-400" : open ? "border-[#1D6BA3]" : "border-gray-200"
        }`}
      >
        <span className={value ? "text-gray-700" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <svg
          className={`w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Options list */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 overflow-hidden">
          <div className="max-h-44 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-gray-50 ${
                  value === opt
                    ? "text-[#1D6BA3] font-semibold bg-blue-50/50"
                    : "text-gray-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Full-page Lead Form (Add / Edit)
// ═══════════════════════════════════════════════════════════════════════════════
interface LeadFormProps {
  mode:       "add" | "edit";
  initial?:   Lead;
  generators: string[];
  onSave:     (data: Omit<Lead, "id">) => void;
  onCancel:   () => void;
}

const LeadForm = ({ mode, initial, generators, onSave, onCancel }: LeadFormProps) => {
  const [form, setForm] = useState<Omit<Lead, "id">>(
    initial ? { ...initial } : emptyForm()
  );
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const set = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.institutionName.trim())   e.institutionName   = "Required";
    if (!form.contactPersonName.trim()) e.contactPersonName = "Required";
    if (!form.phone.trim())             e.phone             = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => { if (validate()) onSave(form); };


  const genOptions = generators.length > 0 ? generators : ["Amudhan", "Tammannah", "Priya", "Indhu"];

  return (
    <div className="space-y-5">

      {/* Page header */}
      <h1 className="text-xl font-bold text-gray-800">
        {mode === "add" ? "New Lead" : "Edit Lead"}
      </h1>

      {/* ── Section 1: Contact Information ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-5">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
          <TextField label="Institution Name" fkey="institutionName" required errors={errors} form={form} set={set} />
          <TextField label="Email"            fkey="email"            type="email" errors={errors} form={form} set={set} />
          <TextField label="Phone"            fkey="institutionPhone" placeholder="Enter" errors={errors} form={form} set={set} />
          <TextField label="Contact Person Name" fkey="contactPersonName" required errors={errors} form={form} set={set} />
          <TextField label="Designation"         fkey="designation" errors={errors} form={form} set={set} />
          <TextField label="Phone"               fkey="phone" required errors={errors} form={form} set={set} />
        </div>
      </div>

      {/* ── Section 2: Pipeline Stage ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-5">Pipeline Stage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4">
          <SelectField label="Lead Source"       fkey="leadSource"       options={SEED_LEAD_SOURCES} errors={errors} form={form} set={set} />
          <SelectField label="Engagement Model"  fkey="engagementModel"  options={SEED_ENGAGEMENT_MODELS} errors={errors} form={form} set={set} />
          <SelectField label="Plan Type"         fkey="planType"         options={SEED_ALL_PLANS} errors={errors} form={form} set={set} />
          <SelectField label="Lead Generated By" fkey="leadGeneratedBy"  options={genOptions} errors={errors} form={form} set={set} />
          <SelectField label="Status"            fkey="status"           options={SEED_ALL_STATUSES} errors={errors} form={form} set={set} />
          <SelectField label="Institution Structure" fkey="institutionStructure" options={SEED_ALL_STRUCTURES} errors={errors} form={form} set={set} />
        </div>
      </div>

      {/* ── Section 3: Next Action ─────────────────────────────────────── */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Next Action
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 mb-4">
          <DateField label="Date" fkey="nextAction" form={form} set={set} />
          <SelectField label="Action Type" fkey="actionType" options={SEED_ACTION_TYPES} errors={errors} form={form} set={set} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Notes</label>
          <textarea
            rows={4}
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
            placeholder="Discussion points..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] resize-none bg-white text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── Footer buttons ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-2">
        <button
          onClick={onCancel}
          className="h-9 px-6 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="h-9 px-6 bg-[#1D6BA3] hover:bg-[#1A5F91] text-white text-xs font-bold rounded-lg transition-all shadow-sm"
        >
          Save Changes
        </button>
      </div>

    </div>
  );
};

// ── Success popup ─────────────────────────────────────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex flex-col items-center py-8 px-5 gap-3">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-gray-800 text-center">{message}</p>
          <button
            onClick={onClose}
            className="mt-1 h-8 px-6 bg-[#1D6BA3] text-white text-xs font-bold rounded-lg hover:bg-[#1A5F91] transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

// ═══════════════════════════════════════════════════════════════════════════════
// CRM Page
// ═══════════════════════════════════════════════════════════════════════════════
type ViewMode = "list" | "add" | "edit";

const CRM = () => {
  const [leads,        setLeads]        = useState<Lead[]>(SEED_LEADS);
  const [viewMode,     setViewMode]     = useState<ViewMode>("list");
  const [editingLead,  setEditingLead]  = useState<Lead | null>(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genFilter,    setGenFilter]    = useState("");
  const [successMsg,   setSuccessMsg]   = useState("");

  // ── Stats ─────────────────────────────────────────────────────────────────
  const STATS = [
    { label: "TOTAL LEADS",              value: String(leads.length) },
    { label: "TRAIL TO PAID CONVERSION", value: `${SEED_CRM_METRICS.trailToPaidConversion}%` },
    { label: "OVERALL CONVERSION RATE",  value: `${SEED_CRM_METRICS.overallConversionRate}%` },
    { label: "TASKS TODAY",              value: String(SEED_CRM_METRICS.tasksToday) },
  ];

  // ── Unique lead generators ────────────────────────────────────────────────
  const generators = useMemo(
    () => Array.from(new Set(leads.map(l => l.leadGeneratedBy))).sort(),
    [leads]
  );

  // ── Live filtering ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter(l => {
      const matchSearch =
        !q ||
        l.institutionName.toLowerCase().includes(q) ||
        l.contactPersonName.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.leadGeneratedBy.toLowerCase().includes(q);
      const matchStatus = !statusFilter || l.status === statusFilter;
      const matchGen    = !genFilter    || l.leadGeneratedBy === genFilter;
      return matchSearch && matchStatus && matchGen;
    });
  }, [leads, search, statusFilter, genFilter]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveLead = (data: Omit<Lead, "id">) => {
    if (viewMode === "add") {
      const newId = Math.max(...leads.map(l => l.id), 0) + 1;
      setLeads(prev => [...prev, { id: newId, ...data }]);
      setSuccessMsg("Lead added successfully.");
    } else if (editingLead) {
      setLeads(prev => prev.map(l => l.id === editingLead.id ? { ...l, ...data } : l));
      setSuccessMsg("Lead updated successfully.");
    }
    setViewMode("list");
    setEditingLead(null);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setViewMode("edit");
  };

  const handleCancel = () => {
    setViewMode("list");
    setEditingLead(null);
  };

  const handleExport = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "Institution Name", "Institution Structure", "Contact Person", "Phone",
        "Lead Source", "Lead Generated By", "Plan Type",
        "Next Action", "Status", "Email", "Designation",
        "Engagement Model", "Action Type", "Notes",
      ],
      ...filtered.map(l => [
        l.institutionName, l.institutionStructure, l.contactPersonName, l.phone,
        l.leadSource, l.leadGeneratedBy, l.planType,
        l.nextAction, l.status, l.email, l.designation,
        l.engagementModel, l.actionType, l.notes,
      ]),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CRM Leads");
    XLSX.writeFile(wb, "CRM_Leads.xlsx");
  };

  // ── Full-page form view ───────────────────────────────────────────────────
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <>
        <LeadForm
          mode={viewMode}
          initial={editingLead ?? undefined}
          generators={generators}
          onSave={handleSaveLead}
          onCancel={handleCancel}
        />
        {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg("")} />}
      </>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <>
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Leads & Pipeline</h1>
        <button
          onClick={() => setViewMode("add")}
          className="h-9 px-4 bg-[#1D6BA3] hover:bg-[#1A5F91] text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          + Add Lead
        </button>
      </div>

      {/* ── Stats cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              {s.label}
            </p>
            <p className="text-2xl font-bold text-gray-800 leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">

          {/* Search */}
          <div className="relative">
            <svg
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="h-9 pl-9 pr-4 w-52 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] placeholder:text-gray-400"
            />
          </div>

          {/* Status filter */}
          <div className="relative min-w-[130px]">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full h-9 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none cursor-pointer"
            >
              <option value="">Status</option>
              {SEED_ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown />
          </div>

          {/* Lead Generator By */}
          <div className="relative min-w-[170px]">
            <select
              value={genFilter}
              onChange={e => setGenFilter(e.target.value)}
              className="w-full h-9 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none cursor-pointer"
            >
              <option value="">Leads Generator by</option>
              {generators.map(g => <option key={g}>{g}</option>)}
            </select>
            <ChevronDown />
          </div>
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          className="h-9 px-4 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "920px" }}>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "Institution Name", "Institution Structure", "Contact Person",
                  "Phone", "Lead Source", "Lead Generated By",
                  "Exp Plan Type", "Next Action", "Status", "Actions",
                ].map(label => (
                  <th
                    key={label}
                    className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-400">
                    No leads found
                  </td>
                </tr>
              ) : (
                filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">

                    <td className="px-4 py-3.5">
                      <p className="text-[12px] font-semibold text-gray-800 whitespace-nowrap">
                        {lead.institutionName}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 text-[12px] text-gray-600 whitespace-nowrap">
                      {lead.institutionStructure}
                    </td>

                    <td className="px-4 py-3.5 text-[12px] font-medium text-gray-700">
                      {lead.contactPersonName}
                    </td>

                    <td className="px-4 py-3.5 text-[12px] text-gray-600 whitespace-nowrap">
                      {lead.phone}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-[12px] font-semibold text-gray-800 whitespace-nowrap">
                        {lead.leadSource}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-[12px] text-gray-700">
                      {lead.leadGeneratedBy}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${PLAN_STYLE[lead.planType]}`}>
                        {lead.planType}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {lead.nextAction && lead.nextAction !== "—" ? (
                        <span className="flex items-center gap-1.5 text-[12px] text-gray-600 whitespace-nowrap">
                          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {lead.nextAction}
                        </span>
                      ) : (
                        <span className="text-[12px] text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-bold tracking-wide ${STATUS_STYLE[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(lead)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-blue-50 text-gray-400 hover:text-[#1D6BA3] transition-colors"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="View Details"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11px] text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
            <span className="font-semibold text-gray-700">{leads.length}</span> leads
          </p>
        </div>
      </div>

    </div>

    {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg("")} />}
    </>
  );
};

export default CRM;
