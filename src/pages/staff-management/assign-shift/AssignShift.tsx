import { useState } from "react";
import { DataTable, type Column } from "../../../components/common/Table/DataTable";
import Button from "../../../components/common/Button/Button";
import Badge from "../../../components/common/Badge";
import Modal from "../../../components/common/Modal/Modal";

// ── Types ─────────────────────────────────────────────────────────────────────

import { type EmployeeShiftData } from "../../../types/interfaces";

import { MOCK_EMPLOYEES_SHIFT } from "../../../types/mockData";

const AVAILABLE_SHIFTS = ["Morning", "Evening"];

// ── Component ─────────────────────────────────────────────────────────────────

const AssignShift = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isChooseShiftOpen, setIsChooseShiftOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState("Morning");

  const itemsPerPage = 7;
  const totalItems = MOCK_EMPLOYEES_SHIFT.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = MOCK_EMPLOYEES_SHIFT.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Selection helpers ──────────────────────────────────────────────────────
  const currentIds = currentItems.map((e) => e.id);
  const allCurrentSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.has(id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allCurrentSelected) {
        currentIds.forEach((id) => next.delete(id));
      } else {
        currentIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Assign flow ────────────────────────────────────────────────────────────
  const handleAssignClick = () => {
    setSelectedShift("Morning");
    setIsChooseShiftOpen(true);
  };

  const handleConfirmAssign = () => {
    setIsChooseShiftOpen(false);
    setIsSuccessOpen(true);
    setSelectedIds(new Set());
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: Column<EmployeeShiftData>[] = [
    {
      key: "checkbox",
      header: (
        <input
          type="checkbox"
          id="select-all-employees"
          checked={allCurrentSelected}
          onChange={toggleAll}
          className="rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3] w-4 h-4 cursor-pointer"
        />
      ),
      render: (item) => (
        <input
          type="checkbox"
          id={`select-employee-${item.id}`}
          checked={selectedIds.has(item.id)}
          onChange={() => toggleOne(item.id)}
          className="rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3] w-4 h-4 cursor-pointer"
        />
      ),
      className: "w-12 px-6",
    },
    {
      key: "name",
      header: "Name",
      render: (item) => (
        <span className="font-medium text-gray-800">{item.name}</span>
      ),
    },
    { key: "department", header: "Department" },
    { key: "designation", header: "Designation" },
    { key: "branch", header: "Branch" },
    {
      key: "shiftName",
      header: "Shift Name",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-700">{item.shiftName}</span>
          {item.isDefault && (
            <Badge
              variant="info"
              pill
              className="bg-[#EBF5FB] text-[#2884C6] border-transparent font-medium text-xs"
            >
              Default
            </Badge>
          )}
        </div>
      ),
    },
  ];

  const hasSelection = selectedIds.size > 0;

  return (
    <div className="w-full">
      {/* ── Choose Shift Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={isChooseShiftOpen}
        onClose={() => setIsChooseShiftOpen(false)}
        title="Choose Shift To Assign"
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="ghost"
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 h-9 font-semibold rounded-md"
              onClick={() => setIsChooseShiftOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 px-6 h-9 font-semibold rounded-md shadow-sm shadow-[#1D6BA3]/20"
              onClick={handleConfirmAssign}
            >
              Assign Shifts
            </Button>
          </div>
        }
      >
        <div className="py-4 space-y-4">
          <p className="text-sm font-medium text-gray-600">Shift Name</p>
          <div className="flex items-center gap-8">
            {AVAILABLE_SHIFTS.map((shift) => (
              <label
                key={shift}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="shift-selector"
                  id={`shift-radio-${shift.toLowerCase()}`}
                  value={shift}
                  checked={selectedShift === shift}
                  onChange={() => setSelectedShift(shift)}
                  className="w-5 h-5 border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3] cursor-pointer"
                />
                <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {shift}
                </span>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      {/* ── Shift Assigned Successfully Modal ─────────────────────────────── */}
      <Modal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title=""
        size="md"
      >
        <div className="py-16 flex flex-col items-center text-center px-6">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5">
            <svg
              className="w-7 h-7 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-900">
            Shift Assigned Successfully
          </p>
        </div>
      </Modal>

      {/* ── Page Content ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">
            Assign Shift To Employees
          </h1>
          <Button
            variant="primary"
            id="assign-shift-btn"
            className={`font-medium px-5 py-2 text-sm rounded-lg transition-all ${
              !hasSelection ? "opacity-50 cursor-not-allowed" : "shadow-md shadow-[#1D6BA3]/20"
            }`}
            onClick={hasSelection ? handleAssignClick : undefined}
          >
            Assign Shift
          </Button>
        </div>

        {/* Table */}
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
  );
};

export default AssignShift;
