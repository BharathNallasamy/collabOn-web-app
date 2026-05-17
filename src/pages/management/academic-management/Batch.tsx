import { useState, useRef, useEffect, Fragment } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import Button from "../../../components/common/Button/Button";

// ── Constants ─────────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(CURRENT_YEAR - 2 + i));

const STATUS_OPTIONS = ["Active", "Inactive"] as const;
type BatchStatus = (typeof STATUS_OPTIONS)[number];

const LINKED_CLASSES = [
  "B.A Tamil - 1st Year",   "B.A Tamil - 2nd Year",   "B.A Tamil - 3rd Year",
  "B.A English - 1st Year", "B.A English - 2nd Year", "B.A English - 3rd Year",
  "B.Com (G) - 1st Year",   "B.Com (G) - 2nd Year",   "B.Com (G) - 3rd Year",
  "B.Com (CS) - 1st Year",  "B.Com (CS) - 2nd Year",  "B.Com (CS) - 3rd Year",
  "B.Tech CSE - 1st Year",  "B.Tech CSE - 2nd Year",
] as const;

const ITEMS_PER_PAGE = 7;

// ── Types ─────────────────────────────────────────────────────────────────────
import { type Batch } from "../../../types/interfaces";
import { SEED_BATCHES } from "../../../types/mockData";

type UploadResult = { fileName: string; added: number; skipped: number; errors: string[] } | null;


// ── Excel parsing ─────────────────────────────────────────────────────────────
const normalise = (s: unknown) => String(s ?? "").trim().toLowerCase();

const parseXlsxRows = (rows: Record<string, unknown>[]): { added: Batch[]; skipped: string[] } => {
  const added: Batch[]    = [];
  const skipped: string[] = [];

  rows.forEach((row, i) => {
    const find = (...keys: string[]) => {
      for (const k of Object.keys(row)) {
        if (keys.includes(normalise(k))) return row[k];
      }
    };
    const batchName   = String(find("batch name", "batch") ?? "").trim();
    const linkedClass = String(find("linked class", "class") ?? "").trim();
    const startYear   = String(find("start year", "start") ?? CURRENT_YEAR).trim();
    const endYear     = String(find("end year", "end")     ?? CURRENT_YEAR + 2).trim();
    const statusRaw   = normalise(find("status"));
    const status: BatchStatus = statusRaw === "inactive" ? "Inactive" : "Active";

    if (!batchName) { skipped.push(`Row ${i + 2} — missing batch name`); return; }
    added.push({ id: Date.now() + i, batchName, linkedClass, startYear, endYear, status });
  });

  return { added, skipped };
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-4 h-4 text-[#1D6BA3] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const ChevronDown = () => (
  <svg className="w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// ── Shared UI helpers ─────────────────────────────────────────────────────────
const MultiSelectDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select",
  error,
}: {
  options: readonly string[] | string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = value ? value.split(", ").filter(Boolean) : [];

  const toggleOption = (opt: string) => {
    let next;
    if (selected.includes(opt)) {
      next = selected.filter(s => s !== opt);
    } else {
      next = [...selected, opt];
    }
    onChange(next.join(", "));
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={[
          "w-full px-4 py-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer flex items-center justify-between",
          error ? "border-red-400" : "border-gray-200",
          selected.length === 0 ? "text-gray-400" : "text-gray-800",
        ].join(" ")}
      >
        <span className="truncate pr-2">
          {selected.length === 0 ? placeholder : selected.join(", ")}
        </span>
        <ChevronDown />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
                className="w-4 h-4 accent-[#1D6BA3] cursor-pointer rounded border-gray-300 focus:ring-[#1D6BA3]"
              />
              <span className="text-sm text-gray-700 select-none">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const IconBtn = ({ children, title, onClick }: { children: React.ReactNode; title: string; onClick?: () => void }) => (
  <button title={title} onClick={onClick}
    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors">
    {children}
  </button>
);

// Year picker field (calendar icon + coloured year + chevron)
const YearSelect = ({
  value, onChange, label,
}: { value: string; onChange: (v: string) => void; label: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative flex items-center border border-gray-200 rounded-xl bg-white px-3 py-2.5 gap-2">
      <CalendarIcon />
      <select value={value} onChange={e => onChange(e.target.value)}
        className="flex-1 appearance-none text-sm font-semibold text-[#1D6BA3] bg-transparent focus:outline-none cursor-pointer pr-4">
        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center"><ChevronDown /></div>
    </div>
  </div>
);

// ── Auto-close Success Popup ──────────────────────────────────────────────────
const SuccessPopup = ({
  title, message, onClose,
}: { title: string; message: string; onClose: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">{title}</h3>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>
        <div className="flex flex-col items-center py-10 px-5 gap-3">
          <div className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30">
            <CheckIcon />
          </div>
          <p className="text-[13px] font-bold text-gray-800 text-center mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};

// ── Pagination ─────────────────────────────────────────────────────────────────
const Pagination = ({
  currentPage, totalPages, totalItems, startIdx, onPageChange,
}: {
  currentPage: number; totalPages: number; totalItems: number;
  startIdx: number; onPageChange: (p: number) => void;
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-700">{totalItems > 0 ? startIdx + 1 : 0}</span> To{" "}
        <span className="font-semibold text-gray-700">{Math.min(startIdx + ITEMS_PER_PAGE, totalItems)}</span> Of{" "}
        <span className="font-semibold text-gray-700">{totalItems}</span> Results
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className="px-3 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Previous
        </button>
        {pages.map((page, i) => {
          const prev = pages[i - 1];
          return (
            <Fragment key={page}>
              {prev !== undefined && page - prev > 1 && <span className="px-1 text-xs text-gray-400">…</span>}
              <button onClick={() => onPageChange(page)}
                className={["w-7 h-7 text-xs rounded-md font-medium transition-colors",
                  page === currentPage ? "bg-[#1D6BA3] text-white" : "text-gray-600 hover:bg-gray-100"].join(" ")}>
                {page}
              </button>
            </Fragment>
          );
        })}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Next
        </button>
      </div>
    </div>
  );
};

// ── Add Batch Modal ────────────────────────────────────────────────────────────
interface AddBatchModalProps {
  onClose: () => void;
  onSave: (data: Omit<Batch, "id" | "status">) => void;
}

const AddBatchModal = ({ onClose, onSave }: AddBatchModalProps) => {
  const [batchName,   setBatchName]   = useState("");
  const [linkedClass, setLinkedClass] = useState("");
  const [startYear,   setStartYear]   = useState(String(CURRENT_YEAR));
  const [endYear,     setEndYear]     = useState(String(CURRENT_YEAR + 2));
  const [nameError,   setNameError]   = useState("");

  const handleSave = () => {
    if (!batchName.trim()) { setNameError("Batch name is required."); return; }
    onSave({ batchName: batchName.trim(), linkedClass, startYear, endYear });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-900">Add New Batch</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 grid grid-cols-2 gap-x-6 gap-y-5">

          {/* Batch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
            <input type="text" value={batchName}
              onChange={e => { setBatchName(e.target.value); setNameError(""); }}
              placeholder="Enter"
              className={["w-full px-4 py-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400",
                nameError ? "border-red-400" : "border-gray-200"].join(" ")} />
            {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
          </div>

          {/* Linked Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Linked Class</label>
            <MultiSelectDropdown
              options={LINKED_CLASSES}
              value={linkedClass}
              onChange={setLinkedClass}
              placeholder="Select"
            />
          </div>

          {/* Start Year */}
          <YearSelect value={startYear} onChange={setStartYear} label="Start Year" />

          {/* End Year */}
          <YearSelect value={endYear} onChange={setEndYear} label="End Year" />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button variant="ghost"   size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Edit Batch Modal ───────────────────────────────────────────────────────────
interface EditBatchModalProps {
  batch: Batch;
  onClose: () => void;
  onSave: (updated: Batch) => void;
}

const EditBatchModal = ({ batch, onClose, onSave }: EditBatchModalProps) => {
  const [batchName,   setBatchName]   = useState(batch.batchName);
  const [linkedClass, setLinkedClass] = useState(batch.linkedClass);
  const [startYear,   setStartYear]   = useState(batch.startYear);
  const [endYear,     setEndYear]     = useState(batch.endYear);
  const [status,      setStatus]      = useState<BatchStatus>(batch.status);
  const [nameError,   setNameError]   = useState("");

  const handleSave = () => {
    if (!batchName.trim()) { setNameError("Batch name is required."); return; }
    onSave({ ...batch, batchName: batchName.trim(), linkedClass, startYear, endYear, status });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-900">Edit Batch</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 grid grid-cols-2 gap-x-6 gap-y-5">

          {/* Batch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
            <input type="text" value={batchName}
              onChange={e => { setBatchName(e.target.value); setNameError(""); }}
              placeholder="Enter"
              className={["w-full px-4 py-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400",
                nameError ? "border-red-400" : "border-gray-200"].join(" ")} />
            {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
          </div>

          {/* Linked Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Linked Class</label>
            <MultiSelectDropdown
              options={LINKED_CLASSES}
              value={linkedClass}
              onChange={setLinkedClass}
              placeholder="Select"
            />
          </div>

          {/* Start Year */}
          <YearSelect value={startYear} onChange={setStartYear} label="Start Year" />

          {/* End Year */}
          <YearSelect value={endYear} onChange={setEndYear} label="End Year" />

          {/* Status — spans only left column */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="relative">
              <select value={status} onChange={e => setStatus(e.target.value as BatchStatus)}
                className={["w-full appearance-none pl-4 pr-10 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer",
                  !status ? "text-gray-400" : "text-gray-800"].join(" ")}>
                <option value="">Select</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center"><ChevronDown /></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button variant="ghost"   size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const BatchManagement = () => {
  const [batches,      setBatches]     = useState<Batch[]>(SEED_BATCHES);
  const [showAdd,      setShowAdd]     = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [successMode,  setSuccessMode] = useState<"add" | "edit" | null>(null);

  // Search
  const [searchInput,   setSearchInput]   = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [currentPage,   setCurrentPage]   = useState(1);

  // Upload
  const [uploadResult,  setUploadResult]  = useState<UploadResult>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = batches.filter(b => {
    const q = searchApplied.toLowerCase();
    return !q || b.batchName.toLowerCase().includes(q);
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIdx   = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems  = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => { setSearchApplied(searchInput); setCurrentPage(1); };
  const handleClear  = () => { setSearchInput(""); setSearchApplied(""); setCurrentPage(1); };

  // ── Bulk upload ────────────────────────────────────────────────────────────
  const handleBulkUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadLoading(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data  = new Uint8Array(evt.target!.result as ArrayBuffer);
        const wb    = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows  = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
        const { added, skipped } = parseXlsxRows(rows);

        const existingNames = new Set(batches.map(b => b.batchName.toLowerCase()));
        const toAdd    = added.filter(b => !existingNames.has(b.batchName.toLowerCase()));
        const dupNames = added.filter(b =>  existingNames.has(b.batchName.toLowerCase()))
          .map(b => `"${b.batchName}" already exists`);

        if (toAdd.length > 0) { setBatches(prev => [...prev, ...toAdd]); setCurrentPage(1); }

        setUploadResult({
          fileName: file.name,
          added:    toAdd.length,
          skipped:  skipped.length + dupNames.length,
          errors:   [...skipped, ...dupNames],
        });
      } catch {
        setUploadResult({ fileName: file.name, added: 0, skipped: 0, errors: ["Failed to parse file — ensure it is a valid .xlsx or .csv"] });
      } finally {
        setUploadLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAddSave = (data: Omit<Batch, "id" | "status">) => {
    setBatches(prev => [...prev, { id: Date.now(), status: "Active", ...data }]);
    setCurrentPage(1);
    setShowAdd(false);
    setSuccessMode("add");
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEditSave = (updated: Batch) => {
    setBatches(prev => prev.map(b => b.id === updated.id ? updated : b));
    setEditingBatch(null);
    setSuccessMode("edit");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Batch Management</h1>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            <button
              onClick={handleBulkUploadClick}
              disabled={uploadLoading}
              title="Upload .xlsx or .csv — columns: Batch Name | Linked Class | Start Year | End Year | Status"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 disabled:opacity-60 transition-colors">
              <UploadIcon />
              {uploadLoading ? "Importing…" : "Bulk Upload"}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors">
              <PlusIcon />
              Add Batch
            </button>
          </div>
        </div>

        {/* Upload result banner */}
        {uploadResult && (
          <div className={["flex items-start gap-3 px-5 py-3 border-b text-xs",
            uploadResult.added > 0 ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"].join(" ")}>
            <div className="flex-1 min-w-0">
              <p className={["font-semibold", uploadResult.added > 0 ? "text-green-700" : "text-amber-700"].join(" ")}>
                {uploadResult.fileName} — {uploadResult.added} batch{uploadResult.added !== 1 ? "es" : ""} added
                {uploadResult.skipped > 0 && `, ${uploadResult.skipped} skipped`}
              </p>
              {uploadResult.errors.slice(0, 3).map((err, i) => (
                <p key={i} className="text-amber-600 mt-0.5 truncate">{err}</p>
              ))}
              {uploadResult.errors.length > 3 && (
                <p className="text-amber-500 mt-0.5">+{uploadResult.errors.length - 3} more issues</p>
              )}
            </div>
            <button onClick={() => setUploadResult(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Search row */}
        <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 border-b border-gray-100">
          <div className="relative min-w-[220px] max-w-xs">
            <input
              type="text"
              placeholder="Search by Batch Name"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-4 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400"
            />
            {searchInput && (
              <button onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={handleSearch}>Search</Button>
          <Button variant="ghost"   size="sm" onClick={handleClear}>Clear</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                {["S No", "Batch Name", "Start Year", "End Year", "Actions"].map(h => (
                  <th key={h} className={["py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap",
                    h === "Actions" ? "pr-5 text-right" :
                    h === "S No"    ? "pl-5 pr-3 text-left w-20" : "px-4 text-left",
                  ].join(" ")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length > 0 ? pageItems.map((batch, idx) => (
                <tr key={batch.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="pl-5 pr-3 py-3.5 text-gray-500 font-medium">
                    {String(startIdx + idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">{batch.batchName}</td>
                  <td className="px-4 py-3.5 text-gray-700">{batch.startYear}</td>
                  <td className="px-4 py-3.5 text-gray-700">{batch.endYear}</td>
                  <td className="pr-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <IconBtn title="Edit" onClick={() => setEditingBatch(batch)}><EditIcon /></IconBtn>
                      <IconBtn title="View Details"><DocumentIcon /></IconBtn>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">No batches found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIdx={startIdx}
          onPageChange={p => { if (p >= 1 && p <= totalPages) setCurrentPage(p); }}
        />
      </div>

      {/* Add Modal */}
      {showAdd && (
        <AddBatchModal onClose={() => setShowAdd(false)} onSave={handleAddSave} />
      )}

      {/* Edit Modal */}
      {editingBatch && (
        <EditBatchModal
          batch={editingBatch}
          onClose={() => setEditingBatch(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Success Popups — auto-close after 5 s */}
      {successMode === "add" && (
        <SuccessPopup
          title="Add"
          message="New Batch Added Successfully"
          onClose={() => setSuccessMode(null)}
        />
      )}
      {successMode === "edit" && (
        <SuccessPopup
          title="Edit"
          message="Batch Edited Successfully"
          onClose={() => setSuccessMode(null)}
        />
      )}
    </>
  );
};

export default BatchManagement;
