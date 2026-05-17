import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../../../components/common/Button/Button";
import { ITEMS_PER_PAGE, PROGRAM_TYPES, DEPARTMENTS, STATUS_OPTIONS } from "../../../constants";
import { findField, readXlsxFile } from "../../../utils/excel";
import {
  UploadIcon,
  PlusIcon,
  // EditIcon,
  // DocumentIcon,
  // EyeIcon,
  BackArrow,
  ChevronDown,
  XIcon,
  CheckIcon,
} from "../../../components/common/Icons/PageIcons";
import Pagination from "../../../components/common/Pagination/Pagination";

type CurriculumStatus = (typeof STATUS_OPTIONS)[number];

// ── Types ─────────────────────────────────────────────────────────────────────
import { type Curriculum, type Subject } from "../../../types/interfaces";
import { SEED_CURRICULA, SEED_CURRICULA_SUBJECTS as SEED_SUBJECTS } from "../../../types/mockData";

type UploadResult = { fileName: string; added: number; skipped: number; errors: string[] } | null;

const getSubjects = (id: number): Subject[] =>
  SEED_SUBJECTS[id] ?? [
    {
      id: 1,
      subjectName: "Core Subject I",
      subjectType: "Core",
      subjectCode: "SUB101",
      credits: "4",
    },
    {
      id: 2,
      subjectName: "Core Subject II",
      subjectType: "Core",
      subjectCode: "SUB102",
      credits: "4",
    },
    {
      id: 3,
      subjectName: "Elective Subject",
      subjectType: "Elective",
      subjectCode: "SUB103",
      credits: "3",
    },
  ];

// ── Excel parsing (page-specific) ─────────────────────────────────────────────
const parseXlsxRows = (
  rows: Record<string, unknown>[]
): { added: Curriculum[]; skipped: string[] } => {
  const added: Curriculum[] = [];
  const skipped: string[] = [];
  rows.forEach((row, i) => {
    const curriculumName = String(findField(row, "curriculum name", "curriculum") ?? "").trim();
    const batchName = String(findField(row, "batch name", "batch") ?? "").trim();
    const departmentName = String(findField(row, "department name", "department") ?? "").trim();
    const institutionType = String(
      findField(row, "institution type", "institution") ?? "College"
    ).trim();
    const programType = String(findField(row, "program type", "program") ?? "UG").trim();
    const description = String(findField(row, "description", "desc") ?? "").trim();
    const statusRaw = String(findField(row, "status") ?? "")
      .trim()
      .toLowerCase();
    const status: CurriculumStatus = statusRaw === "inactive" ? "Inactive" : "Active";
    if (!curriculumName) {
      skipped.push(`Row ${i + 2} — missing curriculum name`);
      return;
    }
    added.push({
      id: Date.now() + i,
      curriculumName,
      batchName,
      departmentName,
      institutionType,
      programType,
      description,
      status,
    });
  });
  return { added, skipped };
};

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
  error?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const selected = value ? value.split(", ").filter(Boolean) : [];
  const toggleOption = (opt: string) => {
    let next;
    if (selected.includes(opt)) next = selected.filter((s) => s !== opt);
    else next = [...selected, opt];
    onChange(next.join(", "));
  };
  return (
    <div className="relative" ref={wrapperRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={[
          "w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer flex items-center justify-between",
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
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
            >
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


const StatusBadge = ({ status }: { status: CurriculumStatus }) => (
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

// ── Auto-close Success Popup ───────────────────────────────────────────────────
const SuccessPopup = ({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
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

// ── Section Header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xs font-bold text-[#1D6BA3] whitespace-nowrap">{label}</span>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);

// ── Form field primitives ─────────────────────────────────────────────────────
const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-sm font-medium text-gray-700 mb-2">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const inputCls = (err?: boolean) =>
  `w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400 ${err ? "border-red-400" : "border-gray-200"}`;

const SelectField = ({
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
        inputCls(error),
        "appearance-none pr-9 cursor-pointer",
        !value ? "text-gray-400" : "text-gray-800",
      ].join(" ")}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <ChevronDown />
    </div>
  </div>
);

// ── Curriculum Form (shared by Add & Edit) ─────────────────────────────────────
interface CurriculumFormData {
  curriculumName: string;
  batchName: string;
  departmentName: string;
  institutionType: string;
  programType: string;
  description: string;
  status?: CurriculumStatus;
}

interface CurriculumFormErrors {
  curriculumName?: string;
  batchName?: string;
  departmentName?: string;
}

interface CurriculumFormProps {
  mode: "add" | "edit";
  initial: CurriculumFormData;
  onClose: () => void;
  onSave: (data: CurriculumFormData) => void;
}

const CurriculumForm = ({ mode, initial, onClose, onSave }: CurriculumFormProps) => {
  const [curriculumName, setCurriculumName] = useState(initial.curriculumName);
  const [batchName, setBatchName] = useState(initial.batchName);
  const [departmentName, setDepartmentName] = useState(initial.departmentName);
  const [institutionType, setInstitutionType] = useState(initial.institutionType);
  const [programType, setProgramType] = useState(initial.programType);
  const [description, setDescription] = useState(initial.description);
  const [status, setStatus] = useState<CurriculumStatus>(initial.status ?? "Active");
  const [errors, setErrors] = useState<CurriculumFormErrors>({});

  const validate = (): boolean => {
    const e: CurriculumFormErrors = {};
    if (!curriculumName.trim()) e.curriculumName = "Required";
    if (!batchName) e.batchName = "Required";
    if (!departmentName) e.departmentName = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      curriculumName: curriculumName.trim(),
      batchName,
      departmentName,
      institutionType,
      programType,
      description,
      status,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-900">
            {mode === "add" ? "Define New Curriculum" : "Edit Curriculum"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <SectionHeader label="01 Basic Details" />

          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {/* Curriculum Name */}
            <div>
              <FieldLabel required>Curriculum Name</FieldLabel>
              <input
                type="text"
                value={curriculumName}
                onChange={(e) => {
                  setCurriculumName(e.target.value);
                  setErrors((p) => ({ ...p, curriculumName: undefined }));
                }}
                placeholder="Enter"
                className={inputCls(!!errors.curriculumName)}
              />
              {errors.curriculumName && (
                <p className="mt-1 text-xs text-red-500">{errors.curriculumName}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <FieldLabel required>Department</FieldLabel>
              <MultiSelectDropdown
                value={departmentName}
                onChange={(v) => {
                  setDepartmentName(v);
                  setErrors((p) => ({ ...p, departmentName: undefined }));
                }}
                placeholder="Select"
                options={DEPARTMENTS}
                error={!!errors.departmentName}
              />
              {errors.departmentName && (
                <p className="mt-1 text-xs text-red-500">{errors.departmentName}</p>
              )}
            </div>

            {/* Institution Type */}
            <div>
              <FieldLabel>Institution Type</FieldLabel>
              <input
                type="text"
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value)}
                placeholder="Enter"
                className={inputCls()}
              />
            </div>

            {/* Program Type */}
            <div>
              <FieldLabel>Program Type</FieldLabel>
              <SelectField
                value={programType}
                onChange={setProgramType}
                placeholder="Select"
                options={PROGRAM_TYPES}
              />
            </div>
          </div>

          {/* Batch Name — full width */}
          <div className="mt-4">
            <FieldLabel required>Batch Name</FieldLabel>
            <MultiSelectDropdown
              value={batchName}
              onChange={(v) => {
                setBatchName(v);
                setErrors((p) => ({ ...p, batchName: undefined }));
              }}
              placeholder="Select Batches"
              options={[
                "Batch 2024",
                "Batch 2025",
                "Batch 2026",
                "Batch 2027",
                "Tamil",
                "English",
                "Commerce",
                "Computer Science",
              ]}
              error={!!errors.batchName}
            />
            {errors.batchName && <p className="mt-1 text-xs text-red-500">{errors.batchName}</p>}
          </div>

          {/* Description — full width */}
          <div className="mt-4">
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter"
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400 resize-none"
            />
          </div>

          {/* Status — only in Edit */}
          {mode === "edit" && (
            <div className="mt-4 grid grid-cols-2 gap-x-5">
              <div>
                <FieldLabel>Status</FieldLabel>
                <SelectField
                  value={status}
                  onChange={(v) => setStatus(v as CurriculumStatus)}
                  placeholder="Select"
                  options={STATUS_OPTIONS}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Curriculum Detail View ────────────────────────────────────────────────────
interface CurriculumDetailProps {
  curriculum: Curriculum;
  onBack: () => void;
}

const CurriculumDetail = ({ curriculum, onBack }: CurriculumDetailProps) => {
  const subjects = getSubjects(curriculum.id);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <BackArrow />
          </button>
          <h1 className="text-base font-bold text-gray-900">Curriculum Details</h1>
        </div>

        {/* Details section */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-gray-500 mb-3">Details</p>
          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 min-w-[130px]">Curriculum Name</span>
              <span className="text-sm font-medium text-gray-800">
                {curriculum.curriculumName || "-"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 min-w-[130px]">Batch Name</span>
              <span className="text-sm font-medium text-gray-800">
                {curriculum.batchName || "-"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 min-w-[130px]">Institution Type</span>
              <span className="text-sm font-medium text-gray-800">
                {curriculum.institutionType || "-"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 min-w-[130px]">Department</span>
              <span className="text-sm font-bold text-gray-900">
                {curriculum.departmentName || "-"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 min-w-[130px]">Program Type</span>
              <span className="text-sm font-medium text-gray-800">
                {curriculum.programType || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Subjects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                {["Subject Name", "Subject Type", "Subject Code", "Credits"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{s.subjectName}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={
                        s.subjectType.includes("HSC") ? "text-[#1D6BA3] font-medium" : "text-gray-600"
                      }
                    >
                      {s.subjectType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={
                        s.subjectCode === "HSC" ? "text-[#1D6BA3] font-medium" : "text-gray-600"
                      }
                    >
                      {s.subjectCode}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">{s.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const CurriculumManagement = () => {
  const [curricula, setCurricula] = useState<Curriculum[]>(SEED_CURRICULA);
  const [view, setView] = useState<"list" | "detail">("list");
  const [viewingCurriculum, setViewingCurriculum] = useState<Curriculum | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
  const [successMode, setSuccessMode] = useState<"add" | "edit" | null>(null);

  // Search & filter
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Upload
  const [uploadResult, setUploadResult] = useState<UploadResult>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = curricula.filter((c) => {
    const q = searchApplied.toLowerCase();
    const matchSearch =
      !q ||
      c.curriculumName.toLowerCase().includes(q) ||
      c.departmentName.toLowerCase().includes(q);
    const matchDept = !filterDept || c.departmentName === filterDept;
    return matchSearch && matchDept;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // ── Bulk upload ────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadLoading(true);
    setUploadResult(null);
    try {
      const rows = await readXlsxFile(file);
      const { added, skipped } = parseXlsxRows(rows);
      const existingNames = new Set(curricula.map((c) => c.curriculumName.toLowerCase()));
      const toAdd = added.filter((c) => !existingNames.has(c.curriculumName.toLowerCase()));
      const dupNames = added
        .filter((c) => existingNames.has(c.curriculumName.toLowerCase()))
        .map((c) => `"${c.curriculumName}" already exists`);
      if (toAdd.length > 0) {
        setCurricula((prev) => [...prev, ...toAdd]);
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

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAddSave = (data: CurriculumFormData) => {
    setCurricula((prev) => [...prev, { id: Date.now(), status: "Active", ...data } as Curriculum]);
    setCurrentPage(1);
    setShowAdd(false);
    setSuccessMode("add");
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEditSave = (data: CurriculumFormData) => {
    if (!editingCurriculum) return;
    setCurricula((prev) =>
      prev.map((c) => (c.id === editingCurriculum.id ? { ...c, ...data } : c))
    );
    setEditingCurriculum(null);
    setSuccessMode("edit");
  };

  // ── Detail view ────────────────────────────────────────────────────────────
  if (view === "detail" && viewingCurriculum) {
    return (
      <>
        <CurriculumDetail
          curriculum={viewingCurriculum}
          onBack={() => {
            setView("list");
            setViewingCurriculum(null);
          }}
        />
        {successMode === "edit" && (
          <SuccessPopup
            title="Edit"
            message="Curriculum Edited Successfully"
            onClose={() => setSuccessMode(null)}
          />
        )}
      </>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Curriculum Management</h1>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              title="Upload .xlsx or .csv — columns: Curriculum Name | Department Name | Institution Type | Program Type | Description | Status"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 disabled:opacity-60 transition-colors"
            >
              <UploadIcon />
              {uploadLoading ? "Importing…" : "Bulk Upload"}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors"
            >
              <PlusIcon />
              Add Curriculum
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
                {uploadResult.fileName} — {uploadResult.added} curriculum
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
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
            >
              <XIcon />
            </button>
          </div>
        )}

        {/* Search & filter row */}
        <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 border-b border-gray-100">
          <div className="relative w-52">
            <input
              type="text"
              placeholder="Search by Group name"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSearchApplied(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchApplied("");
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon />
              </button>
            )}
          </div>

          {/* Department filter */}
          <div className="relative">
            <select
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer min-w-[130px]"
            >
              <option value="">Department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <ChevronDown />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                {[
                  "Curriculum Name",
                  "Department Name",
                  "Description",
                  "No Of Batches",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length > 0 ? (
                pageItems.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                      {c.curriculumName}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {c.departmentName}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate">{c.description}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      <div className="relative inline-block group">
                        <span className="cursor-default font-medium">
                          {c.batchName
                            ? c.batchName.split(",").length.toString().padStart(2, "0")
                            : "00"}
                        </span>
                        {c.batchName && (
                          <div className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block min-w-max">
                            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
                              <p className="font-semibold text-gray-300 mb-1.5 uppercase tracking-wide text-[10px]">Batches</p>
                              {c.batchName.split(",").map((b, i) => (
                                <p key={i} className="py-0.5 whitespace-nowrap">{b.trim()}</p>
                              ))}
                              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    No curricula found.
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

      {/* Add Modal */}
      {showAdd && (
        <CurriculumForm
          mode="add"
          initial={{
            curriculumName: "",
            batchName: "",
            departmentName: "",
            institutionType: "",
            programType: "",
            description: "",
            status: "Active",
          }}
          onClose={() => setShowAdd(false)}
          onSave={handleAddSave}
        />
      )}

      {/* Edit Modal */}
      {editingCurriculum && (
        <CurriculumForm
          mode="edit"
          initial={editingCurriculum}
          onClose={() => setEditingCurriculum(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Success Popups — auto-close after 5 s */}
      {successMode === "add" && (
        <SuccessPopup
          title="Add"
          message="New Curriculum Added Successfully"
          onClose={() => setSuccessMode(null)}
        />
      )}
      {successMode === "edit" && (
        <SuccessPopup
          title="Edit"
          message="Curriculum Edited Successfully"
          onClose={() => setSuccessMode(null)}
        />
      )}
    </>
  );
};

export default CurriculumManagement;
