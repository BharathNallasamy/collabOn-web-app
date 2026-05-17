import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "../../../components/common/Button/Button";
import { ITEMS_PER_PAGE, INSTITUTIONS, STREAMS, DEGREE_NAMES, ACADEMIC_YEARS } from "../../../constants";
import { findField, readXlsxFile, exportToExcel } from "../../../utils/excel";
import {
  EditIcon, UploadIcon, PlusIcon, TrashIcon, BackArrow, CalendarIcon,
  ChevronDown, XIcon, CheckIcon, InstIcon,
} from "../../../components/common/Icons/PageIcons";
import Pagination from "../../../components/common/Pagination/Pagination";

// ── Types ─────────────────────────────────────────────────────────────────────
import { type Department, type StagingEntry, type MapRow } from "../../../types/interfaces";
import { SEED_DEPARTMENTS } from "../../../types/mockData";



type UploadResult = { fileName: string; added: number; skipped: number; errors: string[] } | null;


// ── Excel parsing (page-specific) ──────────────────────────────────────────────
const parseXlsxRows = (rows: Record<string, unknown>[]): { added: Department[]; skipped: string[] } => {
  const added: Department[]  = [];
  const skipped: string[]    = [];

  rows.forEach((row, i) => {
    const department        = String(findField(row, "department", "department name", "dept") ?? "").trim();
    const course            = String(findField(row, "course") ?? "").trim();
    const institution       = String(findField(row, "institution", "college") ?? "RGEC").trim();
    const programLevels     = Math.max(1, parseInt(String(findField(row, "program levels", "programs") ?? "1"), 10) || 1);
    const sanctionedStrength = Math.max(0, parseInt(String(findField(row, "sanctioned strength", "sanctioned") ?? "0"), 10) || 0);
    const studentStrength   = Math.max(0, parseInt(String(findField(row, "student strength", "strength", "students") ?? "0"), 10) || 0);

    if (!department) { skipped.push(`Row ${i + 2} — missing department name`); return; }
    added.push({ id: Date.now() + i, department, course, institution, programLevels, sanctionedStrength, studentStrength });
  });

  return { added, skipped };
};

// ── Shared UI helpers ─────────────────────────────────────────────────────────
const IconBtn = ({
  children, title, onClick, color = "blue",
}: { children: React.ReactNode; title: string; onClick?: () => void; color?: "blue" | "red" }) => (
  <button title={title} onClick={onClick}
    className={[
      "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
      color === "red"
        ? "bg-red-50 text-red-500 hover:bg-red-100"
        : "bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20",
    ].join(" ")}>
    {children}
  </button>
);

const SelectField = ({
  value, onChange, placeholder, options, className = "",
}: { value: string; onChange: (v: string) => void; placeholder: string; options: readonly string[]; className?: string }) => (
  <div className={`relative ${className}`}>
    <select value={value} onChange={e => onChange(e.target.value)}
      className={[
        "w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer",
        !value ? "text-gray-400" : "text-gray-700",
      ].join(" ")}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown /></div>
  </div>
);

const TextInput = ({
  value, onChange, placeholder, className = "",
}: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) => (
  <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400 ${className}`} />
);

// ── Success Popup ─────────────────────────────────────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) => (
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
  </div>
);

// ── Create New Modal (Bulk Department Setup) ───────────────────────────────────
interface CreateModalProps {
  onClose: () => void;
  onSave: (entries: StagingEntry[]) => void;
}

const CreateModal = ({ onClose, onSave }: CreateModalProps) => {
  const [institution, setInstitution] = useState("");
  const [stream,      setStream]      = useState("");
  const [department,  setDepartment]  = useState("");
  const [course,      setCourse]      = useState("");
  const [stagingList, setStagingList] = useState<StagingEntry[]>([]);

  const handleAdd = () => {
    if (!department.trim()) return;
    setStagingList(prev => [...prev, {
      id: Date.now(),
      institution: institution || "RGEC",
      stream:      stream      || "Engineering",
      department:  department.trim(),
      course:      course.trim(),
    }]);
    setDepartment("");
    setCourse("");
  };

  const handleDelete = (id: number) =>
    setStagingList(prev => prev.filter(e => e.id !== id));

  const handleSave = () => {
    if (stagingList.length === 0) return;
    onSave(stagingList);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">Bulk Department Setup</h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Department form section */}
          <div className="rounded-xl border border-gray-200 p-4 space-y-4">
            <p className="text-sm font-bold text-gray-800">Department</p>

            {/* Institution + Stream */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Institution</label>
                <SelectField value={institution} onChange={setInstitution}
                  placeholder="XX University" options={INSTITUTIONS} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Stream</label>
                <SelectField value={stream} onChange={setStream}
                  placeholder="Engineering" options={STREAMS} />
              </div>
            </div>

            {/* Department + Course */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Department</label>
                <TextInput value={department} onChange={setDepartment} placeholder="Enter" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Course</label>
                <TextInput value={course} onChange={setCourse} placeholder="Enter" />
              </div>
            </div>

            {/* Add button */}
            <button onClick={handleAdd}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1D6BA3] hover:text-[#1D6BA3]/80 transition-colors">
              <PlusIcon />
              Add Department
            </button>
          </div>

          {/* Staging table */}
          {stagingList.length > 0 && (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#EFF6FF] border-b border-gray-100">
                    {["Institution", "Stream", "Department", "Course", "Actions"].map(h => (
                      <th key={h} className={["py-2.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wide",
                        h === "Actions" ? "pr-4 text-right" : "pl-4 text-left"].join(" ")}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stagingList.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50/60">
                      <td className="pl-4 py-2.5 text-gray-700">{e.institution}</td>
                      <td className="pl-4 py-2.5 text-gray-700">{e.stream}</td>
                      <td className="pl-4 py-2.5 text-gray-800 font-medium">{e.department}</td>
                      <td className="pl-4 py-2.5 text-gray-700">{e.course}</td>
                      <td className="pr-4 py-2.5 text-right">
                        <IconBtn title="Remove" color="red" onClick={() => handleDelete(e.id)}>
                          <TrashIcon />
                        </IconBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave} >
            Save
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Map Program View ───────────────────────────────────────────────────────────
interface MapProgramViewProps {
  departments: Department[];
  academicYear: string;
  onBack: () => void;
  onSave: (rows: MapRow[]) => void;
}

const MapProgramView = ({ departments, academicYear, onBack, onSave }: MapProgramViewProps) => {
  const [rows, setRows] = useState<MapRow[]>(() =>
    departments.slice(0, 10).map(d => ({
      id:         d.id,
      department: d.department,
      course:     d.course,
      stream:     d.institution,
      degreeName: "",
      sections:   0,
      ug:         false,
      pg:         false,
      research:   false,
      phd:        false,
    }))
  );

  const updateRow = (id: number, patch: Partial<MapRow>) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full max-w-full">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <button onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <BackArrow />
        </button>
        <h1 className="text-base font-bold text-gray-900">Map Program</h1>
      </div>

      {/* Sub-header: institution badge + academic year */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
          <InstIcon />
          <span className="text-xs font-medium text-gray-700">Rajiv Gandhi Engineering College</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
          <CalendarIcon />
          <span className="text-xs font-medium text-[#1D6BA3]">Academic Year : {academicYear}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm min-w-max">
          <thead>
            <tr className="bg-[#EFF6FF] border-b border-gray-100">
              {["Department", "Course Name", "Stream", "Degree Name", "Sections", "UG", "PG", "Research", "Ph.d"].map(h => (
                <th key={h} className={[
                  "py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap",
                  ["UG","PG","Research","Ph.d"].includes(h) ? "px-3 text-center" : "px-4 text-left",
                ].join(" ")}>
                  {["UG","PG","Research","Ph.d"].includes(h)
                    ? <div className="flex flex-col items-center gap-1">
                        <span>{h}</span>
                        <input type="checkbox" className="w-4 h-4 accent-[#1D6BA3] cursor-pointer"
                          onChange={e => setRows(prev => prev.map(r => ({
                            ...r,
                            ug:       h === "UG"       ? e.target.checked : r.ug,
                            pg:       h === "PG"       ? e.target.checked : r.pg,
                            research: h === "Research" ? e.target.checked : r.research,
                            phd:      h === "Ph.d"     ? e.target.checked : r.phd,
                          })))} />
                      </div>
                    : h}
                </th>
              ))}
              {(["UG", "PG", "M.Phill", "Ph.d"] as const).map(h => {
                const k = h === "Ph.d" ? "phd" : h === "M.Phill" ? "research" : h.toLowerCase() as "ug" | "pg";
                if (rows.some(r => r[k])) {
                  return (
                    <th key={`${h}_extra`} className="py-3 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap text-center">
                      {h} Allocated Strength
                    </th>
                  );
                }
                return null;
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{row.department}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.course}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.stream}</td>

                {/* Degree Name dropdown */}
                <td className="px-4 py-3">
                  <div className="relative w-36">
                    <select value={row.degreeName}
                      onChange={e => updateRow(row.id, { degreeName: e.target.value })}
                      className={["w-full appearance-none pl-2 pr-6 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer",
                        !row.degreeName ? "text-gray-400" : "text-gray-700"].join(" ")}>
                      <option value="">Select</option>
                      {DEGREE_NAMES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
                      <ChevronDown />
                    </div>
                  </div>
                </td>

                {/* Sections stepper */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-700 w-5 text-center">{row.sections}</span>
                    <div className="flex flex-col">
                      <button onClick={() => updateRow(row.id, { sections: row.sections + 1 })}
                        className="flex items-center justify-center w-5 h-4 text-gray-400 hover:text-[#1D6BA3] hover:bg-gray-100 rounded-sm transition-colors leading-none text-[10px]">▲</button>
                      <button onClick={() => updateRow(row.id, { sections: Math.max(0, row.sections - 1) })}
                        className="flex items-center justify-center w-5 h-4 text-gray-400 hover:text-[#1D6BA3] hover:bg-gray-100 rounded-sm transition-colors leading-none text-[10px]">▼</button>
                    </div>
                  </div>
                </td>

                {/* Checkboxes */}
                {(["ug","pg","research","phd"] as const).map(k => (
                  <td key={k} className="px-3 py-3 text-center">
                    <input type="checkbox" checked={row[k]} onChange={e => updateRow(row.id, { [k]: e.target.checked })}
                      className="w-4 h-4 accent-[#1D6BA3] cursor-pointer" />
                  </td>
                ))}

                {/* Extra Columns */}
                {(["ug","pg","research","phd"] as const).map(k => {
                  if (rows.some(r => r[k])) {
                    return (
                      <td key={`${k}_extra`} className="px-3 py-3 text-center">
                        {row[k] && (
                          <input
                            type="number"
                            placeholder="Enter"
                            min="0"
                            value={row[`${k}Strength` as keyof MapRow] as string | number || ""}
                            onChange={e => updateRow(row.id, { [`${k}Strength`]: e.target.value })}
                            className="w-20 px-2 py-1 text-xs border border-gray-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        )}
                      </td>
                    );
                  }
                  return null;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
        <Button variant="ghost" size="md" onClick={onBack}>Cancel</Button>
        <Button variant="primary" size="md" onClick={() => onSave(rows)}>Save</Button>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const Departments = () => {
  const [departments,    setDepartments]   = useState<Department[]>(SEED_DEPARTMENTS);
  const [view,           setView]          = useState<"list" | "map-program">("list");
  const [showModal,      setShowModal]     = useState(false);
  const [successMsg,     setSuccessMsg]    = useState<string | null>(null);
  const [academicYear,   setAcademicYear]  = useState<(typeof ACADEMIC_YEARS)[number]>(ACADEMIC_YEARS[0]);

  // Search & filter
  const [searchInput,    setSearchInput]   = useState("");
  const [searchApplied,  setSearchApplied] = useState("");
  const [filterDept,     setFilterDept]    = useState("");
  const [filterCourse,   setFilterCourse]  = useState("");
  const [currentPage,    setCurrentPage]   = useState(1);
  const [selectedIds,    setSelectedIds]   = useState<Set<number>>(new Set());

  // Upload
  const [uploadResult,   setUploadResult]  = useState<UploadResult>(null);
  const [uploadLoading,  setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Derived data ───────────────────────────────────────────────────────────
  const uniqueDepts   = [...new Set(departments.map(d => d.department))];
  const uniqueCourses = [...new Set(departments.map(d => d.course))];

  const filtered = departments.filter(d => {
    const q = searchApplied.toLowerCase();
    const matchSearch = !q || d.department.toLowerCase().includes(q) || d.course.toLowerCase().includes(q);
    const matchDept   = !filterDept   || d.department === filterDept;
    const matchCourse = !filterCourse || d.course === filterCourse;
    return matchSearch && matchDept && matchCourse;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIdx   = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems  = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => { setSearchApplied(searchInput); setCurrentPage(1); };
  const handleClear  = () => { setSearchInput(""); setSearchApplied(""); setFilterDept(""); setFilterCourse(""); setCurrentPage(1); };

  // ── Selection ──────────────────────────────────────────────────────────────
  const allPageSelected = pageItems.length > 0 && pageItems.every(d => selectedIds.has(d.id));
  const toggleAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allPageSelected) pageItems.forEach(d => next.delete(d.id));
      else pageItems.forEach(d => next.add(d.id));
      return next;
    });
  };
  const toggleOne = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

      const existingNames = new Set(departments.map(d => d.department.toLowerCase()));
      const toAdd    = added.filter(d => !existingNames.has(d.department.toLowerCase()));
      const dupNames = added.filter(d =>  existingNames.has(d.department.toLowerCase()))
        .map(d => `"${d.department}" already exists`);

      if (toAdd.length > 0) { setDepartments(prev => [...prev, ...toAdd]); setCurrentPage(1); }

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

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    exportToExcel(
      departments.map(d => ({
        Department:            d.department,
        Course:                d.course,
        Institution:           d.institution,
        "Program Levels":      d.programLevels,
        "Sanctioned Strength": d.sanctionedStrength,
        "Student Strength":    d.studentStrength,
      })),
      "Departments",
      "departments.xlsx",
    );
  };

  // ── Create modal save ─────────────────────────────────────────────────────
  const handleModalSave = (entries: StagingEntry[]) => {
    const existingNames = new Set(departments.map(d => d.department.toLowerCase()));
    const toAdd: Department[] = entries
      .filter(e => !existingNames.has(e.department.toLowerCase()))
      .map(e => ({
        id:                 Date.now() + Math.random(),
        department:         e.department,
        course:             e.course || e.department,
        institution:        e.institution,
        programLevels:      1,
        sanctionedStrength: 0,
        studentStrength:    0,
      }));
    if (toAdd.length > 0) { setDepartments(prev => [...prev, ...toAdd]); setCurrentPage(1); }
    setShowModal(false);
    setSuccessMsg("Department(s) added successfully!");
  };

  // ── Map Program save ──────────────────────────────────────────────────────
  const handleMapSave = () => {
    setView("list");
    setSuccessMsg("Program mapping saved successfully!");
  };

  // ── Map Program view ──────────────────────────────────────────────────────
  if (view === "map-program") {
    return (
      <>
        <MapProgramView
          departments={departments}
          academicYear={academicYear}
          onBack={() => setView("list")}
          onSave={handleMapSave}
        />
        {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />}
      </>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Department</h1>

          <div className="flex flex-wrap items-center gap-2">
            {/* Academic Year */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs text-gray-600">
              <CalendarIcon />
              <span>Academic Year :</span>
              <div className="relative">
                <select value={academicYear} onChange={e => setAcademicYear(e.target.value as (typeof ACADEMIC_YEARS)[number])}
                  className="appearance-none font-semibold text-[#1D6BA3] bg-transparent pr-4 focus:outline-none cursor-pointer text-xs">
                  {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center"><ChevronDown /></div>
              </div>
            </div>

            {/* Export */}
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Export
              <ChevronDown />
            </button>

            {/* Bulk Upload */}
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            <button onClick={handleBulkUploadClick} disabled={uploadLoading}
              title="Upload .xlsx or .csv — columns: Department | Course | Institution | Program Levels | Sanctioned Strength | Student Strength"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 disabled:opacity-60 transition-colors">
              <UploadIcon />
              {uploadLoading ? "Importing…" : "Bulk Upload"}
            </button>

            {/* Map Program */}
            <button onClick={() => setView("map-program")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 transition-colors">
              Map Program
            </button>

            {/* Create New */}
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors">
              <PlusIcon />
              Create New
            </button>
          </div>
        </div>

        {/* Upload result banner */}
        {uploadResult && (
          <div className={["flex items-start gap-3 px-5 py-3 border-b text-xs",
            uploadResult.added > 0 ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"].join(" ")}>
            <div className="flex-1 min-w-0">
              <p className={["font-semibold", uploadResult.added > 0 ? "text-green-700" : "text-amber-700"].join(" ")}>
                {uploadResult.fileName} — {uploadResult.added} department{uploadResult.added !== 1 ? "s" : ""} added
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

        {/* Search & filter row — all right-aligned to match design */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-b border-gray-100">
          <div className="relative min-w-[220px]">
            <input type="text" placeholder="Search by Department name" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400" />
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

          {/* Department filter */}
          <div className="relative">
            <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setCurrentPage(1); }}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer min-w-[130px]">
              <option value="">Department</option>
              {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown /></div>
          </div>

          {/* Course filter */}
          <div className="relative">
            <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setCurrentPage(1); }}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer min-w-[110px]">
              <option value="">Course</option>
              {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown /></div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                <th className="pl-5 pr-3 py-3 w-10">
                  <input type="checkbox" checked={allPageSelected} onChange={toggleAll}
                    className="w-4 h-4 accent-[#1D6BA3] cursor-pointer rounded" />
                </th>
                {["Department", "Course Name", "Institution", "No.Of Program Level", "Sanctioned Strength", "Student Strength", "Actions"].map(h => (
                  <th key={h} className={["py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap",
                    h === "Actions" ? "pr-5 text-right" : "px-4 text-left"].join(" ")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length > 0 ? pageItems.map(dept => (
                <tr key={dept.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="pl-5 pr-3 py-3.5">
                    <input type="checkbox" checked={selectedIds.has(dept.id)} onChange={() => toggleOne(dept.id)}
                      className="w-4 h-4 accent-[#1D6BA3] cursor-pointer rounded" />
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">{dept.department}</td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{dept.course}</td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{dept.institution}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-[#EFF6FF] text-[#1D6BA3]">
                      {String(dept.programLevels).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[#1D6BA3] font-semibold">{dept.sanctionedStrength}</td>
                  <td className="px-4 py-3.5 text-gray-700">{dept.studentStrength}</td>
                  <td className="pr-5 py-3.5">
                    <div className="flex items-center justify-end">
                      <IconBtn title="Edit" onClick={() => setView("map-program")}><EditIcon /></IconBtn>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">No departments found.</td>
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

      {/* Modals & overlays */}
      {showModal && (
        <CreateModal onClose={() => setShowModal(false)} onSave={handleModalSave} />
      )}
      {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />}
    </>
  );
};

export default Departments;
