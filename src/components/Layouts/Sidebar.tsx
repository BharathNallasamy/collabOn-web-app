import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  DashboardIcon,
  ManageInstIcon,
  AcademicManagementIcon,
  StaffManagementIcon,
  StaffWorkloadIcon,
  StudentManagementIcon,
  UserManagementIcon,
  FinanceIcon,
  AdmissionsIcon,
  CampusCommsIcon,
  ResultsIcon,
  ReportsIcon,
  AssetManagementIcon,
  SettingsIcon,
  ApprovalIcon,
} from "../common/Icons/SidebarIcons";

// ── Flyout sub-items ──────────────────────────────────────────────────────────
const ACADEMIC_ITEMS = [
  { label: "Program Catalog", path: "/layout/academic/program-catalog" },
  { label: "Department", path: "/layout/academic/departments" },
  { label: "Class", path: "/layout/academic/classes" },
  { label: "Batch", path: "/layout/academic/batch" },
  { label: "Curriculum", path: "/layout/academic/curriculum" },
  { label: "Subjects", path: "/layout/academic/subjects" },
  { label: "Semester", path: "/layout/academic/semester" },
  { label: "Rooms & Lab", path: "/layout/academic/rooms-lab" },
  { label: "Calendar", path: "/layout/academic/academic-calendar" },
];

const STAFF_ITEMS = [
  { label: "Dashboard", path: "/layout/staff-management/dashboard" },
  { label: "Department", path: "/layout/staff-management/department" },
  { label: "Designations", path: "/layout/staff-management/designations" },
  { label: "Employee", path: "/layout/staff-management/employees" },
  { label: "Attendance Permission", path: "/layout/staff-management/attendance-permission" },
  { label: "Leave Creation", path: "/layout/staff-management/leave-creation" },
  { label: "Leave Allocation", path: "/layout/staff-management/leave-allocation" },
  { label: "Shift", path: "/layout/staff-management/shift" },
  { label: "Assign Shift", path: "/layout/staff-management/assign-shift" },
];

const USER_MGMT_ITEMS = [
  { label: "Group Access Management", path: "/layout/user-management/group-access" },
  { label: "Role Management", path: "/layout/user-management/roles" },
  { label: "User Access Management", path: "/layout/user-management/user-access" },
];

const ADMISSION_ITEMS = [
  { label: "Enquiries", path: "/layout/admissions" },
  { label: "Admission Overview", path: "/layout/admissions/overview" },
  { label: "Application Review", path: "/layout/admissions/application-review" },
];

const ASSET_ITEMS = [
  { label: "Supplier / Third Party M...", path: "/layout/asset-management/suppliers" },
  { label: "Asset Library", path: "/layout/asset-management/asset-library" },
  { label: "Asset Purchase", path: "/layout/asset-management/asset-purchase" },
  { label: "Available Asset", path: "/layout/asset-management/available-asset" },
];

const FINANCE_ITEMS = [
  { label: "Fees Configuration", path: "/layout/finance/fees-configuration" },
  { label: "Fees Structure", path: "/layout/finance/fees-structure" },
  { label: "Fees Generation", path: "/layout/finance/fees-generation" },
  { label: "Fees Collection", path: "/layout/finance/fees-collection" },
];

const CAMPUS_COMMS_ITEMS = [
  { label: "Feed Management", path: "/layout/campus-comms/feed-management" },
  { label: "Event Management", path: "/layout/campus-comms/event-management" },
  { label: "Event Registration", path: "/layout/campus-comms/event-registration" },
  { label: "Circulars", path: "/layout/campus-comms/circulars" },
];

const STUDENT_ITEMS = [
  { label: "Student Directory", path: "/layout/student-management/directory" },
  { label: "Certificate Registry", path: "/layout/student-management/certificate-registry" },
];

// ── Direct nav items between flyouts ─────────────────────────────────────────
const NAV_AFTER_STAFF = [
  { Icon: StaffWorkloadIcon, label: "Staff Workload", path: "/layout/staff-workload" },
] as const;

const NAV_AFTER_USER = [
  { Icon: ApprovalIcon, label: "Approval", path: "/layout/staff-management/approval" },
  { Icon: ResultsIcon, label: "Results", path: "/layout/results" },
  { Icon: ReportsIcon, label: "Reports", path: "/layout/reports" },
] as const;

type FlyoutKey =
  | "academic"
  | "staff"
  | "user"
  | "admission"
  | "asset"
  | "campus-comms"
  | "student"
  | "finance";

const CollabOnLogo = () => (
  <div className="flex flex-col items-center pt-7 pb-4 px-2 flex-shrink-0">
    <svg viewBox="0 0 132 84" className="w-[74px] h-[46px]" role="img" aria-label="CollabOn">
      <path
        d="M56 14a26 26 0 1 0 0 52"
        fill="none"
        stroke="white"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx="88" cy="40" r="23.5" fill="white" />
    </svg>
    <span className="text-white text-[13px] font-normal leading-none mt-0.5 tracking-tight">
      CollabOn
    </span>
  </div>
);

// ── Shared NavItemContent ─────────────────────────────────────────────────────
const NavItemContent = ({
  Icon,
  label,
  active,
}: {
  Icon: React.FC;
  label: string;
  active: boolean;
}) => (
  <>
    <div
      className={[
        "w-11 h-9 flex items-center justify-center rounded-xl transition-all duration-150",
        active ? "bg-white text-[#1D6BA3]" : "bg-white/10 text-white",
      ].join(" ")}
    >
      <Icon />
    </div>
    <span
      className={[
        "text-[10px] font-medium leading-tight text-center mt-0.5",
        active ? "text-white" : "text-white/70",
      ].join(" ")}
    >
      {label}
    </span>
  </>
);

// ── Nav Link Item ────────────────────────────────────────────────────────────
const NavLinkItem = ({
  Icon,
  label,
  path,
  active,
}: {
  Icon: React.FC;
  label: string;
  path: string;
  active: boolean;
}) => (
  <NavLink
    to={path}
    title={label}
    className="flex flex-col items-center w-full py-1 rounded-lg hover:bg-white/5 transition-colors"
  >
    <NavItemContent Icon={Icon} label={label} active={active} />
  </NavLink>
);

const checkActive = (path: string, currentPath: string, openFlyout: FlyoutKey | null) => {
  if (openFlyout) return false;
  if (path === "/layout") return currentPath === "/layout";
  return currentPath.startsWith(path);
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const [openFlyout, setOpenFlyout] = useState<FlyoutKey | null>(null);
  const [flyoutTop, setFlyoutTop] = useState(0);

  const location = useLocation();
  const academicBtnRef = useRef<HTMLButtonElement>(null);
  const staffBtnRef = useRef<HTMLButtonElement>(null);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const admissionBtnRef = useRef<HTMLButtonElement>(null);
  const campusCommsBtnRef = useRef<HTMLButtonElement>(null);
  const assetBtnRef = useRef<HTMLButtonElement>(null);
  const studentBtnRef = useRef<HTMLButtonElement>(null);
  const financeBtnRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!openFlyout) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !flyoutRef.current?.contains(target) &&
        !academicBtnRef.current?.contains(target) &&
        !staffBtnRef.current?.contains(target) &&
        !userBtnRef.current?.contains(target) &&
        !admissionBtnRef.current?.contains(target) &&
        !campusCommsBtnRef.current?.contains(target) &&
        !assetBtnRef.current?.contains(target) &&
        !studentBtnRef.current?.contains(target) &&
        !financeBtnRef.current?.contains(target)
      )
        setOpenFlyout(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openFlyout]);

  const toggleFlyout = (key: FlyoutKey, ref: React.RefObject<HTMLButtonElement | null>) => {
    if (openFlyout === key) {
      setOpenFlyout(null);
      return;
    }
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setFlyoutTop(rect.top);
    }
    setOpenFlyout(key);
  };

  const currentPath = location.pathname;
  const isAcademicActive = currentPath.startsWith("/layout/academic");
  const isStaffActive = currentPath.startsWith("/layout/staff-management");
  const isUserMgmtActive = currentPath.startsWith("/layout/user-management");
  const isAdmissionsActive = currentPath.startsWith("/layout/admissions");
  const isCampusCommsActive = currentPath.startsWith("/layout/campus-comms");
  const isAssetActive = currentPath.startsWith("/layout/asset-management");
  const isStudentActive = currentPath.startsWith("/layout/student-management");
  const isFinanceActive = currentPath.startsWith("/layout/finance");

  // ── Flyout config ─────────────────────────────────────────────────────────
  const flyoutConfig =
    openFlyout === "academic"
      ? { title: "Academic Management", items: ACADEMIC_ITEMS, scrollable: false }
      : openFlyout === "staff"
        ? { title: "Staff Management", items: STAFF_ITEMS, scrollable: true }
        : openFlyout === "user"
          ? { title: "User Management", items: USER_MGMT_ITEMS, scrollable: false }
          : openFlyout === "admission"
            ? { title: "Admissions", items: ADMISSION_ITEMS, scrollable: false }
            : openFlyout === "asset"
              ? { title: "Asset Management", items: ASSET_ITEMS, scrollable: false }
              : openFlyout === "campus-comms"
                ? { title: "Campus Communication", items: CAMPUS_COMMS_ITEMS, scrollable: false }
                : openFlyout === "student"
                  ? { title: "Student Management", items: STUDENT_ITEMS, scrollable: false }
                  : openFlyout === "finance"
                    ? { title: "Finance", items: FINANCE_ITEMS, scrollable: false }
                    : null;

  return (
    <>
      {/* ── Sidebar rail ── */}
      <aside className="flex flex-col w-[88px] h-full bg-[#1D6BA3] flex-shrink-0 overflow-y-auto overflow-x-hidden relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Logo */}
        <CollabOnLogo />

        <div className="w-8 h-0.5 bg-rose-400 mx-auto mb-3 rounded-full flex-shrink-0" />

        {/* Nav */}
        <nav className="flex-1 flex flex-col items-center gap-1 px-2 pb-2">
          {/* 1. Dashboard */}
          <NavLinkItem
            Icon={DashboardIcon}
            label="Dashboard"
            path="/layout"
            active={checkActive("/layout", currentPath, openFlyout)}
          />

          {/* 2. Manage Institution */}
          <NavLinkItem
            Icon={ManageInstIcon}
            label="Manage Instit..."
            path="/layout/manage-institution"
            active={checkActive("/layout/manage-institution", currentPath, openFlyout)}
          />

          {/* 3. Academic Management — flyout trigger */}
          <button
            ref={academicBtnRef}
            onClick={() => toggleFlyout("academic", academicBtnRef)}
            title="Academic Management"
            className={[
              "flex flex-col items-center w-full py-1 rounded-lg transition-colors",
              openFlyout === "academic" ? "bg-white/10" : "hover:bg-white/5",
            ].join(" ")}
          >
            <NavItemContent
              Icon={AcademicManagementIcon}
              label="Academic Ma..."
              active={openFlyout ? openFlyout === "academic" : isAcademicActive}
            />
          </button>

          {/* 4. Staff Management — flyout trigger */}
          <button
            ref={staffBtnRef}
            onClick={() => toggleFlyout("staff", staffBtnRef)}
            title="Staff Management"
            className={[
              "flex flex-col items-center w-full py-1 rounded-lg transition-colors",
              openFlyout === "staff" ? "bg-white/10" : "hover:bg-white/5",
            ].join(" ")}
          >
            <NavItemContent
              Icon={StaffManagementIcon}
              label="Staff Manage..."
              active={openFlyout ? openFlyout === "staff" : isStaffActive}
            />
          </button>

          {/* 5. Staff Workload */}
          {NAV_AFTER_STAFF.map((item) => (
            <NavLinkItem
              key={item.path}
              {...item}
              active={checkActive(item.path, currentPath, openFlyout)}
            />
          ))}

          {/* 6. Student Management — flyout trigger */}
          <button
            ref={studentBtnRef}
            onClick={() => toggleFlyout("student", studentBtnRef)}
            title="Student Management"
            className={[
              "flex flex-col items-center w-full py-1 rounded-lg transition-colors",
              openFlyout === "student" ? "bg-white/10" : "hover:bg-white/5",
            ].join(" ")}
          >
            <NavItemContent
              Icon={StudentManagementIcon}
              label="Student Mana..."
              active={openFlyout ? openFlyout === "student" : isStudentActive}
            />
          </button>

          {/* 7. User Management — flyout trigger */}
          <button
            ref={userBtnRef}
            onClick={() => toggleFlyout("user", userBtnRef)}
            title="User Management"
            className={[
              "flex flex-col items-center w-full py-1 rounded-lg transition-colors",
              openFlyout === "user" ? "bg-white/10" : "hover:bg-white/5",
            ].join(" ")}
          >
            <NavItemContent
              Icon={UserManagementIcon}
              label="User Manage..."
              active={openFlyout ? openFlyout === "user" : isUserMgmtActive}
            />
          </button>

          {/* 8. Finance — flyout trigger */}
          <button
            ref={financeBtnRef}
            onClick={() => toggleFlyout("finance", financeBtnRef)}
            title="Finance"
            className={[
              "flex flex-col items-center w-full py-1 rounded-lg transition-colors",
              openFlyout === "finance" ? "bg-white/10" : "hover:bg-white/5",
            ].join(" ")}
          >
            <NavItemContent
              Icon={FinanceIcon}
              label="Finance"
              active={openFlyout ? openFlyout === "finance" : isFinanceActive}
            />
          </button>

          {/* 9. Admissions — flyout trigger */}
          <button
            ref={admissionBtnRef}
            onClick={() => toggleFlyout("admission", admissionBtnRef)}
            title="Admissions"
            className={[
              "flex flex-col items-center w-full py-1 rounded-lg transition-colors",
              openFlyout === "admission" ? "bg-white/10" : "hover:bg-white/5",
            ].join(" ")}
          >
            <NavItemContent
              Icon={AdmissionsIcon}
              label="Admissions"
              active={openFlyout ? openFlyout === "admission" : isAdmissionsActive}
            />
          </button>

          {/* 10. Campus Comms — flyout trigger */}
          <button
            ref={campusCommsBtnRef}
            onClick={() => toggleFlyout("campus-comms", campusCommsBtnRef)}
            title="Campus Communication"
            className={[
              "flex flex-col items-center w-full py-1 rounded-lg transition-colors",
              openFlyout === "campus-comms" ? "bg-white/10" : "hover:bg-white/5",
            ].join(" ")}
          >
            <NavItemContent
              Icon={CampusCommsIcon}
              label="Campus Com..."
              active={openFlyout ? openFlyout === "campus-comms" : isCampusCommsActive}
            />
          </button>

          {/* 11. Results + Reports */}
          {NAV_AFTER_USER.map((item) => (
            <NavLinkItem
              key={item.path}
              {...item}
              active={checkActive(item.path, currentPath, openFlyout)}
            />
          ))}

          {/* 12. Asset Management — flyout trigger */}
          <button
            ref={assetBtnRef}
            onClick={() => toggleFlyout("asset", assetBtnRef)}
            title="Asset Management"
            className={[
              "flex flex-col items-center w-full py-1 rounded-lg transition-colors",
              openFlyout === "asset" ? "bg-white/10" : "hover:bg-white/5",
            ].join(" ")}
          >
            <NavItemContent
              Icon={AssetManagementIcon}
              label="Asset Manage..."
              active={openFlyout ? openFlyout === "asset" : isAssetActive}
            />
          </button>
        </nav>

        {/* Settings — pinned bottom */}
        <div className="flex flex-col items-center pb-4 px-2 flex-shrink-0">
          <div className="w-8 h-px bg-white/15 mb-2" />
          <NavLinkItem
            Icon={SettingsIcon}
            label="Settings"
            path="/layout/settings"
            active={checkActive("/layout/settings", currentPath, openFlyout)}
          />
        </div>
      </aside>

      {/* ── Flyout panel ─────────────────────────────────────────────────────── */}
      {flyoutConfig && (
        <div
          ref={flyoutRef}
          style={{ position: "fixed", left: 96, top: Math.max(0, flyoutTop) }}
          className="z-50 drop-shadow-xl"
        >
          <div className="w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1D6BA3] mb-0.5">
                Navigation
              </p>
              <h3 className="text-[14px] font-bold text-gray-900">{flyoutConfig.title}</h3>
            </div>

            <ul
              className={[
                "py-1.5",
                flyoutConfig.scrollable ? "max-h-[360px] overflow-y-auto" : "",
              ].join(" ")}
            >
              {flyoutConfig.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setOpenFlyout(null)}
                    className={({ isActive }) =>
                      [
                        "flex items-center justify-between px-5 py-2.5 text-[13px] font-medium transition-all duration-150 group",
                        isActive
                          ? "bg-[#1D6BA3]/10 text-[#1D6BA3]"
                          : "text-gray-700 hover:bg-[#1D6BA3]/10 hover:text-[#1D6BA3]",
                      ].join(" ")
                    }
                  >
                    <span>{item.label}</span>
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0 text-gray-300 group-hover:text-[#1D6BA3] transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
