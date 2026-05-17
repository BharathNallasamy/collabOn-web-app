import { useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import Card from "../common/Card";

// ── Types (backend-JSON ready — swap DASHBOARD_DATA with API response) ──────
interface StatItem {
  iconKey: string;
  label: string;
  value: string;
  sub: string;
  change: string;
  changeUp: boolean;
  bgColor: string;
  iconColor: string;
}
interface DailyAttendancePoint { day: string; staff: number; students: number }
interface AbsenteeRow { id: number; name: string; course: string; section: string; days: number }
interface CourseAttendancePoint { course: string; batch2020: number; batch2021: number }
interface DeptResultPoint { dept: string; appeared: number; passed: number }
interface FeeStatusItem { name: string; value: number; color: string }
interface CollectionPoint { month: string; collected: number; expected: number }
interface DefaulterRow { id: number; name: string; course: string; amount: string }
interface FunnelItem { label: string; value: number; color: string }
interface AdmissionTrendPoint { month: string; admissions: number }
interface AssetCondItem { label: string; value: string; sub: string; color: string; bg: string }
interface AssetDeptItem { dept: string; count: number; maxCount: number; color: string }

interface DashboardData {
  stats: StatItem[];
  dailyAttendanceTrend: DailyAttendancePoint[];
  topAbsentees: AbsenteeRow[];
  studentAttendance: CourseAttendancePoint[];
  staffAttendance: CourseAttendancePoint[];
  examResults: { passed: number; failed: number };
  deptComparison: DeptResultPoint[];
  feeStatus: FeeStatusItem[];
  collectionTrend: CollectionPoint[];
  topDefaulters: DefaulterRow[];
  admissionFunnel: FunnelItem[];
  admissionTrend: AdmissionTrendPoint[];
  assetConditions: AssetCondItem[];
  assetsByDept: AssetDeptItem[];
}

// ── Seed data (replace entire object with API response when backend is ready) ─
const DASHBOARD_DATA: DashboardData = {
  stats: [
    { iconKey: "students", label: "Total Students", value: "4,320", sub: "Active", change: "+12%", changeUp: true, bgColor: "bg-blue-50", iconColor: "text-[#1D6BA3]" },
    { iconKey: "staff",    label: "Staff Count",    value: "248",    sub: "Active", change: "+3%",  changeUp: true, bgColor: "bg-teal-50",   iconColor: "text-teal-600" },
    { iconKey: "attendance", label: "Today's Attendance", value: "87.4%", sub: "Present Today", change: "+2.1%", changeUp: true,  bgColor: "bg-violet-50", iconColor: "text-violet-600" },
    { iconKey: "fees",    label: "Fees Collected", value: "₹42.5L", sub: "This Month",  change: "+18%", changeUp: true,  bgColor: "bg-amber-50", iconColor: "text-amber-600" },
    { iconKey: "pending", label: "Pending Fees",   value: "₹12.3L", sub: "Outstanding", change: "-5%", changeUp: false, bgColor: "bg-red-50",   iconColor: "text-red-500" },
  ],
  dailyAttendanceTrend: [
    { day: "Mon", staff: 92, students: 85 },
    { day: "Tue", staff: 88, students: 82 },
    { day: "Wed", staff: 95, students: 90 },
    { day: "Thu", staff: 90, students: 87 },
    { day: "Fri", staff: 86, students: 78 },
  ],
  topAbsentees: [
    { id: 1, name: "Arun Kumar",    course: "BSC CS",    section: "A", days: 5 },
    { id: 2, name: "Priya Nair",    course: "B.Com",     section: "B", days: 4 },
    { id: 3, name: "Ravi Shankar",  course: "BBA",       section: "C", days: 4 },
    { id: 4, name: "Meena Devi",    course: "BSC CS",    section: "B", days: 3 },
    { id: 5, name: "Suresh Babu",   course: "B.Com",     section: "A", days: 3 },
  ],
  studentAttendance: [
    { course: "BSC CS",    batch2020: 88, batch2021: 91 },
    { course: "B.Com",     batch2020: 82, batch2021: 85 },
    { course: "BBA",       batch2020: 79, batch2021: 84 },
    { course: "BSC Maths", batch2020: 90, batch2021: 87 },
    { course: "B.Lit",     batch2020: 75, batch2021: 80 },
  ],
  staffAttendance: [
    { course: "CS Dept",   batch2020: 94, batch2021: 96 },
    { course: "Commerce",  batch2020: 90, batch2021: 93 },
    { course: "Mgmt",      batch2020: 88, batch2021: 91 },
    { course: "Maths",     batch2020: 95, batch2021: 97 },
    { course: "Literature",batch2020: 87, batch2021: 89 },
  ],
  examResults: { passed: 540, failed: 170 },
  deptComparison: [
    { dept: "BSC CS",    appeared: 120, passed: 98 },
    { dept: "B.Com",     appeared: 95,  passed: 78 },
    { dept: "BBA",       appeared: 85,  passed: 72 },
    { dept: "BSC Maths", appeared: 110, passed: 95 },
    { dept: "B.Lit",     appeared: 65,  passed: 50 },
  ],
  feeStatus: [
    { name: "Paid",    value: 43, color: "#1D6BA3" },
    { name: "Partial", value: 24, color: "#f59e0b" },
    { name: "Unpaid",  value: 16, color: "#ef4444" },
    { name: "Others",  value: 17, color: "#e5e7eb" },
  ],
  collectionTrend: [
    { month: "Jun", collected: 28, expected: 35 },
    { month: "Jul", collected: 32, expected: 35 },
    { month: "Aug", collected: 38, expected: 40 },
    { month: "Sep", collected: 35, expected: 40 },
    { month: "Oct", collected: 42, expected: 45 },
  ],
  topDefaulters: [
    { id: 1, name: "Karthik R",  course: "BSC CS - A",    amount: "₹45,000" },
    { id: 2, name: "Divya S",    course: "B.Com - B",     amount: "₹38,500" },
    { id: 3, name: "Mani K",     course: "BBA - A",       amount: "₹32,000" },
    { id: 4, name: "Siva P",     course: "BSC Maths",     amount: "₹28,750" },
    { id: 5, name: "Geetha M",   course: "B.Lit - A",     amount: "₹22,000" },
  ],
  admissionFunnel: [
    { label: "Enquiries",    value: 1200, color: "#1D6BA3" },
    { label: "Applications", value: 850,  color: "#0d9488" },
    { label: "Admissions",   value: 420,  color: "#8b5cf6" },
  ],
  admissionTrend: [
    { month: "Jan", admissions: 45  },
    { month: "Feb", admissions: 62  },
    { month: "Mar", admissions: 78  },
    { month: "Apr", admissions: 110 },
    { month: "May", admissions: 95  },
    { month: "Jun", admissions: 130 },
    { month: "Jul", admissions: 88  },
    { month: "Aug", admissions: 72  },
    { month: "Sep", admissions: 65  },
    { month: "Oct", admissions: 50  },
    { month: "Nov", admissions: 42  },
    { month: "Dec", admissions: 38  },
  ],
  assetConditions: [
    { label: "To Replace",      value: "250",   sub: "Items flagged",  color: "#ef4444", bg: "bg-red-50"     },
    { label: "Good Condition",  value: "3,850", sub: "Total in use",   color: "#10b981", bg: "bg-emerald-50" },
    { label: "Scrapped Value",  value: "₹1.5L", sub: "Written off",    color: "#6b7280", bg: "bg-gray-50"    },
  ],
  assetsByDept: [
    { dept: "BSC CS",  count: 1200, maxCount: 1500, color: "#1D6BA3" },
    { dept: "B.Com",   count: 1200, maxCount: 1500, color: "#0d9488" },
    { dept: "BBA",     count: 1200, maxCount: 1500, color: "#8b5cf6" },
    { dept: "Others",  count: 200,  maxCount: 1500, color: "#f59e0b" },
  ],
};

// ── Full defaulter list (API endpoint: /fees/defaulters) ─────────────────
const ALL_DEFAULTERS: DefaulterRow[] = [
  { id: 1,  name: "Karthik R",   course: "BSC CS - A",    amount: "₹45,000" },
  { id: 2,  name: "Divya S",     course: "B.Com - B",     amount: "₹38,500" },
  { id: 3,  name: "Mani K",      course: "BBA - A",       amount: "₹32,000" },
  { id: 4,  name: "Siva P",      course: "BSC Maths",     amount: "₹28,750" },
  { id: 5,  name: "Geetha M",    course: "B.Lit - A",     amount: "₹22,000" },
  { id: 6,  name: "Rajan T",     course: "BSC CS - B",    amount: "₹19,500" },
  { id: 7,  name: "Nirmala K",   course: "B.Com - A",     amount: "₹17,000" },
  { id: 8,  name: "Senthil V",   course: "BBA - B",       amount: "₹15,250" },
  { id: 9,  name: "Amudha P",    course: "BSC Maths - A", amount: "₹13,000" },
  { id: 10, name: "Harish N",    course: "B.Lit - B",     amount: "₹11,500" },
  { id: 11, name: "Deepa R",     course: "BSC CS - C",    amount: "₹10,000" },
  { id: 12, name: "Vinoth S",    course: "B.Com - C",     amount: "₹8,750"  },
];

// ── Full absentee list (API endpoint: /attendance/absentees?week=current) ──
const ALL_ABSENTEES: AbsenteeRow[] = [
  { id: 1,  name: "Arun Kumar",    course: "BSC CS",    section: "A", days: 5 },
  { id: 2,  name: "Priya Nair",    course: "B.Com",     section: "B", days: 4 },
  { id: 3,  name: "Ravi Shankar",  course: "BBA",       section: "C", days: 4 },
  { id: 4,  name: "Meena Devi",    course: "BSC CS",    section: "B", days: 3 },
  { id: 5,  name: "Suresh Babu",   course: "B.Com",     section: "A", days: 3 },
  { id: 6,  name: "Kavitha R",     course: "BSC Maths", section: "A", days: 3 },
  { id: 7,  name: "Dinesh Kumar",  course: "B.Lit",     section: "B", days: 2 },
  { id: 8,  name: "Anitha M",      course: "BSC CS",    section: "C", days: 2 },
  { id: 9,  name: "Venkat S",      course: "BBA",       section: "A", days: 2 },
  { id: 10, name: "Lakshmi P",     course: "B.Com",     section: "C", days: 2 },
  { id: 11, name: "Balu T",        course: "BSC Maths", section: "B", days: 1 },
  { id: 12, name: "Nithya J",      course: "B.Lit",     section: "A", days: 1 },
];

// ── Shared Recharts tooltip style ─────────────────────────────────────────
const TooltipStyle: React.CSSProperties = {
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontSize: "12px",
};

// ── Stat card icon map ─────────────────────────────────────────────────────
const STAT_ICONS: Record<string, React.ReactElement> = {
  students: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  staff: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  attendance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  fees: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pending: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ── Avatar initial circle ─────────────────────────────────────────────────
const AvatarInitial = ({ name }: { name: string }) => {
  const COLORS = ["#1D6BA3", "#0d9488", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981"];
  const bg = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
      style={{ backgroundColor: bg }}
    >
      {name[0].toUpperCase()}
    </div>
  );
};

// ── Section header ────────────────────────────────────────────────────────
const SectionTitle = ({
  title, sub, action,
}: {
  title: string; sub?: string; action?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <p className="text-[13px] font-semibold text-gray-800 leading-tight">{title}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {action && <div className="flex-shrink-0 ml-2">{action}</div>}
  </div>
);

// ── "View all" link ────────────────────────────────────────────────────────
const ViewAll = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="text-[11px] font-semibold text-[#1D6BA3] hover:underline whitespace-nowrap"
  >
    View all
  </button>
);

// ── View All Absentees Modal ──────────────────────────────────────────────
const ViewAllAbsenteesModal = ({ onClose }: { onClose: () => void }) => {
  const [search, setSearch] = useState("");

  const filtered = ALL_ABSENTEES.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.course.toLowerCase().includes(search.toLowerCase()) ||
    a.section.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportList = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["S.No", "Student Name", "Course", "Section", "Days Absent"],
      ...ALL_ABSENTEES.map((a, i) => [i + 1, a.name, a.course, a.section, a.days]),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absentees");
    XLSX.writeFile(wb, "Absentees_This_Week.xlsx");
  };

  const daysBadge = (days: number) =>
    days >= 4
      ? "bg-red-50 text-red-500"
      : days >= 3
      ? "bg-orange-50 text-orange-500"
      : "bg-yellow-50 text-yellow-600";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-bold text-gray-800">All Absentees</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              This Week · {ALL_ABSENTEES.length} Students
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportList}
              className="h-8 px-3 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-50">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, course or section…"
              className="w-full h-9 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] focus:bg-white transition-all placeholder:text-gray-400"
            />
            <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-14">S.No</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Course</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Section</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Days</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                    No absentees found
                  </td>
                </tr>
              ) : (
                filtered.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3 text-[12px] text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <AvatarInitial name={a.name} />
                        <span className="text-[12px] font-semibold text-gray-800">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{a.course}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">Section {a.section}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${daysBadge(a.days)}`}>
                        {a.days}d
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-[#1D6BA3] transition-colors" title="Send mail">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-[#1D6BA3] transition-colors" title="View profile">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
            <span className="font-semibold text-gray-700">{ALL_ABSENTEES.length}</span> absentees
          </p>
          <button
            onClick={onClose}
            className="h-8 px-4 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── View All Defaulters Modal ─────────────────────────────────────────────
const ViewAllDefaultersModal = ({ onClose }: { onClose: () => void }) => {
  const [search, setSearch] = useState("");

  const filtered = ALL_DEFAULTERS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.course.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportList = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["S.No", "Student Name", "Course", "Outstanding Amount"],
      ...ALL_DEFAULTERS.map((d, i) => [i + 1, d.name, d.course, d.amount]),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Top Defaulters");
    XLSX.writeFile(wb, "Top_Defaulters.xlsx");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-bold text-gray-800">All Defaulters</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Highest Outstanding Fees · {ALL_DEFAULTERS.length} Students
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportList}
              className="h-8 px-3 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-50">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or course…"
              className="w-full h-9 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] focus:bg-white transition-all placeholder:text-gray-400"
            />
            <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-14">S.No</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Course</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Outstanding</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                    No defaulters found
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3 text-[12px] text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <AvatarInitial name={d.name} />
                        <span className="text-[12px] font-semibold text-gray-800">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{d.course}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] font-bold text-red-500">{d.amount}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="h-6 px-3 bg-amber-50 hover:bg-amber-100 text-amber-600 text-[10px] font-semibold rounded-md transition-colors">
                        Remind
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
            <span className="font-semibold text-gray-700">{ALL_DEFAULTERS.length}</span> defaulters
          </p>
          <button
            onClick={onClose}
            className="h-8 px-4 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────
const DashStatCard = ({ item }: { item: StatItem }) => (
  <Card className="flex items-start gap-3.5 !overflow-visible">
    <div className={`w-11 h-11 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0 ${item.iconColor}`}>
      {STAT_ICONS[item.iconKey]}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide leading-none">{item.label}</p>
      <p className="text-[22px] font-bold text-gray-800 mt-1 leading-tight">{item.value}</p>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px] text-gray-400">{item.sub}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.changeUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
          {item.change}
        </span>
      </div>
    </div>
  </Card>
);

// ── Filter dropdown ────────────────────────────────────────────────────────
const FilterSelect = ({
  value, onChange, children,
}: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-9 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none cursor-pointer"
    >
      {children}
    </select>
    <svg className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

// ── Donut center label helper ─────────────────────────────────────────────
const DonutCenter = ({ value, label }: { value: string; label: string }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="text-center">
      <p className="text-xl font-bold text-gray-800 leading-tight">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  </div>
);

// ── Scroll wrapper for charts ─────────────────────────────────────────────
const ScrollChart = ({ minWidth, height, children }: { minWidth: number; height: number; children: React.ReactNode }) => (
  <div className="overflow-x-auto">
    <div style={{ minWidth }}>
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// College Dashboard
// ═══════════════════════════════════════════════════════════════════════════
const Overview = () => {
  const [dept,              setDept]              = useState("");
  const [program,           setProgram]           = useState("");
  const [semester,          setSemester]          = useState("");
  const [year,              setYear]              = useState("2024-25");
  const [showAbsentees,     setShowAbsentees]     = useState(false);
  const [showDefaulters,    setShowDefaulters]    = useState(false);
  const [isExporting,       setIsExporting]       = useState(false);

  const handleExportDashboard = () => {
    setIsExporting(true);
    const wb = XLSX.utils.book_new();
    const today = new Date().toLocaleDateString("en-IN");

    // Sheet 1: Overview Stats
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Dashboard Export — CollabOn", "", ""],
      [`Report Date: ${today}`, "", ""],
      ["", "", ""],
      ["OVERVIEW STATISTICS"],
      ["Metric", "Value", "Change"],
      ...DASHBOARD_DATA.stats.map(s => [s.label, s.value, s.change]),
    ]), "Overview Stats");

    // Sheet 2: Attendance Trend
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["DAILY ATTENDANCE TREND"],
      ["Day", "Staff (%)", "Students (%)"],
      ...DASHBOARD_DATA.dailyAttendanceTrend.map(d => [d.day, d.staff, d.students]),
    ]), "Attendance Trend");

    // Sheet 3: All Absentees
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["ALL ABSENTEES — THIS WEEK"],
      ["S.No", "Student Name", "Course", "Section", "Days Absent"],
      ...ALL_ABSENTEES.map((a, i) => [i + 1, a.name, a.course, a.section, a.days]),
    ]), "All Absentees");

    // Sheet 4: Exam Results
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["EXAM RESULTS OVERVIEW"],
      ["Category", "Count"],
      ["Passed", DASHBOARD_DATA.examResults.passed],
      ["Failed", DASHBOARD_DATA.examResults.failed],
      ["Total", DASHBOARD_DATA.examResults.passed + DASHBOARD_DATA.examResults.failed],
      [],
      ["DEPARTMENT COMPARISON"],
      ["Department", "Appeared", "Passed"],
      ...DASHBOARD_DATA.deptComparison.map(d => [d.dept, d.appeared, d.passed]),
    ]), "Exam Results");

    // Sheet 5: Fee & Collection
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["FEE STATUS SUMMARY"],
      ["Category", "Percentage"],
      ...DASHBOARD_DATA.feeStatus.map(f => [f.name, `${f.value}%`]),
      [],
      ["COLLECTION TREND"],
      ["Month", "Collected (₹L)", "Expected (₹L)"],
      ...DASHBOARD_DATA.collectionTrend.map(c => [c.month, c.collected, c.expected]),
      [],
      ["TOP DEFAULTERS"],
      ["Name", "Course", "Amount"],
      ...DASHBOARD_DATA.topDefaulters.map(d => [d.name, d.course, d.amount]),
    ]), "Fee & Collection");

    // Sheet 6: Admissions
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["ADMISSIONS FUNNEL"],
      ["Stage", "Count"],
      ...DASHBOARD_DATA.admissionFunnel.map(f => [f.label, f.value]),
      [],
      ["ADMISSION TREND — MONTHLY"],
      ["Month", "Admissions"],
      ...DASHBOARD_DATA.admissionTrend.map(a => [a.month, a.admissions]),
    ]), "Admissions");

    // Sheet 7: Assets
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["ASSET CONDITIONS"],
      ["Label", "Value", "Note"],
      ...DASHBOARD_DATA.assetConditions.map(a => [a.label, a.value, a.sub]),
      [],
      ["ASSETS BY DEPARTMENT"],
      ["Department", "Count"],
      ...DASHBOARD_DATA.assetsByDept.map(a => [a.dept, a.count]),
    ]), "Assets");

    XLSX.writeFile(wb, `Dashboard_Report_${today.replaceAll("/", "-")}.xlsx`);
    setTimeout(() => setIsExporting(false), 800);
  };

  const { examResults, feeStatus } = DASHBOARD_DATA;
  const totalExam  = examResults.passed + examResults.failed;
  const passedPct  = Math.round((examResults.passed / totalExam) * 100);

  const resultsDonutData = [
    { name: "Passed", value: examResults.passed, color: "#1D6BA3" },
    { name: "Failed", value: examResults.failed, color: "#ef4444" },
  ];

  return (
    <>
    <div className="space-y-5 pb-6">

      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <FilterSelect value={dept} onChange={setDept}>
            <option value="">All Departments</option>
            <option>BSC CS</option>
            <option>B.Com</option>
            <option>BBA</option>
            <option>BSC Maths</option>
            <option>B.Lit</option>
          </FilterSelect>
          <FilterSelect value={program} onChange={setProgram}>
            <option value="">All Program Types</option>
            <option>Under Graduate</option>
            <option>Post Graduate</option>
            <option>Diploma</option>
          </FilterSelect>
          <FilterSelect value={semester} onChange={setSemester}>
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6].map(n => <option key={n}>Semester {n}</option>)}
          </FilterSelect>
          <FilterSelect value={year} onChange={setYear}>
            <option>2024-25</option>
            <option>2023-24</option>
            <option>2022-23</option>
          </FilterSelect>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-4 bg-[#1D6BA3] hover:bg-[#1A5F91] text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Insights
          </button>
          <button
            onClick={handleExportDashboard}
            disabled={isExporting}
            className="h-9 px-4 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Exporting…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {DASHBOARD_DATA.stats.map(s => <DashStatCard key={s.label} item={s} />)}
      </div>

      {/* ── Daily Attendance Trend + Top Absentees ───────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <Card className="h-full">
            <SectionTitle title="Daily Attendance Trend" sub="Staff & Students — Mon to Fri" />
            <ScrollChart minWidth={440} height={220}>
              <LineChart
                data={DASHBOARD_DATA.dailyAttendanceTrend}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={TooltipStyle} formatter={(v) => [`${Number(v)}%`]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="staff"    name="Staff"    stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4, fill: "#0d9488" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="students" name="Students" stroke="#1D6BA3" strokeWidth={2.5} dot={{ r: 4, fill: "#1D6BA3" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ScrollChart>
          </Card>
        </div>
        <Card className="h-full">
          <SectionTitle title="Top Absentees" sub="This Week" action={<ViewAll onClick={() => setShowAbsentees(true)} />} />
          <div className="space-y-3">
            {DASHBOARD_DATA.topAbsentees.map(a => (
              <div key={a.id} className="flex items-center gap-2.5">
                <AvatarInitial name={a.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">{a.name}</p>
                  <p className="text-[11px] text-gray-400">{a.course} · Sec {a.section}</p>
                </div>
                <span className="text-[11px] font-bold text-red-500 flex-shrink-0 bg-red-50 px-2 py-0.5 rounded-full">
                  {a.days}d
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-[#1D6BA3] transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-[#1D6BA3] transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Student Attendance + Staff Attendance ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="Daily Attendance — Students" sub="By Course · Batch 2020 vs 2021" />
          <ScrollChart minWidth={400} height={220}>
            <BarChart
              data={DASHBOARD_DATA.studentAttendance}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="course" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={TooltipStyle} formatter={(v) => [`${Number(v)}%`]} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Bar dataKey="batch2020" name="Batch 2020" fill="#1D6BA3" radius={[3, 3, 0, 0]} barSize={14} />
              <Bar dataKey="batch2021" name="Batch 2021" fill="#93c5fd" radius={[3, 3, 0, 0]} barSize={14} />
            </BarChart>
          </ScrollChart>
        </Card>
        <Card>
          <SectionTitle title="Daily Attendance — Staff" sub="By Department · 2020 vs 2021" />
          <ScrollChart minWidth={400} height={220}>
            <BarChart
              data={DASHBOARD_DATA.staffAttendance}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="course" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={TooltipStyle} formatter={(v) => [`${Number(v)}%`]} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Bar dataKey="batch2020" name="Batch 2020" fill="#0d9488" radius={[3, 3, 0, 0]} barSize={14} />
              <Bar dataKey="batch2021" name="Batch 2021" fill="#5eead4" radius={[3, 3, 0, 0]} barSize={14} />
            </BarChart>
          </ScrollChart>
        </Card>
      </div>

      {/* ── Results Overview + Department Comparison ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <SectionTitle title="Results Overview" sub="Pass / Fail Distribution" />
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={resultsDonutData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  dataKey="value"
                  startAngle={90} endAngle={-270}
                  paddingAngle={2}
                >
                  {resultsDonutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <DonutCenter value={`${passedPct}%`} label="Passed" />
          </div>
          <div className="flex items-center justify-center gap-5 mt-3">
            {resultsDonutData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] text-gray-500">{d.name}</span>
                <span className="text-[11px] font-bold text-gray-800">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <SectionTitle title="Department Comparison" sub="Appeared vs Passed — Current Semester" />
            <ScrollChart minWidth={420} height={230}>
              <BarChart
                data={DASHBOARD_DATA.deptComparison}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TooltipStyle} />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="appeared" name="Appeared" fill="#e5e7eb" radius={[3, 3, 0, 0]} barSize={18} />
                <Bar dataKey="passed"   name="Passed"   fill="#1D6BA3" radius={[3, 3, 0, 0]} barSize={18} />
              </BarChart>
            </ScrollChart>
          </Card>
        </div>
      </div>

      {/* ── Fee Status + Collection Trend + Top Defaulters ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <SectionTitle title="Fee Status" sub="Paid · Partial · Unpaid" />
          <div className="relative">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={feeStatus}
                  cx="50%" cy="50%"
                  innerRadius={48} outerRadius={70}
                  dataKey="value"
                  startAngle={90} endAngle={-270}
                  paddingAngle={2}
                >
                  {feeStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TooltipStyle} formatter={(v) => [`${Number(v)}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <DonutCenter value={`${feeStatus[0].value}%`} label="Paid" />
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3">
            {feeStatus.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] text-gray-500 truncate">{d.name}</span>
                <span className="text-[11px] font-bold text-gray-800 ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle title="Collection Trend" sub="Collected vs Expected (₹ Lakhs)" />
          <ScrollChart minWidth={300} height={210}>
            <ComposedChart
              data={DASHBOARD_DATA.collectionTrend}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TooltipStyle} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Bar  dataKey="collected" name="Collected" fill="#1D6BA3" radius={[3, 3, 0, 0]} barSize={20} />
              <Line type="monotone" dataKey="expected" name="Expected" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ScrollChart>
        </Card>
        <Card>
          <SectionTitle title="Top Defaulters" sub="Highest Outstanding Fees" action={<ViewAll onClick={() => setShowDefaulters(true)} />} />
          <div className="space-y-3">
            {DASHBOARD_DATA.topDefaulters.map(d => (
              <div key={d.id} className="flex items-center gap-2.5">
                <AvatarInitial name={d.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">{d.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{d.course}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-bold text-red-500">{d.amount}</span>
                  <button className="h-6 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 text-[10px] font-semibold rounded-md transition-colors">
                    Remind
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Admissions Funnel + Admission Trend ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <SectionTitle title="Admissions Funnel" sub="Enquiries → Applications → Admissions" />
          <div className="space-y-5 mt-2">
            {DASHBOARD_DATA.admissionFunnel.map(f => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-700">{f.label}</span>
                  <span className="font-bold text-gray-800">{f.value.toLocaleString()}</span>
                </div>
                <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-700"
                    style={{
                      width: `${(f.value / DASHBOARD_DATA.admissionFunnel[0].value) * 100}%`,
                      backgroundColor: f.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <SectionTitle title="Admission Trend" sub="Monthly Admissions — Jan to Dec" />
            <ScrollChart minWidth={560} height={230}>
              <AreaChart
                data={DASHBOARD_DATA.admissionTrend}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1D6BA3" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1D6BA3" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="admissions"
                  name="Admissions"
                  stroke="#1D6BA3"
                  strokeWidth={2.5}
                  fill="url(#admGrad)"
                  dot={{ r: 3, fill: "#1D6BA3" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ScrollChart>
          </Card>
        </div>
      </div>

      {/* ── Asset Conditions + Assets by Department ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <SectionTitle title="Asset Conditions Overview" />
          <div className="space-y-3 mt-1">
            {DASHBOARD_DATA.assetConditions.map(a => (
              <div key={a.label} className={`flex items-center gap-3 p-3 rounded-xl ${a.bg}`}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: a.color + "22" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke={a.color} strokeWidth={2} viewBox="0 0 24 24">
                    {a.label === "To Replace" && (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    )}
                    {a.label === "Good Condition" && (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                    {a.label === "Scrapped Value" && (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800 leading-tight">{a.value}</p>
                  <p className="text-[11px] font-medium text-gray-600">{a.label}</p>
                  <p className="text-[10px] text-gray-400">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <SectionTitle title="Assets by Department" sub="Current Asset Distribution" />
            <div className="space-y-4 mt-2">
              {DASHBOARD_DATA.assetsByDept.map(d => (
                <div key={d.dept}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-medium text-gray-700">{d.dept}</span>
                    <span className="text-[12px] font-bold text-gray-800">{d.count.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(d.count / d.maxCount) * 100}%`,
                        backgroundColor: d.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

    </div>

    {/* ── Modals ──────────────────────────────────────────────────────── */}
    {showAbsentees && (
      <ViewAllAbsenteesModal onClose={() => setShowAbsentees(false)} />
    )}
    {showDefaulters && (
      <ViewAllDefaultersModal onClose={() => setShowDefaulters(false)} />
    )}
    </>
  );
};

export default Overview;
