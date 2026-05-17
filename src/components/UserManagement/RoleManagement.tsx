import React, { useState } from "react";
import Button from "../common/Button/Button";

// ── Mock data — replace with API response when backend is ready ──────────────
const ALL_ROLES = [
  { id: 1,  name: "Super Admin",        created: "2024-01-10", modified: "2024-06-15" },
  { id: 2,  name: "Admin",              created: "2024-01-10", modified: "2024-06-15" },
  { id: 3,  name: "Faculty",            created: "2024-01-12", modified: "2024-05-20" },
  { id: 4,  name: "Student",            created: "2024-01-12", modified: "2024-05-20" },
  { id: 5,  name: "HR Manager",         created: "2024-01-15", modified: "2024-06-01" },
  { id: 6,  name: "Finance Officer",    created: "2024-01-15", modified: "2024-06-01" },
  { id: 7,  name: "IT Staff",           created: "2024-01-18", modified: "2024-04-10" },
  { id: 8,  name: "Librarian",          created: "2024-01-18", modified: "2024-04-10" },
  { id: 9,  name: "Admissions Officer", created: "2024-01-20", modified: "2024-05-05" },
  { id: 10, name: "Academic Advisor",   created: "2024-01-20", modified: "2024-05-05" },
  { id: 11, name: "Department Head",    created: "2024-02-01", modified: "2024-06-10" },
  { id: 12, name: "Lab Technician",     created: "2024-02-01", modified: "2024-06-10" },
  { id: 13, name: "Sports Coach",       created: "2024-02-05", modified: "2024-03-15" },
  { id: 14, name: "Cultural Coordinator",created: "2024-02-05",modified: "2024-03-15" },
  { id: 15, name: "Research Associate", created: "2024-02-10", modified: "2024-06-20" },
  { id: 16, name: "Alumni Coordinator", created: "2024-02-10", modified: "2024-06-20" },
  { id: 17, name: "Guest Lecturer",     created: "2024-02-12", modified: "2024-04-25" },
  { id: 18, name: "Exam Controller",    created: "2024-02-12", modified: "2024-04-25" },
  { id: 19, name: "Hostel Warden",      created: "2024-02-15", modified: "2024-05-30" },
  { id: 20, name: "Security Staff",     created: "2024-02-15", modified: "2024-05-30" },
];

const ITEMS_PER_PAGE = 12;

// ── Action icons ─────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconBtn = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <button
    title={title}
    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors"
  >
    {children}
  </button>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
};

// ── Add / Edit form ───────────────────────────────────────────────────────────
const RoleForm = ({ onCancel }: { onCancel: () => void }) => {
  const [name, setName] = useState("");

  const handleSave = () => {
    // TODO: call POST /api/roles with { name } when backend is ready
    onCancel(); // return to list for now
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Form title */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-800">Role Name</h2>
      </div>

      {/* Fields */}
      <div className="px-6 py-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-72 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 placeholder-gray-400"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <Button variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

// ── List view ─────────────────────────────────────────────────────────────────
const RoleManagement = () => {
  const [view,          setView]          = useState<"list" | "add">("list");
  const [searchInput,   setSearchInput]   = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [currentPage,   setCurrentPage]   = useState(1);

  const filtered   = ALL_ROLES.filter(r =>
    r.name.toLowerCase().includes(searchApplied.toLowerCase())
  );
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIdx   = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems  = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => {
    setSearchApplied(searchInput);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchApplied("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  // ── Add form view ──
  if (view === "add") {
    return <RoleForm onCancel={() => setView("list")} />;
  }

  // ── List view ──
  return (
    <div className="space-y-4">
      {/* ── Main card ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Role Management</h1>

          <div className="flex items-center gap-2">
            {/* Search with clear button */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Role name"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="w-56 pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 placeholder-gray-400"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <Button variant="primary" size="md" onClick={handleSearch}>
              Search
            </Button>

            <Button variant="primary" size="md" onClick={() => setView("add")}>
              Add New
            </Button>
          </div>
        </div>

        {/* ── Table ── */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#EFF6FF] border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Name
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Created
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Modified
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageItems.length > 0 ? (
              pageItems.map(role => (
                <tr key={role.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-gray-700 font-medium">{role.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{formatDate(role.created)}</td>
                  <td className="px-5 py-3.5 text-gray-500">{formatDate(role.modified)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <IconBtn title="Edit"><EditIcon /></IconBtn>
                      <IconBtn title="Delete"><TrashIcon /></IconBtn>
                      <IconBtn title="View"><DocumentIcon /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">{totalItems > 0 ? startIdx + 1 : 0}</span>
            {" "}To{" "}
            <span className="font-semibold text-gray-700">{Math.min(startIdx + ITEMS_PER_PAGE, totalItems)}</span>
            {" "}Of{" "}
            <span className="font-semibold text-gray-700">{totalItems}</span>
            {" "}Results
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {pageNumbers.map((page, i) => {
              const prev = pageNumbers[i - 1];
              const showEllipsis = prev !== undefined && page - prev > 1;
              return (
                <React.Fragment key={page}>
                  {showEllipsis && (
                    <span className="px-2 py-1 text-xs text-gray-400">…</span>
                  )}
                  <button
                    onClick={() => goToPage(page)}
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
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
