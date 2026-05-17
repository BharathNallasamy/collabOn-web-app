import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../../../components/common/Button/Button";
import ManagementModal from "../../../components/Layouts/ManagementModal";
import { ITEMS_PER_PAGE, PROGRAM_TYPES } from "../../../constants";
import { findField, readXlsxFile } from "../../../utils/excel";
import {
  UploadIcon, PlusIcon, EditIcon, DocumentIcon, ChevronDown, XIcon, CheckIcon,
} from "../../../components/common/Icons/PageIcons";
import Pagination from "../../../components/common/Pagination/Pagination";

// ── Types ─────────────────────────────────────────────────────────────────────
import { type Class } from "../../../types/interfaces";
import { SEED_CLASSES } from "../../../types/mockData";

type UploadResult = { fileName: string; added: number; skipped: number; errors: string[] } | null;


// ── Excel parsing (page-specific) ─────────────────────────────────────────────
const parseXlsxRows = (rows: Record<string, unknown>[]): { added: Class[]; skipped: string[] } => {
  const added: Class[]    = [];
  const skipped: string[] = [];

  rows.forEach((row, i) => {
    const departmentName = String(findField(row, "department name", "department", "dept") ?? "").trim();
    const course         = String(findField(row, "course") ?? "").trim();
    const className      = String(findField(row, "class name", "class") ?? "").trim();
    const programTypeRaw = String(findField(row, "program type", "program", "type") ?? "UG").trim().toUpperCase();
    const sections       = String(findField(row, "sections", "section") ?? "A").trim();

    if (!className) { skipped.push(`Row ${i + 2} — missing class name`); return; }
    added.push({ id: Date.now() + i, departmentName, course, className, programType: programTypeRaw, sections });
  });

  return { added, skipped };
};

const sectionCount = (sections: string) =>
  sections.split(",").map(s => s.trim()).filter(Boolean).length;

// ── Shared UI helpers ─────────────────────────────────────────────────────────

const MultiSelectDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select",
  error,
}: {
  options: string[];
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

// ── Success Popup — accepts optional message + title for reuse ─────────────────
const SuccessPopup = ({
  title = "Add",
  message = "New Class Added Successfully",
  onClose,
}: {
  title?: string;
  message?: string;
  onClose: () => void;
}) => (
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


// ── Shared form-field helpers ─────────────────────────────────────────────────
const fieldCls = (err?: string) => [
  "w-full px-4 py-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400",
  err ? "border-red-400" : "border-gray-200",
].join(" ");


// ── Shared class form fields — reused by Add and Edit modals ──────────────────
interface FormErrors {
  departmentName?: string;
  className?: string;
  programType?: string;
  course?: string;
}

interface ClassFormBodyProps {
  departmentName: string;
  setDepartmentName: (v: string) => void;
  className: string;
  setClassName: (v: string) => void;
  programType: string;
  setProgramType: (v: string) => void;
  sections: string;
  setSections: (v: string) => void;
  course: string;
  setCourse: (v: string) => void;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  departments: string[];
  courses: string[];
}

const ClassFormBody = ({
  departmentName, setDepartmentName,
  className, setClassName,
  programType, setProgramType,
  sections, setSections,
  course, setCourse,
  errors, setErrors,
  departments,
  courses,
}: ClassFormBodyProps) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-5">

    {/* Department */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
      <MultiSelectDropdown
        options={departments}
        value={departmentName}
        onChange={v => { setDepartmentName(v); setErrors(p => ({ ...p, departmentName: undefined })); }}
        placeholder="Select Department"
        error={errors.departmentName}
      />
      {errors.departmentName && <p className="mt-1 text-xs text-red-500">{errors.departmentName}</p>}
    </div>

    {/* Class Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
      <input
        type="text"
        value={className}
        onChange={e => { setClassName(e.target.value); setErrors(p => ({ ...p, className: undefined })); }}
        placeholder="Enter"
        className={fieldCls(errors.className)}
      />
      {errors.className && <p className="mt-1 text-xs text-red-500">{errors.className}</p>}
    </div>

    {/* Program Type */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
      <MultiSelectDropdown
        options={PROGRAM_TYPES as unknown as string[]}
        value={programType}
        onChange={v => { setProgramType(v); setErrors(p => ({ ...p, programType: undefined })); }}
        placeholder="Select Program Type"
        error={errors.programType}
      />
      {errors.programType && <p className="mt-1 text-xs text-red-500">{errors.programType}</p>}
    </div>

    {/* Section */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
      <input
        type="text"
        value={sections}
        onChange={e => setSections(e.target.value)}
        placeholder="Enter"
        className={fieldCls()}
      />
      <p className="mt-1 text-xs text-gray-400 text-right">Comma Separated (Eg. A,B)</p>
    </div>

    {/* Course Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
      <MultiSelectDropdown
        options={courses}
        value={course}
        onChange={v => { setCourse(v); setErrors(p => ({ ...p, course: undefined })); }}
        placeholder="Select Course"
        error={errors.course}
      />
      {errors.course && <p className="mt-1 text-xs text-red-500">{errors.course}</p>}
    </div>

  </div>
);

// ── Add New Class Modal ────────────────────────────────────────────────────────
interface AddClassModalProps {
  departments: string[];
  courses: string[];
  onClose: () => void;
  onSave: (data: Omit<Class, "id">) => void;
}

const AddClassModal = ({ departments, courses, onClose, onSave }: AddClassModalProps) => {
  const [departmentName, setDepartmentName] = useState("");
  const [className,      setClassName]      = useState("");
  const [programType,    setProgramType]    = useState("");
  const [sections,       setSections]       = useState("");
  const [course,         setCourse]         = useState("");
  const [errors,         setErrors]         = useState<FormErrors>({});

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!departmentName)   e.departmentName = "Required";
    if (!className.trim()) e.className      = "Required";
    if (!programType)      e.programType    = "Required";
    if (!course.trim())    e.course         = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      departmentName,
      className:   className.trim(),
      programType: programType,
      sections:    sections.trim() || "A",
      course:      course.trim(),
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-900">Add New Class</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Body — shared form fields */}
        <div className="px-6 py-6">
          <ClassFormBody
            departmentName={departmentName} setDepartmentName={setDepartmentName}
            className={className}           setClassName={setClassName}
            programType={programType}       setProgramType={setProgramType}
            sections={sections}             setSections={setSections}
            course={course}                 setCourse={setCourse}
            errors={errors}                 setErrors={setErrors}
            departments={departments}       courses={courses}
          />
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

// ── Edit Class Modal — uses ManagementModal + shared ClassFormBody ─────────────
interface EditClassModalProps {
  cls: Class;
  departments: string[];
  courses: string[];
  onClose: () => void;
  onSave: (updated: Class) => void;
}

const EditClassModal = ({ cls, departments, courses, onClose, onSave }: EditClassModalProps) => {
  const [departmentName, setDepartmentName] = useState(cls.departmentName);
  const [className,      setClassName]      = useState(cls.className);
  const [programType,    setProgramType]    = useState<string>(cls.programType);
  const [sections,       setSections]       = useState(cls.sections);
  const [course,         setCourse]         = useState(cls.course);
  const [errors,         setErrors]         = useState<FormErrors>({});

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!departmentName)   e.departmentName = "Required";
    if (!className.trim()) e.className      = "Required";
    if (!programType)      e.programType    = "Required";
    if (!course.trim())    e.course         = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ...cls,
      departmentName,
      className:   className.trim(),
      programType: programType,
      sections:    sections.trim() || "A",
      course:      course.trim(),
    });
  };

  return (
    <ManagementModal
      isOpen
      onClose={onClose}
      title="Edit Class"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost"   size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave}>Save</Button>
        </div>
      }
    >
      <ClassFormBody
        departmentName={departmentName} setDepartmentName={setDepartmentName}
        className={className}           setClassName={setClassName}
        programType={programType}       setProgramType={setProgramType}
        sections={sections}             setSections={setSections}
        course={course}                 setCourse={setCourse}
        errors={errors}                 setErrors={setErrors}
        departments={departments}       courses={courses}
      />
    </ManagementModal>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const Classes = () => {
  const [classes,       setClasses]      = useState<Class[]>(SEED_CLASSES);
  const [showModal,     setShowModal]    = useState(false);
  const [showSuccess,   setShowSuccess]  = useState(false);
  const [editingClass,  setEditingClass] = useState<Class | null>(null);
  const [showEditSuccess, setShowEditSuccess] = useState(false);

  // Search
  const [searchInput,   setSearchInput]   = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [currentPage,   setCurrentPage]   = useState(1);

  // Upload
  const [uploadResult,  setUploadResult]  = useState<UploadResult>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const uniqueDepartments = [...new Set(classes.flatMap(c => c.departmentName.split(", ")))].filter(Boolean);
  const uniqueCourses     = [...new Set(classes.flatMap(c => c.course.split(", ")))].filter(Boolean);

  const filtered = classes.filter(c => {
    const q = searchApplied.toLowerCase();
    return !q || c.className.toLowerCase().includes(q) || c.departmentName.toLowerCase().includes(q);
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIdx   = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems  = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => { setSearchApplied(searchInput); setCurrentPage(1); };
  const handleClear  = () => { setSearchInput(""); setSearchApplied(""); setCurrentPage(1); };

  // ── Bulk upload ────────────────────────────────────────────────────────────
  const handleBulkUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadLoading(true);
    setUploadResult(null);

    try {
      const rows = await readXlsxFile(file);
      const { added, skipped } = parseXlsxRows(rows);

      const existingNames = new Set(classes.map(c => c.className.toLowerCase()));
      const toAdd    = added.filter(c => !existingNames.has(c.className.toLowerCase()));
      const dupNames = added.filter(c =>  existingNames.has(c.className.toLowerCase()))
        .map(c => `"${c.className}" already exists`);

      if (toAdd.length > 0) { setClasses(prev => [...prev, ...toAdd]); setCurrentPage(1); }

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

  // ── Add class ──────────────────────────────────────────────────────────────
  const handleAddSave = (data: Omit<Class, "id">) => {
    setClasses(prev => [{ id: Date.now(), ...data }, ...prev]);
    setCurrentPage(1);
    setShowModal(false);
    setShowSuccess(true);
  };

  // ── Edit class ─────────────────────────────────────────────────────────────
  const handleEditSave = (updated: Class) => {
    setClasses(prev => prev.map(c => c.id === updated.id ? updated : c));
    setEditingClass(null);
    setShowEditSuccess(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Class</h1>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            <button
              onClick={handleBulkUploadClick}
              disabled={uploadLoading}
              title="Upload .xlsx or .csv — columns: Department Name | Course | Class Name | Program Type | Sections"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 disabled:opacity-60 transition-colors">
              <UploadIcon />
              {uploadLoading ? "Importing…" : "Bulk Upload"}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors">
              <PlusIcon />
              Add Class
            </button>
          </div>
        </div>

        {/* Upload result banner */}
        {uploadResult && (
          <div className={["flex items-start gap-3 px-5 py-3 border-b text-xs",
            uploadResult.added > 0 ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"].join(" ")}>
            <div className="flex-1 min-w-0">
              <p className={["font-semibold", uploadResult.added > 0 ? "text-green-700" : "text-amber-700"].join(" ")}>
                {uploadResult.fileName} — {uploadResult.added} class{uploadResult.added !== 1 ? "es" : ""} added
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

        {/* Search row */}
        <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 border-b border-gray-100">
          <div className="relative w-52">
            <input
              type="text"
              placeholder="Search by Class name"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchInput && (
              <button onClick={() => setSearchInput("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <XIcon />
              </button>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={handleSearch}>Search</Button>
          <Button variant="ghost"   size="sm" onClick={handleClear}>Clear</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                {["S No", "Department Name", "Course Name", "Class Name", "Program Type", "Sections", "Actions"].map(h => (
                  <th key={h} className={["py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap",
                    h === "Actions" ? "pr-5 text-right" :
                    h === "S No"    ? "pl-5 pr-3 text-left w-16" : "px-4 text-left",
                  ].join(" ")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length > 0 ? pageItems.map((cls, idx) => (
                <tr key={cls.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="pl-5 pr-3 py-3.5 text-gray-500 font-medium text-sm">
                    {String(startIdx + idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3.5 text-gray-800 font-medium whitespace-nowrap">{cls.departmentName}</td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{cls.course}</td>
                  <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{cls.className}</td>
                  <td className="px-4 py-3.5 text-[#1D6BA3] font-semibold text-sm whitespace-nowrap">{cls.programType}</td>
                  <td className="px-4 py-3.5 text-gray-700">{sectionCount(cls.sections)}</td>
                  <td className="pr-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <IconBtn title="Edit" onClick={() => setEditingClass(cls)}><EditIcon /></IconBtn>
                      <IconBtn title="View Details"><DocumentIcon /></IconBtn>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">No classes found.</td>
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

      {/* Add Class Modal */}
      {showModal && (
        <AddClassModal
          departments={uniqueDepartments}
          courses={uniqueCourses}
          onClose={() => setShowModal(false)}
          onSave={handleAddSave}
        />
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <EditClassModal
          cls={editingClass}
          departments={uniqueDepartments}
          courses={uniqueCourses}
          onClose={() => setEditingClass(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Add success popup */}
      {showSuccess && (
        <SuccessPopup
          title="Add"
          message="New Class Added Successfully"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* Edit success popup */}
      {showEditSuccess && (
        <SuccessPopup
          title="Add"
          message="Class Edited Successfully"
          onClose={() => setShowEditSuccess(false)}
        />
      )}
    </>
  );
};

export default Classes;
