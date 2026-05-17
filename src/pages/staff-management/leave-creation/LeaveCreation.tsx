import { useState } from "react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button/Button";
import DataTable, { type Column } from "../../../components/common/Table/DataTable";
import {
  EditIcon,
  DocumentIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
} from "../../../components/common/Icons";
import Modal from "../../../components/common/Modal/Modal";
import { type LeaveTemplateItem } from "../../../types/interfaces";

import { MOCK_LEAVE_TEMPLATES } from "../../../types/mockData";

const InputField = ({
  label,
  required,
  value,
  onChange,
  placeholder = "Enter Name",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="flex-1 min-w-[300px] space-y-1.5">
    <label className="text-sm font-medium text-gray-700 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50 placeholder-gray-400 h-10 transition-all"
    />
  </div>
);

const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder = "Enter",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="w-full space-y-1.5">
    <label className="text-sm font-medium text-gray-700 block">{label}</label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50 placeholder-gray-400 transition-all resize-none"
    />
  </div>
);

const FormRadioGroup = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center gap-x-8 flex-1">
    {options.map((opt) => (
      <label key={opt} className="flex items-center gap-2.5 cursor-pointer group min-w-[180px]">
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="appearance-none w-5 h-5 rounded-full border-2 border-gray-300 checked:border-[#1D6BA3] transition-all group-hover:border-gray-400"
          />
          {value === opt && (
            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#1D6BA3] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
          {opt}
        </span>
      </label>
    ))}
  </div>
);

const LeaveCreation = () => {
  const [view, setView] = useState<"list" | "create">("list");
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form State
  const [formData, setFormData] = useState({
    leaveName: "",
    alias: "",
    description: "",
    autoAllocation: "",
    allocationType: "Every Month",
    carryForward: "",
    carryForwardType: "End of Every Month",
  });

  const handleSave = () => {
    setShowSuccess(true);
    // Automatically close and navigate back after 2 seconds
    setTimeout(() => {
      handleModalClose();
    }, 2000);
  };

  const handleModalClose = () => {
    setShowSuccess(false);
    setView("list");
    setFormData({
      leaveName: "",
      alias: "",
      description: "",
      autoAllocation: "",
      allocationType: "Every Month",
      carryForward: "",
      carryForwardType: "End of Every Month",
    });
  };

  const totalItems = MOCK_LEAVE_TEMPLATES.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = MOCK_LEAVE_TEMPLATES.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<LeaveTemplateItem>[] = [
    {
      key: "leaveName",
      header: "Leave Name",
      className: "px-6 py-4 text-sm text-gray-700",
    },
    {
      key: "alias",
      header: "Alias",
      className: "px-6 py-4 text-sm text-gray-700",
    },
    {
      key: "autoAllocation",
      header: "Auto Allocation",
      className: "px-6 py-4 text-sm text-gray-700",
    },
    {
      key: "carryForward",
      header: "Carry Forward",
      className: "px-6 py-4 text-sm text-gray-700",
    },
    {
      key: "carryForwardDate",
      header: "Carry Forward",
      className: "px-6 py-4 text-sm text-gray-700",
    },
    {
      key: "actions",
      header: "Actions",
      className: "px-6 py-4 text-sm text-gray-700 text-center",
      render: () => (
        <div className="flex items-center justify-center gap-3">
          <button className="text-[#1D6BA3] hover:text-[#1D6BA3]/80 p-1 rounded-md hover:bg-gray-50 transition-colors">
            <EditIcon size={16} />
          </button>
          <button className="text-[#1D6BA3] hover:text-[#1D6BA3]/80 p-1 rounded-md hover:bg-gray-50 transition-colors">
            <DocumentIcon size={16} />
          </button>
          <button className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors">
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (view === "create") {
    return (
      <div className="space-y-6">
        <Card noPadding className="border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h1 className="text-base font-bold text-gray-900">Create New Leave Template</h1>
          </div>
          <div className="p-6">
            <div className="space-y-8">
              <div className="flex flex-wrap gap-6">
                <InputField
                  label="Leave Name"
                  value={formData.leaveName}
                  onChange={(v) => setFormData((p) => ({ ...p, leaveName: v }))}
                />
                <InputField
                  label="Alias"
                  value={formData.alias}
                  onChange={(v) => setFormData((p) => ({ ...p, alias: v }))}
                />
              </div>

              <TextAreaField
                label="Description"
                value={formData.description}
                onChange={(v) => setFormData((p) => ({ ...p, description: v }))}
              />

              <div className="space-y-1.5 flex-1 max-w-[900px]">
                <label className="text-sm font-medium text-gray-700 block">
                  Number of Auto Allocation Leaves <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-8">
                  <div className="flex-1 max-w-[300px]">
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={formData.autoAllocation}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, autoAllocation: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50 placeholder-gray-400 h-10 transition-all"
                    />
                  </div>
                  <FormRadioGroup
                    options={["Every Month", "Every Academic Year"]}
                    value={formData.allocationType}
                    onChange={(v) => setFormData((p) => ({ ...p, allocationType: v }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex-1 max-w-[900px] mb-4">
                <label className="text-sm font-medium text-gray-700 block">
                  Carry Forward <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-8">
                  <div className="flex-1 max-w-[300px]">
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={formData.carryForward}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, carryForward: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50 placeholder-gray-400 h-10 transition-all"
                    />
                  </div>
                  <FormRadioGroup
                    options={["End of Every Month", "End of Every Academic Year"]}
                    value={formData.carryForwardType}
                    onChange={(v) => setFormData((p) => ({ ...p, carryForwardType: v }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <SuccessModal
          isOpen={showSuccess}
          onClose={handleModalClose}
        />

        {/* Action Footer */}
        <div className="bg-white rounded-xl px-5 py-3.5 shadow-sm border border-gray-200 flex justify-end gap-3 mt-4">
          <Button
            variant="ghost"
            className="border border-[#1D6BA3] text-[#1D6BA3] hover:bg-gray-50 h-9 px-6 rounded-md font-semibold"
            onClick={() => setView("list")}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-9 px-8 rounded-md font-semibold"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card noPadding className="border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">Leave Template</h1>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="border border-gray-300 text-gray-700 hover:text-[#1D6BA3] hover:border-[#1D6BA3]/50 h-10 px-4"
              onClick={() => setView("create")}
            >
              <span className="font-semibold text-sm">Allocate Leaves</span>
            </Button>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-10 px-4"
              icon={<PlusIcon size={18} />}
              onClick={() => setView("create")}
            >
              <span className="font-semibold text-sm">Create New Leave</span>
            </Button>
          </div>
        </div>

        <DataTable
          data={currentItems}
          columns={columns}
          headerRowClassName="bg-[#F8FBFF] border-b border-gray-100"
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            pageSize: itemsPerPage,
            total: totalItems,
            onPageChange: (page) => setCurrentPage(page),
          }}
          showPagination={true}
        />
      </Card>
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Add" size="md">
    <div className="flex flex-col items-center py-8 gap-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30 animate-in zoom-in duration-500">
        <CheckIcon size={38} className="text-white stroke-[3]" />
      </div>
      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-xl font-bold text-gray-900">Leave Template Created Successfully</h2>
      </div>
    </div>
  </Modal>
);

export default LeaveCreation;
