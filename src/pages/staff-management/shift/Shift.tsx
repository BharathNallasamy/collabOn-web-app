import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "../../../components/common/Table/DataTable";
import Button from "../../../components/common/Button/Button";
import Badge from "../../../components/common/Badge";
import Card from "../../../components/common/Card";
import { Check, Clock } from "lucide-react";
import Modal from "../../../components/common/Modal/Modal";
import { type ShiftData } from "../../../types/interfaces";

import { MOCK_SHIFTS } from "../../../types/mockData";

const InputField = ({
  label,
  value,
  onChange,
  placeholder = "Enter Name",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="flex-1 min-w-[300px] space-y-1.5">
    <label className="text-sm font-medium text-gray-700 block">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50 placeholder-gray-400 h-10 transition-all"
    />
  </div>
);

const TimeInputField = ({
  label,
  value,
  onChange,
  placeholder = "Choose to Time",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="flex-1 min-w-[300px] space-y-1.5">
    <label className="text-sm font-medium text-gray-700 block">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Clock size={16} strokeWidth={2.5} className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50 placeholder-gray-400 h-10 transition-all font-medium"
      />
    </div>
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

const Shift = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "create">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    shiftName: "",
    startTime: "",
    endTime: "",
    graceTime: "",
    remark: "",
  });
  const [isShiftCreatedModalOpen, setIsShiftCreatedModalOpen] = useState(false);
  const [isAdjustHoursModalOpen, setIsAdjustHoursModalOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({
    mode: "fixed",
    startTime: "",
    endTime: "",
  });

  const handleSave = () => {
    setIsShiftCreatedModalOpen(true);
  };

  const totalItems = MOCK_SHIFTS.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = MOCK_SHIFTS.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<ShiftData>[] = [
    {
      key: "checkbox",
      header: (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3] w-4 h-4"
        />
      ),
      render: () => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3] w-4 h-4 cursor-pointer"
        />
      ),
      className: "w-12 px-6",
    },
    {
      key: "name",
      header: "Shift Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-700">{item.name}</span>
          {item.isDefault && (
            <Badge
              variant="info"
              pill
              className="bg-[#EBF5FB] text-[#2884C6] border-transparent font-medium"
            >
              Default
            </Badge>
          )}
        </div>
      ),
    },
    { key: "sunday", header: "Sunday" },
    { key: "monday", header: "Monday" },
    { key: "tuesday", header: "Tuesday" },
    { key: "wednesday", header: "Wednesday" },
    { key: "thursday", header: "Thursday" },
    { key: "friday", header: "Friday" },
    { key: "saturday", header: "Saturday" },
  ];

  return (
    <div className="w-full">


      {/* Shift Created Modal */}
      <Modal
        isOpen={isShiftCreatedModalOpen}
        onClose={() => setIsShiftCreatedModalOpen(false)}
        title=""
        size="md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="ghost"
              className="border border-[#1D6BA3] text-[#1D6BA3] px-8 h-10 font-bold"
              onClick={() => {
                setIsShiftCreatedModalOpen(false);
              }}
            >
              Later
            </Button>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] px-8 h-10 font-bold shadow-lg shadow-[#1D6BA3]/20"
              onClick={() => {
                setIsShiftCreatedModalOpen(false);
                setIsAdjustHoursModalOpen(true);
              }}
            >
              Assign Shift
            </Button>
          </div>
        }
      >
        <div className="py-12 flex flex-col items-center text-center px-6 gap-6">
          <div className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30 animate-in zoom-in duration-500">
            <Check size={32} className="text-white stroke-[3]" />
          </div>
          <p className="text-lg font-bold text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Shift Created Successfully
          </p>
        </div>
      </Modal>

      {/* Adjust Working Hours Modal */}
      <Modal
        isOpen={isAdjustHoursModalOpen}
        onClose={() => setIsAdjustHoursModalOpen(false)}
        title="Adjust Full Day/Half Day Hours"
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="ghost"
              className="border border-[#1D6BA3] text-[#1D6BA3] px-8"
              onClick={() => setIsAdjustHoursModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] px-8"
              onClick={() => {
                setIsAdjustHoursModalOpen(false);
                setView("list");
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="py-6 px-4 space-y-8">
          <div className="space-y-4">
            <p className="text-[15px] font-medium text-gray-600">Select</p>
            <div className="flex items-center gap-10">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="workMode"
                  className="w-5 h-5 border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]"
                  checked={adjustData.mode === "fixed"}
                  onChange={() => setAdjustData((p) => ({ ...p, mode: "fixed" }))}
                />
                <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  Fixed Working Hours Per Day
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="workMode"
                  className="w-5 h-5 border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]"
                  checked={adjustData.mode === "shift"}
                  onChange={() => setAdjustData((p) => ({ ...p, mode: "shift" }))}
                />
                <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  Shift Wise Working Hours
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-2">
            <div className="space-y-2">
              <label className="text-[15px] font-medium text-gray-700">Start Time</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Clock size={18} className="text-gray-400 group-focus-within:text-[#1D6BA3] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Choose to Time"
                  value={adjustData.startTime}
                  onChange={(e) => setAdjustData((p) => ({ ...p, startTime: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3 text-[15px] border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] h-12 transition-all placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[15px] font-medium text-gray-700">End Time</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Clock size={18} className="text-gray-400 group-focus-within:text-[#1D6BA3] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Choose to Time"
                  value={adjustData.endTime}
                  onChange={(e) => setAdjustData((p) => ({ ...p, endTime: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3 text-[15px] border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] h-12 transition-all placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {view === "create" ? (
        <div className="space-y-6">
          <Card noPadding className="border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h1 className="text-base font-bold text-gray-900">Create Shift</h1>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-6">
                  <InputField
                    label="Shift Name"
                    value={formData.shiftName}
                    onChange={(v) => setFormData((p) => ({ ...p, shiftName: v }))}
                  />
                </div>

                <div className="flex flex-wrap gap-6">
                  <TimeInputField
                    label="Start Time"
                    value={formData.startTime}
                    onChange={(v) => setFormData((p) => ({ ...p, startTime: v }))}
                  />
                  <TimeInputField
                    label="End Time"
                    value={formData.endTime}
                    onChange={(v) => setFormData((p) => ({ ...p, endTime: v }))}
                  />
                  <TimeInputField
                    label="Grace Time Allowed"
                    value={formData.graceTime}
                    onChange={(v) => setFormData((p) => ({ ...p, graceTime: v }))}
                  />
                </div>

                <TextAreaField
                  label="Remark"
                  value={formData.remark}
                  onChange={(v) => setFormData((p) => ({ ...p, remark: v }))}
                />
              </div>
            </div>
          </Card>

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
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 px-2">Shifts</h2>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="border border-[#1D6BA3]/30 text-[#1D6BA3] hover:bg-[#1D6BA3]/5 font-medium px-4 py-2 text-sm rounded-lg"
                onClick={() => navigate("/layout/staff-management/assign-shift")}
              >
                Manage Shift
              </Button>
              <Button
                variant="ghost"
                className="border border-[#1D6BA3]/30 text-[#1D6BA3] hover:bg-[#1D6BA3]/5 font-medium px-4 py-2 text-sm rounded-lg"
                onClick={() => setIsAdjustHoursModalOpen(true)}
              >
                Set Working Hours
              </Button>
              <Button
                variant="primary"
                className="font-medium px-4 py-2 text-sm rounded-lg"
                onClick={() => setView("create")}
              >
                Create Shift
              </Button>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DataTable
              data={currentItems}
              columns={columns}
              headerRowClassName="bg-[#F8FBFC] border-b border-gray-200"
              showPagination={true}
              pagination={{
                currentPage: currentPage,
                totalPages: totalPages,
                pageSize: itemsPerPage,
                total: totalItems,
                onPageChange: (page) => setCurrentPage(page),
              }}
            />
          </div>
        </div>
      )}

        </div>
  );
};

export default Shift;

