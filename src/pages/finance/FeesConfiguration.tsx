import { useState, useEffect } from "react";
import { Plus, Pencil, FileText, Check, X, ChevronDown } from "lucide-react";
import DataTable, { type Column } from "../../components/common/Table/DataTable";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";
import ManagementModal from "../../components/Layouts/ManagementModal";

import { type FeeCategory } from "../../types/interfaces";
import { SEED_FEE_CATEGORIES as MOCK_DATA } from "../../types/mockData";


const FeeTypeBadge = ({ type }: { type: string }) => {
  if (type === "Department /Degree Fee") {
    return <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FDF4FF] text-[#C026D3] text-xs font-semibold">{type}</span>;
  }
  return <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EFF6FF] text-[#3B82F6] text-xs font-semibold">{type}</span>;
};

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

const FeesConfiguration = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSave = () => {
    setIsModalOpen(false);
    setSuccessMsg("Category added successfully");
  };

  const columns: Column<FeeCategory>[] = [
    { key: "categoryName", header: "Category Name", className: "px-6 py-4 text-sm text-gray-700 font-medium" },
    { key: "description", header: "Description", className: "px-6 py-4 text-sm text-gray-600" },
    { key: "feeType", header: "Fee Type", className: "px-6 py-4", render: (row) => <FeeTypeBadge type={row.feeType} /> },
    { key: "frequency", header: "Frequency", className: "px-6 py-4 text-sm text-gray-600" },
    {
      key: "actions",
      header: <div className="text-center w-full">Actions</div>,
      className: "px-6 py-4 text-center",
      render: () => (
        <div className="flex items-center justify-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors">
            <Pencil size={14} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors">
            <FileText size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 bg-white">
          <h1 className="text-base font-bold text-gray-900 tracking-tight">Finance Management</h1>
        </div>
      </Card>

      <Card noPadding className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <h2 className="text-base font-bold text-gray-900">Fee Categories</h2>
          <Button variant="primary" icon={<Plus size={16} />} className="text-sm font-medium px-4 py-2" onClick={() => setIsModalOpen(true)}>
            Add Category
          </Button>
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
        title="Add Category"
        maxWidth="max-w-2xl"
        footer={
          <div className="flex justify-end gap-3 pb-1 pr-1">
            <Button variant="outline" className="border-[#1D6BA3] text-[#1D6BA3] font-semibold text-sm px-5" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="text-sm font-semibold px-5" onClick={handleSave}>Save</Button>
          </div>
        }
      >
        <div className="space-y-5 mb-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Category Name</label>
            <input type="text" placeholder="Enter" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Description</label>
            <textarea placeholder="Enter" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Fee Type</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-10 pl-3 pr-10 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none font-medium text-gray-500">
                  <option value="" disabled>Select</option>
                  <option value="common">Common Fees</option>
                  <option value="dept">Department /Degree Fee</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Frequency</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-10 pl-3 pr-10 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none font-medium text-gray-500">
                  <option value="" disabled>Select</option>
                  <option value="annual">Annual</option>
                  <option value="semester">Semester - Wise</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </ManagementModal>

      {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg("")} />}
    </div>
  );
};

export default FeesConfiguration;
