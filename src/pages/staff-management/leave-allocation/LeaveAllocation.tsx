import { useState } from "react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button/Button";
import DataTable, { type Column } from "../../../components/common/Table/DataTable";
import PageHeader from "../../../components/common/PageHeader";
import { CheckIcon, CloseIcon } from "../../../components/common/Icons";
import Modal from "../../../components/common/Modal/Modal";

import { type LeaveAllocationItem } from "../../../types/interfaces";

import { MOCK_LEAVE_ALLOCATIONS } from "../../../types/mockData";

const LeaveAllocation = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<"allocation" | "balance">("allocation");
  const [isChooseModalOpen, setIsChooseModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState<string[]>([]);
  const [adjustData, setAdjustData] = useState({
    leaveType: "",
    count: "",
    remarks: "",
  });
  const itemsPerPage = 8;

  // Pagination logic
  const totalItems = MOCK_LEAVE_ALLOCATIONS.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = MOCK_LEAVE_ALLOCATIONS.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = () => {
    if (selectedRows.length === currentItems.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentItems.map((item) => item.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const columns: Column<LeaveAllocationItem>[] = [
    {
      key: "selection",
      header: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]"
            checked={selectedRows.length === currentItems.length && currentItems.length > 0}
            onChange={handleSelectAll}
          />
        </div>
      ),
      className: "w-12 px-4",
      render: (item) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]"
            checked={selectedRows.includes(item.id)}
            onChange={() => handleSelectRow(item.id)}
          />
        </div>
      ),
    },
    {
      key: "employeeId",
      header: "Employee ID",
      className: "px-6 py-4 text-sm text-gray-700",
    },
    {
      key: "name",
      header: "Name",
      className: "px-6 py-4 text-sm text-gray-700",
    },
    {
      key: "department",
      header: "Department",
      className: "px-6 py-4 text-sm text-gray-700",
    },
    {
      key: "designation",
      header: "Designation",
      className: "px-6 py-4 text-sm text-gray-700",
    },
    {
      key: "earnedLeave",
      header: "Earned Leave",
      className: "px-6 py-4 text-sm text-gray-700",
      render: (item) =>
        view === "allocation" ? (
          item.earnedLeave ? (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckIcon size={16} />
              <span>(4)</span>
            </div>
          ) : null
        ) : (
          <span className="text-gray-700">{item.earnedBalance}</span>
        ),
    },
    {
      key: "casualLeave",
      header: "Casual Leave",
      className: "px-6 py-4 text-sm text-gray-700",
      render: (item) =>
        view === "allocation" ? (
          item.casualLeave ? (
            <div className="flex items-center gap-2 text-red-500 font-medium">
              <CheckIcon size={16} />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-500 font-medium">
              <CloseIcon size={16} />
            </div>
          )
        ) : (
          <span className="text-gray-700">{item.casualBalance}</span>
        ),
    },
  ];

  const headerActions =
    view === "allocation" ? (
      <>
        <Button
          variant="ghost"
          className="text-[#1D6BA3] border border-[#1D6BA3] hover:bg-[#1D6BA3]/5 h-9 px-4 font-semibold text-xs"
          onClick={() => setView("balance")}
        >
          Manage Leave Balance
        </Button>
        <Button
          variant="primary"
          className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-9 px-4 font-semibold text-xs text-white"
          onClick={() => setIsChooseModalOpen(true)}
          disabled={selectedRows.length === 0}
        >
          Bulk Assign
        </Button>
      </>
    ) : (
      <Button
        variant="primary"
        className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-9 px-6 font-semibold text-xs text-white"
        onClick={() => setIsAdjustModalOpen(true)}
      >
        Bulk Adjust
      </Button>
    );

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-4 w-full">
        {view === "balance" && (
          <button
            onClick={() => {
              setView("allocation");
              setSelectedRows([]);
            }}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 flex items-center gap-4"
          >
            <span>
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </span>
            <span>Leave Allocation</span>
          </button>
        )}
        <div className="flex-1">
          {view === "allocation" && (
            <PageHeader title="Leave Allocation" actions={headerActions} />
          )}
        </div>
      </div>

      {view === "allocation" ? (
        <Card noPadding className="border-gray-100 overflow-hidden">
          <DataTable
            data={currentItems}
            columns={columns}
            pagination={{
              currentPage: currentPage,
              totalPages: totalPages,
              pageSize: itemsPerPage,
              total: totalItems,
              onPageChange: (page) => setCurrentPage(page),
            }}
            showPagination={true}
            containerClassName="border-none"
            headerRowClassName="bg-[#F8FBFF]"
          />
        </Card>
      ) : (
        <Card noPadding className="border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Leave Balance</h2>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-9 px-6 font-semibold text-xs text-white"
              onClick={() => setIsAdjustModalOpen(true)}
            >
              Bulk Adjust
            </Button>
          </div>
          <DataTable
            data={currentItems}
            columns={columns}
            pagination={{
              currentPage: currentPage,
              totalPages: totalPages,
              pageSize: itemsPerPage,
              total: totalItems,
              onPageChange: (page) => setCurrentPage(page),
            }}
            showPagination={true}
            containerClassName="border-none"
            headerRowClassName="bg-[#F8FBFF]"
          />
        </Card>
      )}

      {/* Choose Leave Modal */}
      <Modal
        isOpen={isChooseModalOpen}
        onClose={() => setIsChooseModalOpen(false)}
        title="Choose Leave To Allocate"
        size="md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="ghost"
              className="border border-[#1D6BA3] text-[#1D6BA3] px-6"
              onClick={() => setIsChooseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] px-8"
              onClick={() => {
                setIsChooseModalOpen(false);
                setIsConfirmModalOpen(true);
              }}
              disabled={selectedLeaveTypes.length === 0}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="py-4 px-2">
          <p className="text-sm font-medium text-gray-500 mb-6">Choose Leave to Allocate</p>
          <div className="flex items-center gap-12">
            {["Earned Leave", "Casual Leave"].map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3] transition-all"
                  checked={selectedLeaveTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLeaveTypes((prev) => [...prev, type]);
                    } else {
                      setSelectedLeaveTypes((prev) => prev.filter((t) => t !== type));
                    }
                  }}
                />
                <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Allocate Leave"
        size="md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="ghost"
              className="border border-[#1D6BA3] text-[#1D6BA3] px-8"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              No
            </Button>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] px-8"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setIsSuccessModalOpen(true);
              }}
            >
              Yes
            </Button>
          </div>
        }
      >
        <div className="py-12 flex flex-col items-center text-center px-6">
          <p className="text-lg font-medium text-gray-800 leading-relaxed max-w-[360px]">
            Are You Sure You Want To Allocate{" "}
            <span className="font-bold">{selectedLeaveTypes.join(" & ")}</span> Leaves To{" "}
            {selectedRows.length || 1} Selected Employees?
          </p>
        </div>
      </Modal>

      {/* Bulk Adjust Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Bulk Adjust Leave Balance"
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="ghost"
              className="border border-[#1D6BA3] text-[#1D6BA3] px-8"
              onClick={() => setIsAdjustModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] px-8"
              onClick={() => {
                setIsAdjustModalOpen(false);
                setIsSuccessModalOpen(true);
                // Auto-close success modal after 2 seconds
                setTimeout(() => {
                  setIsSuccessModalOpen(false);
                }, 2000);
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="py-2 space-y-6">
          <div className="flex gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Choose Leave <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10"
                value={adjustData.leaveType}
                onChange={(e) => setAdjustData({ ...adjustData, leaveType: e.target.value })}
              >
                <option value="">Select</option>
                <option value="Comp Off">Comp Off</option>
                <option value="Earned Leave">Earned Leave</option>
                <option value="Casual Leave">Casual Leave</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Update Leave Balance Count <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter"
                className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10"
                value={adjustData.count}
                onChange={(e) => setAdjustData({ ...adjustData, count: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter"
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 resize-none"
              value={adjustData.remarks}
              onChange={(e) => setAdjustData({ ...adjustData, remarks: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Add"
        size="md"
      >
        <div className="flex flex-col items-center py-8 gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30 animate-in zoom-in duration-500">
            <CheckIcon size={38} className="text-white stroke-[3]" />
          </div>
          <div className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-lg font-bold text-gray-900">Leave Successfully Updated</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveAllocation;
