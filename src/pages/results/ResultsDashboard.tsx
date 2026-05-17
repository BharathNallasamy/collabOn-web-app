import DataTable, { type Column } from "../../components/common/Table/DataTable";
import Card from "../../components/common/Card";
import { Eye, ChevronDown, Calendar } from "lucide-react";

// ── SVG Donut Chart ──────────────────────────────────────────────────────────
const DonutChart = ({ pass = 80, fail = 20 }: { pass?: number; fail?: number }) => {
  const size = 260;
  const radius = 90;
  const strokeWidth = 55;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Use degree-based calculations for perfectly radial gaps
  const gapDeg = 5;
  const failDeg = (fail / 100) * 360;
  const passDeg = (pass / 100) * 360;

  // Calculate pixel lengths for dasharray from degrees
  const failLength = ((failDeg - gapDeg) / 360) * circumference;
  const passLength = ((passDeg - gapDeg) / 360) * circumference;

  // Start rotations to center gaps at 3 o'clock and the split point
  const failStartDeg = gapDeg / 2;
  const passStartDeg = failDeg + gapDeg / 2;

  return (
    <div className="relative w-[260px] h-[260px] flex items-center justify-center group">
      <svg width={size} height={size}>
        {/* Fail Segment (Red) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#D9534F"
          strokeWidth={strokeWidth}
          strokeDasharray={`${failLength} ${circumference - failLength}`}
          className="transition-all duration-1000 ease-in-out"
          style={{
            transform: `rotate(${failStartDeg}deg)`,
            transformOrigin: "center",
          }}
        />
        {/* Pass/Bank Segment (Green) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#5CC863"
          strokeWidth={strokeWidth}
          strokeDasharray={`${passLength} ${circumference - passLength}`}
          className="transition-all duration-1000 ease-in-out"
          style={{
            transform: `rotate(${passStartDeg}deg)`,
            transformOrigin: "center",
          }}
        />
      </svg>

      {/* Floating Labels - Positioned via absolute classes to match Figma anchors */}
      <div className="absolute top-1/4 left-[5%] -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] bg-[#F9FAFB] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center justify-center transition-transform group-hover:scale-105">
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter leading-none">
          Bank
        </span>
        <span className="text-sm font-bold text-gray-900 leading-none mt-1">{pass}%</span>
      </div>

      <div className="absolute bottom-[25%] right-[5%] translate-x-1/2 translate-y-1/2 w-[60px] h-[60px] bg-[#F9FAFB] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center justify-center transition-transform group-hover:scale-105">
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter leading-none">
          Fail
        </span>
        <span className="text-sm font-bold text-gray-900 leading-none mt-1">{fail}%</span>
      </div>
    </div>
  );
};

const FilterDropdown = ({ label, icon: Icon }: { label: string; icon?: React.ElementType }) => (
  <div className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors min-w-[140px] shadow-sm group">
    <div className="flex items-center gap-2">
      {Icon && (
        <Icon size={16} className="text-gray-400 group-hover:text-[#1D6BA3] transition-colors" />
      )}
      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </div>
    <ChevronDown
      size={14}
      className="text-gray-400 ml-2 group-hover:translate-y-0.5 transition-transform"
    />
  </div>
);

const ResultsDashboard = () => {
  const DEPT_PERFORMANCE = [
    { department: "Computer Science", appeared: 120, passed: 110, failed: 10 },
    { department: "Bio Technology", appeared: 120, passed: 110, failed: 75 },
    { department: "Computer Science", appeared: 120, passed: 110, failed: 130 },
    { department: "Chemistry", appeared: 120, passed: 110, failed: 157 },
  ];

  const columns: Column<{
    department: string;
    appeared: number;
    passed: number;
    failed: number;
  }>[] = [
    {
      key: "department",
      header: "Department",
      className: "px-6 py-6 text-sm text-gray-700 font-semibold",
    },
    {
      key: "appeared",
      header: "Appeared",
      className: "px-6 py-6 text-sm text-gray-600 font-medium",
    },
    {
      key: "passed",
      header: "Passed",
      className: "px-6 py-6 text-sm",
      render: (row) => <span className="text-green-600 font-bold">{row.passed}</span>,
    },
    {
      key: "failed",
      header: "Failed",
      className: "px-6 py-6 text-sm",
      render: (row) => <span className="text-red-500 font-bold">{row.failed}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "px-6 py-6 text-center",
      render: () => (
        <button className="p-1.5 hover:bg-blue-50 rounded-full transition-colors text-blue-500 border border-blue-100">
          <Eye size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Bar Card */}
      <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-4 bg-white">
          <h2 className="text-base font-bold text-gray-800 tracking-tight">Results Management</h2>
          <div className="flex flex-wrap items-center gap-4">
            <FilterDropdown label="Department" />
            <FilterDropdown label="Program Type" />
            <FilterDropdown label="Semester" />
            <FilterDropdown label="Academic Year" icon={Calendar} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Pass vs Fail Distribution */}
        <Card
          noPadding
          className="col-span-12 lg:col-span-12 xl:col-span-5 border-gray-100 shadow-sm rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">Pass Vs Fail Distribution</h3>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-center justify-center gap-12 min-h-[380px]">
            <DonutChart pass={80} fail={20} />

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-8 min-w-[120px]">
                <span className="text-sm font-bold text-gray-700">Pass:</span>
                <div className="w-14 h-5 bg-[#5CC863] rounded-full" />
              </div>
              <div className="flex items-center justify-between gap-8 min-w-[120px]">
                <span className="text-sm font-bold text-gray-700">Fail:</span>
                <div className="w-14 h-5 bg-[#D9534F] rounded-full" />
              </div>
            </div>
          </div>
        </Card>

        {/* Department Performance */}
        <Card
          noPadding
          className="col-span-12 lg:col-span-7 border-gray-100 shadow-sm rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">Department Performance</h3>
          </div>
          <div className="overflow-hidden">
            <DataTable
              data={DEPT_PERFORMANCE}
              columns={columns}
              headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResultsDashboard;
