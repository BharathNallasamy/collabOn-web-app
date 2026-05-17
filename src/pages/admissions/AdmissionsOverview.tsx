import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ITEMS_PER_PAGE } from "../../constants";
import {
  PlusIcon,
  ChevronDown,
  XIcon,
  SearchIcon,
  EyeIcon,
} from "../../components/common/Icons/PageIcons";
import Pagination from "../../components/common/Pagination/Pagination";

// ── Types ──────────────────────────────────────────────────────────────────────
import { type AdmissionOverviewRow } from "../../types/interfaces";

// ── Seed data ──────────────────────────────────────────────────────────────────
import { SEED_ADMISSION_OVERVIEW } from "../../types/mockData";

const ADMISSION_TYPES = ["All", "UG", "PG", "PHD", "Diploma"] as const;
const ACADEMIC_YEARS_LIST = ["All", "2024-2025", "2023-2024", "2022-2023"] as const;

// ── Small inline icons ─────────────────────────────────────────────────────────
const SortIcon = () => (
  <svg className="w-3.5 h-3.5 inline ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const GreenCheckIcon = () => (
  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const DocIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// ── Select wrapper ─────────────────────────────────────────────────────────────
const SelectFilter = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none h-9 pl-3 pr-8 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o === "All" ? "" : o}>
          {o}
        </option>
      ))}
    </select>
    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
      <ChevronDown />
    </span>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const AdmissionsOverview = () => {
  const navigate = useNavigate();

  const [rows] = useState<AdmissionOverviewRow[]>(SEED_ADMISSION_OVERVIEW);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [admissionType, setAdmissionType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Apply filters
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchCourse = searchActive
        ? r.course.toLowerCase().includes(searchActive.toLowerCase())
        : true;
      const matchType = admissionType ? r.adminType === admissionType : true;
      return matchCourse && matchType;
    });
  }, [rows, searchActive, admissionType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => {
    setSearchActive(searchTerm);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearchTerm("");
    setSearchActive("");
    setAdmissionType("");
    setAcademicYear("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const isAllSelected =
    paginated.length > 0 && paginated.every((r) => selectedIds.has(r.id));

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0 px-6 py-5 gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-gray-900">Admissions Overview</h1>
        <button
          onClick={() => navigate("/layout/admissions/new-entry")}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1a5f91] transition-colors shadow-sm"
        >
          <PlusIcon />
          New Entry
        </button>
      </div>

      {/* ── Search / Filter row ── */}
      <div className="flex items-center gap-2 justify-end flex-wrap">
        {/* Search input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by Course Name"
            className="w-52 h-9 pl-8 pr-8 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(""); setSearchActive(""); setCurrentPage(1); }}
              className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
            >
              <XIcon />
            </button>
          )}
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="h-9 px-4 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1a5f91] transition-colors"
        >
          Search
        </button>

        {/* Clear button */}
        <button
          onClick={handleClear}
          className="h-9 px-4 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>

        {/* Academic Year dropdown */}
        <SelectFilter
          value={academicYear}
          onChange={(v) => { setAcademicYear(v); setCurrentPage(1); }}
          options={ACADEMIC_YEARS_LIST}
          placeholder="Academic Year"
        />

        {/* Admission Type dropdown */}
        <SelectFilter
          value={admissionType}
          onChange={(v) => { setAdmissionType(v); setCurrentPage(1); }}
          options={ADMISSION_TYPES}
          placeholder="Program Type"
        />
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/30 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Course Name
                  <SortIcon />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Admin Type
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Submitted Responses
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Draft Responses
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-xs">
                    No records found.
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleOne(row.id)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/30 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {row.course}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.adminType}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <GreenCheckIcon />
                        <span className="font-semibold text-[#1D6BA3]">{row.submitted}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <DocIcon />
                        <span className="text-gray-500">{row.draft}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        title="View"
                        onClick={() => navigate("/layout/admissions/application-review", { state: { admissionType: row.adminType } })}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors"
                      >
                        <EyeIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          startIdx={startIdx}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AdmissionsOverview;
