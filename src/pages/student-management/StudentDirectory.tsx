import React, { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";
import { ITEMS_PER_PAGE, DEPARTMENTS, PROGRAM_TYPES } from "../../constants";
import { exportToExcel, readXlsxFile } from "../../utils/excel";
import { type Student } from "../../types/interfaces";
import {
  EyeIcon,
  XIcon,
  CheckIcon,
  DocumentIcon,
} from "../../components/common/Icons/PageIcons";
import { SEED_STUDENTS } from "../../types/mockData";


const BATCHES = ["2022-2026", "2023-2025", "2023-2026", "2024-2027", "2024-2028"];

// ── Success Popup ─────────────────────────────────────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Success</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
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

// ── Select helper ─────────────────────────────────────────────────────────────
const Select = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none h-9 pl-3 pr-8 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
    <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

// ── Bulk Status Update Modal ──────────────────────────────────────────────────
const BulkStatusModal = ({
  selectedCount,
  onClose,
  onApply,
}: {
  selectedCount: number;
  onClose: () => void;
  onApply: (status: "Active" | "Inactive") => void;
}) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Bulk Status Update</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <XIcon />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <p className="text-[12px] text-gray-600">
            Update status for <span className="font-semibold text-gray-900">{selectedCount}</span> selected student(s).
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => onApply("Active")}
              className="flex-1 h-9 rounded-lg bg-green-600 text-white text-[12px] font-semibold hover:bg-green-700 transition-colors"
            >
              Set Active
            </button>
            <button
              onClick={() => onApply("Inactive")}
              className="flex-1 h-9 rounded-lg bg-red-500 text-white text-[12px] font-semibold hover:bg-red-600 transition-colors"
            >
              Set Inactive
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={[
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold",
      status === "Active"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-600",
    ].join(" ")}
  >
    {status}
  </span>
);

// ── Main Component ────────────────────────────────────────────────────────────
const StudentDirectory = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [students, setStudents] = useState<Student[]>(SEED_STUDENTS);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadBanner, setUploadBanner] = useState<{ type: "success" | "warn"; msg: string } | null>(null);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      if (batchFilter && s.batch !== batchFilter) return false;
      if (programFilter && s.programType !== programFilter) return false;
      if (deptFilter && s.department !== deptFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.rollNo.toLowerCase().includes(q) && !s.admissionNo.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, search, batchFilter, programFilter, deptFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ── Selection helpers ─────────────────────────────────────────────────────
  const allPageSelected = paginated.length > 0 && paginated.every((s) => selected.has(s.id));
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) paginated.forEach((s) => next.delete(s.id));
      else paginated.forEach((s) => next.add(s.id));
      return next;
    });
  };
  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    exportToExcel(
      filtered.map((s) => ({
        "Roll No": s.rollNo,
        "Admission No": s.admissionNo,
        "Student Name": s.name,
        Gender: s.gender,
        Phone: s.phone,
        Email: s.email,
        Community: s.community,
        "Program Type": s.programType,
        Scholarship: s.scholarship,
        "Course / Program": s.course,
        Department: s.department,
        Batch: s.batch,
        "Admission Date": s.admissionDate,
        Status: s.status,
      })),
      "Students",
      "Student_Directory.xlsx"
    );
  };

  // ── Bulk upload ───────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const rows = await readXlsxFile(file);
      const imported: Student[] = rows.map((r: Record<string, unknown>, i: number) => ({
        id: Date.now() + i,
        rollNo: String(r["Roll No"] ?? `ROLL-${i}`),
        admissionNo: String(r["Admission No"] ?? `ADM-${i}`),
        name: String(r["Student Name"] ?? "Unknown"),
        gender: (String(r["Gender"] ?? "Male") as "Male" | "Female"),
        phone: String(r["Phone"] ?? ""),
        email: String(r["Email"] ?? ""),
        community: String(r["Community"] ?? "OC"),
        programType: String(r["Program Type"] ?? "UG"),
        scholarship: String(r["Scholarship"] ?? "None"),
        course: String(r["Course / Program"] ?? ""),
        department: String(r["Department"] ?? ""),
        batch: String(r["Batch"] ?? ""),
        admissionDate: String(r["Admission Date"] ?? ""),
        status: (String(r["Status"] ?? "Active") as "Active" | "Inactive"),
      }));
      setStudents((prev) => [...prev, ...imported]);
      setUploadBanner({ type: "success", msg: `${imported.length} record(s) imported successfully.` });
    } catch {
      setUploadBanner({ type: "warn", msg: "Failed to read file. Please check the format." });
    }
  };

  // ── Bulk status update ────────────────────────────────────────────────────
  const handleBulkStatus = (status: "Active" | "Inactive") => {
    setStudents((prev) =>
      prev.map((s) => (selected.has(s.id) ? { ...s, status } : s))
    );
    setSelected(new Set());
    setShowBulkModal(false);
    setSuccessMsg(`Status updated to "${status}" for selected students.`);
  };

  // ── Navigate to detail ────────────────────────────────────────────────────
  const goToDetail = (id: number) =>
    navigate(`/layout/student-management/directory/${id}`);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-800">Student Directory</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{filtered.length} students found</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExport}
              className="h-8 px-3.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Bulk Upload
            </button>
            <button
              onClick={() => selected.size > 0 ? setShowBulkModal(true) : undefined}
              disabled={selected.size === 0}
              className="h-8 px-3.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bulk Status Update {selected.size > 0 && `(${selected.size})`}
            </button>
            <button
              onClick={() => paginated.length > 0 && goToDetail(paginated[0].id)}
              className="h-8 px-4 rounded-lg bg-[#1D6BA3] text-white text-[12px] font-semibold hover:bg-[#1558a0] flex items-center gap-1.5 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Upload banner */}
        {uploadBanner && (
          <div className={`mx-5 mt-3 flex items-center justify-between px-4 py-2.5 rounded-lg text-[12px] font-medium ${uploadBanner.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
            {uploadBanner.msg}
            <button onClick={() => setUploadBanner(null)} className="ml-3 opacity-60 hover:opacity-100"><XIcon /></button>
          </div>
        )}

        {/* Filters */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap justify-end">
          <Select value={batchFilter} onChange={(v) => { setBatchFilter(v); setPage(1); }} options={BATCHES} placeholder="All Batches" />
          <Select value={programFilter} onChange={(v) => { setProgramFilter(v); setPage(1); }} options={[...PROGRAM_TYPES]} placeholder="Program Type" />
          <Select value={deptFilter} onChange={(v) => { setDeptFilter(v); setPage(1); }} options={[...DEPARTMENTS]} placeholder="Department" />
          <Select value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={["Active", "Inactive"]} placeholder="Student Status" />
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search students..."
              className="h-9 pl-8 pr-3 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 w-48 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-[12px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/20 cursor-pointer"
                  />
                </th>
                {["Roll No", "Admission No", "Student Name", "Gender", "Phone No", "Email", "Community", "Program Type", "Scholarship", "Course / Program", "Department", "Batch", "Admission Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-semibold text-[11px] text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={16} className="text-center py-16 text-gray-400 text-sm">No students found.</td>
                </tr>
              ) : (
                paginated.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggleOne(s.id)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/20 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-800 whitespace-nowrap">{s.rollNo}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{s.admissionNo}</td>
                    <td className="px-3 py-3 font-medium text-gray-800 whitespace-nowrap">{s.name}</td>
                    <td className="px-3 py-3 text-gray-600">{s.gender}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{s.phone}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{s.email}</td>
                    <td className="px-3 py-3 text-gray-600">{s.community}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">{s.programType}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{s.scholarship}</td>
                    <td className="px-3 py-3 text-gray-700 font-medium whitespace-nowrap">{s.course}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{s.department}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{s.batch}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{s.admissionDate}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => goToDetail(s.id)}
                          title="View"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1D6BA3]/10 text-[#1D6BA3] transition-colors"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          title="Document"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                          <DocumentIcon />
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
        <div className="px-5 py-3 border-t border-gray-100">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filtered.length}
            startIdx={(page - 1) * ITEMS_PER_PAGE}
          />
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />

      {/* Modals */}
      {showBulkModal && (
        <BulkStatusModal
          selectedCount={selected.size}
          onClose={() => setShowBulkModal(false)}
          onApply={handleBulkStatus}
        />
      )}
      {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />}
    </div>
  );
};

export default StudentDirectory;
