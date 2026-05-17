import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown, Star,
  Users, User, TrendingUp, TrendingDown, BarChart2,
  BookOpen, Monitor, ShoppingBag, Calendar, DollarSign,
  Clock, PieChart, AlertCircle, Rss, Bell,
} from "lucide-react";
// ── Types ─────────────────────────────────────────────────────────────────────
import { type ReportItem, type ReportSection } from "../../types/interfaces";

// ── Static Data ───────────────────────────────────────────────────────────────
const D = "Track Conversion Rate From Enquiry To Confirm Admission.";

const REPORT_SECTIONS: ReportSection[] = [
  {
    id: "student-management",
    title: "Student Management",
    reports: [
      { id: "admission-funnel",    title: "Admission Funnel Report",    description: D,                                                                               columns: 5, iconBg: "bg-green-500",   Icon: BarChart2,    defaultStarred: true  },
      { id: "student-directory",   title: "Student Directory Report",   description: D,                                                                               columns: 5, iconBg: "bg-teal-500",    Icon: Users,        defaultStarred: false },
      { id: "enrollment-trends",   title: "Enrollment Trends",          description: D,                                                                               columns: 5, iconBg: "bg-blue-500",    Icon: TrendingUp,   defaultStarred: false },
      { id: "dropout-inactive",    title: "Dropout/Inactive Students",  description: D,                                                                               columns: 5, iconBg: "bg-purple-600",  Icon: AlertCircle,  defaultStarred: true  },
    ],
  },
  {
    id: "academic-reports",
    title: "Academic Reports",
    reports: [
      { id: "dept-academic-coverage", title: "Department Academic Coverage Report", description: D,                                                                   columns: 5, iconBg: "bg-purple-600",  Icon: BookOpen,     defaultStarred: true  },
      { id: "student-allocation",     title: "Student Allocation Report",           description: D,                                                                   columns: 5, iconBg: "bg-pink-500",    Icon: Users,        defaultStarred: false },
      { id: "timetable-coverage",     title: "Timetable Coverage",                  description: D,                                                                   columns: 5, iconBg: "bg-emerald-500", Icon: Calendar,     defaultStarred: false },
    ],
  },
  {
    id: "attendance-reports",
    title: "Attendance Reports",
    reports: [
      { id: "student-attendance-summary", title: "Student Attendance Summary", description: D,                                                                        columns: 5, iconBg: "bg-green-500",   Icon: Users,        defaultStarred: true  },
      { id: "staff-attendance-report",    title: "Staff Attendance Report",    description: D,                                                                        columns: 5, iconBg: "bg-teal-500",    Icon: User,         defaultStarred: false },
      { id: "low-attendance-alert",       title: "Low Attendance Alert",       description: D,                                                                        columns: 5, iconBg: "bg-red-500",     Icon: TrendingDown, defaultStarred: false },
    ],
  },
  {
    id: "finance-reports",
    title: "Finance Reports",
    reports: [
      { id: "fee-collection-summary", title: "Fee Collection Summary",    description: D,                                                                             columns: 5, iconBg: "bg-green-500",   Icon: DollarSign,   defaultStarred: true  },
      { id: "student-fee-status",     title: "Student Fee Status Report", description: D,                                                                             columns: 5, iconBg: "bg-teal-500",    Icon: Users,        defaultStarred: false },
      { id: "defaulters-report",      title: "Defaulters Report",         description: D,                                                                             columns: 5, iconBg: "bg-blue-500",    Icon: TrendingUp,   defaultStarred: false },
      { id: "payment-mode-analysis",  title: "Payment Mode Analysis",     description: D,                                                                             columns: 5, iconBg: "bg-purple-600",  Icon: PieChart,     defaultStarred: true  },
    ],
  },
  {
    id: "asset-reports",
    title: "Asset Reports",
    reports: [
      { id: "asset-inventory",  title: "Asset Inventory Report",      description: D,                                                                                 columns: 5, iconBg: "bg-blue-500",    Icon: Monitor,      defaultStarred: true  },
      { id: "asset-condition",  title: "Asset Condition Report",      description: D,                                                                                 columns: 5, iconBg: "bg-purple-600",  Icon: BookOpen,     defaultStarred: false },
      { id: "asset-valuation",  title: "Asset Valuation Report",      description: D,                                                                                 columns: 5, iconBg: "bg-green-500",   Icon: DollarSign,   defaultStarred: false },
      { id: "vendor-purchase",  title: "Vendor Wise Purchase Report", description: D,                                                                                 columns: 5, iconBg: "bg-purple-600",  Icon: ShoppingBag,  defaultStarred: true  },
    ],
  },
  {
    id: "hr-staff-reports",
    title: "HR & Staff Reports",
    reports: [
      { id: "staff-directory",  title: "Staff Directory Report",  description: D,                                                                                     columns: 5, iconBg: "bg-pink-500",    Icon: Users,        defaultStarred: true  },
      { id: "staff-workload",   title: "Staff Workload Report",   description: D,                                                                                     columns: 5, iconBg: "bg-green-500",   Icon: BarChart2,    defaultStarred: false },
      { id: "leave-attendance", title: "Leave & Attendance Report", description: D,                                                                                   columns: 5, iconBg: "bg-blue-500",    Icon: Calendar,     defaultStarred: false },
    ],
  },
  {
    id: "results-performance",
    title: "Results & Performance Reports",
    reports: [
      { id: "student-results",   title: "Student Results Report",        description: D,                                                                              columns: 5, iconBg: "bg-teal-500",    Icon: User,         defaultStarred: true  },
      { id: "dept-performance",  title: "Department Performance Report", description: D,                                                                              columns: 5, iconBg: "bg-pink-500",    Icon: BarChart2,    defaultStarred: false },
      { id: "subject-difficulty",title: "Subject Difficulty Analysis",   description: D,                                                                              columns: 5, iconBg: "bg-blue-500",    Icon: TrendingUp,   defaultStarred: false },
    ],
  },
  {
    id: "campus-comms-reports",
    title: "Campus Communication Reports",
    reports: [
      { id: "feed-engagement",     title: "Feed Engagement Report",      description: "Metrics On View And Interactions For Campus Feed Posts.",  columns: 5, iconBg: "bg-pink-500",   Icon: Rss,      defaultStarred: true  },
      { id: "event-participation", title: "Event Participation Report",  description: "Attendance Tracing For Campus Events And Activates.",      columns: 5, iconBg: "bg-amber-400", Icon: Calendar, defaultStarred: false },
      { id: "notification-delivery",title: "Notification Delivery Report",description: "Delivery And Read Rates For System Notification.",        columns: 5, iconBg: "bg-blue-500",  Icon: Bell,     defaultStarred: false },
    ],
  },
  {
    id: "cross-module",
    title: "Cross Module Insights",
    reports: [
      { id: "attendance-vs-results", title: "Attendance Vs Results Report", description: "Correlation Analysis Between Student Attendance And Academic Performance.", columns: 5, iconBg: "bg-amber-400",   Icon: BarChart2,    defaultStarred: true  },
      { id: "fees-vs-attendance",    title: "Fees Vs Attendance Report",    description: "Analyze Attendance Patterns Against Fee Payment Status",                   columns: 5, iconBg: "bg-indigo-500",  Icon: Clock,        defaultStarred: false },
    ],
  },
];

// ── Report Card ───────────────────────────────────────────────────────────────
const ReportCard = ({
  report, starred, onStarToggle, onClick,
}: {
  report: ReportItem;
  starred: boolean;
  onStarToggle: () => void;
  onClick: () => void;
}) => {
  const { Icon } = report;
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-[#1D6BA3]/20 transition-all"
    >
      {/* Icon + Title + Star */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
          <div className={`w-10 h-10 rounded-full ${report.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 leading-snug mt-0.5">{report.title}</h3>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onStarToggle(); }}
          className="flex-shrink-0 p-0.5 rounded hover:bg-gray-100 transition-colors"
          title={starred ? "Remove from favourites" : "Add to favourites"}
        >
          <Star className={`w-4 h-4 transition-colors ${starred ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300"}`} />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-4 leading-relaxed min-h-[2.5rem]">{report.description}</p>

      {/* Divider + Column badge */}
      <hr className="border-gray-100 mb-3" />
      <span className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
        {report.columns} Columns
      </span>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const Reports = () => {
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [starred,  setStarred]  = useState<Set<string>>(
    () => new Set(REPORT_SECTIONS.flatMap(s => s.reports.filter(r => r.defaultStarred).map(r => r.id)))
  );

  const toggleSection = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleStar = (id: string) => {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <h1 className="text-lg font-bold text-gray-900">Reports & Analytics</h1>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {REPORT_SECTIONS.map(section => {
          const isOpen = expanded.has(section.id);
          return (
            <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">

              {/* Section Header */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">{section.title}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded: Report Cards Grid */}
              {isOpen && (
                <div className="border-t border-gray-100 bg-slate-50 px-5 py-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.reports.map(report => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        starred={starred.has(report.id)}
                        onStarToggle={() => toggleStar(report.id)}
                        onClick={() => navigate(`/layout/reports/view/${report.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
