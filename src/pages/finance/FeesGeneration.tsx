import { useState, useEffect } from "react";
import { RefreshCw, ChevronDown, Calendar, Check, X, Zap } from "lucide-react";
import DataTable, { type Column } from "../../components/common/Table/DataTable";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";
import ManagementModal from "../../components/Layouts/ManagementModal";

import { type FeeGeneration } from "../../types/interfaces";
import { SEED_FEE_GENERATIONS as MOCK_DATA } from "../../types/mockData";


const renderFee = (amount: string) => (
  <span className="text-green-600 font-bold">{amount}</span>
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
          <h3 className="text-[14px] font-bold text-gray-900">Saved</h3>
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

const FeesGeneration = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleGenerate = () => {
    setIsModalOpen(false);
    setSuccessMsg("Fees generated and notified successfully");
  };

  const columns: Column<FeeGeneration>[] = [
    { key: "department", header: "Department", className: "px-6 py-4 text-sm text-gray-800 font-medium whitespace-nowrap" },
    { key: "courseName", header: "Course Name", className: "px-6 py-4 text-sm text-gray-600 whitespace-nowrap" },
    { key: "frequency", header: "Frequency", className: "px-6 py-4 text-sm text-gray-600 whitespace-nowrap" },
    { key: "tuitionFee", header: "Tuition Fee", className: "px-6 py-4 text-sm whitespace-nowrap", render: (row) => renderFee(row.tuitionFee) },
    { key: "labFee", header: "Lab Fee", className: "px-6 py-4 text-sm whitespace-nowrap", render: (row) => renderFee(row.labFee) },
    { key: "examFee", header: "Exam Fee", className: "px-6 py-4 text-sm whitespace-nowrap", render: (row) => renderFee(row.examFee) },
    { key: "transportFee", header: "Transport Fee", className: "px-6 py-4 text-sm whitespace-nowrap", render: (row) => renderFee(row.transportFee) },
  ];

  return (
    <div className="space-y-6">
      <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 bg-white">
          <h1 className="text-base font-bold text-gray-900 tracking-tight">Finance Management</h1>
        </div>
      </Card>

      <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between px-6 py-4 border-b border-gray-100 bg-white gap-4">
          <h2 className="text-base font-bold text-gray-900 whitespace-nowrap">Bulk Fee Generation</h2>
          
          <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto">
            <div className="relative min-w-[140px] flex-1 sm:flex-none">
              <select defaultValue="" className="w-full h-10 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none font-medium text-gray-500">
                <option value="" disabled>Department</option>
                <option value="cse">CSE</option>
                <option value="all">ALL</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative min-w-[140px] flex-1 sm:flex-none">
              <select defaultValue="" className="w-full h-10 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none font-medium text-gray-500">
                <option value="" disabled>Program Type</option>
                <option value="ug">UG</option>
                <option value="pg">PG</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative min-w-[140px] flex-1 sm:flex-none">
              <select defaultValue="" className="w-full h-10 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none font-medium text-gray-500">
                <option value="" disabled>Semester</option>
                <option value="sem5">Semester 5</option>
                <option value="annual">Annual</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative min-w-[150px] flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Academic Year"
                className="block w-full h-10 pl-9 pr-3 border border-gray-200 rounded-lg text-sm bg-white placeholder-gray-500 font-medium focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]"
              />
            </div>

            <Button
              variant="primary"
              icon={<RefreshCw size={16} />}
              className="text-sm font-medium px-4 py-2 whitespace-nowrap lg:ml-2"
              onClick={() => setIsModalOpen(true)}
            >
              Bulk Generate
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            data={MOCK_DATA}
            columns={columns}
            headerRowClassName="bg-[#F8FAFC] border-b border-gray-100"
          />
        </div>
      </Card>

      <ManagementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Bulk Generate Fees"
        maxWidth="max-w-xl"
        footer={
          <div className="flex justify-end gap-3 pb-1 pr-1">
            <Button variant="outline" className="border-[#1D6BA3] text-[#1D6BA3] font-semibold text-sm px-5" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="text-sm font-semibold px-5" onClick={handleGenerate}>Generate & Notify</Button>
          </div>
        }
      >
        <div className="bg-[#EFF6FF] text-[#1D6BA3] p-4 rounded-lg flex items-center gap-3 font-medium text-[15px] mb-6 border border-[#1D6BA3]/10">
          <Zap size={18} className="fill-[#1D6BA3]" /> Generating Fees for 3 selected students .
        </div>
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-600 mb-2">Due Date</label>
          <div className="relative w-full sm:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <input type="text" placeholder="dd/mm/yyyy" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]" />
          </div>
        </div>
      </ManagementModal>

      {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg("")} />}
    </div>
  );
};

export default FeesGeneration;
