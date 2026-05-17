import React, { useState, useRef, useEffect } from "react";
import Button from "../common/Button/Button";

// ── Mock data — replace with API response when backend is ready ───────────────
const ALL_USERS = [
  {
    id: 1,
    name: "Amudhan",
    email: "Pamudhan3@gmail.com",
    role: "Principal",
    institution: "RGEC",
    status: "Active",
    created: "2024-12-20",
  },
  {
    id: 2,
    name: "Saravana",
    email: "saravana123@yahoo.com",
    role: "Vice-Principal",
    institution: "RGEC",
    status: "Active",
    created: "2024-12-20",
  },
  {
    id: 3,
    name: "Amudhan",
    email: "Pamudhan3@gmail.com",
    role: "Head Of Department",
    institution: "RGNC",
    status: "Active",
    created: "2024-12-20",
  },
  {
    id: 4,
    name: "Karthika",
    email: "karje39@gmail.com",
    role: "Head of Department",
    institution: "RGEC",
    status: "Active",
    created: "2024-12-20",
  },
  {
    id: 5,
    name: "Jagadeesh",
    email: "k.jacky@gmail.com",
    role: "Head of Department",
    institution: "RGEC",
    status: "Active",
    created: "2024-12-20",
  },
  {
    id: 6,
    name: "Amudhan",
    email: "Pamudhan3@gmail.com",
    role: "Head of Department",
    institution: "RGNC",
    status: "Active",
    created: "2024-12-20",
  },
  {
    id: 7,
    name: "Amudhan",
    email: "Pamudhan3@gmail.com",
    role: "Head of Department",
    institution: "RGASC",
    status: "Active",
    created: "2024-12-20",
  },
  {
    id: 8,
    name: "Amudhan",
    email: "Pamudhan3@gmail.com",
    role: "Head Of Department",
    institution: "RGASC",
    status: "Active",
    created: "2024-12-20",
  },
  {
    id: 9,
    name: "Priya",
    email: "priya.k@gmail.com",
    role: "Faculty",
    institution: "RGEC",
    status: "Active",
    created: "2024-12-21",
  },
  {
    id: 10,
    name: "Rajesh",
    email: "rajesh.m@gmail.com",
    role: "Faculty",
    institution: "RGNC",
    status: "Inactive",
    created: "2024-12-21",
  },
  {
    id: 11,
    name: "Deepa",
    email: "deepa.s@gmail.com",
    role: "Admin",
    institution: "RGASC",
    status: "Active",
    created: "2024-12-21",
  },
  {
    id: 12,
    name: "Suresh",
    email: "suresh.k@gmail.com",
    role: "IT Staff",
    institution: "RGEC",
    status: "Active",
    created: "2024-12-22",
  },
  {
    id: 13,
    name: "Meena",
    email: "meena.r@gmail.com",
    role: "HR Manager",
    institution: "RGNC",
    status: "Inactive",
    created: "2024-12-22",
  },
  {
    id: 14,
    name: "Vinoth",
    email: "vinoth.p@gmail.com",
    role: "Finance Officer",
    institution: "RGASC",
    status: "Active",
    created: "2024-12-22",
  },
];

const TYPE_OPTIONS = ["Admin", "Faculty", "Student", "Staff"];
const STATUS_OPTIONS = ["Active", "Inactive"];
const ITEMS_PER_PAGE = 8;

// ── Icons ─────────────────────────────────────────────────────────────────────
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

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
  const [, m, d] = iso.split("-");
  return `${d}/${m}/${iso.split("-")[0]}`;
};

const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status === "Active";
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        isActive
          ? "text-green-600 border-green-400 bg-green-50"
          : "text-red-500 border-red-400 bg-red-50",
      ].join(" ")}
    >
      {status}
    </span>
  );
};

// ── Actions dropdown ──────────────────────────────────────────────────────────
const ActionsDropdown = ({ disabled }: { disabled: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#1D6BA3] text-white hover:bg-[#155280] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Actions
        <ChevronDown />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
          <button
            onClick={() => setOpen(false)}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#1D6BA3]/10 hover:text-[#1D6BA3] transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete Selected
          </button>
        </div>
      )}
    </div>
  );
};

// ── Custom Select ─────────────────────────────────────────────────────────────
const SelectDropdown = ({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 w-40 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-left focus:outline-none hover:border-gray-300 transition-colors"
      >
        <span className={value ? "text-gray-700" : "text-gray-400"}>{value || placeholder}</span>
        <ChevronDown />
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
          {value && (
            <button
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 transition-colors"
            >
              — Clear —
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={[
                "w-full text-left px-3 py-2 text-sm transition-colors",
                opt === value
                  ? "bg-[#1D6BA3]/10 text-[#1D6BA3] font-medium"
                  : "text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const UserAccessManagement = () => {
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // ── Filter logic ──
  const filtered = ALL_USERS.filter((u) => {
    const matchType = !filterType || u.role.toLowerCase().includes(filterType.toLowerCase());
    const matchStatus = !filterStatus || u.status === filterStatus;
    const matchSearch =
      !searchApplied || u.name.toLowerCase().includes(searchApplied.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => {
    setSearchApplied(searchInput);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilterType("");
    setFilterStatus("");
    setSearchInput("");
    setSearchApplied("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  // ── Checkbox logic ──
  const pageIds = pageItems.map((u) => u.id);
  const allPageChecked = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someChecked = pageIds.some((id) => selected.has(id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageChecked) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleRow = (id: number) => {
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

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">User Access Management</h1>

          <div className="flex items-center gap-2">
            <ActionsDropdown disabled={selected.size === 0} />
            <Button variant="primary" size="md">
              Add User
            </Button>
          </div>
        </div>

        {/* ── Filter row ── */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-gray-100">
          <SelectDropdown
            placeholder="Select Type"
            options={TYPE_OPTIONS}
            value={filterType}
            onChange={(v) => {
              setFilterType(v);
              setCurrentPage(1);
            }}
          />

          <SelectDropdown
            placeholder="Select Status"
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={(v) => {
              setFilterStatus(v);
              setCurrentPage(1);
            }}
          />

          {/* Search input with clear */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Group name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-60 pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 placeholder-gray-400"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <Button variant="primary" size="md" onClick={handleSearch}>
            Search
          </Button>

          <Button variant="primary" size="md" onClick={handleClear}>
            Clear
          </Button>
        </div>

        {/* ── Table ── */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#EFF6FF] border-b border-gray-100">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allPageChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked && !allPageChecked;
                  }}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] accent-[#1D6BA3] cursor-pointer"
                />
              </th>
              {[
                "Name",
                "Email",
                "Role Name",
                "Institution Name",
                "Status",
                "Created Date",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className={[
                    "py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide",
                    h === "Actions" ? "pr-5 text-right" : "px-3 text-left",
                  ].join(" ")}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {pageItems.length > 0 ? (
              pageItems.map((user) => (
                <tr
                  key={user.id}
                  className={[
                    "transition-colors",
                    selected.has(user.id) ? "bg-[#1D6BA3]/5" : "hover:bg-gray-50/60",
                  ].join(" ")}
                >
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selected.has(user.id)}
                      onChange={() => toggleRow(user.id)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#1D6BA3] cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3.5 text-gray-700 font-medium whitespace-nowrap">
                    {user.name}
                  </td>
                  <td className="px-3 py-3.5 text-gray-500">{user.email}</td>
                  <td className="px-3 py-3.5 text-gray-600">{user.role}</td>
                  <td className="px-3 py-3.5 text-gray-600">{user.institution}</td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-3 py-3.5 text-gray-500 whitespace-nowrap">
                    {formatDate(user.created)}
                  </td>
                  <td className="pr-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <IconBtn title="Edit">
                        <EditIcon />
                      </IconBtn>
                      <IconBtn title="Delete">
                        <TrashIcon />
                      </IconBtn>
                      <IconBtn title="View">
                        <DocumentIcon />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">{totalItems > 0 ? startIdx + 1 : 0}</span>{" "}
            To{" "}
            <span className="font-semibold text-gray-700">
              {Math.min(startIdx + ITEMS_PER_PAGE, totalItems)}
            </span>{" "}
            Of <span className="font-semibold text-gray-700">{totalItems}</span> Results
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
                  {showEllipsis && <span className="px-2 py-1 text-xs text-gray-400">…</span>}
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

export default UserAccessManagement;
