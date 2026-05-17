import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button/Button";
import DataTable, { type Column } from "../../../components/common/Table/DataTable";
import {
  EditIcon,
  DocumentIcon,
  PlusIcon,
  UploadIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MoreVerticalIcon,
  DownloadIcon,
  type LucideIcon,
} from "../../../components/common/Icons";
import Modal from "../../../components/common/Modal/Modal";
import Badge from "../../../components/common/Badge";

import { useStaff, type EmployeeItem } from "../../../contexts/StaffContext";

const normalise = (s: unknown) =>
  String(s ?? "")
    .trim()
    .toLowerCase();

type UploadResult = { fileName: string; added: number; skipped: number; errors: string[] } | null;

// ── Action Buttons ─────────────────────────────────────────────────────────────
const ActionBtn = ({ icon: IconComponent, title }: { icon: LucideIcon; title: string }) => (
  <button
    title={title}
    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors"
  >
    <IconComponent size={16} />
  </button>
);

const EmployeesDirectory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employees, bulkAddEmployees } = useStaff();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (location.state?.addedSuccess) {
      setShowAddSuccess(true);
      // Clean up the location state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setShowAddSuccess(false);
      }, 2000);
    }
  }, [location]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    department: "",
    designation: "",
  });

  // Upload states
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploadLoading(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target!.result as string;
        const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
        if (lines.length < 2) throw new Error("Empty file");

        const headers = lines[0].split(",").map((h) => normalise(h));
        const added: EmployeeItem[] = [];
        const skipped: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",");
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx]?.trim() || "";
          });

          const find = (...keys: string[]) => {
            for (const k of Object.keys(row)) {
              if (keys.includes(normalise(k))) return row[k];
            }
            return undefined;
          };

          const name = String(find("name", "employee name") ?? "").trim();
          const empId = String(find("id", "employee id") ?? "").trim();
          const dept = String(find("department", "dept") ?? "").trim();
          const desig = String(find("designation", "desig") ?? "").trim();

          if (!name || !empId) {
            skipped.push(`Line ${i + 1} — missing name or ID`);
            continue;
          }

          added.push({
            id: Date.now() + i,
            employeeId: empId,
            name,
            department: dept,
            designation: desig,
            dateOfJoining: new Date().toISOString().split("T")[0],
            masterBranch: "Main Campus",
            status: "Active",
          });
        }

        const existingIds = new Set(employees.map((e) => e.employeeId.toLowerCase()));
        const toAdd = added.filter((e) => !existingIds.has(e.employeeId.toLowerCase()));
        const dupIds = added
          .filter((e) => existingIds.has(e.employeeId.toLowerCase()))
          .map((e) => `ID "${e.employeeId}" already exists`);

        if (toAdd.length > 0) {
          bulkAddEmployees(toAdd);
          setCurrentPage(1);
        }

        setUploadResult({
          fileName: file.name,
          added: toAdd.length,
          skipped: skipped.length + dupIds.length,
          errors: [...skipped, ...dupIds],
        });
      } catch {
        setUploadResult({
          fileName: file.name,
          added: 0,
          skipped: 0,
          errors: ["Failed to parse file — ensure it is a valid .csv file"],
        });
      } finally {
        setUploadLoading(false);
      }
    };
    reader.readAsText(file);
  };


  // Filter and Pagination logic
  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    if (selectedRows.length === currentItems.length && currentItems.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentItems.map((item) => String(item.id)));
    }
  };

  const handleSelectRow = (id: string | number) => {
    setSelectedRows((prev) =>
      prev.includes(String(id)) ? prev.filter((rowId) => rowId !== String(id)) : [...prev, String(id)]
    );
  };

  const columns: Column<EmployeeItem>[] = [
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
            checked={selectedRows.includes(String(item.id))}
            onChange={() => handleSelectRow(item.id)}
          />
        </div>
      ),
    },
    {
      key: "employeeId",
      header: "Emp ID",
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
      key: "dateOfJoining",
      header: "Date of Joining",
      className: "px-6 py-4 text-sm text-gray-700",
    },
    {
      key: "masterBranch",
      header: "Master Branch",
      className: "px-6 py-4 text-sm text-gray-700",
    },
    {
      key: "status",
      header: "Status",
      className: "px-6 py-4 text-sm",
      render: (item) => (
        <Badge variant={item.status === "Active" ? "success" : "neutral"} pill>
          {item.status}
        </Badge>
      ),
    },

    {
      key: "actions",
      header: "Actions",
      className: "px-6 py-4 text-sm text-gray-700 flex justify-center",
      render: () => (
        <div className="flex items-center justify-center gap-2">
          <ActionBtn icon={EditIcon} title="Edit" />
          <ActionBtn icon={DocumentIcon} title="View" />
          <ActionBtn icon={MoreVerticalIcon} title="More" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card noPadding className="border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-base font-bold text-gray-900">Total Active Employees</h1>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="ghost"
              className="border border-gray-300 text-gray-700 hover:text-[#1D6BA3] hover:border-[#1D6BA3]/50 h-10 px-4"
              icon={<UploadIcon size={18} className="text-[#1D6BA3]" />}
              onClick={handleBulkUploadClick}
              disabled={uploadLoading}
            >
              <span className="font-semibold text-sm">
                {uploadLoading ? "Uploading..." : "Bulk Upload"}
              </span>
            </Button>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-10 px-4"
              onClick={() => navigate("/layout/staff-management/employee-addition")}
              icon={<PlusIcon size={18} />}
            >
              <span className="font-semibold text-sm">Add Employee</span>
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-4 flex flex-wrap items-center gap-3 bg-white border-y border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by Employee name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <Button
            className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white h-9 px-4 text-sm font-medium"
            onClick={() => { }}
          >
            Search
          </Button>
          <Button
            variant="ghost"
            className="border border-[#1D6BA3] text-[#1D6BA3] hover:bg-[#1D6BA3]/5 h-9 px-4 text-sm font-medium"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </Button>

          <div className="relative min-w-[200px]">
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 bg-white">
              <span>Attendance Permission</span>
              <ChevronDownIcon size={16} />
            </button>
          </div>

          <div className="relative min-w-[150px]">
            <button
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg transition-colors ${
                isActionsOpen 
                  ? "border-[#1D6BA3] text-[#1D6BA3] bg-white ring-2 ring-[#1D6BA3]/10" 
                  : "border-gray-200 text-gray-500 bg-white"
              }`}
            >
              <span className="font-medium">Actions</span>
              {isActionsOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
            </button>

            {isActionsOpen && (
              <div className="absolute right-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 py-1.5 z-20 animate-zoom-in">
                <button className="w-full text-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1D6BA3] transition-colors flex items-center justify-center gap-2">
                  <span>Download Sample</span>
                </button>
                <button className="w-full text-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1D6BA3] transition-colors flex items-center justify-center gap-2 border-t border-gray-50">
                  <span>Bulk Update Employee</span>
                </button>
                <button className="w-full text-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1D6BA3] transition-colors flex items-center justify-center gap-2 border-t border-gray-50">
                  <span>Export</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upload Result Banner */}
        {uploadResult && (
          <div
            className={`flex items-start gap-3 px-6 py-3 border-b text-xs ${uploadResult.added > 0
                ? "bg-green-50 border-green-100"
                : "bg-amber-50 border-amber-100"
              }`}
          >
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold ${uploadResult.added > 0 ? "text-green-700" : "text-amber-700"
                  }`}
              >
                {uploadResult.fileName} — {uploadResult.added} employee
                {uploadResult.added !== 1 ? "s" : ""} added
                {uploadResult.skipped > 0 && `, ${uploadResult.skipped} skipped`}
              </p>
              {uploadResult.errors.slice(0, 3).map((err, i) => (
                <p key={i} className="text-amber-600 mt-0.5 truncate">
                  {err}
                </p>
              ))}
            </div>
            <button
              onClick={() => setUploadResult(null)}
              className="text-gray-400 hover:text-gray-600 px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Table Container */}
        <div className="border-t border-gray-100">
          <DataTable
            data={currentItems}
            columns={columns}
            tableClassName="min-w-[1200px]"
            headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
            emptyMessage="No Data Found"
            pagination={{
              currentPage,
              totalPages,
              pageSize: itemsPerPage,
              total: totalItems,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </Card>

      {/* Redirect Success Modal */}
      <Modal
        isOpen={showAddSuccess}
        onClose={() => setShowAddSuccess(false)}
        title="Add"
        size="md"
      >
        <div className="flex flex-col items-center py-8 gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30 animate-in zoom-in duration-500">
            <CheckIcon size={38} className="text-white stroke-[3]" />
          </div>
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-xl font-bold text-gray-900">New Employee Added Successfully</h2>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeesDirectory;
