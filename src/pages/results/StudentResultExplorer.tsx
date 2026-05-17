import { 
  ChevronDown, 
  Calendar as CalendarIcon 
} from "lucide-react";
import DataTable, { type Column } from "../../components/common/Table/DataTable";
import Card from "../../components/common/Card";
import { type ExplorerRow } from "../../types/interfaces";

// ── Custom Dropdown ───────────────────────────────────────────────────────────
const FilterDropdown = ({ label }: { label: string }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors min-w-[140px] shadow-sm">
      <div className="flex items-center gap-2">
         <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <ChevronDown size={14} className="text-gray-400 ml-2" />
    </div>
  );
};

const StudentResultExplorer = () => {
  const EXPLORER_DATA = [
     { name: "Arjun", subjectId: "24-ST_011", subject: "Computer Science", marks: 62, grade: "A", results: "Pass" },
     { name: "Priya", subjectId: "24-ST_011", subject: "Bio Technology", marks: 67, grade: "B", results: "Pass" },
     { name: "Rahul", subjectId: "24-ST_011", subject: "Computer Science", marks: 80, grade: "B", results: "Pass" },
     { name: "Priya", subjectId: "24-ST_011", subject: "Chemistry", marks: 87, grade: "A", results: "Fail" },
  ];

  const columns: Column<ExplorerRow>[] = [
    { key: "name", header: "Subject Name", className: "px-6 py-5 text-sm text-gray-700 font-semibold" },
    { key: "subjectId", header: "Subject ID", className: "px-6 py-5 text-sm text-gray-500" },
    { key: "marks", header: "Marks", className: "px-6 py-5 text-sm", render: (row) => (
      <span className="text-green-600 font-bold">{row.marks}</span>
    )},
    { key: "grade", header: "Grade", className: "px-6 py-5 text-sm text-gray-700 font-bold" },
    { key: "results", header: "Results", className: "px-6 py-5 text-center", render: (row) => (
      <span className={[
        "px-6 py-1.5 rounded-full text-xs font-bold ring-1 ring-inset inline-block", 
        row.results === "Pass" 
          ? "bg-green-50 text-green-600 ring-green-100" 
          : "bg-red-50 text-red-500 ring-red-100"
      ].join(" ")}>
        {row.results}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-4 bg-white">
          <h2 className="text-base font-bold text-gray-800 tracking-tight">Student Result Explorer</h2>
          <div className="flex flex-wrap items-center gap-4">
            <FilterDropdown label="Department" />
            <FilterDropdown label="Program Type" />
            <FilterDropdown label="Semester" />
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors min-w-[140px] shadow-sm">
                <CalendarIcon size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Academic Year</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Table Card */}
      <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <DataTable 
          data={EXPLORER_DATA} 
          columns={columns} 
          headerRowClassName="bg-[#EFF6FF] border-b border-gray-100" 
        />
      </Card>
    </div>
  );
};

export default StudentResultExplorer;
