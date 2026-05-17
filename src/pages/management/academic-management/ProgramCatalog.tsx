import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import Button from "../../../components/common/Button/Button";

// ── Constants ────────────────────────────────────────────────────────────────
const PROGRAM_TYPES = ["UG", "PG", "PHD", "Integrated", "Diploma"] as const;
type ProgramType = (typeof PROGRAM_TYPES)[number];

const STREAMS = [
  "Technology",
  "Arts and Science",
  "Commerce",
  "Humanities",
  "Management",
  "Science",
  "Education",
  "Law",
] as const;

const INSTITUTIONS = ["College", "University", "Institute", "School of Business"] as const;

const ITEMS_PER_PAGE = 7;

// ── Types ─────────────────────────────────────────────────────────────────────
import { type Degree } from "../../../types/interfaces";
import { SEED_DEGREES } from "../../../types/mockData";

type ViewMode = "list" | "form";


// ── Excel parsing ──────────────────────────────────────────────────────────────
const normalise = (s: unknown) =>
  String(s ?? "")
    .trim()
    .toLowerCase();

const parseXlsxRows = (rows: Record<string, unknown>[]): { added: Degree[]; skipped: string[] } => {
  const added: Degree[] = [];
  const skipped: string[] = [];

  rows.forEach((row, i) => {
    const find = (...keys: string[]) => {
      for (const k of Object.keys(row)) {
        if (keys.includes(normalise(k))) return row[k];
      }
    };

    const degreeName = String(find("degree type", "degree name", "degree", "name") ?? "").trim();
    const programType = String(find("program type", "type", "program") ?? "UG")
      .trim()
      .toUpperCase() as ProgramType;
    const duration = Math.max(
      1,
      parseInt(String(find("duration", "duration (yrs)", "years") ?? "3"), 10) || 3
    );
    const stream = String(find("stream") ?? "Technology").trim();
    const semesters = Math.max(1, parseInt(String(find("semesters", "semester") ?? "6"), 10) || 6);
    const institution = String(find("institution", "college") ?? "College").trim();
    const statusRaw = normalise(find("status"));
    const status: "Active" | "Inactive" = statusRaw === "inactive" ? "Inactive" : "Active";

    if (!degreeName) {
      skipped.push(`Row ${i + 2} — missing degree name`);
      return;
    }

    added.push({
      id: Date.now() + i,
      degreeName,
      programType,
      duration,
      stream,
      semesters,
      institution,
      status,
    });
  });

  return { added, skipped };
};

type UploadResult = { fileName: string; added: number; skipped: number; errors: string[] } | null;

// ── Shared icons ───────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const BackArrow = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);
const ChevronDown = () => (
  <svg
    className="w-4 h-4 text-gray-400 pointer-events-none"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const XIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconBtn = ({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
}) => (
  <button
    title={title}
    onClick={onClick}
    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors"
  >
    {children}
  </button>
);

// ── Status badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: "Active" | "Inactive" }) => (
  <span
    className={[
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      status === "Active"
        ? "text-green-600 border-green-400 bg-green-50"
        : "text-red-500 border-red-400 bg-red-50",
    ].join(" ")}
  >
    {status}
  </span>
);

// ── Program type badge ─────────────────────────────────────────────────────────
const TypeBadge = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    UG: "bg-blue-50 text-blue-700 border-blue-200",
    PG: "bg-purple-50 text-purple-700 border-purple-200",
    PHD: "bg-amber-50 text-amber-700 border-amber-200",
    Integrated: "bg-teal-50 text-teal-700 border-teal-200",
    Diploma: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border",
        colors[type] ?? colors.Diploma,
      ].join(" ")}
    >
      {type}
    </span>
  );
};

// ── FilterSelect ───────────────────────────────────────────────────────────────
const FilterSelect = ({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[];
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer min-w-[120px]"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
      <ChevronDown />
    </div>
  </div>
);

// ── FormField ─────────────────────────────────────────────────────────────────
const FormField = ({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// ── FormInput ─────────────────────────────────────────────────────────────────
const FormInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  error?: boolean;
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={[
      "w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 placeholder-gray-400",
      error ? "border-red-400 ring-2 ring-red-200" : "border-gray-200",
    ].join(" ")}
  />
);

// ── FormSelect ────────────────────────────────────────────────────────────────
const FormSelect = ({
  value,
  onChange,
  placeholder,
  options,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[];
  error?: boolean;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={[
        "w-full appearance-none pl-3 pr-8 py-2 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 cursor-pointer",
        error ? "border-red-400 ring-2 ring-red-200" : "border-gray-200",
        !value ? "text-gray-400" : "text-gray-800",
      ].join(" ")}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
      <ChevronDown />
    </div>
  </div>
);

// ── Pagination ─────────────────────────────────────────────────────────────────
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  startIdx,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIdx: number;
  itemsPerPage: number;
  onPageChange: (p: number) => void;
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-700">{totalItems > 0 ? startIdx + 1 : 0}</span> To{" "}
        <span className="font-semibold text-gray-700">
          {Math.min(startIdx + itemsPerPage, totalItems)}
        </span>{" "}
        Of <span className="font-semibold text-gray-700">{totalItems}</span> Results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        {pages.map((page, i) => {
          const prev = pages[i - 1];
          return (
            <React.Fragment key={page}>
              {prev !== undefined && page - prev > 1 && (
                <span className="px-2 py-1 text-xs text-gray-400">…</span>
              )}
              <button
                onClick={() => onPageChange(page)}
                className={[
                  "w-7 h-7 text-xs rounded-md font-medium transition-colors",
                  page === currentPage
                    ? "bg-[#1D6BA3] text-white"
                    : "text-gray-600 hover:bg-gray-100",
                ].join(" ")}
              >
                {page}
              </button>
            </React.Fragment>
          );
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ── Success popup ──────────────────────────────────────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-[14px] font-bold text-gray-900">Saved</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
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
  </div>
);

// ── Form errors ────────────────────────────────────────────────────────────────
interface FormErrors {
  degreeName?: string;
  programType?: string;
  stream?: string;
  duration?: string;
  semesters?: string;
  institution?: string;
}

// ── New / Edit Degree Form ─────────────────────────────────────────────────────
interface DegreeFormProps {
  editingDegree: Degree | null;
  onSave: (data: Omit<Degree, "id">) => void;
  onCancel: () => void;
}

const DegreeForm = ({ editingDegree, onSave, onCancel }: DegreeFormProps) => {
  const [degreeName, setDegreeName] = useState(editingDegree?.degreeName ?? "");
  const [programType, setProgramType] = useState(editingDegree?.programType ?? "");
  const [stream, setStream] = useState(editingDegree?.stream ?? "");
  const [duration, setDuration] = useState(
    editingDegree?.duration ? String(editingDegree.duration) : ""
  );
  const [semesters, setSemesters] = useState(
    editingDegree?.semesters ? String(editingDegree.semesters) : ""
  );
  const [institution, setInstitution] = useState(editingDegree?.institution ?? "");
  const [status, setStatus] = useState<"Active" | "Inactive">(editingDegree?.status ?? "Active");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!degreeName.trim()) e.degreeName = "Degree name is required.";
    if (!programType) e.programType = "Program type is required.";
    if (!stream) e.stream = "Stream is required.";
    if (!duration || isNaN(Number(duration)) || Number(duration) < 1)
      e.duration = "Valid duration is required.";
    if (!semesters || isNaN(Number(semesters)) || Number(semesters) < 1)
      e.semesters = "Valid semesters count is required.";
    if (!institution) e.institution = "Institution is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      degreeName: degreeName.trim(),
      programType: programType as ProgramType,
      stream,
      duration: Number(duration),
      semesters: Number(semesters),
      institution,
      status,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <BackArrow />
        </button>
        <h1 className="text-base font-bold text-gray-900">
          {editingDegree ? "Edit Degree" : "New Degree"}
        </h1>
      </div>

      {/* Form body */}
      <div className="p-6 space-y-6">
        {/* Row 1: Name + Type + Stream */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Degree Type" required error={errors.degreeName}>
            <FormInput
              value={degreeName}
              onChange={(v) => {
                setDegreeName(v);
                setErrors((p) => ({ ...p, degreeName: undefined }));
              }}
              placeholder="Enter"
              error={!!errors.degreeName}
            />
          </FormField>

          <FormField label="Program Type" required error={errors.programType}>
            <FormSelect
              value={programType}
              onChange={(v) => {
                setProgramType(v);
                setErrors((p) => ({ ...p, programType: undefined }));
              }}
              placeholder="Select"
              options={PROGRAM_TYPES}
              error={!!errors.programType}
            />
          </FormField>

          <FormField label="Stream" required error={errors.stream}>
            <FormSelect
              value={stream}
              onChange={(v) => {
                setStream(v);
                setErrors((p) => ({ ...p, stream: undefined }));
              }}
              placeholder="Select"
              options={STREAMS}
              error={!!errors.stream}
            />
          </FormField>
        </div>

        {/* Row 2: Duration + Semesters + Institution */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Duration (Year)" required error={errors.duration}>
            <FormInput
              value={duration}
              onChange={(v) => {
                setDuration(v.replace(/\D/g, ""));
                setErrors((p) => ({ ...p, duration: undefined }));
              }}
              placeholder="Enter"
              type="text"
              error={!!errors.duration}
            />
          </FormField>

          <FormField label="Semesters" required error={errors.semesters}>
            <FormInput
              value={semesters}
              onChange={(v) => {
                setSemesters(v.replace(/\D/g, ""));
                setErrors((p) => ({ ...p, semesters: undefined }));
              }}
              placeholder="Enter"
              type="text"
              error={!!errors.semesters}
            />
          </FormField>

          <FormField label="Institution" required error={errors.institution}>
            <FormSelect
              value={institution}
              onChange={(v) => {
                setInstitution(v);
                setErrors((p) => ({ ...p, institution: undefined }));
              }}
              placeholder="Select"
              options={INSTITUTIONS}
              error={!!errors.institution}
            />
          </FormField>
        </div>

        {/* Status */}
        <FormField label="Status">
          <div className="flex items-center gap-6 mt-1">
            {(["Active", "Inactive"] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="degree-status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="w-4 h-4 accent-[#1D6BA3] cursor-pointer"
                />
                <span className="text-sm text-gray-700">{s}</span>
              </label>
            ))}
          </div>
        </FormField>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
        <Button variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={handleSave}>
          {editingDegree ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const ProgramCatalog = () => {
  const [degrees, setDegrees] = useState<Degree[]>(SEED_DEGREES);
  const [view, setView] = useState<ViewMode>("list");
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Search & filter
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [filterInst, setFilterInst] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Upload
  const [uploadResult, setUploadResult] = useState<UploadResult>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success popup
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Filter / paginate ───────────────────────────────────────────────────────
  const filtered = degrees.filter((d) => {
    const q = searchApplied.toLowerCase();
    const matchSearch =
      !q || d.degreeName.toLowerCase().includes(q) || d.stream.toLowerCase().includes(q);
    const matchInst = !filterInst || d.institution === filterInst;
    const matchType = !filterType || d.programType === filterType;
    return matchSearch && matchInst && matchType;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => {
    setSearchApplied(searchInput);
    setCurrentPage(1);
  };
  const handleClear = () => {
    setSearchInput("");
    setSearchApplied("");
    setFilterInst("");
    setFilterType("");
    setCurrentPage(1);
  };

  // ── Selection ───────────────────────────────────────────────────────────────
  const allPageSelected = pageItems.length > 0 && pageItems.every((d) => selectedIds.has(d.id));
  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageItems.forEach((d) => next.delete(d.id));
      else pageItems.forEach((d) => next.add(d.id));
      return next;
    });
  };
  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Bulk upload ─────────────────────────────────────────────────────────────
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
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
        const { added, skipped } = parseXlsxRows(rows);

        const existingNames = new Set(degrees.map((d) => d.degreeName.toLowerCase()));
        const toAdd = added.filter((d) => !existingNames.has(d.degreeName.toLowerCase()));
        const dupNames = added
          .filter((d) => existingNames.has(d.degreeName.toLowerCase()))
          .map((d) => `"${d.degreeName}" already exists`);

        if (toAdd.length > 0) {
          setDegrees((prev) => [...prev, ...toAdd]);
          setCurrentPage(1);
        }

        setUploadResult({
          fileName: file.name,
          added: toAdd.length,
          skipped: skipped.length + dupNames.length,
          errors: [...skipped, ...dupNames],
        });
      } catch {
        setUploadResult({
          fileName: file.name,
          added: 0,
          skipped: 0,
          errors: ["Failed to parse file — ensure it is a valid .xlsx or .csv"],
        });
      } finally {
        setUploadLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Sample Excel Download ──────────────────────────────────────────────────
  const downloadSampleExcel = () => {
    const headers = [
      ["Degree Type", "Program Type", "Duration (yrs)", "Stream", "Semesters", "Institution", "Status"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, "Program_Catalog_Sample.xlsx");
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingDegree(null);
    setView("form");
  };
  const openEdit = (d: Degree) => {
    setEditingDegree(d);
    setView("form");
  };

  const handleSave = (data: Omit<Degree, "id">) => {
    if (editingDegree) {
      setDegrees((prev) => prev.map((d) => (d.id === editingDegree.id ? { ...d, ...data } : d)));
      setSuccessMsg("Degree updated successfully!");
    } else {
      setDegrees((prev) => [{ id: Date.now(), ...data }, ...prev]);
      setCurrentPage(1);
      setSuccessMsg("Degree added successfully!");
    }
    setView("list");
    setEditingDegree(null);
  };

  // ── Form view ───────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <>
        <DegreeForm
          editingDegree={editingDegree}
          onSave={handleSave}
          onCancel={() => {
            setView("list");
            setEditingDegree(null);
          }}
        />
        {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />}
      </>
    );
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Program Catalog</h1>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={downloadSampleExcel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 transition-colors"
            >
              Sample Excel
            </button>
            <button
              onClick={handleBulkUploadClick}
              disabled={uploadLoading}
              title="Upload .xlsx or .csv — columns: Degree Name | Program Type | Duration | Stream | Semesters | Institution | Status"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 disabled:opacity-60 transition-colors"
            >
              <UploadIcon />
              {uploadLoading ? "Importing…" : "Bulk Upload"}
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors"
            >
              <PlusIcon />
              Add New Degree
            </button>
          </div>
        </div>

        {/* Upload result banner */}
        {uploadResult && (
          <div
            className={[
              "flex items-start gap-3 px-5 py-3 border-b text-xs",
              uploadResult.added > 0
                ? "bg-green-50 border-green-100"
                : "bg-amber-50 border-amber-100",
            ].join(" ")}
          >
            <div className="flex-1 min-w-0">
              <p
                className={[
                  "font-semibold",
                  uploadResult.added > 0 ? "text-green-700" : "text-amber-700",
                ].join(" ")}
              >
                {uploadResult.fileName} — {uploadResult.added} degree
                {uploadResult.added !== 1 ? "s" : ""} added
                {uploadResult.skipped > 0 && `, ${uploadResult.skipped} skipped`}
              </p>
              {uploadResult.errors.slice(0, 3).map((err, i) => (
                <p key={i} className="text-amber-600 mt-0.5 truncate">
                  {err}
                </p>
              ))}
              {uploadResult.errors.length > 3 && (
                <p className="text-amber-500 mt-0.5">
                  +{uploadResult.errors.length - 3} more issues
                </p>
              )}
            </div>
            <button
              onClick={() => setUploadResult(null)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5 transition-colors"
            >
              <XIcon />
            </button>
          </div>
        )}

        {/* Search & Filters row — all right-aligned to match design */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-b border-gray-100">
          <div className="relative min-w-[220px]">
            <input
              type="text"
              placeholder="Search by Degree"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400"
            />
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon />
              </button>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <FilterSelect
            value={filterInst}
            onChange={(v) => {
              setFilterInst(v);
              setCurrentPage(1);
            }}
            placeholder="Institution"
            options={INSTITUTIONS}
          />
          <FilterSelect
            value={filterType}
            onChange={(v) => {
              setFilterType(v);
              setCurrentPage(1);
            }}
            placeholder="Degree"
            options={PROGRAM_TYPES}
          />
        </div>

        {/* Table — horizontal scroll enabled */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                <th className="pl-5 pr-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-[#1D6BA3] cursor-pointer rounded"
                  />
                </th>
                {[
                  "Degree Type",
                  "Program Type",
                  "Duration (yrs)",
                  "Stream",
                  "Semesters",
                  "Institution",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={[
                      "py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap",
                      h === "Actions" ? "pr-5 text-right" : "px-4 text-left",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length > 0 ? (
                pageItems.map((degree) => (
                  <tr key={degree.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="pl-5 pr-3 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(degree.id)}
                        onChange={() => toggleOne(degree.id)}
                        className="w-4 h-4 accent-[#1D6BA3] cursor-pointer rounded"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                      {degree.degreeName}
                    </td>
                    <td className="px-4 py-3.5">
                      <TypeBadge type={degree.programType} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 text-center">{degree.duration}</td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{degree.stream}</td>
                    <td className="px-4 py-3.5 text-gray-700 text-center">{degree.semesters}</td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                      {degree.institution}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={degree.status} />
                    </td>
                    <td className="pr-5 py-3.5">
                      <div className="flex items-center justify-end">
                        <IconBtn title="Edit" onClick={() => openEdit(degree)}>
                          <EditIcon />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-sm text-gray-400">
                    No degrees found.
                  </td>
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
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(p) => {
            if (p >= 1 && p <= totalPages) setCurrentPage(p);
          }}
        />
      </div>

      {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />}
    </>
  );
};

export default ProgramCatalog;
