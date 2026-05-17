import { useState, useMemo, useCallback } from "react";
import Card from "../../../components/common/Card";
import StatsCard from "../../../components/common/StatsCard";
import DataTable, { type Column } from "../../../components/common/Table/DataTable";
import DatePicker from "../../../components/common/DatePicker";
import { Fingerprint } from "lucide-react";

// ── Seed data ──────────────────────────────────────────────────────────────────
const EMPLOYEES = [
  {
    id: "EMP001",
    name: "Jayam",
    dept: "Tamil",
    role: "Professor",
    punch1: "01:59 PM",
    punch2: "01:59 PM",
    totalWork: "01:59 PM",
    totalBreak: "01:59 PM",
    overtime: "01:59 PM",
  },
  {
    id: "EMP002",
    name: "Sumith",
    dept: "English",
    role: "Professor",
    punch1: null,
    punch2: null,
    totalWork: null,
    totalBreak: null,
    overtime: null,
  },
  {
    id: "EMP003",
    name: "Vivek",
    dept: "Tamil",
    role: "Assistant Professor",
    punch1: null,
    punch2: null,
    totalWork: null,
    totalBreak: null,
    overtime: null,
  },
  {
    id: "EMP004",
    name: "Sradha",
    dept: "Computer Science",
    role: "Professor",
    punch1: null,
    punch2: null,
    totalWork: null,
    totalBreak: null,
    overtime: null,
  },
  {
    id: "EMP005",
    name: "Shankar",
    dept: "Commerce",
    role: "Professor",
    punch1: null,
    punch2: null,
    totalWork: null,
    totalBreak: null,
    overtime: null,
  },
  {
    id: "EMP006",
    name: "Prem",
    dept: "Mathematics",
    role: "Assistant Professor",
    punch1: null,
    punch2: null,
    totalWork: null,
    totalBreak: null,
    overtime: null,
  },
  {
    id: "EMP007",
    name: "Yuvan",
    dept: "Computer Science",
    role: "Assistant Professor",
    punch1: null,
    punch2: null,
    totalWork: null,
    totalBreak: null,
    overtime: null,
  },
  {
    id: "EMP008",
    name: "Prabhu",
    dept: "Commerce",
    role: "Assistant Professor",
    punch1: null,
    punch2: null,
    totalWork: null,
    totalBreak: null,
    overtime: null,
  },
  {
    id: "EMP009",
    name: "Palani",
    dept: "Commerce",
    role: "Assistant Professor",
    punch1: null,
    punch2: null,
    totalWork: null,
    totalBreak: null,
    overtime: null,
  },
  {
    id: "EMP010",
    name: "Prem",
    dept: "Mathematics",
    role: "Lecturer",
    punch1: null,
    punch2: null,
    totalWork: null,
    totalBreak: null,
    overtime: null,
  },
  {
    id: "EMP011",
    name: "Vignesh",
    dept: "Commerce",
    role: "Lecturer",
    punch1: null,
    punch2: null,
    totalWork: null,
    totalBreak: null,
    overtime: null,
  },
];

const SHIFT_SUMMARY = [
  { name: "Morning", onTime: 3, late: 1, notIn: 2, timeOff: 0 },
  { name: "Evening", onTime: 2, late: 0, notIn: 3, timeOff: 1 },
  { name: "Night", onTime: 1, late: 0, notIn: 1, timeOff: 0 },
  { name: "General", onTime: 0, late: 0, notIn: 0, timeOff: 1 },
  { name: "Split", onTime: 0, late: 0, notIn: 0, timeOff: 0 },
];

const DEPT_SUMMARY = [
  { name: "Tamil", checkedIn: 2, notIn: 0, timeOff: 0 },
  { name: "English", checkedIn: 0, notIn: 1, timeOff: 0 },
  { name: "Computer Science", checkedIn: 2, notIn: 0, timeOff: 0 },
  { name: "Commerce", checkedIn: 1, notIn: 3, timeOff: 0 },
  { name: "Mathematics", checkedIn: 0, notIn: 2, timeOff: 0 },
];

// ── PunchCell ──────────────────────────────────────────────────────────────────
const PunchCell = ({ value }: { value: string | null }) => {
  return (
    <div className="flex items-center gap-1.5">
      <Fingerprint className="w-4 h-4 text-gray-400" />
      <span className="text-sm text-gray-900">{value || "Fingerprint"}</span>
    </div>
  );
};

// Types
type Employee = (typeof EMPLOYEES)[0];
type ShiftSummary = (typeof SHIFT_SUMMARY)[0];
type DeptSummary = (typeof DEPT_SUMMARY)[0];

// ── Main component ─────────────────────────────────────────────────────────────
type TabKey = "all" | "morning" | "evening";

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  const allSelected = selected.length === EMPLOYEES.length;
  const toggleAll = useCallback(
    () => setSelected(allSelected ? [] : EMPLOYEES.map((e) => e.id)),
    [allSelected]
  );
  const toggleOne = useCallback(
    (id: string) =>
      setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    []
  );

  const TABS: { key: TabKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "morning", label: "Morning Shift" },
    { key: "evening", label: "Evening Shift" },
  ];

  const STATS = [
    {
      label: "Checked In",
      value: 6,
      bgClassName: "bg-emerald-50",
      iconColorClassName: "text-emerald-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      label: "Not In Yet",
      value: 6,
      bgClassName: "bg-red-50",
      iconColorClassName: "text-red-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
    {
      label: "Time Off",
      value: 10,
      bgClassName: "bg-blue-50",
      iconColorClassName: "text-blue-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Pending Biometric",
      value: 6,
      bgClassName: "bg-amber-50",
      iconColorClassName: "text-amber-500",
      valueColorClassName: "text-amber-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
          />
        </svg>
      ),
    },
  ];

  const ATTENDANCE_COLS: Column<Employee>[] = useMemo(
    () => [
      {
        key: "select",
        header: (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 accent-[#1D6BA3]"
          />
        ),
        className: "pl-5 pr-4 py-3 w-12",
        render: (emp) => (
          <input
            type="checkbox"
            checked={selected.includes(emp.id)}
            onChange={() => toggleOne(emp.id)}
            className="w-4 h-4 accent-[#1D6BA3] cursor-pointer"
          />
        ),
      },
      {
        key: "id",
        header: "Employee ID",
        className: "px-4 py-4 text-sm font-medium text-gray-700",
      },
      {
        key: "name",
        header: "Name",
        className: "px-4 py-4 text-sm font-semibold text-gray-900",
      },
      {
        key: "dept",
        header: "Department",
        className: "px-4 py-4 text-sm text-gray-600",
      },
      {
        key: "role",
        header: "Designation",
        className: "px-4 py-4 text-sm text-gray-600",
      },
      {
        key: "punch1",
        header: "First Punch",
        className: "px-4 py-4 text-sm text-gray-700",
        render: (emp) => <PunchCell value={emp.punch1} />,
      },
      {
        key: "punch2",
        header: "Last Punch",
        className: "px-4 py-4 text-sm text-gray-700",
        render: (emp) => <PunchCell value={emp.punch2} />,
      },
      {
        key: "totalWork",
        header: "Total Working Hours",
        className: "px-4 py-4 text-sm text-gray-700 border-l border-gray-50",
        render: (emp) => <PunchCell value={emp.totalWork} />,
      },
      {
        key: "totalBreak",
        header: "Total Break Hours",
        className: "px-4 py-4 text-sm text-gray-700 border-l border-gray-50",
        render: (emp) => <PunchCell value={emp.totalBreak} />,
      },
      {
        key: "overtime",
        header: "Overtime Hours",
        className: "px-4 py-4 text-sm text-gray-700 border-l border-gray-50",
        render: (emp) => <PunchCell value={emp.overtime} />,
      },
    ],
    [selected, allSelected, toggleAll, toggleOne]
  );

  const SHIFT_COLS: Column<ShiftSummary>[] = [
    { key: "name", header: "Shift", className: "px-4 py-2.5 text-sm font-bold text-gray-700" },
    {
      key: "onTime",
      header: "On time",
      className: "px-4 py-2.5 text-sm font-bold text-gray-700",
    },
    { key: "late", header: "Late", className: "px-4 py-2.5 text-sm font-bold text-gray-700" },
    {
      key: "notIn",
      header: "Not in yet",
      className: "px-4 py-2.5 text-sm font-bold text-gray-700",
    },
    {
      key: "timeOff",
      header: "Time Off",
      className: "px-4 py-2.5 text-sm font-bold text-gray-700",
    },
  ];

  const DEPT_COLS: Column<DeptSummary>[] = [
    {
      key: "name",
      header: "Department",
      className: "px-4 py-2.5 text-sm font-bold text-gray-700",
    },
    {
      key: "checkedIn",
      header: "Checked In",
      className: "px-4 py-2.5 font-bold text-sm text-gray-700",
    },
    {
      key: "notIn",
      header: "Not in yet",
      className: "px-4 py-2.5 font-bold text-sm text-gray-700",
    },
    {
      key: "timeOff",
      header: "Time Off",
      className: "px-4 py-2.5 font-bold text-sm text-gray-700",
    },
  ];

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-800">Quick Attendance Summary</h1>
        <DatePicker value={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* ── Stats row ── */}
      <div className="flex gap-3">
        {STATS.map((s) => (
          <StatsCard key={s.label} variant="horizontal" {...s} />
        ))}
      </div>

      {/* ── Attendance table ── */}
      <Card noPadding className="border-gray-200">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 pt-3 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                "px-4 py-2 text-sm font-semibold transition-colors",
                activeTab === tab.key
                  ? "text-[#1D6BA3] border-b-2 border-[#1D6BA3] -mb-px"
                  : "text-gray-500 hover:text-gray-700",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DataTable
            data={EMPLOYEES}
            columns={ATTENDANCE_COLS}
            tableClassName="min-w-[1240px]"
            headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
            bodyRowClassName={(emp) =>
              selected.includes(emp.id) ? "bg-blue-50/30" : "hover:bg-gray-50/60 transition-colors"
            }
            pagination={{
              currentPage: 1,
              totalPages: 1,
              pageSize: 10,
              total: EMPLOYEES.length,
              onPageChange: () => {},
            }}
          />
        </div>
      </Card>

      {/* ── Summary tables row ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Shift Wise */}
        <Card noPadding className="border-gray-200">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">
              Todays Shift Wise Attendance Summary
            </h2>
          </div>
          <DataTable
            data={SHIFT_SUMMARY}
            columns={SHIFT_COLS}
            headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
            showPagination={false}
          />
        </Card>

        {/* Department Wise */}
        <Card noPadding className="border-gray-200">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">
              Todays Department Wise Attendance Summary
            </h2>
          </div>
          <DataTable
            data={DEPT_SUMMARY}
            columns={DEPT_COLS}
            headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
            showPagination={false}
          />
        </Card>
      </div>

      {/* ── Pending Approvals ── */}
      <Card noPadding className="border-gray-200">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Pending Approvals</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-sm font-medium">No Data Found</p>
        </div>
      </Card>
    </div>
  );
};

export default StaffDashboard;
