import { useState, useEffect, useRef } from "react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button/Button";
import DataTable, { type Column } from "../../../components/common/Table/DataTable";
import PageHeader from "../../../components/common/PageHeader";
import {
  EditIcon,
  DocumentIcon,
  MoreVerticalIcon,
  ChevronDownIcon,
} from "../../../components/common/Icons";
import { Fingerprint, Printer, Trash2, Wrench } from "lucide-react";
import { type AttendancePermissionItem } from "../../../types/interfaces";

import { MOCK_ATTENDANCE_PERMISSIONS } from "../../../types/mockData";

const AttendancePermission = () => {
  const [geoFencing, setGeoFencing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const itemsPerPage = 11;

  // Filter logic
  const filteredData = MOCK_ATTENDANCE_PERMISSIONS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const columns: Column<AttendancePermissionItem>[] = [
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
      className: "px-6 py-4 text-sm text-gray-700 font-medium",
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
      key: "biometrics",
      header: "Biometrics Registered",
      className: "px-6 py-4 text-sm text-gray-700",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Fingerprint size={16} className="text-gray-400" />
          <span className="text-gray-600 font-medium">{item.biometrics}</span>
        </div>
      ),
    },
    {
      key: "attendanceMethod",
      header: "Attendance Method",
      className: "px-6 py-4 text-sm text-gray-700",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-gray-400" />
          <span className="text-gray-600 font-medium">{item.attendanceMethod}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "px-6 py-4 text-sm text-gray-700 flex justify-center",
      render: (item) => (
        <div className="flex items-center justify-center gap-3 relative">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors">
            <EditIcon size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors">
            <DocumentIcon size={16} />
          </button>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === item.id ? null : item.id);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors"
            >
              <MoreVerticalIcon size={16} />
            </button>
            
            {openMenuId === item.id && (
              <div 
                ref={menuRef}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Printer size={18} className="text-gray-400" strokeWidth={1.5} />
                  <span className="font-medium">Document Library</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Trash2 size={18} className="text-gray-400" strokeWidth={1.5} />
                  <span className="font-medium">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  const headerActions = (
    <div className="flex items-center gap-2">
      <div
        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${geoFencing ? "bg-blue-600" : "bg-gray-300"}`}
        onClick={() => setGeoFencing(!geoFencing)}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${geoFencing ? "translate-x-6" : "translate-x-0"}`}
        />
      </div>
      <span className="text-sm font-bold text-gray-700">Geo Fencing</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Permission" actions={headerActions} />

      <Card noPadding className="border-gray-100 overflow-hidden">
        {/* Filter Section */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-end gap-3 bg-white">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by Employee name"
              className="w-full pl-3 pr-10 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] focus:border-[#1D6BA3]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-xs">x</span>
            </div> */}
          </div>
          <Button
            className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white h-8 px-5 rounded-md text-sm font-semibold whitespace-nowrap"
            onClick={() => setCurrentPage(1)}
          >
            Search
          </Button>
          <Button
            variant="ghost"
            className="text-[#1D6BA3] border border-[#1D6BA3] hover:bg-gray-50 h-8 px-5 rounded-md text-sm font-semibold whitespace-nowrap shadow-sm"
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
          >
            Clear
          </Button>
          <div className="relative w-full md:w-48">
            <button className="w-full flex items-center justify-between px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50">
              <span className="truncate">Choose Branch</span>
              <ChevronDownIcon size={14} className="text-gray-400" />
            </button>
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

export default AttendancePermission;
