import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import Button from "../../../components/common/Button/Button";
import ManagementModal from "../../../components/Layouts/ManagementModal";
import { useGroups } from "../../../contexts/GroupsContext";
import {
  RIGHTS_MODULES,
  REPORT_MODULES,
  SHOW_ONLY_MODULES,
  makeDefaultPerms,
  type PermMap,
  type Group,
} from "../../../types/groups";
import { MOCK_ADMINS } from "../../../types/mockData";
import { type GroupFormBodyProps } from "../../../types/interfaces";
import { useUser } from "../../../contexts/UserContext";

const ITEMS_PER_PAGE = 7;

const IconBtn = ({
  icon: Icon,
  title,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  onClick?: () => void;
}) => (
  <button
    title={title}
    onClick={onClick}
    className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#F1F7FE] text-[#1D6BA3] hover:bg-[#1D6BA3] hover:text-white transition-all duration-200 border border-[#D6E6F7] shadow-sm active:scale-95"
  >
    <Icon size={18} />
  </button>
);

// ── Permission table ──────────────────────────────────────────────────────────

const PermTable = ({
  modules,
  perms,
  setPerms,
  col1Label,
  col2Label,
}: {
  modules: string[];
  perms: PermMap;
  setPerms: (p: PermMap) => void;
  col1Label: string;
  col2Label: string;
}) => {
  const allChecked = modules.every((m) => {
    const isShowOnly = SHOW_ONLY_MODULES.includes(m);
    return isShowOnly ? perms[m].col1 : perms[m].col1 && perms[m].col2;
  });

  const toggle = (module: string, col: "col1" | "col2") =>
    setPerms({ ...perms, [module]: { ...perms[module], [col]: !perms[module][col] } });

  const selectAll = () => {
    const next = !allChecked;
    setPerms(
      Object.fromEntries(
        modules.map((m) => [
          m,
          { col1: next, col2: SHOW_ONLY_MODULES.includes(m) ? false : next },
        ])
      )
    );
  };

  return (
    <div className="border border-[#D1E4FA] rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="flex items-center gap-3 px-5 py-3 bg-[#EAF2FC] border-b border-[#D1E4FA]">
        <input
          type="checkbox"
          id={`select-all-${col1Label}`}
          checked={allChecked}
          onChange={selectAll}
          className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/20 cursor-pointer"
        />
        <label
          htmlFor={`select-all-${col1Label}`}
          className="text-[13px] font-bold text-gray-700 cursor-pointer"
        >
          Select All
        </label>
      </div>
      <div className="divide-y divide-gray-100">
        {modules.map((module) => {
          const isShowOnly = SHOW_ONLY_MODULES.includes(module);
          return (
            <div
              key={module}
              className="flex items-center px-5 py-3.5 hover:bg-gray-50/50 transition-colors group"
            >
              <span className="flex-1 text-[13px] font-medium text-gray-600 group-hover:text-[#1D6BA3] transition-colors">
                {module}
              </span>
              <div className="flex gap-10 min-w-[240px] justify-end">
                <label className="flex items-center gap-3 cursor-pointer group/label">
                  <input
                    type="checkbox"
                    checked={perms[module].col1}
                    onChange={() => toggle(module, "col1")}
                    className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/20"
                  />
                  <span className="text-[13px] font-bold text-gray-600 group-hover/label:text-gray-900 min-w-[40px]">
                    {isShowOnly ? "Show" : col1Label}
                  </span>
                </label>
                {!isShowOnly && (
                  <label className="flex items-center gap-3 cursor-pointer group/label">
                    <input
                      type="checkbox"
                      checked={perms[module].col2}
                      onChange={() => toggle(module, "col2")}
                      className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/20"
                    />
                    <span className="text-[13px] font-bold text-gray-600 group-hover/label:text-gray-900 min-w-[40px]">
                      {col2Label}
                    </span>
                  </label>
                )}
                {isShowOnly && <div className="w-[73px]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GroupFormBody = ({
  name,
  setName,
  nameError,
  setNameError,
  activeTab,
  setActiveTab,
  rightsPerms,
  setRightsPerms,
  reportPerms,
  setReportPerms,
}: GroupFormBodyProps) => (
  <div className="space-y-6">
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
      <label className="block text-sm font-bold text-gray-700 mb-2">
        Group Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        placeholder="e.g. Management Group"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setNameError(false);
        }}
        className={[
          "w-full h-11 px-4 text-sm border rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] transition-all placeholder:text-gray-400",
          nameError ? "border-red-400 ring-4 ring-red-50" : "border-gray-200",
        ].join(" ")}
      />
      {nameError && (
        <p className="mt-1.5 text-xs font-medium text-red-500 ml-1">Name is required.</p>
      )}
    </div>

    <div className="border-b border-gray-100">
      <div className="flex gap-12">
        {(["rights", "report"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "pb-4 px-2 text-sm font-semibold transition-all relative border-b-2",
              activeTab === tab
                ? "border-[#1D6BA3] text-black"
                : "border-transparent text-gray-400 hover:text-gray-600",
            ].join(" ")}
          >
            <span className="flex items-center gap-1.5">
              {tab === "rights" ? "Rights" : "Report Rights"}
              <span className="text-red-500 font-black">*</span>
            </span>
          </button>
        ))}
      </div>
    </div>
    <div className="pt-6">
        {activeTab === "rights" ? (
          <PermTable
            modules={RIGHTS_MODULES}
            perms={rightsPerms}
            setPerms={setRightsPerms}
            col1Label="Read"
            col2Label="Write"
          />
        ) : (
          <PermTable
            modules={REPORT_MODULES}
            perms={reportPerms}
            setPerms={setReportPerms}
            col1Label="Show"
            col2Label="Export"
          />
        )}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const GroupAccessManagement = () => {
  const navigate = useNavigate();
  const { groups, setGroups } = useGroups();

  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Modal form state
  const { fetchUsers } = useUser();
  const [groupName, setGroupName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [activeTab, setActiveTab] = useState<"rights" | "report">("rights");
  const [rightsPerms, setRightsPerms] = useState<PermMap>(makeDefaultPerms(RIGHTS_MODULES));
  const [reportPerms, setReportPerms] = useState<PermMap>(makeDefaultPerms(REPORT_MODULES));

  // Assign user state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [groupToAssign, setGroupToAssign] = useState<Group | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(searchApplied.toLowerCase()));
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => {
    setSearchApplied(searchInput);
    setCurrentPage(1);
  };
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const openAdd = () => {
    navigate("add");
  };

  const openEdit = (group: Group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setNameError(false);
    setActiveTab("rights");
    setRightsPerms({ ...group.rightsPerms });
    setReportPerms({ ...group.reportPerms });
    setModalOpen(true);
  };

  const openAssign = (group: Group) => {
    setGroupToAssign(group);
    setSelectedUserIds([]);
    setIsDropdownOpen(false);
    setAssignModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setAssignModalOpen(false);
    setSuccessModalOpen(false);
    setEditingGroup(null);
    setGroupToAssign(null);
  };

  const handleSave = () => {
    if (!groupName.trim()) {
      setNameError(true);
      return;
    }
    if (editingGroup) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editingGroup.id ? { ...g, name: groupName.trim(), rightsPerms, reportPerms } : g
        )
      );
    } else {
      setGroups((prev) => [
        { id: Date.now(), name: groupName.trim(), rightsPerms, reportPerms },
        ...prev,
      ]);
      setSearchApplied("");
      setSearchInput("");
      setCurrentPage(1);
    }
    closeModal();
  };

  const handleAssignSave = () => {
    if (selectedUserIds.length === 0 || !groupToAssign) return;
    setAssignModalOpen(false);
    setSuccessModalOpen(true);
  };

  const handleDelete = (id: number) => setGroups((prev) => prev.filter((g) => g.id !== id));

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9]/50 -m-6 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-8 py-7 border-b border-gray-50">
            <h1 className="text-xl font-semibold text-[#1e293b] tracking-tight">
              Group Access Management
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search by Group name"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full sm:w-80 h-11 px-5 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1D6BA3] focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  className="h-11 px-7 bg-[#1D6BA3] hover:bg-[#155280] text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  Search
                </Button>
                <Button
                  variant="primary"
                  onClick={openAdd}
                  className="h-11 px-7 bg-[#1D6BA3] hover:bg-[#155280] text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F1F7FE] border-b border-[#E1EFFE]">
                  <th className="text-left px-10 py-5 text-[12px] font-black text-[#64748b] uppercase tracking-widest w-2/3">
                    Group Name
                  </th>
                  <th className="text-right px-10 py-5 text-[12px] font-black text-[#64748b] uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageItems.length > 0 ? (
                  pageItems.map((group) => (
                    <tr
                      key={group.id}
                      className="hover:bg-blue-50/20 transition-all duration-300 group"
                    >
                      <td className="px-10 py-5">
                        <span className="text-[15px] font-bold text-gray-700 group-hover:text-[#1D6BA3] transition-colors">
                          {group.name}
                        </span>
                      </td>
                      <td className="px-10 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <IconBtn icon={Pencil} title="Edit" onClick={() => openEdit(group)} />
                          <IconBtn
                            icon={Trash2}
                            title="Delete"
                            onClick={() => handleDelete(group.id)}
                          />
                          <Button
                            variant="primary"
                            onClick={() => openAssign(group)}
                            className="h-9 px-6 bg-[#1D6BA3] hover:bg-[#155280] text-white text-xs font-black rounded-xl shadow-md shadow-blue-600/10 transition-all active:scale-95"
                          >
                            Assign User
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-6 rounded-2xl bg-gray-50 text-gray-200">
                          <Search size={48} />
                        </div>
                        <p className="text-base font-bold text-gray-400">
                          No matching groups found.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-10 py-7 bg-[#F8FAFC]/50 border-t border-gray-50 gap-6">
            <p className="text-[14px] font-bold text-[#64748b]">
              Showing{" "}
              <span className="text-[#1D6BA3] px-1">{totalItems > 0 ? startIdx + 1 : 0}</span> To{" "}
              <span className="text-[#1D6BA3] px-1">
                {Math.min(startIdx + ITEMS_PER_PAGE, totalItems)}
              </span>{" "}
              Of <span className="text-[#1D6BA3] px-1">{totalItems}</span> Results
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-5 py-2 text-[13px] font-black text-gray-600 rounded-xl bg-white border border-gray-200 hover:border-[#1D6BA3] hover:text-[#1D6BA3] hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <div className="flex items-center gap-2">
                {pageNumbers.map((page, i) => {
                  const prev = pageNumbers[i - 1];
                  return (
                    <React.Fragment key={page}>
                      {prev !== undefined && page - prev > 1 && (
                        <span className="px-1 text-gray-300 font-bold">...</span>
                      )}
                      <button
                        onClick={() => goToPage(page)}
                        className={[
                          "w-10 h-10 text-[13px] font-black rounded-xl transition-all shadow-sm",
                          page === currentPage
                            ? "bg-[#1D6BA3] text-white shadow-blue-200 shadow-lg"
                            : "bg-white text-gray-400 border border-gray-200 hover:border-[#1D6BA3] hover:text-[#1D6BA3]",
                        ].join(" ")}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center gap-2 px-5 py-2 text-[13px] font-black text-gray-600 rounded-xl bg-white border border-gray-200 hover:border-[#1D6BA3] hover:text-[#1D6BA3] hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Group Modal */}
      <ManagementModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingGroup ? "Edit Admin Group" : "Add Admin Group"}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex justify-end gap-4 w-full">
            <button
              onClick={closeModal}
              className="px-8 py-2.5 text-[13px] font-semibold text-[#1D6BA3] border border-[#1D6BA3] rounded-xl hover:bg-blue-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="px-10 py-2.5 h-auto bg-[#1D6BA3] hover:bg-[#155280] text-white font-semibold rounded-xl shadow-lg shadow-blue-600/10 transition-all active:scale-95"
            >
              Save
            </Button>
          </div>
        }
      >
        <GroupFormBody
          name={groupName}
          setName={setGroupName}
          nameError={nameError}
          setNameError={setNameError}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          rightsPerms={rightsPerms}
          setRightsPerms={setRightsPerms}
          reportPerms={reportPerms}
          setReportPerms={setReportPerms}
        />
      </ManagementModal>

      {/* Assign User Modal */}
      <ManagementModal
        isOpen={assignModalOpen}
        onClose={closeModal}
        title={`Select User To Assign Into ${groupToAssign?.name || ""}`}
        maxWidth="max-w-xl"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button
              onClick={closeModal}
              className="px-6 py-2 border border-gray-200 text-sm font-bold text-[#1D6BA3] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <Button
              variant="primary"
              onClick={handleAssignSave}
              disabled={selectedUserIds.length === 0}
              className="px-8 py-2 h-auto bg-[#1D6BA3] hover:bg-[#155280] text-white font-bold rounded-lg shadow-lg shadow-blue-600/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <label className="block text-sm font-bold text-gray-700">Select Assign Admin</label>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center flex-wrap gap-2 px-4 py-3 bg-gray-50/30 border-b border-gray-100 min-h-[52px] hover:bg-gray-50 transition-colors"
            >
              {selectedUserIds.length > 0 ? (
                <>
                  {selectedUserIds.slice(0, 3).map((id) => {
                    const admin = MOCK_ADMINS.find((a) => a.id === id);
                    return (
                      <span
                        key={id}
                        className="bg-gray-200/80 text-gray-600 px-2.5 py-1 rounded-md text-[13px] font-bold"
                      >
                        {admin?.name}
                      </span>
                    );
                  })}
                  {selectedUserIds.length > 3 && (
                    <span className="bg-gray-200/80 text-gray-600 px-2 py-1 rounded-md text-[13px] font-bold">
                      +{selectedUserIds.length - 3}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-medium text-gray-500">Select</span>
              )}
              <div className="flex-1" />
              <ChevronRight
                className={[
                  "w-4 h-4 text-gray-400 transition-transform duration-300",
                  isDropdownOpen ? "rotate-90" : "",
                ].join(" ")}
              />
            </button>

            {isDropdownOpen && (
              <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {MOCK_ADMINS.map((admin) => {
                  const isSelected = selectedUserIds.includes(admin.id);
                  return (
                    <button
                      key={admin.id}
                      onClick={() => {
                        setSelectedUserIds((prev) =>
                          isSelected ? prev.filter((id) => id !== admin.id) : [...prev, admin.id]
                        );
                      }}
                      className={[
                        "w-full flex items-center gap-4 px-6 py-4 hover:bg-blue-50/50 transition-all text-left group",
                        isSelected ? "bg-blue-50/10" : "",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                          isSelected
                            ? "bg-[#1D6BA3] border-[#1D6BA3]"
                            : "border-gray-200 bg-white group-hover:border-[#1D6BA3]",
                        ].join(" ")}
                      >
                        {isSelected && (
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={[
                          "text-[15px] font-bold transition-colors",
                          isSelected ? "text-[#1D6BA3]" : "text-gray-600",
                        ].join(" ")}
                      >
                        {admin.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ManagementModal>

      {/* Success Modal */}
      <ManagementModal
        isOpen={successModalOpen}
        onClose={closeModal}
        title="Assign User"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full scale-150 animate-ping opacity-20" />
            <div className="relative bg-white rounded-full p-2">
              <CheckCircle2 size={80} className="text-[#1D6BA3] animate-in zoom-in duration-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">User Assigned Successfully</h3>
        </div>
      </ManagementModal>
    </div>
  );
};

export default GroupAccessManagement;
