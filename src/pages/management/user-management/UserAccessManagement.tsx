import React, { useState, useRef, useEffect } from "react";
import Button from "../../../components/common/Button/Button";
import {
  useGroups,
  RIGHTS_MODULES,
  REPORT_MODULES,
  makeDefaultPerms,
  type PermMap,
} from "../../../contexts/GroupsContext";
import { useRoles } from "../../../contexts/RolesContext";
import { type ManagementUser } from "../../../types/interfaces";
import { SEED_USERS } from "../../../types/mockData";

// ── Static options — replace with API/context when backend is ready ───────────
const INSTITUTIONS = ["SumX Engineering College", "SumX School Of Business", "SumX Arts & Science"];

const ITEMS_PER_PAGE = 5;

// ── Shared icons ──────────────────────────────────────────────────────────────
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
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: "Active" | "Inactive" }) => (
  <span
    className={[
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      status === "Active"
        ? "text-green-600 border-green-400 bg-green-50"
        : "text-red-500 border-red-400 bg-red-50",
    ].join(" ")}
  >
    {status}
  </span>
);

// ── Native select wrapper ─────────────────────────────────────────────────────
const FormSelect = ({
  value,
  onChange,
  placeholder,
  options,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  error?: boolean;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={[
      "w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 appearance-none cursor-pointer",
      error ? "border-red-400 ring-2 ring-red-200" : "border-gray-200",
      !value ? "text-gray-400" : "text-gray-800",
    ].join(" ")}
  >
    <option value="" disabled>
      {placeholder}
    </option>
    {options.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);

// ── Group custom dropdown (max 10 visible, scrollable) ───────────────────────
const GroupDropdown = ({
  value,
  onChange,
  groups,
}: {
  value: number | null;
  onChange: (id: number | null) => void;
  groups: { id: number; name: string }[];
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = value !== null ? groups.find((g) => g.id === value) : null;
  const label = selected ? selected.name : "No Group";

  const select = (id: number | null) => {
    onChange(id);
    setOpen(false);
  };

  // 10 items × ~36px each = 360px max visible height
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 hover:border-[#1D6BA3]/50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 transition-colors"
      >
        <span className={selected ? "text-gray-800" : "text-gray-500"}>{label}</span>
        <ChevronDown />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 overflow-hidden">
          {/* max 10 rows visible, scrollable */}
          <div className="overflow-y-auto max-h-[360px]">
            {/* No Group option */}
            <button
              type="button"
              onClick={() => select(null)}
              className={[
                "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between",
                value === null
                  ? "bg-[#1D6BA3]/10 text-[#1D6BA3] font-semibold"
                  : "text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              <span>No Group</span>
              {value === null && (
                <svg
                  className="w-3.5 h-3.5 text-[#1D6BA3]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
            <div className="h-px bg-gray-100" />
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => select(g.id)}
                className={[
                  "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between",
                  value === g.id
                    ? "bg-[#1D6BA3]/10 text-[#1D6BA3] font-semibold"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                <span>{g.name}</span>
                {value === g.id && (
                  <svg
                    className="w-3.5 h-3.5 text-[#1D6BA3]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Actions dropdown (list header) ────────────────────────────────────────────
const ActionsDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#1D6BA3]/15 text-[#1D6BA3] hover:bg-[#1D6BA3]/25 transition-colors"
      >
        Actions <ChevronDown />
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

// ── Permission table (supports readOnly) ──────────────────────────────────────
const PermTable = ({
  modules,
  perms,
  setPerms,
  col1Label,
  col2Label,
  readOnly = false,
}: {
  modules: string[];
  perms: PermMap;
  setPerms: (p: PermMap) => void;
  col1Label: string;
  col2Label: string;
  readOnly?: boolean;
}) => {
  const allCol1 = modules.every((m) => perms[m].col1);
  const allCol2 = modules.every((m) => perms[m].col2);
  const allChecked = allCol1 && allCol2;

  const toggle = (module: string, col: "col1" | "col2") => {
    if (readOnly) return;
    setPerms({ ...perms, [module]: { ...perms[module], [col]: !perms[module][col] } });
  };

  const selectAll = () => {
    if (readOnly) return;
    const next = !allChecked;
    setPerms(Object.fromEntries(modules.map((m) => [m, { col1: next, col2: next }])));
  };

  return (
    <div
      className={[
        "border rounded-lg overflow-hidden",
        readOnly ? "border-[#1D6BA3]/20" : "border-gray-200",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center justify-between gap-2.5 px-4 py-2.5 border-b",
          readOnly ? "bg-[#1D6BA3]/8 border-[#1D6BA3]/20" : "bg-[#EFF6FF] border-gray-200",
        ].join(" ")}
      >
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={selectAll}
            disabled={readOnly}
            className="w-4 h-4 accent-[#1D6BA3] cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Select All
          </span>
        </div>
        {readOnly && (
          <span className="text-[10px] font-semibold text-[#1D6BA3] bg-[#1D6BA3]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Inherited from group
          </span>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {modules.map((module) => (
          <div
            key={module}
            className={[
              "flex items-center px-4 py-2.5 transition-colors",
              readOnly ? "bg-gray-50/40" : "hover:bg-gray-50/60",
            ].join(" ")}
          >
            <span
              className={["flex-1 text-sm", readOnly ? "text-gray-500" : "text-gray-700"].join(" ")}
            >
              {module}
            </span>
            <label
              className={[
                "flex items-center gap-2 w-28",
                readOnly ? "cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={perms[module].col1}
                onChange={() => toggle(module, "col1")}
                disabled={readOnly}
                className="w-4 h-4 accent-[#1D6BA3] disabled:cursor-not-allowed"
              />
              <span className={["text-sm", readOnly ? "text-gray-400" : "text-gray-600"].join(" ")}>
                {col1Label}
              </span>
            </label>
            <label
              className={[
                "flex items-center gap-2 w-28",
                readOnly ? "cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={perms[module].col2}
                onChange={() => toggle(module, "col2")}
                disabled={readOnly}
                className="w-4 h-4 accent-[#1D6BA3] disabled:cursor-not-allowed"
              />
              <span className={["text-sm", readOnly ? "text-gray-400" : "text-gray-600"].join(" ")}>
                {col2Label}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Success toast ─────────────────────────────────────────────────────────────
const SuccessToast = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed top-5 right-5 z-[60] flex items-center gap-3 bg-white border border-emerald-200 rounded-xl px-4 py-3 shadow-xl">
      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
        <CheckIcon />
      </div>
      <p className="text-sm font-semibold text-gray-800">{message}</p>
      <button
        onClick={onDismiss}
        className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <XIcon />
      </button>
    </div>
  );
};

// ── ManagementUser form (Add / Edit) ────────────────────────────────────────────────────
interface FormErrors {
  name?: string;
  email?: string;
  mobile?: string;
  password?: string;
  institution?: string;
  roleType?: string;
}

interface ManagementUserFormProps {
  isEdit: boolean;
  initialManagementUser?: ManagementUser;
  onSave: (data: Omit<ManagementUser, "id" | "status" | "createdDate">) => void;
  onCancel: () => void;
}

const ManagementUserForm = ({
  isEdit,
  initialManagementUser,
  onSave,
  onCancel,
}: ManagementUserFormProps) => {
  const { groups } = useGroups();
  const { roles } = useRoles();

  const [name, setName] = useState(initialManagementUser?.name ?? "");
  const [email, setEmail] = useState(initialManagementUser?.email ?? "");
  const [mobile, setMobile] = useState(initialManagementUser?.mobile ?? "");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState(initialManagementUser?.institution ?? "");
  const [roleType, setRoleType] = useState(initialManagementUser?.roleType ?? "");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(
    initialManagementUser?.groupId ?? null
  );
  const [manualRights, setManualRights] = useState<PermMap>(
    initialManagementUser?.manualRightsPerms ?? makeDefaultPerms(RIGHTS_MODULES)
  );
  const [manualReport, setManualReport] = useState<PermMap>(
    initialManagementUser?.manualReportPerms ?? makeDefaultPerms(REPORT_MODULES)
  );
  const [activeTab, setActiveTab] = useState<"rights" | "report">("rights");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPw, setShowPw] = useState(false);

  // Derived: active perms shown in the table
  const activeGroup =
    selectedGroupId !== null ? groups.find((g) => g.id === selectedGroupId) : null;
  const displayRights = activeGroup ? activeGroup.rightsPerms : manualRights;
  const displayReport = activeGroup ? activeGroup.reportPerms : manualReport;
  const isReadOnly = activeGroup !== undefined && activeGroup !== null;

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email.";
    if (!mobile.trim()) e.mobile = "Mobile is required.";
    if (!isEdit && !password.trim()) e.password = "Password is required.";
    if (!institution) e.institution = "Institution is required.";
    if (!roleType) e.roleType = "Role type is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      institution,
      roleType,
      groupId: selectedGroupId,
      manualRightsPerms: manualRights,
      manualReportPerms: manualReport,
    });
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    error?: string,
    extra?: React.ReactNode
  ) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setErrors((prev) => ({ ...prev }));
          }}
          className={[
            "w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 placeholder-gray-400",
            error ? "border-red-400 ring-2 ring-red-200" : "border-gray-200",
          ].join(" ")}
        />
        {extra}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Form header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">
            {isEdit ? "Edit ManagementUser" : "Add ManagementUser"}
          </h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Role Type */}
          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Role Type <span className="text-red-500">*</span>
            </label>
            <FormSelect
              value={roleType}
              onChange={(v) => {
                setRoleType(v);
                setErrors((p) => ({ ...p, roleType: undefined }));
              }}
              placeholder="Choose Role"
              options={roles.map((r) => r.name)}
              error={!!errors.roleType}
            />
            {errors.roleType && <p className="mt-1 text-xs text-red-500">{errors.roleType}</p>}
          </div>

          {/* Name / Email / Mobile / Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {field("Name", name, setName, "Enter Name", errors.name)}
            {field("E-mail", email, setEmail, "Enter Email", errors.email)}
            {field("Mobile", mobile, setMobile, "Enter Number", errors.mobile)}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
                {isEdit && (
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (leave blank to keep)
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  className={[
                    "w-full px-3 py-2 pr-9 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 placeholder-gray-400",
                    errors.password ? "border-red-400 ring-2 ring-red-200" : "border-gray-200",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
          </div>

          {/* Institution + ManagementUser Group */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Institutions <span className="text-red-500">*</span>
              </label>
              <FormSelect
                value={institution}
                onChange={(v) => {
                  setInstitution(v);
                  setErrors((p) => ({ ...p, institution: undefined }));
                }}
                placeholder="Select"
                options={INSTITUTIONS}
                error={!!errors.institution}
              />
              {errors.institution && (
                <p className="mt-1 text-xs text-red-500">{errors.institution}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ManagementUser Group Details
              </label>
              <GroupDropdown
                value={selectedGroupId}
                onChange={setSelectedGroupId}
                groups={groups}
              />
            </div>
          </div>

          {/* Permissions section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-200 bg-white">
              {(["rights", "report"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "px-6 py-3 text-sm font-semibold transition-colors",
                    activeTab === tab
                      ? "text-gray-900 border-b-2 border-[#1D6BA3] -mb-px"
                      : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                >
                  {tab === "rights" ? "Rights" : "Report Rights"}
                  <span className="ml-1 text-red-500">*</span>
                </button>
              ))}
              {isReadOnly && (
                <div className="flex items-center ml-auto px-4">
                  <span className="text-xs text-[#1D6BA3] font-medium bg-[#1D6BA3]/10 px-3 py-1 rounded-full">
                    Showing permissions for: <strong>{activeGroup?.name}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50/30">
              {activeTab === "rights" ? (
                <PermTable
                  modules={RIGHTS_MODULES}
                  perms={displayRights}
                  setPerms={isReadOnly ? () => {} : setManualRights}
                  col1Label="Read"
                  col2Label="Write"
                  readOnly={isReadOnly}
                />
              ) : (
                <PermTable
                  modules={REPORT_MODULES}
                  perms={displayReport}
                  setPerms={isReadOnly ? () => {} : setManualReport}
                  col1Label="Show"
                  col2Label="Export"
                  readOnly={isReadOnly}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave}>
            {isEdit ? "Update ManagementUser" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ManagementUserAccessManagement = () => {
  const [users, setManagementUsers] = useState<ManagementUser[]>(SEED_USERS);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingManagementUser, setEditingManagementUser] = useState<ManagementUser | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const { groups } = useGroups();

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchApplied.toLowerCase()) ||
      u.institution.toLowerCase().includes(searchApplied.toLowerCase())
  );
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
    setEditingManagementUser(null);
    setView("form");
  };
  const openEdit = (u: ManagementUser) => {
    setEditingManagementUser(u);
    setView("form");
  };
  const closeForm = () => {
    setView("list");
    setEditingManagementUser(null);
  };

  const showToast = (msg: string) => {
    setToast(msg);
  };

  const handleSave = (data: Omit<ManagementUser, "id" | "status" | "createdDate">) => {
    if (editingManagementUser) {
      setManagementUsers((prev) =>
        prev.map((u) => (u.id === editingManagementUser.id ? { ...u, ...data } : u))
      );
      showToast("ManagementUser updated successfully!");
    } else {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      setManagementUsers((prev) => [
        { id: Date.now(), ...data, status: "Active", createdDate: `${dd}/${mm}/${yyyy}` },
        ...prev,
      ]);
      setSearchApplied("");
      setSearchInput("");
      setCurrentPage(1);
      showToast("ManagementUser created successfully!");
    }
    closeForm();
  };

  const handleDelete = (id: number) =>
    setManagementUsers((prev) => prev.filter((u) => u.id !== id));

  const getGroupName = (groupId: number | null) => {
    if (groupId === null) return <span className="text-gray-400 italic text-xs">No Group</span>;
    const g = groups.find((g) => g.id === groupId);
    return g ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#1D6BA3]/10 text-[#1D6BA3]">
        {g.name}
      </span>
    ) : (
      <span className="text-gray-400 italic text-xs">Unknown</span>
    );
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  if (view === "form") {
    return (
      <>
        <ManagementUserForm
          isEdit={!!editingManagementUser}
          initialManagementUser={editingManagementUser ?? undefined}
          onSave={handleSave}
          onCancel={closeForm}
        />
        {toast && <SuccessToast message={toast} onDismiss={() => setToast(null)} />}
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <h1 className="text-base font-bold text-gray-800">ManagementUser Access Management</h1>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by name or institution"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-64 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 placeholder-gray-400"
              />
              <Button variant="primary" size="md" onClick={handleSearch}>
                Search
              </Button>
              <ActionsDropdown />
              <Button variant="primary" size="md" onClick={openAdd}>
                Add ManagementUser
              </Button>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                {[
                  "Name",
                  "Institution",
                  "Role",
                  "ManagementUser Group",
                  "Status",
                  "Created Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={[
                      "py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide",
                      h === "Actions" ? "pr-5 text-right" : "px-4 text-left",
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
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                      {user.name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs">{user.institution}</td>
                    <td className="px-4 py-3.5 text-gray-600">{user.roleType}</td>
                    <td className="px-4 py-3.5">{getGroupName(user.groupId)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {user.createdDate}
                    </td>
                    <td className="pr-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <IconBtn title="Edit" onClick={() => openEdit(user)}>
                          <EditIcon />
                        </IconBtn>
                        <IconBtn title="Delete" onClick={() => handleDelete(user.id)}>
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
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
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

      {toast && <SuccessToast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
};

export default ManagementUserAccessManagement;
