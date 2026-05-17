import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../../../components/common/Button/Button";
import {
  ITEMS_PER_PAGE, PROGRAM_TYPES, DEPARTMENTS,
  CURRICULA_OPTS, YEAR_OPTS, SEMESTER_OPTS,
} from "../../../constants";
import { readXlsxFile, findField } from "../../../utils/excel";
import {
  UploadIcon, PlusIcon, EditIcon, DocumentIcon,
  ChevronDown, XIcon, XSmIcon, CheckIcon, SearchIcon,
} from "../../../components/common/Icons/PageIcons";
import Pagination from "../../../components/common/Pagination/Pagination";

// ── Constants ─────────────────────────────────────────────────────────────────
const AVAILABLE_SUBJECTS = [
  "Data Structures", "Operating Systems", "Digital Electronics",
  "Database Management", "Calculus", "English Literature",
  "Quantum Mechanics", "Organic Chemistry", "Financial Accounting",
  "Tamil Literature", "Artificial Intelligence", "Linear Algebra",
  "Microprocessors", "Cell Biology", "English - Literature & Appreciation",
  "Internship", "Communication Skills", "Computer Networks",
  "Software Engineering", "Embedded Systems",
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────
import { type Semester } from "../../../types/interfaces";
import { SEED_SEMESTERS } from "../../../types/mockData";

interface FormState {
  department: string;
  programType: string;
  year: string;
  semester: string;
  curriculum: string;
  subjects: string[];
}

type UploadResult = { fileName: string; added: number; skipped: number; errors: string[] } | null;


const BLANK_FORM: FormState = {
  department: "", programType: "", year: "", semester: "", curriculum: "", subjects: [],
};

// ── Excel parsing (page-specific) ─────────────────────────────────────────────
const parseXlsxRows = (rows: Record<string, unknown>[]): { added: Semester[]; skipped: string[] } => {
  const added: Semester[]  = [];
  const skipped: string[]  = [];
  rows.forEach((row, i) => {
    const semesterName = String(findField(row, "semester name", "semester") ?? "").trim();
    const department   = String(findField(row, "department") ?? "").trim();
    const programType  = String(findField(row, "program type", "program") ?? "UG").trim();
    const curriculum   = String(findField(row, "curriculum", "regulation") ?? "").trim();
    const year         = String(findField(row, "year") ?? "").trim();
    const sem          = String(findField(row, "semester label", "sem") ?? "").trim();
    if (!semesterName) { skipped.push(`Row ${i + 2} — missing semester name`); return; }
    added.push({
      id: Date.now() + i, semesterName, department, programType, curriculum,
      year, semester: sem, subjects: [], totalCredits: 0,
    });
  });
  return { added, skipped };
};

// ── Success Popup (matches Departments / Classes standard) ────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-[14px] font-bold text-gray-900">Saved</h3>
        <button
          onClick={onClose}
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
  </div>
);

// ── Shared select field ────────────────────────────────────────────────────────
const FieldSelect = ({
  label, value, onChange, options, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={[
          "w-full appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer",
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

// ── Subject chip ───────────────────────────────────────────────────────────────
const SubjectChip = ({ label, onRemove }: { label: string; onRemove?: () => void }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EFF6FF] border border-[#1D6BA3]/20 text-xs font-medium text-[#1D6BA3]">
    {label}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="text-[#1D6BA3]/60 hover:text-[#1D6BA3] transition-colors">
        <XSmIcon />
      </button>
    )}
  </span>
);

// ── Add / Edit Semester Modal ──────────────────────────────────────────────────
interface SemesterModalProps {
  mode: "add" | "edit";
  initial?: Semester;
  onClose: () => void;
  onSave: (form: FormState) => void;
}

const SemesterModal = ({ mode, initial, onClose, onSave }: SemesterModalProps) => {
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          department:  initial.department,
          programType: initial.programType,
          year:        initial.year,
          semester:    initial.semester,
          curriculum:  initial.curriculum,
          subjects:    [...initial.subjects],
        }
      : { ...BLANK_FORM }
  );
  const [subjectPick, setSubjectPick] = useState("");
  const [errors, setErrors]           = useState<Partial<Record<keyof FormState, string>>>({});

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const set = (field: keyof FormState) => (v: string) => {
    setForm(prev => ({ ...prev, [field]: v }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const addSubject = (val: string) => {
    if (!val || form.subjects.includes(val)) return;
    setForm(prev => ({ ...prev, subjects: [...prev.subjects, val] }));
    setSubjectPick("");
  };

  const removeSubject = (s: string) =>
    setForm(prev => ({ ...prev, subjects: prev.subjects.filter(x => x !== s) }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.department)  e.department  = "Required";
    if (!form.programType) e.programType = "Required";
    if (!form.year)        e.year        = "Required";
    if (!form.semester)    e.semester    = "Required";
    if (!form.curriculum)  e.curriculum  = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  const unselected = AVAILABLE_SUBJECTS.filter(s => !form.subjects.includes(s));

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">
            {mode === "add" ? "Add Semester" : "Edit Semester"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
            <div className="space-y-4">

            {/* Row 1: Department | Program Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldSelect
                  label="Department"
                  value={form.department}
                  onChange={set("department")}
                  options={DEPARTMENTS}
                />
                {errors.department && (
                  <p className="text-xs text-red-500 mt-1">{errors.department}</p>
                )}
              </div>
              <div>
                <FieldSelect
                  label="Program Type"
                  value={form.programType}
                  onChange={set("programType")}
                  options={PROGRAM_TYPES}
                />
                {errors.programType && (
                  <p className="text-xs text-red-500 mt-1">{errors.programType}</p>
                )}
              </div>
            </div>

            {/* Row 2: Year | Semester */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldSelect
                  label="Year"
                  value={form.year}
                  onChange={set("year")}
                  options={YEAR_OPTS}
                />
                {errors.year && (
                  <p className="text-xs text-red-500 mt-1">{errors.year}</p>
                )}
              </div>
              <div>
                <FieldSelect
                  label="Semester"
                  value={form.semester}
                  onChange={set("semester")}
                  options={SEMESTER_OPTS}
                />
                {errors.semester && (
                  <p className="text-xs text-red-500 mt-1">{errors.semester}</p>
                )}
              </div>
            </div>

            {/* Row 3: Curriculum */}
            <FieldSelect
              label="Curriculum"
              value={form.curriculum}
              onChange={set("curriculum")}
              options={CURRICULA_OPTS}
            />
            {errors.curriculum && (
              <p className="text-xs text-red-500 -mt-3">{errors.curriculum}</p>
            )}

            {/* Row 4: Subjects dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subjects</label>
              <div className="relative">
                <select
                  value={subjectPick}
                  onChange={e => addSubject(e.target.value)}
                  className="w-full max-w-[47%] appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer">
                  <option value="">Select</option>
                  {unselected.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-[calc(47%-24px)] flex items-center">
                  <ChevronDown />
                </div>
              </div>
            </div>
          </div>

          {/* Subject chips — outside the bordered section */}
          {form.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3">
              {form.subjects.map(s => (
                <SubjectChip key={s} label={s} onRemove={() => removeSubject(s)} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const SemesterPage = () => {
  const [semesters,     setSemesters]    = useState<Semester[]>(SEED_SEMESTERS);
  const [modal,         setModal]        = useState<{ mode: "add" | "edit"; target?: Semester } | null>(null);
  const [successMsg,    setSuccessMsg]   = useState<string | null>(null);

  // Search & filter
  const [searchInput,   setSearchInput]  = useState("");
  const [searchApplied, setSearchApplied]= useState("");
  const [filterDept,    setFilterDept]   = useState("");
  const [currentPage,   setCurrentPage]  = useState(1);

  // Upload
  const [uploadResult,  setUploadResult] = useState<UploadResult>(null);
  const [uploadLoading, setUploadLoading]= useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const uniqueDepts = [...new Set(semesters.map(s => s.department))];

  const filtered = semesters.filter(s => {
    const q = searchApplied.toLowerCase();
    const matchSearch = !q
      || s.semesterName.toLowerCase().includes(q)
      || s.department.toLowerCase().includes(q);
    const matchDept = !filterDept || s.department === filterDept;
    return matchSearch && matchDept;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIdx   = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems  = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => { setSearchApplied(searchInput); setCurrentPage(1); };
  const handleClear  = () => {
    setSearchInput(""); setSearchApplied(""); setFilterDept(""); setCurrentPage(1);
  };

  // ── Bulk upload ──────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadLoading(true);
    setUploadResult(null);

    try {
      const rows = await readXlsxFile(file);
      const { added, skipped } = parseXlsxRows(rows);
      const existingNames = new Set(semesters.map(s => s.semesterName.toLowerCase()));
      const toAdd    = added.filter(s => !existingNames.has(s.semesterName.toLowerCase()));
      const dupNames = added.filter(s =>  existingNames.has(s.semesterName.toLowerCase()))
        .map(s => `"${s.semesterName}" already exists`);
      if (toAdd.length > 0) { setSemesters(prev => [...prev, ...toAdd]); setCurrentPage(1); }
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

  // ── Add save ─────────────────────────────────────────────────────────────
  const handleAddSave = (form: FormState) => {
    const semIdx = SEMESTER_OPTS.indexOf(form.semester as (typeof SEMESTER_OPTS)[number]);
    const num    = semIdx >= 0 ? semIdx + 1 : semesters.length + 1;
    const name   = `Semester ${num}`;

    setSemesters(prev => [
      ...prev,
      {
        id:           Date.now(),
        semesterName: name,
        department:   form.department,
        programType:  form.programType,
        curriculum:   form.curriculum,
        year:         form.year,
        semester:     form.semester,
        subjects:     form.subjects,
        totalCredits: form.subjects.length * 3,
      },
    ]);
    setModal(null);
    setSuccessMsg("Semester added successfully!");
  };

  // ── Edit save ────────────────────────────────────────────────────────────
  const handleEditSave = (form: FormState) => {
    setSemesters(prev =>
      prev.map(s =>
        s.id === modal?.target?.id
          ? {
              ...s,
              department:   form.department,
              programType:  form.programType,
              curriculum:   form.curriculum,
              year:         form.year,
              semester:     form.semester,
              subjects:     form.subjects,
              totalCredits: form.subjects.length * 3,
            }
          : s
      )
    );
    setModal(null);
    setSuccessMsg("Semester updated successfully!");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Semester Planning</h1>
          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Upload */}
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 disabled:opacity-60 transition-colors">
              <UploadIcon />
              {uploadLoading ? "Importing…" : "Bulk Upload"}
            </button>

            {/* Add Manual */}
            <button
              onClick={() => setModal({ mode: "add" })}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors">
              <PlusIcon />
              Add Manual
            </button>
          </div>
        </div>

        {/* Upload result banner */}
        {uploadResult && (
          <div className={[
            "flex items-start gap-3 px-5 py-3 border-b text-xs",
            uploadResult.added > 0 ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100",
          ].join(" ")}>
            <div className="flex-1 min-w-0">
              <p className={["font-semibold", uploadResult.added > 0 ? "text-green-700" : "text-amber-700"].join(" ")}>
                {uploadResult.fileName} — {uploadResult.added} semester{uploadResult.added !== 1 ? "s" : ""} added
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
              <XIcon />
            </button>
          </div>
        )}

        {/* Search & filter row */}
        <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 border-b border-gray-100">
          <div className="relative w-52">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by Semester"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <XIcon />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-1.5 text-sm font-medium text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors">
            Search
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Clear
          </button>

          {/* Department filter */}
          <div className="relative">
            <select
              value={filterDept}
              onChange={e => { setFilterDept(e.target.value); setCurrentPage(1); }}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer min-w-[130px]">
              <option value="">Department</option>
              {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <ChevronDown />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                {["Semester Name", "Department", "Program Type", "Curriculum", "Total Subjects", "Total Credits", "Actions"].map(h => (
                  <th
                    key={h}
                    className={[
                      "py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap",
                      h === "Actions" ? "pr-5 text-right" : "px-4 text-left",
                    ].join(" ")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length > 0 ? pageItems.map(sem => (
                <tr key={sem.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                    {sem.semesterName}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{sem.department}</td>
                  <td className="px-4 py-3.5 text-gray-600">{sem.programType}</td>
                  <td className="px-4 py-3.5 text-gray-600">{sem.curriculum}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#EFF6FF] text-[#1D6BA3] text-xs font-bold">
                      {sem.subjects.length}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[#1D6BA3] font-semibold text-sm cursor-default">
                      {sem.totalCredits} Credits
                    </span>
                  </td>
                  <td className="pr-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Edit"
                        onClick={() => setModal({ mode: "edit", target: sem })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors">
                        <EditIcon />
                      </button>
                      <button
                        title="View"
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors">
                        <DocumentIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                    No semesters found.
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
          onPageChange={p => { if (p >= 1 && p <= totalPages) setCurrentPage(p); }}
        />
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <SemesterModal
          mode={modal.mode}
          initial={modal.target}
          onClose={() => setModal(null)}
          onSave={modal.mode === "add" ? handleAddSave : handleEditSave}
        />
      )}

      {/* Success popup */}
      {successMsg && (
        <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
    </>
  );
};

export default SemesterPage;
