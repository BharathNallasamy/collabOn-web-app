import { useState, useRef, useEffect } from "react";
import {
  CalendarDays,
  Users,
  UserPlus,
  GraduationCap,
  CalendarRange,
  Eye,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";
import DataTable, { type Column } from "../../components/common/Table/DataTable";
import { ChevronDownIcon } from "../../components/common/Icons";

import { type RegistrationRow } from "../../types/interfaces";
import { SEED_REGISTRATIONS as MOCK_DATA } from "../../types/mockData";

// ── Custom Dropdown ───────────────────────────────────────────────────────────
const CustomDropdown = ({
  label, options, value, onChange,
}: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative min-w-[140px]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 bg-white hover:border-gray-300 transition-colors"
      >
        <span className={value ? "text-gray-700 font-medium" : ""}>{value || label}</span>
        <ChevronDownIcon size={16} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-full min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
          <ul className="py-1">
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => { onChange(opt === value ? "" : opt); setOpen(false); }}
                  className={[
                    "w-full text-left px-4 py-2.5 text-[13px] transition-colors",
                    opt === value ? "text-[#1D6BA3] font-semibold bg-[#EFF6FF]" : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ── Metric Card ───────────────────────────────────────────────────────────────
const MetricCard = ({
  icon, count, label, subLabel, color, bg,
}: {
  icon: React.ReactNode; count: number; label: string; subLabel: string; color: string; bg: string;
}) => (
  <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-[0_2px_4px_rgba(0,0,0,0.03)] border border-gray-100">
    <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center ${color} flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <div className="flex items-baseline gap-1">
        <span className={`text-[20px] font-bold ${color} leading-none`}>{count}</span>
        <span className={`text-[11px] font-bold ${color} ml-1`}>• {label}</span>
      </div>
      <p className="text-[13px] font-medium text-gray-500 mt-1">{subLabel}</p>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const EventRegistration = () => {
  const navigate = useNavigate();

  const [eventType, setEventType] = useState("");
  const [department, setDepartment] = useState("");
  const [eventMode, setEventMode] = useState("");
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleClear = () => {
    setEventType(""); setDepartment(""); setEventMode("");
    setStatus(""); setDateRange(""); setSearchQuery("");
  };

  const columns: Column<RegistrationRow>[] = [
    { key: "sNo", header: "S.No", className: "px-6 py-4 text-sm text-gray-700 w-16" },
    { key: "id", header: "Participant ID", className: "px-6 py-4 text-sm text-gray-700 font-medium" },
    { key: "name", header: "Participant Name", className: "px-6 py-4 text-sm text-gray-700" },
    { key: "type", header: "Type", className: "px-6 py-4 text-sm text-gray-700" },
    { key: "department", header: "Department", className: "px-6 py-4 text-sm text-gray-700" },
    { key: "eventName", header: "Event Name", className: "px-6 py-4 text-sm text-gray-700" },
    {
      key: "actions",
      header: "Actions",
      className: "px-6 py-4 text-sm text-gray-700 text-center",
      render: (row) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => navigate(`/layout/campus-comms/event-registration/view/${row.eventId}`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard icon={<CalendarDays className="w-6 h-6" />} count={6} label="Total Events" subLabel="Registration" color="text-[#E01A7B]" bg="bg-[#FFF0F7]" />
        <MetricCard icon={<Users className="w-6 h-6" />} count={6} label="Total Participats" subLabel="Registration" color="text-[#1D6BA3]" bg="bg-[#EDF5FF]" />
        <MetricCard icon={<UserPlus className="w-6 h-6" />} count={6} label="Total Faculty" subLabel="Registration" color="text-[#7C3AED]" bg="bg-[#F6F0FF]" />
        <MetricCard icon={<GraduationCap className="w-6 h-6" />} count={6} label="Total Student" subLabel="Registration" color="text-[#16A34A]" bg="bg-[#F0FCF4]" />
        <MetricCard icon={<CalendarRange className="w-6 h-6" />} count={6} label="Active Events" subLabel="With Registration" color="text-[#EAB308]" bg="bg-[#FFF8EB]" />
      </div>

      {/* ── Main Table Card ── */}
      <Card noPadding className="border-gray-200 overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-base font-bold text-gray-900">Feed Management</h1>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-4 flex flex-wrap items-center gap-3 bg-white border-y border-gray-100">
          <CustomDropdown label="Event Type" value={eventType} onChange={setEventType}
            options={["Workshop", "Seminar", "Conference", "Cultural Event", "Academic Event"]} />
          <CustomDropdown label="Department" value={department} onChange={setDepartment}
            options={["Computer Science", "Statistics", "Business Administration"]} />
          <CustomDropdown label="Event Mode" value={eventMode} onChange={setEventMode}
            options={["Online", "Offline"]} />
          <CustomDropdown label="Status" value={status} onChange={setStatus}
            options={["Register", "Cancel"]} />
          <CustomDropdown label="Date Range" value={dateRange} onChange={setDateRange}
            options={["Today", "This Week", "This Month"]} />

          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by Event Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white h-9 px-4 text-sm font-medium" onClick={() => {}}>
            Apply
          </Button>
          <Button variant="ghost" className="border border-[#1D6BA3] text-[#1D6BA3] hover:bg-[#1D6BA3]/5 h-9 px-4 text-sm font-medium" onClick={handleClear}>
            Clear
          </Button>
        </div>

        {/* Table */}
        <div className="border-t border-gray-100">
          <DataTable
            data={MOCK_DATA}
            columns={columns}
            headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
            emptyMessage="No registrations found"
          />
        </div>
      </Card>
    </div>
  );
};

export default EventRegistration;
