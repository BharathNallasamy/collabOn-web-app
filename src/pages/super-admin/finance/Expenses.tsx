import { useState } from "react";
import { Search, Plus, Pencil, Download } from "lucide-react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button/Button";
import DataTable, { type Column } from "../../../components/common/Table/DataTable";
import Modal from "../../../components/common/Modal/Modal";
import CustomDropdown from "../../../components/common/Dropdown";
import DatePicker from "../../../components/common/DatePicker";
import { type ExpenseListing, type ExpenseMaster } from "../../../types/interfaces";
import { MOCK_EXPENSE_LISTING as MOCK_LISTING, MOCK_EXPENSE_MASTER as MOCK_MASTER_DATA } from "../../../types/mockData";

const SuperAdminExpenses = () => {
  const [activeTab, setActiveTab] = useState<"listing" | "master">("listing");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddMasterModalOpen, setIsAddMasterModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<"active" | "inactive">("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [masterSearchTerm, setMasterSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState<"listing" | "add">("listing");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [masterData, setMasterData] = useState<ExpenseMaster[]>(MOCK_MASTER_DATA);
  const [editingMaster, setEditingMaster] = useState<ExpenseMaster | null>(null);
  const [masterForm, setMasterForm] = useState({ title: "", status: true });

  const [addRows, setAddRows] = useState([
    {
      id: 1,
      selected: false,
      reason: "",
      amount: "",
      explanation: "",
      employee: "",
      paymentStatus: "Paid",
      paidFrom: "From Cash",
      referenceNo: "",
      paidBy: "",
    },
    {
      id: 2,
      selected: false,
      reason: "",
      amount: "",
      explanation: "",
      employee: "",
      paymentStatus: "Paid",
      paidFrom: "From Bak",
      referenceNo: "",
      paidBy: "",
    },
    {
      id: 3,
      selected: false,
      reason: "",
      amount: "",
      explanation: "",
      employee: "",
      paymentStatus: "Unpaid",
      paidFrom: "Select",
      referenceNo: "",
      paidBy: "",
    },
    {
      id: 4,
      selected: false,
      reason: "",
      amount: "",
      explanation: "",
      employee: "",
      paymentStatus: "Unpaid",
      paidFrom: "Select",
      referenceNo: "",
      paidBy: "",
    },
  ]);

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      selected: false,
      reason: "",
      amount: "",
      explanation: "",
      employee: "",
      paymentStatus: "Unpaid",
      paidFrom: "Select",
      referenceNo: "",
      paidBy: "",
    };
    setAddRows([...addRows, newRow]);
  };

  const toggleSelectAll = (checked: boolean) => {
    setAddRows(addRows.map((row) => ({ ...row, selected: checked })));
  };

  const toggleSelectRow = (id: number) => {
    setAddRows(addRows.map((row) => (row.id === id ? { ...row, selected: !row.selected } : row)));
  };

  const handleClearRow = (id: number) => {
    setAddRows(
      addRows.map((row) =>
        row.id === id
          ? {
              ...row,
              reason: "",
              amount: "",
              explanation: "",
              employee: "",
              referenceNo: "",
              paidBy: "",
            }
          : row
      )
    );
  };

  const columns: Column<ExpenseListing>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => <span className="font-medium text-gray-700">{row.title}</span>,
    },
    {
      key: "totalExpense",
      header: "Total Expense Reported",
      render: (row) => <span className="font-medium text-gray-700">{row.totalExpense}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      stickyRight: true,
      className: "min-w-[100px]",
      render: () => (
        <div className="flex items-center justify-center gap-4">
          <button className="text-[#1D6BA3] hover:text-[#1D6BA3]/80 transition-colors">
            <Pencil size={18} />
          </button>
        </div>
      ),
    },
  ];

  const masterColumns: Column<ExpenseMaster>[] = [
    {
      key: "checkbox",
      header: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 accent-[#1D6BA3]"
            checked={masterData.length > 0 && masterData.every((m) => m.selected)}
            onChange={(e) =>
              setMasterData(masterData.map((m) => ({ ...m, selected: e.target.checked })))
            }
          />
        </div>
      ),
      className: "w-12",
      render: (row) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 accent-[#1D6BA3]"
            checked={row.selected || false}
            onChange={() =>
              setMasterData(
                masterData.map((m) => (m.id === row.id ? { ...m, selected: !m.selected } : m))
              )
            }
          />
        </div>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (row) => <span className="font-medium text-gray-700">{row.title}</span>,
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center">
          <button
            onClick={() =>
              setMasterData(
                masterData.map((m) => (m.id === row.id ? { ...m, status: !m.status } : m))
              )
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              row.status ? "bg-emerald-500" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                row.status ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ),
    },
    {
      key: "createdDate",
      header: "Created Date",
      render: (row) => <span className="text-gray-600">{row.createdDate}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      stickyRight: true,
      className: "min-w-[100px] border-l border-gray-100",
      render: (row) => (
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => {
              setEditingMaster(row);
              setMasterForm({ title: row.title, status: row.status });
              setIsAddMasterModalOpen(true);
            }}
            className="text-[#1D6BA3] hover:text-[#1D6BA3]/80 transition-colors"
          >
            <Pencil size={18} />
          </button>
          {/* <button className="text-[#1D6BA3] hover:text-[#1D6BA3]/80 transition-colors">
            <FileText size={18} />
          </button> */}
        </div>
      ),
    },
  ];

  if (currentView === "add") {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        {/* Header Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
          <h1 className="text-[15px] font-bold text-gray-800">Expenses</h1>
        </div>

        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-[16px] font-bold text-gray-800 tracking-tight">
                  Date : {selectedDate.split("-").reverse().join("/")}
                </h2>
                <p className="text-[12px] text-gray-400">
                  Note : Only row with reason & amount will get saved.
                </p>
                <p className="text-[12px] text-gray-400">
                  Note : record added from the web dashboard would not be visible in Pos
                </p>
              </div>
              <Button
                variant="primary"
                className="bg-[#1D6BA3] font-bold h-10 px-6 rounded-lg shadow-md shadow-blue-100 whitespace-nowrap"
                icon={<Plus size={18} />}
                onClick={handleAddRow}
              >
                Add Row
              </Button>
            </div>

            <div className="overflow-x-auto relative">
              <table className="w-full min-w-[1600px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#EFF6FF] border-y border-gray-100">
                    <th className="w-12 p-3 text-center border-b border-gray-100">
                      <input
                        type="checkbox"
                        className="w-4 h-4 border border-gray-300 rounded cursor-pointer accent-[#1D6BA3]"
                        checked={addRows.length > 0 && addRows.every((r) => r.selected)}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="p-3 text-left text-[13px] font-bold text-gray-600 min-w-[180px]">
                      Reason
                    </th>
                    <th className="p-3 text-left text-[13px] font-bold text-gray-600 min-w-[120px]">
                      Amount
                    </th>
                    <th className="p-3 text-left text-[13px] font-bold text-gray-600 min-w-[250px]">
                      Explanation
                    </th>
                    <th className="p-3 text-left text-[13px] font-bold text-gray-600 min-w-[180px]">
                      Employee
                    </th>
                    <th className="p-3 text-left text-[13px] font-bold text-gray-600 min-w-[150px]">
                      Payment Status
                    </th>
                    <th className="p-3 text-left text-[13px] font-bold text-gray-600 min-w-[150px]">
                      Paid From
                    </th>
                    <th className="p-3 text-left text-[13px] font-bold text-gray-600 min-w-[150px]">
                      Reference No
                    </th>
                    <th className="p-3 text-left text-[13px] font-bold text-gray-600 min-w-[180px]">
                      Paid By
                    </th>
                    <th className="sticky right-0 z-30 bg-[#EFF6FF] p-3 text-center text-[13px] font-bold text-gray-600 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)] border-b border-l border-gray-100 min-w-[100px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {addRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 border border-gray-200 rounded cursor-pointer accent-[#1D6BA3]"
                          checked={row.selected}
                          onChange={() => toggleSelectRow(row.id)}
                        />
                      </td>
                      <td className="p-3">
                        <CustomDropdown
                          options={["Select Reason", "Salary", "Office Rent", "Utility Bill"]}
                          value={row.reason || "Select Reason"}
                          onChange={(val) =>
                            setAddRows(
                              addRows.map((r) => (r.id === row.id ? { ...r, reason: val } : r))
                            )
                          }
                          className="w-full"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="Enter"
                          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-[13px] focus:ring-2 focus:ring-[#1D6BA3]/10 outline-none"
                          value={row.amount}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setAddRows(
                              addRows.map((r) => (r.id === row.id ? { ...r, amount: val } : r))
                            );
                          }}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="Enter"
                          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-[13px] focus:ring-2 focus:ring-[#1D6BA3]/10 outline-none"
                          value={row.explanation}
                          onChange={(e) =>
                            setAddRows(
                              addRows.map((r) =>
                                r.id === row.id ? { ...r, explanation: e.target.value } : r
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-3">
                        <CustomDropdown
                          options={["Select Employee", "John Doe", "Jane Smith"]}
                          value={row.employee || "Select Employee"}
                          onChange={(val) =>
                            setAddRows(
                              addRows.map((r) => (r.id === row.id ? { ...r, employee: val } : r))
                            )
                          }
                          className="w-full"
                        />
                      </td>
                      <td className="p-3">
                        <CustomDropdown
                          options={["Paid", "Unpaid"]}
                          value={row.paymentStatus}
                          onChange={(val) =>
                            setAddRows(
                              addRows.map((r) =>
                                r.id === row.id ? { ...r, paymentStatus: val } : r
                              )
                            )
                          }
                          className="w-full"
                        />
                      </td>
                      <td className="p-3">
                        <CustomDropdown
                          options={["From Cash", "From Bak", "Select"]}
                          value={row.paidFrom}
                          onChange={(val) =>
                            setAddRows(
                              addRows.map((r) => (r.id === row.id ? { ...r, paidFrom: val } : r))
                            )
                          }
                          className="w-full"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="Enter"
                          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-[13px] focus:ring-2 focus:ring-[#1D6BA3]/10 outline-none"
                          value={row.referenceNo}
                          onChange={(e) =>
                            setAddRows(
                              addRows.map((r) =>
                                r.id === row.id ? { ...r, referenceNo: e.target.value } : r
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-3">
                        <CustomDropdown
                          options={["Select Employee", "John Doe", "Jane Smith"]}
                          value={row.paidBy || "Select Employee"}
                          onChange={(val) =>
                            setAddRows(
                              addRows.map((r) => (r.id === row.id ? { ...r, paidBy: val } : r))
                            )
                          }
                          className="w-full"
                        />
                      </td>
                      <td className="sticky right-0 z-20 bg-white group-hover:bg-gray-50 p-3 text-center transition-colors shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)] min-w-[100px] border-l border-gray-100">
                        <button
                          onClick={() => handleClearRow(row.id)}
                          className="px-4 py-2 text-[#1D6BA3] font-bold text-[13px] hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                className="px-8 border-[#1D6BA3] text-[#1D6BA3] font-bold h-11 rounded-xl"
                onClick={() => setCurrentView("listing")}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="px-10 bg-[#1D6BA3] font-bold h-11 rounded-xl shadow-lg shadow-blue-100"
                onClick={() => setCurrentView("listing")}
              >
                Save
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
        <h1 className="text-[15px] font-bold text-gray-800">Expenses</h1>
        <div className="flex items-center gap-3">
          {activeTab === "listing" ? (
            <>
              <div className="h-10 px-4 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-2">
                <span className="text-[12px] font-bold text-gray-500">Grand Total:</span>
                <span className="text-[13px] font-bold text-gray-800">₹ 27,400</span>
              </div>
              <Button
                variant="outline"
                className="border-gray-200 text-gray-600 font-bold h-10 px-4 rounded-lg"
                icon={<Download size={18} />}
              >
                Export Excel
              </Button>
              <Button
                variant="primary"
                className="bg-[#1D6BA3] font-bold h-10 px-6 rounded-lg shadow-md shadow-blue-100"
                icon={<Plus size={18} />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Expense
              </Button>
            </>
          ) : (
            <>
              <CustomDropdown
                options={["Action", "Active", "Inactive"]}
                value="Action"
                onChange={(val) => {
                  if (val === "Active") {
                    setConfirmModalType("active");
                    setIsConfirmModalOpen(true);
                  } else if (val === "Inactive") {
                    setConfirmModalType("inactive");
                    setIsConfirmModalOpen(true);
                  }
                }}
                className="w-32"
              />
              <Button
                variant="primary"
                className="bg-[#1D6BA3] font-bold h-10 px-6 rounded-lg shadow-md shadow-blue-100"
                icon={<Plus size={18} />}
                onClick={() => {
                  setEditingMaster(null);
                  setMasterForm({ title: "", status: true });
                  setIsAddMasterModalOpen(true);
                }}
              >
                Add Expense Master
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs & Filters Card */}
      <Card noPadding className="border-gray-200 shadow-sm">
        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab("listing")}
            className={`px-6 py-4 text-[14px] font-bold transition-all border-b-2 relative top-[1px] ${
              activeTab === "listing"
                ? "text-[#1D6BA3] border-[#1D6BA3]"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            Expense Listing
          </button>
          <button
            onClick={() => setActiveTab("master")}
            className={`px-6 py-4 text-[14px] font-bold transition-all border-b-2 relative top-[1px] ${
              activeTab === "master"
                ? "text-[#1D6BA3] border-[#1D6BA3]"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            Expense Master
          </button>
        </div>

        {/* Filters */}
        {activeTab === "listing" ? (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700">Start Date</label>
              <DatePicker value={startDate} onChange={setStartDate} className="w-full" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700">End Date</label>
              <DatePicker value={endDate} onChange={setEndDate} className="w-full" />
            </div>
            <div className="space-y-1.5 lg:col-span-1">
              <label className="text-[12px] font-bold text-gray-700">Title</label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search by title..."
                  className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-[13px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 h-10 bg-[#1D6BA3] text-white text-[13px] font-bold rounded-lg hover:bg-[#1D6BA3]/90 transition-colors shadow-sm">
                Search
              </button>
              <button className="flex-1 h-10 border border-gray-200 text-gray-600 text-[13px] font-bold rounded-lg hover:bg-gray-50 transition-colors">
                Show All
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="relative max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search expense master..."
                className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-[13px]"
                value={masterSearchTerm}
                onChange={(e) => setMasterSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="border-t border-gray-100">
          {activeTab === "listing" ? (
            <DataTable
              data={MOCK_LISTING}
              columns={columns}
              headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
            />
          ) : (
            <DataTable
              data={masterData}
              columns={masterColumns}
              headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
            />
          )}
        </div>
      </Card>

      {/* Add Expenses Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Expenses">
        <div className="space-y-6 pt-2">
          <p className="text-[14px] text-gray-500 font-medium">
            Please provide the date for which you want to record your expenses.
          </p>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-700">Date</label>
            <DatePicker value={selectedDate} onChange={setSelectedDate} className="w-full" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              className="px-8 border-[#1D6BA3] text-[#1D6BA3] font-bold h-11 rounded-xl"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="px-10 bg-[#1D6BA3] font-bold h-11 rounded-xl shadow-lg shadow-blue-100"
              onClick={() => {
                setIsAddModalOpen(false);
                setCurrentView("add");
              }}
            >
              Load
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Expense Master Modal */}
      <Modal
        isOpen={isAddMasterModalOpen}
        onClose={() => setIsAddMasterModalOpen(false)}
        title={editingMaster ? "Edit Expense Master" : "Add Expense Master"}
      >
        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-700">Title</label>
            <input
              type="text"
              placeholder="Enter title"
              value={masterForm.title}
              onChange={(e) => setMasterForm({ ...masterForm, title: e.target.value })}
              className="w-full h-11 px-4 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10"
            />
          </div>

          <div className="pt-2 border-t border-dashed border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={masterForm.status}
                onChange={(e) => setMasterForm({ ...masterForm, status: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 accent-[#1D6BA3] cursor-pointer"
              />
              <span className="text-[14px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                Status
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              className="px-8 border-[#1D6BA3] text-[#1D6BA3] font-bold h-11 rounded-xl"
              onClick={() => setIsAddMasterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="px-10 bg-[#1D6BA3] font-bold h-11 rounded-xl shadow-lg shadow-blue-100"
              onClick={() => {
                if (editingMaster) {
                  setMasterData(
                    masterData.map((m) =>
                      m.id === editingMaster.id
                        ? { ...m, title: masterForm.title, status: masterForm.status }
                        : m
                    )
                  );
                } else {
                  const newMaster: ExpenseMaster = {
                    id: Date.now().toString(),
                    title: masterForm.title,
                    status: masterForm.status,
                    createdDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
                  };
                  setMasterData([...masterData, newMaster]);
                }
                setIsAddMasterModalOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Action Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Add Expense Master"
      >
        <div className="space-y-8 pt-4">
          <p className="text-[15px] font-bold text-gray-500 text-center">
            Are you sure you want to {confirmModalType === "active" ? "active" : "Inactive"}{" "}
            Selected records?
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="px-8 border-[#1D6BA3] text-[#1D6BA3] font-bold h-11 rounded-xl"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="px-10 bg-[#1D6BA3] font-bold h-11 rounded-xl shadow-lg shadow-blue-100"
              onClick={() => {
                const isStatus = confirmModalType === "active";
                setMasterData(
                  masterData.map((m) =>
                    m.selected ? { ...m, status: isStatus, selected: false } : m
                  )
                );
                setIsConfirmModalOpen(false);
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuperAdminExpenses;
