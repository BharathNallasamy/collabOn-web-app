import { useState, useMemo, useRef } from "react";
import { exportToExcel, readXlsxFile } from "../../utils/excel";
import { createPortal } from "react-dom";
import { ITEMS_PER_PAGE } from "../../constants";
import Pagination from "../../components/common/Pagination/Pagination";
import {
  EditIcon,
  PlusIcon,
  ChevronDown,
  XIcon,
  CheckIcon,
  SearchIcon,
  UploadIcon,
  ExportIcon,
  DocumentIcon,
} from "../../components/common/Icons/PageIcons";

import { 
  type Supplier 
} from "../../types/interfaces";
import { 
  SEED_SUPPLIERS as SEED 
} from "../../types/mockData";

type ViewMode = "list" | "form";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const CITIES_BY_STATE: Record<string, string[]> = {
  "Tamil Nadu":    ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
  "Karnataka":     ["Bengaluru", "Mysuru", "Hubli", "Mangaluru"],
  "Maharashtra":   ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Telangana":     ["Hyderabad", "Warangal", "Karimnagar"],
  "Kerala":        ["Thiruvananthapuram", "Kochi", "Kozhikode"],
  "Gujarat":       ["Ahmedabad", "Surat", "Vadodara"],
  "Andhra Pradesh":["Vijayawada", "Visakhapatnam", "Guntur"],
};

// ── Inline icons ──────────────────────────────────────────────────────────────
const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const BackArrow = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// ── Shared form primitives ────────────────────────────────────────────────────
const TextField = ({
  label, value, onChange, required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Enter"}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] transition-colors placeholder-gray-300"
    />
  </div>
);

const SelectField = ({
  label, value, onChange, options, required,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] transition-colors",
          !value ? "text-gray-400" : "text-gray-700",
        ].join(" ")}
      >
        <option value="">Select</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <ChevronDown />
      </div>
    </div>
  </div>
);

// ── Status Toggle ─────────────────────────────────────────────────────────────
const StatusToggle = ({ value, onChange }: { value: "Active" | "Inactive"; onChange: (v: "Active" | "Inactive") => void }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => onChange(value === "Active" ? "Inactive" : "Active")}
      className={[
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
        value === "Active" ? "bg-[#1D6BA3]" : "bg-gray-300",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
          value === "Active" ? "translate-x-[18px]" : "translate-x-[3px]",
        ].join(" ")}
      />
    </button>
    <span className="text-sm text-gray-600">{value}</span>
  </div>
);

// ── SuccessPopup ──────────────────────────────────────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Saved</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
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

// ── Supplier Form (screen — used for Add) ─────────────────────────────────────
// Layout matches Figma: page-level title, separate white section cards, bottom actions
interface SupplierFormProps {
  onSave: (s: Partial<Supplier>) => void;
  onCancel: () => void;
}

const SupplierForm = ({ onSave, onCancel }: SupplierFormProps) => {
  const [form, setForm] = useState<Partial<Supplier>>({ type: "None", status: "Active" });
  const set = (field: keyof Supplier) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));
  const cities = form.state ? (CITIES_BY_STATE[form.state] ?? []) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Page-level title with back arrow */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <BackArrow />
        </button>
        <h1 className="text-base font-bold text-gray-900">Add Supplier / Third Party</h1>
      </div>

      {/* Basic Details — separate white card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Basic Details</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField label="Name"    value={form.name ?? ""}    onChange={set("name")}    required />
            <TextField label="Company" value={form.company ?? ""} onChange={set("company")} required />
            <TextField label="Email"   value={form.email ?? ""}   onChange={set("email")}   placeholder="email@example.com" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField label="Phone"       value={form.phone ?? ""} onChange={set("phone")} />
            <TextField label="GST No"      value={form.gst ?? ""}   onChange={set("gst")} />
            <TextField label="MSME Number" value={form.msme ?? ""}  onChange={set("msme")} />
          </div>
        </div>
      </div>

      {/* Address — separate white card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Address</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Register Address" value={form.registerAddress ?? ""} onChange={set("registerAddress")} />
            <TextField label="Address Line 1"   value={form.addressLine1 ?? ""}   onChange={set("addressLine1")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectField
              label="State" value={form.state ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, state: v, city: "" }))}
              options={INDIAN_STATES}
            />
            <SelectField label="City"     value={form.city ?? ""}    onChange={set("city")}    options={cities} />
            <TextField   label="Pin Code" value={form.pinCode ?? ""} onChange={set("pinCode")} />
          </div>

          {/* Type + Status row — inside Address card, below fields */}
          <div className="flex items-center gap-6 flex-wrap pt-1">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Type</span>
              {(["None", "Purchase"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="supplierType-form"
                    value={t}
                    checked={form.type === t}
                    onChange={() => setForm((p) => ({ ...p, type: t }))}
                    className="w-4 h-4 accent-[#1D6BA3]"
                  />
                  <span className="text-sm text-gray-700">{t}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <StatusToggle
                value={form.status ?? "Active"}
                onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions — outside cards, bottom right */}
      <div className="flex items-center justify-end gap-3 py-1">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          className="px-6 py-2 text-sm font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// ── Supplier Modal (used for Edit only) ───────────────────────────────────────
interface ModalProps {
  supplier: Partial<Supplier>;
  onClose: () => void;
  onSave: (s: Partial<Supplier>) => void;
}

const SupplierModal = ({ supplier, onClose, onSave }: ModalProps) => {
  const [form, setForm] = useState<Partial<Supplier>>({ type: "None", status: "Active", ...supplier });
  const set = (field: keyof Supplier) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));
  const cities = form.state ? (CITIES_BY_STATE[form.state] ?? []) : [];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-[15px] font-bold text-gray-900">Edit Supplier / Third Party</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="-mx-6 px-6 py-2 bg-gray-50 border-y border-gray-100">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Basic Details</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <TextField label="Name"    value={form.name ?? ""}    onChange={set("name")}    required />
            <TextField label="Company" value={form.company ?? ""} onChange={set("company")} required />
            <TextField label="Email"   value={form.email ?? ""}   onChange={set("email")}   placeholder="email@example.com" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <TextField label="Phone"       value={form.phone ?? ""} onChange={set("phone")} />
            <TextField label="GST No"      value={form.gst ?? ""}   onChange={set("gst")} />
            <TextField label="MSME Number" value={form.msme ?? ""}  onChange={set("msme")} />
          </div>

          <div className="-mx-6 px-6 py-2 bg-gray-50 border-y border-gray-100">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Address</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Register Address" value={form.registerAddress ?? ""} onChange={set("registerAddress")} />
            <TextField label="Address Line 1"   value={form.addressLine1 ?? ""}   onChange={set("addressLine1")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <SelectField
              label="State" value={form.state ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, state: v, city: "" }))}
              options={INDIAN_STATES}
            />
            <SelectField label="City"     value={form.city ?? ""}    onChange={set("city")}    options={cities} />
            <TextField   label="Pin Code" value={form.pinCode ?? ""} onChange={set("pinCode")} />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-700">Type</span>
              {(["None", "Purchase"] as const).map((t) => (
                <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="supplierType-modal"
                    value={t}
                    checked={form.type === t}
                    onChange={() => setForm((p) => ({ ...p, type: t }))}
                    className="w-3.5 h-3.5 accent-[#1D6BA3]"
                  />
                  <span className="text-xs text-gray-700">{t}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-semibold text-gray-700">Status</span>
              <StatusToggle
                value={form.status ?? "Active"}
                onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="px-5 py-2 text-sm font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const SupplierManagement = () => {
  const [rows, setRows] = useState<Supplier[]>(SEED);
  const [view, setView] = useState<ViewMode>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editSupplier, setEditSupplier] = useState<Partial<Supplier> | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ fileName: string; added: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportToExcel(
      rows.map(r => ({ Name: r.name, Company: r.company, Type: r.type, Phone: r.phone, Email: r.email, "GST No": r.gst })),
      "Suppliers", "Supplier_Management.xlsx"
    );
  };

  const handleBulkUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadLoading(true);
    try {
      const data = await readXlsxFile(file);
      const added = data.length;
      const newRows: Supplier[] = data.map((r, i) => ({
        id: Date.now() + i,
        name: String(r["Name"] ?? r["name"] ?? ""),
        company: String(r["Company"] ?? r["company"] ?? ""),
        type: String(r["Type"] ?? r["type"] ?? "None") as "Purchase" | "None",
        phone: String(r["Phone"] ?? r["phone"] ?? ""),
        email: String(r["Email"] ?? r["email"] ?? ""),
        gst: String(r["GST No"] ?? r["gst"] ?? ""),
        msme: "", registerAddress: "", addressLine1: "", state: "", city: "", pinCode: "", status: "Active",
      }));
      setRows(p => [...newRows, ...p]);
      setUploadResult({ fileName: file.name, added, skipped: 0 });
    } catch {
      setUploadResult({ fileName: file.name, added: 0, skipped: 0 });
    } finally {
      setUploadLoading(false);
    }
  };

  const companies = useMemo(() => Array.from(new Set(rows.map((r) => r.company))).sort(), [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchName = searchActive ? r.name.toLowerCase().includes(searchActive.toLowerCase()) : true;
      const matchCompany = companyFilter ? r.company === companyFilter : true;
      return matchName && matchCompany;
    });
  }, [rows, searchActive, companyFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => { setSearchActive(searchTerm); setCurrentPage(1); };
  const handleClear = () => { setSearchTerm(""); setSearchActive(""); setCompanyFilter(""); setCurrentPage(1); };

  // Create New → navigate to form screen
  const openCreate = () => setView("form");

  // Edit → open modal popup (unchanged)
  const openEdit = (s: Supplier) => setEditSupplier(s);

  const handleSave = (form: Partial<Supplier>) => {
    if (form.id) {
      setRows((prev) => prev.map((r) => (r.id === form.id ? { ...r, ...form } as Supplier : r)));
      setEditSupplier(null);
    } else {
      const newId = Math.max(0, ...rows.map((r) => r.id)) + 1;
      setRows((prev) => [...prev, { ...form, id: newId } as Supplier]);
      setView("list");
    }
    setShowSuccess(true);
  };

  // ── Form screen view ────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <>
        <SupplierForm onSave={handleSave} onCancel={() => setView("list")} />
        {showSuccess && (
          <SuccessPopup message="Supplier Saved Successfully" onClose={() => setShowSuccess(false)} />
        )}
      </>
    );
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0 px-6 py-5 gap-4">
      {/* Upload banner outside the card */}
      {uploadResult && (
        <div className={["flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs border", uploadResult.added > 0 ? "bg-green-50 border-green-100 text-green-700" : "bg-amber-50 border-amber-100 text-amber-700"].join(" ")}>
          <span className="flex-1 font-medium">{uploadResult.fileName} — {uploadResult.added} supplier{uploadResult.added !== 1 ? "s" : ""} imported</span>
          <button onClick={() => setUploadResult(null)} className="text-gray-400 hover:text-gray-600"><XIcon /></button>
        </div>
      )}

      {/* Single white card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">

        {/* Title + action buttons */}
        <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-4 border-b border-gray-100">
          <h1 className="text-[18px] font-bold text-gray-900">Supplier / Third Party Management</h1>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
              <ExportIcon />
              Export
              <ChevronDown />
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            <button onClick={handleBulkUpload} disabled={uploadLoading} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#1D6BA3] text-[#1D6BA3] text-xs font-medium hover:bg-[#1D6BA3]/5 disabled:opacity-60 transition-colors">
              <UploadIcon />
              {uploadLoading ? "Importing…" : "Bulk Upload"}
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1D6BA3]/90 transition-colors shadow-sm"
            >
              <PlusIcon />
              Create New
            </button>
          </div>
        </div>

        {/* Search / Filter row */}
        <div className="flex items-center gap-2 justify-end flex-wrap px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by Name"
              className="w-44 h-9 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]"
            />
          </div>
          <div className="relative">
            <select
              value={companyFilter}
              onChange={(e) => { setCompanyFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none h-9 pl-3 pr-8 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] w-36"
            >
              <option value="">Company</option>
              {companies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <ChevronDown />
            </span>
          </div>
          <button onClick={handleSearch} className="h-9 px-4 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1D6BA3]/90 transition-colors">
            Search
          </button>
          <button onClick={handleClear} className="h-9 px-4 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
            Clear
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">GST No.</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-xs">No records found.</td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.company}</td>
                    <td className="px-4 py-3 text-gray-600">{row.type}</td>
                    <td className="px-4 py-3 text-gray-600">{row.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{row.email}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{row.gst}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button title="Edit" onClick={() => openEdit(row)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors">
                          <EditIcon />
                        </button>
                        <button title="Document" className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                          <DocumentIcon />
                        </button>
                        <button title="Link" className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                          <LinkIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          startIdx={startIdx}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Edit Modal */}
      {editSupplier && (
        <SupplierModal
          supplier={editSupplier}
          onClose={() => setEditSupplier(null)}
          onSave={handleSave}
        />
      )}

      {/* Success popup */}
      {showSuccess && (
        <SuccessPopup message="Supplier Saved Successfully" onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );

};

export default SupplierManagement;
