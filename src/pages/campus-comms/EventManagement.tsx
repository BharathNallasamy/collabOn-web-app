import { useState, useRef, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Eye, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";
import DataTable, { type Column } from "../../components/common/Table/DataTable";
import { ChevronDownIcon, EditIcon, DocumentIcon, PlusIcon } from "../../components/common/Icons";
import { getEvents } from "./eventStore";
import { type EventRow, type EventStatus } from "../../types/interfaces";

// ── Custom Dropdown ───────────────────────────────────────────────────────────
const CustomDropdown = ({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative min-w-[140px]">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 bg-white hover:border-gray-300 transition-colors">
        <span className={value ? "text-gray-700 font-medium" : ""}>{value || label}</span>
        <ChevronDownIcon size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-full min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
          <ul className="py-1">
            {options.map(opt => (
              <li key={opt}>
                <button type="button" onClick={() => { onChange(opt === value ? "" : opt); setOpen(false); }}
                  className={["w-full text-left px-4 py-2.5 text-[13px] transition-colors",
                    opt === value ? "text-[#1D6BA3] font-semibold bg-[#EFF6FF]" : "text-gray-700 hover:bg-gray-50"].join(" ")}>
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

// ── Event Thumbnail ───────────────────────────────────────────────────────────
const EventThumb = () => (
  <div className="w-12 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-[#0F2460] via-[#1D6BA3] to-[#1A3A8A] flex items-center justify-center flex-shrink-0">
    <svg className="w-5 h-5 opacity-60" fill="none" stroke="white" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

// ── Status Badge (approval) ───────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: EventStatus }) => {
  const map: Record<EventStatus, string> = {
    Pending:  "bg-orange-50 text-orange-500 border border-orange-200",
    Approved: "bg-green-50 text-green-600 border border-green-200",
    Rejected: "bg-red-50 text-red-500 border border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${map[status]}`}>
      {status}
    </span>
  );
};

// ── Active Badge ──────────────────────────────────────────────────────────────
const ActiveBadge = ({ value }: { value: "Active" | "Inactive" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
    value === "Active"
      ? "bg-green-50 text-green-600 border border-green-200"
      : "bg-gray-50 text-gray-500 border border-gray-200"
  }`}>
    {value}
  </span>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const EventManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Re-read from store every time this page is visited
  const [events, setEvents] = useState<EventRow[]>(() => getEvents());
  useEffect(() => { setEvents(getEvents()); }, [location.key]);

  const [search, setSearch]         = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus]         = useState("");
  // Applied filter state — only updates on Apply click
  const [appliedSearch, setAppliedSearch]         = useState("");
  const [appliedDepartment, setAppliedDepartment] = useState("");
  const [appliedStatus, setAppliedStatus]         = useState("");

  const handleApply = () => {
    setAppliedSearch(search);
    setAppliedDepartment(department);
    setAppliedStatus(status);
  };

  const handleClear = () => {
    setSearch(""); setDepartment(""); setStatus("");
    setAppliedSearch(""); setAppliedDepartment(""); setAppliedStatus("");
  };

  const filtered = events.filter(e => {
    const q = appliedSearch.toLowerCase();
    const matchSearch = !q || e.eventTitle.toLowerCase().includes(q);
    const matchDept   = !appliedDepartment || e.department === appliedDepartment;
    const matchStatus = !appliedStatus || e.status === appliedStatus;
    return matchSearch && matchDept && matchStatus;
  });

  // Stats derived from full events list
  const pendingCount  = events.filter(e => e.status === "Pending").length;
  const approvedCount = events.filter(e => e.status === "Approved").length;
  const rejectedCount = events.filter(e => e.status === "Rejected").length;

  const deptOptions   = [...new Set(events.map(e => e.department))];
  const statusOptions: EventStatus[] = ["Approved", "Rejected", "Pending"];

  const columns: Column<EventRow>[] = [
    { key: "sNo",         header: "S.No",        className: "px-6 py-4 text-sm text-gray-700 w-16" },
    { key: "image",       header: "Image",        className: "px-6 py-4", render: () => <EventThumb /> },
    { key: "eventTitle",  header: "Event Title",  className: "px-6 py-4 text-sm text-gray-700 font-medium" },
    { key: "type",        header: "Type",         className: "px-6 py-4 text-sm text-gray-700" },
    { key: "department",  header: "Department",   className: "px-6 py-4 text-sm text-gray-700" },
    {
      key: "mode", header: "Mode", className: "px-6 py-4 text-sm font-semibold",
      render: (row) => (
        <span className={row.mode === "Offline" ? "text-red-500" : "text-gray-700"}>{row.mode}</span>
      ),
    },
    { key: "date",        header: "Date",         className: "px-6 py-4 text-sm text-gray-700" },
    {
      key: "registration", header: "Registration", className: "px-6 py-4 text-sm",
      render: (row) => (
        <span className={row.registration === "Open" ? "text-green-600 font-semibold" : "text-gray-500"}>
          {row.registration}
        </span>
      ),
    },
    {
      key: "status", header: "Status", className: "px-6 py-4",
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: "visibility",  header: "Visibility",   className: "px-6 py-4 text-sm text-gray-700" },
    {
      key: "activeStatus", header: "Status", className: "px-6 py-4",
      render: (row) => <ActiveBadge value={row.activeStatus} />,
    },
    {
      key: "actions", header: "Actions", className: "px-6 py-4",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/layout/campus-comms/event-management/view/${row.id}`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors" title="View">
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/layout/campus-comms/event-management/edit/${row.id}`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors" title="Edit">
            <EditIcon size={16} />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors" title="Document">
            <DocumentIcon size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 flex items-center gap-4 border border-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-orange-500">{pendingCount}</span>
            <p className="text-sm font-semibold text-gray-700">Pending Review</p>
            <p className="text-xs text-orange-500 font-medium">• Events Awaiting Approval</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 flex items-center gap-4 border border-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-green-600">{approvedCount}</span>
            <p className="text-sm font-semibold text-gray-700">Approved</p>
            <p className="text-xs text-green-600 font-medium">• Active events</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 flex items-center gap-4 border border-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-red-500">{rejectedCount}</span>
            <p className="text-sm font-semibold text-gray-700">Rejected</p>
            <p className="text-xs text-red-500 font-medium">• Events Rejected</p>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <Card noPadding className="border-gray-200 overflow-visible">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-base font-bold text-gray-900">Event Management</h1>
          <Button variant="primary" className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-10 px-4"
            icon={<PlusIcon size={18} />} onClick={() => navigate("/layout/campus-comms/event-management/create")}>
            <span className="font-semibold text-sm">Create Event</span>
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-4 flex flex-wrap items-center gap-3 bg-white border-y border-gray-100">
          <div className="relative flex-1 min-w-[240px]">
            <input type="text" placeholder="Search by Name , Roll No, Phone No, Email"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <CustomDropdown label="Department" value={department} onChange={setDepartment} options={deptOptions} />
          <CustomDropdown label="Status" value={status} onChange={setStatus} options={statusOptions} />
          <Button
            className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white h-9 px-4 text-sm font-medium"
            onClick={handleApply}>
            Apply
          </Button>
          <Button variant="ghost" className="border border-[#1D6BA3] text-[#1D6BA3] hover:bg-[#1D6BA3]/5 h-9 px-4 text-sm font-medium"
            onClick={handleClear}>Clear</Button>
        </div>

        <div className="border-t border-gray-100">
          <DataTable
            data={filtered}
            columns={columns}
            headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
            emptyMessage="No events found"
          />
        </div>
      </Card>
    </div>
  );
};

export default EventManagement;
