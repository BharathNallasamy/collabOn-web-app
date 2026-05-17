import React, { useState, useEffect } from "react";
import Button from "../../../components/common/Button/Button";
import ManagementModal from "../../../components/Layouts/ManagementModal";
import { useRoles, type Role } from "../../../contexts/RolesContext";

const ITEMS_PER_PAGE = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
};

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

const IconBtn = ({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
}) => (
  <button
    title={title}
    onClick={onClick}
    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors"
  >
    {children}
  </button>
);

// ── Success toast ─────────────────────────────────────────────────────────────
const SuccessToast = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed top-5 right-5 z-[60] flex items-center gap-3 bg-white border border-emerald-200 rounded-xl px-4 py-3 shadow-xl">
      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-800">{message}</p>
      <button
        onClick={onDismiss}
        className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

// ── Role form body (used inside ManagementModal) ───────────────────────────────
const RoleFormBody = ({
  name,
  setName,
  nameError,
  setNameError,
}: {
  name: string;
  setName: (v: string) => void;
  nameError: boolean;
  setNameError: (v: boolean) => void;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      Name <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      placeholder="Enter Role Name"
      value={name}
      onChange={(e) => {
        setName(e.target.value);
        setNameError(false);
      }}
      className={[
        "w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 placeholder-gray-400",
        nameError ? "border-red-400 ring-2 ring-red-200" : "border-gray-200",
      ].join(" ")}
    />
    {nameError && <p className="mt-1 text-xs text-red-500">Role name is required.</p>}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const RoleManagement = () => {
  const { roles, setRoles } = useRoles();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = roles.filter((r) => r.name.toLowerCase().includes(searchApplied.toLowerCase()));
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

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
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  const openAdd = () => {
    setEditingRole(null);
    setRoleName("");
    setNameError(false);
    setModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setNameError(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRole(null);
    setRoleName("");
    setNameError(false);
  };

  const handleSave = () => {
    if (!roleName.trim()) {
      setNameError(true);
      return;
    }
    const today = todayIso();
    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRole.id ? { ...r, name: roleName.trim(), modified: today } : r
        )
      );
      setToast("Role updated successfully!");
    } else {
      setRoles((prev) => [
        { id: Date.now(), name: roleName.trim(), created: today, modified: today },
        ...prev,
      ]);
      setSearchApplied("");
      setSearchInput("");
      setCurrentPage(1);
      setToast("Role created successfully!");
    }
    closeModal();
  };

  const handleDelete = (id: number) => setRoles((prev) => prev.filter((r) => r.id !== id));

  return (
    <>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <h1 className="text-base font-bold text-gray-800">Role Management</h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Role name"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-56 pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 placeholder-gray-400"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
              <Button variant="primary" size="md" onClick={openAdd}>
                Add New
              </Button>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                {["Name", "Created", "Modified", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={[
                      "py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide",
                      i === 3 ? "pr-5 text-right" : "px-5 text-left",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length > 0 ? (
                pageItems.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-gray-700 font-medium">{role.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(role.created)}</td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(role.modified)}</td>
                    <td className="pr-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <IconBtn title="Edit" onClick={() => openEdit(role)}>
                          <EditIcon />
                        </IconBtn>
                        <IconBtn title="Delete" onClick={() => handleDelete(role.id)}>
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
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                    No roles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {totalItems > 0 ? startIdx + 1 : 0}
              </span>{" "}
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
                return (
                  <React.Fragment key={page}>
                    {prev !== undefined && page - prev > 1 && (
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

      {/* Add / Edit Role Modal */}
      <ManagementModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingRole ? "Edit Role" : "Add Role"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="md" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSave}>
              {editingRole ? "Update" : "Save"}
            </Button>
          </div>
        }
      >
        <RoleFormBody
          name={roleName}
          setName={setRoleName}
          nameError={nameError}
          setNameError={setNameError}
        />
      </ManagementModal>

      {toast && <SuccessToast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
};

export default RoleManagement;
