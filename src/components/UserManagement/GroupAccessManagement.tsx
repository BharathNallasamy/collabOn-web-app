import React, { useState } from "react";
import Button from "../common/Button/Button";

// ── Mock data — replace each item with API response when backend is ready ───
const ALL_GROUPS = [
  { id: 1,  name: "Management Group"  },
  { id: 2,  name: "Admin Group"        },
  { id: 3,  name: "Faculty Group"      },
  { id: 4,  name: "Student Group"      },
  { id: 5,  name: "IT Department"      },
  { id: 6,  name: "Finance Group"      },
  { id: 7,  name: "HR Group"           },
  { id: 8,  name: "Academic Group"     },
  { id: 9,  name: "Library Group"      },
  { id: 10, name: "Sports Group"       },
  { id: 11, name: "Cultural Group"     },
  { id: 12, name: "Research Group"     },
  { id: 13, name: "Alumni Group"       },
  { id: 14, name: "Guest Group"        },
];

const ITEMS_PER_PAGE = 2;

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

// Reusable small icon button
const IconBtn = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <button
    title={title}
    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors"
  >
    {children}
  </button>
);

// ── Component ────────────────────────────────────────────────────────────────
const GroupAccessManagement = () => {
  const [searchInput,   setSearchInput]   = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [currentPage,   setCurrentPage]   = useState(1);

  // Filter + paginate
  const filtered    = ALL_GROUPS.filter(g =>
    g.name.toLowerCase().includes(searchApplied.toLowerCase())
  );
  const totalItems  = filtered.length;
  const totalPages  = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIdx    = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems   = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => {
    setSearchApplied(searchInput);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Show at most 5 page numbers around the current page
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <div className="space-y-4">
      {/* ── Main card ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Group Access Management</h1>

          <div className="flex items-center gap-2">
            {/* Search input */}
            <input
              type="text"
              placeholder="Search by Group name"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-56 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 placeholder-gray-400"
            />

            <Button variant="primary" size="md" onClick={handleSearch}>
              Search
            </Button>

            <Button variant="primary" size="md">
              Add
            </Button>
          </div>
        </div>

        {/* ── Table ── */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#EFF6FF] border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Group Name
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageItems.length > 0 ? (
              pageItems.map(group => (
                <tr key={group.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-gray-700 font-medium">{group.name}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <IconBtn title="Edit"><EditIcon /></IconBtn>
                      <IconBtn title="Delete"><TrashIcon /></IconBtn>
                      <IconBtn title="View"><DocumentIcon /></IconBtn>
                      <Button variant="primary" size="sm">
                        Assign User
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-5 py-8 text-center text-sm text-gray-400">
                  No groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          {/* Result count */}
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">{totalItems > 0 ? startIdx + 1 : 0}</span>
            {" "}To{" "}
            <span className="font-semibold text-gray-700">{Math.min(startIdx + ITEMS_PER_PAGE, totalItems)}</span>
            {" "}Of{" "}
            <span className="font-semibold text-gray-700">{totalItems}</span>
            {" "}Results
          </p>

          {/* Page controls */}
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

export default GroupAccessManagement;
