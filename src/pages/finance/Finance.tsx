import { useState, useEffect } from "react";
import { Search, CreditCard, ChevronDown, Check, X, Calendar } from "lucide-react";
import DataTable, { type Column } from "../../components/common/Table/DataTable";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";
import ManagementModal from "../../components/Layouts/ManagementModal";
import { 
  type ApplicationFee, 
  type AdmissionFee, 
  type RegularFee 
} from "../../types/interfaces";
import { 
  SEED_APPLICATION_FEES as APPLICATION_DATA,
  SEED_ADMISSION_FEES as ADMISSION_DATA,
  SEED_REGULAR_FEES as REGULAR_DATA
} from "../../types/mockData";

// ── Shared Filter Bar ────────────────────────────────────────────────────────
const FilterBar = ({ onCollect }: { onCollect: () => void }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 bg-white border-b border-gray-50">
    <div className="flex items-center gap-3">
      <h3 className="text-sm font-bold text-gray-800 tracking-tight">Fee Collection Tracking</h3>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[280px]">
        <input
          type="text"
          placeholder="Search by Application Number"
          className="w-full h-10 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] transition-all placeholder:text-gray-400"
        />
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      <button className="h-10 px-6 bg-[#1D6BA3] hover:bg-[#1A5F91] text-white text-sm font-bold rounded-lg transition-all shadow-sm">
        Search
      </button>
      <button className="h-10 px-6 border border-[#1D6BA3] text-[#1D6BA3] text-sm font-bold rounded-lg hover:bg-blue-50 transition-all">
        Clear
      </button>
      <button 
        onClick={onCollect}
        className="h-10 px-6 bg-[#1D6BA3] hover:bg-[#1A5F91] text-white text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2"
      >
        <CreditCard size={16} />
        Collect
      </button>
      <div className="relative min-w-[120px]">
        <select className="w-full h-10 px-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 appearance-none font-medium text-gray-600">
          <option>Status</option>
          <option>Paid</option>
          <option>Pending</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  </div>
);

const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Collect</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col items-center py-8 px-5 gap-3">
          <div className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30">
            <Check size={32} className="text-white" />
          </div>
          <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};

const Finance = () => {
  const [activeTab, setActiveTab] = useState("Application Fees");
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const TABS = ["Application Fees", "Admission Fees", "Regular Fees"];

  const handleCollectSubmit = () => {
    setIsCollectModalOpen(false);
    setSuccessMsg("Fees Collected Successfully");
  };

  const appColumns: Column<ApplicationFee>[] = [
    { 
      key: "selection", 
      header: <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1D6BA3]" />, 
      className: "w-12 px-6 py-4",
      render: () => <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1D6BA3]" />
    },
    { key: "name", header: "Applicant Name", className: "px-6 py-4 text-sm text-gray-800 font-medium" },
    { key: "appNo", header: "Application No.", className: "px-6 py-4 text-sm text-gray-600" },
    { key: "course", header: "Course Name", className: "px-6 py-4 text-sm text-gray-600" },
    { key: "type", header: "Program Type", className: "px-6 py-4 text-sm text-gray-600 font-medium" },
    { key: "amount", header: "Fee Amount", className: "px-6 py-4 text-sm", render: (row) => <span className="text-green-600 font-bold">{row.amount}</span> },
    { key: "dueDate", header: "Due Date", className: "px-6 py-4 text-sm text-gray-600" },
  ];

  const admColumns: Column<AdmissionFee>[] = [
    { 
      key: "selection", 
      header: <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1D6BA3]" />, 
      className: "w-12 px-6 py-4",
      render: () => <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1D6BA3]" />
    },
    { key: "appNo", header: "Application No.", className: "px-6 py-4 text-sm text-gray-600" },
    { key: "name", header: "Student Name", className: "px-6 py-4 text-sm text-gray-800 font-medium" },
    { key: "paidDate", header: "Paid Date", className: "px-6 py-4 text-sm text-gray-600" },
    { key: "totalAmount", header: "Total Amount", className: "px-6 py-4 text-sm", render: (row) => <span className="text-green-600 font-bold">{row.totalAmount}</span> },
    { key: "paidAmount", header: "Paid Amount", className: "px-6 py-4 text-sm", render: (row) => <span className="text-green-600 font-bold">{row.paidAmount}</span> },
    { 
      key: "balance", 
      header: "Balance", 
      className: "px-6 py-4 text-sm", 
      render: (row) => (
        <span className={`${row.isBalanceRed ? "text-red-600" : "text-green-600"} font-bold`}>
          {row.balance}
        </span>
      )
    },
  ];

  const regColumns: Column<RegularFee>[] = [
    { 
      key: "selection", 
      header: <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1D6BA3]" />, 
      className: "w-12 px-6 py-4",
      render: () => <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1D6BA3]" />
    },
    { key: "rollNo", header: "Roll Number", className: "px-6 py-4 text-sm text-gray-600" },
    { key: "name", header: "Student Name", className: "px-6 py-4 text-sm text-gray-800 font-medium" },
    { key: "scholarship", header: "Scholarship", className: "px-6 py-4 text-sm text-gray-800 font-medium" },
    { 
      key: "attendance", 
      header: "Attendance %", 
      className: "px-6 py-4 text-sm", 
      render: (row) => <span className={`${row.attendanceColor} font-bold`}>{row.attendance}</span> 
    },
    { 
      key: "fineApplicable", 
      header: "Fine Applicable", 
      className: "px-6 py-4 text-sm", 
      render: (row) => (
        <span className={`${row.fineApplicable === "Yes" ? "text-red-600" : "text-gray-800"} font-medium`}>
          {row.fineApplicable}
        </span>
      )
    },
    { key: "feeAmount", header: "Fee Amount", className: "px-6 py-4 text-sm", render: (row) => <span className="text-green-600 font-bold">{row.feeAmount}</span> },
    { key: "fineAmount", header: "Fine Amount", className: "px-6 py-4 text-sm", render: (row) => <span className="text-green-600 font-bold">{row.fineAmount}</span> },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 pt-5 bg-white">
          <h1 className="text-base font-black text-gray-800 tracking-tight mb-6">Finance Management</h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-8">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  "pb-4 text-sm font-bold transition-all relative",
                  activeTab === tab ? "text-[#1D6BA3]" : "text-gray-400 hover:text-gray-600",
                ].join(" ")}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D6BA3] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Content Card */}
      <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <FilterBar onCollect={() => setIsCollectModalOpen(true)} />
        <div className="overflow-x-auto">
          {activeTab === "Application Fees" && (
            <DataTable data={APPLICATION_DATA} columns={appColumns} headerRowClassName="bg-[#EFF6FF] border-b border-gray-100" />
          )}
          {activeTab === "Admission Fees" && (
            <DataTable data={ADMISSION_DATA} columns={admColumns} headerRowClassName="bg-[#EFF6FF] border-b border-gray-100" />
          )}
          {activeTab === "Regular Fees" && (
            <DataTable data={REGULAR_DATA} columns={regColumns} headerRowClassName="bg-[#EFF6FF] border-b border-gray-100" />
          )}
        </div>
      </Card>

      <ManagementModal 
        isOpen={isCollectModalOpen} 
        onClose={() => setIsCollectModalOpen(false)} 
        title={`Collect - ${activeTab}`}
        maxWidth="max-w-4xl"
        footer={
          <div className="flex justify-end gap-3 pb-1 pr-1">
            <Button variant="outline" className="border-[#1D6BA3] text-[#1D6BA3] font-semibold text-sm px-6" onClick={() => setIsCollectModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="bg-[#1D6BA3] hover:bg-[#1A5F91] text-sm font-semibold px-8" onClick={handleCollectSubmit}>Submit</Button>
          </div>
        }
      >
        {activeTab === "Application Fees" && (
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Application Number</label>
              <input type="text" value="APP-2024001" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Applicant Name</label>
              <input type="text" value="John Dow" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Course Name</label>
              <input type="text" value="BE Computer Science" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Program Type</label>
              <input type="text" value="UG" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Due Date</label>
              <div className="relative">
                <input type="text" value="10/05/2024" readOnly className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Fee Amount</label>
              <input type="text" value="500.00" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Payment Mode</label>
              <div className="relative">
                <select defaultValue="Cash" className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none">
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                  <option value="Cheque">Cheque</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Due Date</label>
              <div className="relative">
                <input type="text" value="10/05/2024" readOnly className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Admission Fees" && (
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Application Number</label>
              <input type="text" value="APP-2024001" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Applicant Name</label>
              <input type="text" value="John Dow" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Course Name</label>
              <input type="text" value="BE Computer Science" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Program Type</label>
              <input type="text" value="UG" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Due Date</label>
              <div className="relative">
                <input type="text" value="10/05/2024" readOnly className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Total Amount</label>
              <input type="text" value="500.00" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Payment Mode</label>
              <div className="relative">
                <select defaultValue="Cash" className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none">
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                  <option value="Cheque">Cheque</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Paid Date</label>
              <div className="relative">
                <input type="text" value="10/05/2024" readOnly className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Regular Fees" && (
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Roll Number</label>
              <input type="text" value="APP-2024001" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Student Name</label>
              <input type="text" value="John Dow" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Fee Amount</label>
              <input type="text" value="50000.00" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Fine Amount</label>
              <input type="text" value="1000.00" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Total Amount</label>
              <input type="text" value="51000.00" readOnly className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Due Date</label>
              <div className="relative">
                <input type="text" value="10/05/2024" readOnly className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Payment Mode</label>
              <div className="relative">
                <select defaultValue="Cash" className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none">
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                  <option value="Cheque">Cheque</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Paid Date</label>
              <div className="relative">
                <input type="text" value="10/05/2024" readOnly className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none" />
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              </div>
            </div>
          </div>
        )}
      </ManagementModal>

      {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg("")} />}
    </div>
  );
};

export default Finance;
