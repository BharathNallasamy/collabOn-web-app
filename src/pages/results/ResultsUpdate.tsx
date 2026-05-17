import { useState } from "react";
import { Plus, Upload, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable, { type Column } from "../../components/common/Table/DataTable";
import Card from "../../components/common/Card";
// import Button from "../../components/common/Button/Button";

import { type ResultRow } from "../../types/interfaces";

const ResultsUpdate = () => {
  const navigate = useNavigate();
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const UPLOAD_DATA = [
    {
      subjectId: "24-ST_011",
      studentName: "Arjun",
      department: "Computer Science",
      subject: "Computer Science",
      marks: 62,
      grade: "A",
      results: "Pass",
      status: "Published",
    },
    {
      subjectId: "24-ST_011",
      studentName: "Priya",
      department: "Bio Technology",
      subject: "Bio Technology",
      marks: 67,
      grade: "B",
      results: "Pass",
      status: "Published",
    },
    {
      subjectId: "24-ST_011",
      studentName: "Rahul",
      department: "Computer Science",
      subject: "Computer Science",
      marks: 80,
      grade: "B",
      results: "Pass",
      status: "Published",
    },
    {
      subjectId: "24-ST_011",
      studentName: "Priya",
      department: "Chemistry",
      subject: "Chemistry",
      marks: 87,
      grade: "A",
      results: "Fail",
      status: "Published",
    },
  ];

  const columns: Column<ResultRow>[] = [
    { key: "subjectId", header: "Subject ID", className: "px-6 py-5 text-sm text-gray-500" },
    {
      key: "studentName",
      header: "Subject Name",
      className: "px-6 py-5 text-sm text-gray-700 font-semibold",
    },
    { key: "department", header: "Department", className: "px-6 py-5 text-sm text-gray-500" },
    { key: "subject", header: "Subject", className: "px-6 py-5 text-sm text-gray-700 font-medium" },
    {
      key: "marks",
      header: "Marks",
      className: "px-6 py-5 text-sm",
      render: (row) => <span className="text-green-600 font-bold">{row.marks}</span>,
    },
    { key: "grade", header: "Grade", className: "px-6 py-5 text-sm text-gray-700 font-bold" },
    {
      key: "results",
      header: "Results",
      className: "px-6 py-5 text-center",
      render: (row) => (
        <span
          className={[
            "px-6 py-1.5 rounded-full text-xs font-bold ring-1 ring-inset inline-block",
            row.results === "Pass"
              ? "bg-green-50 text-green-600 ring-green-100"
              : "bg-red-50 text-red-500 ring-red-100",
          ].join(" ")}
        >
          {row.results}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "px-6 py-5",
      render: () => (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] text-[#1D6BA3] border border-[#1D6BA3]/20 rounded-lg text-xs font-bold w-fit">
          <CheckCircle size={14} className="text-[#1D6BA3]" />
          <span>Published</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Bar Card */}
      <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 bg-white">
          <h2 className="text-base font-bold text-gray-800 tracking-tight">Results Update</h2>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center justify-center gap-2 px-6 h-11 border-2 border-[#1D6BA3] text-[#1D6BA3] font-bold rounded-xl hover:bg-blue-50 transition-all bg-white group"
              onClick={() => setShowBulkUpload(!showBulkUpload)}
            >
              <Upload size={18} className="text-[#1D6BA3]" />
              <span className="text-sm">Bulk Upload</span>
            </button>
            <button
              className="flex items-center justify-center gap-2 px-6 h-11 bg-[#1D6BA3] hover:bg-[#1A5F91] text-white font-bold rounded-xl transition-all shadow-sm group"
              onClick={() => navigate("/layout/results/add-individual")}
            >
              <Plus size={20} className="text-white" />
              <span className="text-sm">Add Individual Result</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Bulk Upload Zone */}
      {showBulkUpload && (
        <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Bulk Upload Via Excel
              </p>
              <button
                onClick={() => setShowBulkUpload(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold truncate"
              >
                Close
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-100 bg-gray-50/50 rounded-2xl py-12 flex flex-col items-center justify-center gap-3 hover:bg-gray-100/50 transition-all cursor-pointer group">
              <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Upload size={24} className="text-[#1D6BA3]" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Drop Files here</span> or{" "}
                  <span className="text-[#1D6BA3] font-black pointer-events-none">Choose file</span>
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                  Supports .xlsx, .xls, .csv
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Table Card */}
      <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <DataTable
          data={UPLOAD_DATA}
          columns={columns}
          headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
        />
      </Card>
    </div>
  );
};

export default ResultsUpdate;
