import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { ITEMS_PER_PAGE } from "../../constants";
import Pagination from "../../components/common/Pagination/Pagination";
import {
  EyeIcon,
  XIcon,
  CheckIcon,
  ChevronDown,
  SearchIcon,
  DocumentIcon,
} from "../../components/common/Icons/PageIcons";

import { SEED_APPLICATIONS as SEED } from "../../types/mockData";

// ── Shared components ─────────────────────────────────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Saved</h3>
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

// ── Stat card data ─────────────────────────────────────────────────────────────
const STATS = [
  {
    label: "Total Application",
    value: 6,
    valueColor: "text-gray-900",
    bg: "bg-blue-50",
    icon: (
      <svg className="w-5 h-5 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: "Rejected",
    value: 6,
    valueColor: "text-red-600",
    bg: "bg-red-50",
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  {
    label: "Waitlist",
    value: 6,
    valueColor: "text-amber-600",
    bg: "bg-amber-50",
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Shortlist",
    value: 3,
    valueColor: "text-[#1D6BA3]",
    bg: "bg-blue-50",
    icon: (
      <svg className="w-5 h-5 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    label: "Admitted",
    value: 10,
    valueColor: "text-green-600",
    bg: "bg-green-50",
    icon: (
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

// ── Status badge helper ────────────────────────────────────────────────────────
const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Received:  "bg-blue-50 text-blue-700",
    Shortlist: "bg-blue-50 text-blue-700",
    Waitlist:  "bg-amber-50 text-amber-700",
    Rejected:  "bg-red-50 text-red-700",
    Admitted:  "bg-green-50 text-green-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
};

// ── Sort icon ─────────────────────────────────────────────────────────────────
const SortIcon = () => (
  <span className="inline-flex flex-col ml-1 text-gray-400">
    <svg className="w-3 h-3 -mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
    </svg>
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  </span>
);

// ── MailIcon ──────────────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// ── Main component ─────────────────────────────────────────────────────────────
const ApplicationReview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill admissionType filter if navigated from Admissions Overview eye icon
  const incomingType = (location.state as { admissionType?: string } | null)?.admissionType ?? "All";

  // Search & filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [admissionTypeFilter, setAdmissionTypeFilter] = useState(incomingType);
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionsOpen, setActionsOpen] = useState(false);

  // Sort state
  type SortField = "appNo" | "name";
  type SortDir = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>("appNo");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Pagination
  const [page, setPage] = useState(1);

  // Success popup
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtering
  const filtered = useMemo(() => {
    let data = [...SEED];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      data = data.filter(r => r.appNo.toLowerCase().includes(q));
    }
    if (admissionTypeFilter !== "All") {
      data = data.filter(r => r.admissionType === admissionTypeFilter);
    }
    if (statusFilter !== "All") {
      data = data.filter(r => r.status === statusFilter);
    }
    data.sort((a, b) => {
      const valA = sortField === "appNo" ? a.appNo : a.name;
      const valB = sortField === "appNo" ? b.appNo : b.name;
      const cmp = valA.localeCompare(valB);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [searchQuery, admissionTypeFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const pageRows = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const allOnPageSelected = pageRows.length > 0 && pageRows.every(r => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      const next = new Set(selectedIds);
      pageRows.forEach(r => next.delete(r.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      pageRows.forEach(r => next.add(r.id));
      setSelectedIds(next);
    }
  };

  const toggleRow = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchQuery("");
    setAdmissionTypeFilter("All");
    setStatusFilter("All");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Page title */}
      <h1 className="text-lg font-bold text-gray-900">Application Review</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-5 gap-4">
        {STATS.map(s => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className={`text-xl font-bold ${s.valueColor}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search / filter row */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-b border-gray-100 flex-wrap">
          {/* Search input */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by Application No"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-56 pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); setSearchQuery(""); setPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon />
              </button>
            )}
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1a5f91] transition-colors"
          >
            Search
          </button>

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setActionsOpen(o => !o)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Actions <ChevronDown />
            </button>
            {actionsOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {["Export CSV", "Export PDF", "Print"].map(a => (
                  <button
                    key={a}
                    onClick={() => setActionsOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admission Type dropdown */}
          <div className="relative">
            <select
              value={admissionTypeFilter}
              onChange={e => { setAdmissionTypeFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] bg-white text-gray-700"
            >
              <option value="All">Program Type</option>
              <option value="UG">UG</option>
              <option value="PG">PG</option>
              <option value="PHD">PHD</option>
              <option value="Diploma">Diploma</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown />
            </span>
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] bg-white text-gray-700"
            >
              <option value="All">Status</option>
              {["Received", "Shortlist", "Waitlist", "Rejected", "Admitted"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown />
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 accent-[#1D6BA3] cursor-pointer"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("appNo")}
                >
                  App No <SortIcon />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("name")}
                >
                  Application <SortIcon />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Course Pref 1</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Course Pref 2</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Gender</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Age</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                    No applications found.
                  </td>
                </tr>
              ) : (
                pageRows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="w-3.5 h-3.5 accent-[#1D6BA3] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-700 whitespace-nowrap">{row.appNo}</td>
                    <td className="px-4 py-3 text-xs text-gray-900 font-semibold">{row.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{row.course1}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{row.course2}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{row.gender}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{row.age}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* View detail */}
                        <button
                          onClick={() => navigate(`/layout/admissions/application-review/${row.id}`)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#1D6BA3] hover:bg-[#1D6BA3]/10 transition-colors"
                          title="View"
                        >
                          <EyeIcon />
                        </button>
                        {/* Document */}
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#1D6BA3] hover:bg-[#1D6BA3]/10 transition-colors"
                          title="Document"
                        >
                          <DocumentIcon />
                        </button>
                        {/* Mail */}
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#1D6BA3] hover:bg-[#1D6BA3]/10 transition-colors"
                          title="Mail"
                        >
                          <MailIcon />
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
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          startIdx={startIdx}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={p => setPage(p)}
        />
      </div>

      {/* Success popup */}
      {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />}

      {/* Close actions dropdown on outside click */}
      {actionsOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setActionsOpen(false)} />
      )}
    </div>
  );
};

export default ApplicationReview;
