import React, { useState } from "react";
import { ShieldCheck, Check, ChevronDown, Plus, Pencil, XCircle, CheckCircle2 } from "lucide-react";
import ManagementModal from "../../../components/Layouts/ManagementModal";
import DataTable from "../../../components/common/Table/DataTable";
import { type User } from "../../../types/interfaces";

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  {
    id: 1,
    name: "Super Admin",
    email: "admin@gmail.com",
    mobile: "+1000000000",
    rights: ["Dashboard", "Registration_List"],
    status: "Active",
    extraRightsCount: 2,
  },
  {
    id: 2,
    name: "Support Staff",
    email: "support@gmail.com",
    mobile: "+1000000001",
    rights: ["Dashboard", "Registration_List"],
    status: "Active",
    extraRightsCount: 0,
  },
];

const APPLICATION_RIGHTS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "registration", label: "Registration" },
  { id: "crm", label: "CRM" },
  { id: "user_mgmt", label: "User Mgmt" },
  { id: "support", label: "Support" },
  { id: "finance", label: "Finance" },
];

// ── Main Component ───────────────────────────────────────────────────────────
const SuperAdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    emailAddress: "",
    rights: [] as string[],
  });

  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleVerifyRequest = () => {
    if (!formData.emailAddress) return;
    setIsVerifying(true);
    // Simulate API call to send OTP
    setTimeout(() => {
      setOtpSent(true);
      setIsVerifying(false);
    }, 800);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // If all 6 digits are entered, simulate verification
    if (index === 5 && value) {
      handleFinalVerification(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleFinalVerification = (code: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (code === "123456") {
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          setIsSuccessModalOpen(false);
          setIsVerified(true);
          setOtpSent(false); // Hide OTP field after verification
        }, 1500);
      } else {
        setIsVerificationModalOpen(true);
      }
    }, 1000);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.name,
      mobileNumber: user.mobile,
      emailAddress: user.email,
      rights: user.rights.map(
        (label: string) => APPLICATION_RIGHTS.find((ar) => ar.label === label)?.id || label
      ),
    });
    setIsVerified(true); // Pre-verified since user already exists
    setIsAddModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!isVerified) return;

    if (editingUser) {
      // Update existing user
      setUsers((prev: User[]) =>
        prev.map((u: User) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.fullName,
                email: formData.emailAddress,
                mobile: formData.mobileNumber,
                rights: formData.rights.map(
                  (r: string) => APPLICATION_RIGHTS.find((ar) => ar.id === r)?.label || r
                ),
              }
            : u
        )
      );
    } else {
      // Create new user
      const uniqueId = Number(window.crypto.getRandomValues(new Uint32Array(1))[0] % 1000000);
      const newUser: User = {
        id: uniqueId,
        name: formData.fullName,
        email: formData.emailAddress,
        mobile: formData.mobileNumber,
        rights: formData.rights.map(
          (r: string) => APPLICATION_RIGHTS.find((ar) => ar.id === r)?.label || r
        ),
        status: "Active",
        extraRightsCount: 0,
      };
      setUsers((prev: User[]) => [newUser, ...prev]);
    }

    closeModal();
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingUser(null);
    setFormData({ fullName: "", mobileNumber: "", emailAddress: "", rights: [] });
    setOtp(["", "", "", "", "", ""]);
    setOtpSent(false);
    setIsVerified(false);
  };

  const toggleRight = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      rights: prev.rights.includes(id) ? prev.rights.filter((r) => r !== id) : [...prev.rights, id],
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
  };

  const filteredUsers = users.filter((u: User) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.mobile.includes(searchTerm);

    const matchesStatus = statusFilter === "All Status" || u.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500 mb-10">
      {/* ── Top Header Section ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h1 className="text-sm font-bold text-gray-900">User Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
              className="flex items-center gap-2 px-4 h-9 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all min-w-[100px] justify-between"
            >
              Action{" "}
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${isActionDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isActionDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsActionDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2">
                  {["Active", "Inactive", "Delete"].map((option) => (
                    <button
                      key={option}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-[#1D6BA3] transition-colors"
                      onClick={() => setIsActionDropdownOpen(false)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 h-9 bg-[#1D6BA3] hover:bg-[#1A5F91] text-white text-xs font-bold rounded-md transition-all shadow-sm"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* ── Filter Bar Section ───────────────────────────────────────────────── */}
      <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-end gap-3">
        <div className="relative flex-1 w-full md:max-w-md">
          <input
            type="text"
            placeholder="Filter by name , mail and phone number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 px-4 bg-white border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative min-w-[120px]">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center gap-2 px-4 h-9 w-full bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all justify-between"
            >
              {statusFilter}{" "}
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isStatusDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsStatusDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2">
                  {["All Status", "Active", "Inactive"].map((option) => (
                    <button
                      key={option}
                      className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                        statusFilter === option
                          ? "bg-blue-50 text-[#1D6BA3]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#1D6BA3]"
                      }`}
                      onClick={() => {
                        setStatusFilter(option);
                        setIsStatusDropdownOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleClearFilters}
            className="h-9 px-6 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ── Table Section ────────────────────────────────────────────────────── */}
      <div className="px-6 pb-6">
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <DataTable<User>
            data={filteredUsers}
            columns={[
              {
                key: "checkbox",
                header: (
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 accent-[#1D6BA3]"
                  />
                ),
                render: () => (
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 accent-[#1D6BA3]"
                  />
                ),
                className: "w-12 px-4",
              },
              {
                key: "name",
                header: "Name",
                render: (u) => (
                  <span className="text-[12px] font-bold text-gray-800">{u.name}</span>
                ),
                className: "px-4",
              },
              {
                key: "email",
                header: "Email",
                render: (u) => (
                  <span className="text-[12px] font-bold text-gray-700">{u.email}</span>
                ),
                className: "px-4",
              },
              {
                key: "mobile",
                header: "Mobile",
                render: (u) => (
                  <span className="text-[12px] font-bold text-gray-700">{u.mobile}</span>
                ),
                className: "px-4",
              },
              {
                key: "rights",
                header: "Access Rights",
                className: "px-4",
                render: (u) => (
                  <div className="flex items-center gap-2">
                    {u.rights.slice(0, 2).map((right) => (
                      <div
                        key={right}
                        className="px-2.5 py-1 bg-white border border-gray-200 rounded text-[11px] font-medium text-gray-500 whitespace-nowrap"
                      >
                        {right}
                      </div>
                    ))}
                    {u.extraRightsCount > 0 && (
                      <div className="px-2 py-1 bg-white border border-gray-200 rounded text-[11px] font-medium text-gray-500">
                        +{u.extraRightsCount}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                className: "px-4",
                render: (u) => (
                  <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-[11px] font-bold border border-green-100">
                    {u.status}
                  </div>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-center min-w-[100px] border-l border-gray-50 bg-blue-50/30 px-4",
                render: (u) => (
                  <button
                    onClick={() => handleEditClick(u)}
                    className="p-1.5 text-[#1D6BA3] hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                ),
              },
            ]}
            showPagination={false}
          />
        </div>
      </div>

      {/* ── Add/Edit Internal User Modal ── */}
      <ManagementModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        title={editingUser ? "Edit Internal User" : "Add Internal User"}
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              onClick={closeModal}
              className="px-6 py-2.5 text-sm font-bold text-[#1D6BA3] border-2 border-[#1D6BA3] rounded-xl hover:bg-[#1D6BA3]/5 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              disabled={!isVerified}
              onClick={handleSaveUser}
              className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-sm ${
                isVerified
                  ? "bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 active:scale-95"
                  : "bg-[#A7D1F7] cursor-not-allowed"
              }`}
            >
              {editingUser ? "Update User" : "Create User"}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* User Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={formData.mobileNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) {
                    setFormData({ ...formData, mobileNumber: val });
                  }
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.emailAddress}
                  disabled={isVerified}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                />
                {!isVerified && (
                  <button
                    onClick={handleVerifyRequest}
                    disabled={isVerifying || otpSent}
                    className="px-5 py-2 text-sm font-bold text-white bg-[#1D6BA3] rounded-xl hover:bg-[#1D6BA3]/90 transition-all flex items-center justify-center min-w-[80px] disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* OTP Section (Shown after Verify click) */}
            {otpSent && !isVerified && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-bold text-gray-700 mb-2">OTP</label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit: string, idx: number) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-full h-12 text-center text-lg font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Success Banner */}
            {isVerified && (
              <div className="flex items-center gap-2 bg-green-50 border-l-4 border-green-500 px-4 py-3 rounded-r-xl animate-in fade-in slide-in-from-left-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                  <Check size={12} strokeWidth={4} />
                </div>
                <p className="text-[13px] font-semibold text-green-700">
                  OTP Email Verification Successful.
                </p>
              </div>
            )}
          </div>

          <div className="w-full h-px border-t border-dashed border-gray-200" />

          {/* Application Rights */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-[#1D6BA3]" size={18} />
              <h3 className="text-sm font-bold text-gray-800 tracking-tight">Application Rights</h3>
            </div>
            <div className="grid grid-cols-3 gap-y-3">
              {APPLICATION_RIGHTS.map((right) => (
                <label
                  key={right.id}
                  className="flex items-center gap-2.5 cursor-pointer group select-none"
                >
                  <div
                    onClick={() => toggleRight(right.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      formData.rights.includes(right.id)
                        ? "bg-[#1D6BA3] border-[#1D6BA3]"
                        : "bg-white border-gray-300 group-hover:border-blue-400"
                    }`}
                  >
                    {formData.rights.includes(right.id) && (
                      <Check className="text-white" size={12} strokeWidth={4} />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                    {right.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </ManagementModal>

      {/* ── Verification Result Modals ── */}
      <ManagementModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        title="Verification"
        maxWidth="max-w-sm"
      >
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <XCircle size={80} className="text-rose-500" strokeWidth={1.5} />
          <p className="text-lg font-bold text-gray-800 tracking-tight">Invalid OTP Entred</p>
        </div>
      </ManagementModal>

      <ManagementModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Verification"
        maxWidth="max-w-sm"
      >
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <CheckCircle2 size={80} className="text-emerald-500" strokeWidth={1.5} />
          <p className="text-lg font-bold text-gray-800 tracking-tight">
            OTP Verification Success.
          </p>
        </div>
      </ManagementModal>
    </div>
  );
};

export default SuperAdminUserManagement;
