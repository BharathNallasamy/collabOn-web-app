import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Search,
  Plus,
  ChevronDown,
  CheckCircle2,
  Wallet,
  Coins,
  Pencil,
  MoreVertical,
  X,
  Trash2,
  FileSpreadsheet,
  FileText,
  FileJson,
} from "lucide-react";
import DatePicker from "../../../components/common/DatePicker";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button/Button";
import DataTable, { type Column } from "../../../components/common/Table/DataTable";
import CustomDropdown from "../../../components/common/Dropdown";
import Modal from "../../../components/common/Modal/Modal";
import { type Invoice, type ServiceItem } from "../../../types/interfaces";
import { MOCK_INVOICES } from "../../../types/mockData";
import { exportToExcel, exportToCSV } from "../../../utils/excel";

const RowActions = ({ row, onEdit }: { row: Invoice; onEdit: (row: Invoice) => void }) => {
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ 
        top: rect.bottom + window.scrollY + 8, 
        left: rect.right - 130 
      });
    }
    setShowMenu(!showMenu);
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button 
        onClick={() => onEdit(row)}
        className="p-1.5 text-[#1D6BA3] hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Pencil size={18} />
      </button>
      <div className="relative">
        <button 
          ref={buttonRef}
          onClick={handleToggle}
          className={`p-1.5 text-[#1D6BA3] hover:bg-blue-50 rounded-lg transition-colors ${showMenu ? "bg-blue-50 ring-1 ring-[#1D6BA3]/20" : ""}`}
        >
          <MoreVertical size={18} />
        </button>

        {showMenu && createPortal(
          <>
            <div className="fixed inset-0 z-[999]" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
            <div 
              style={{ top: coords.top - window.scrollY, left: coords.left }}
              className="fixed bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-[1000] min-w-[120px] p-1.5 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={16} className="text-red-500" />
                Cancel
              </button>
            </div>
          </>,
          document.body
        )}
      </div>
    </div>
  );
};

const SuperAdminServiceInvoice = () => {
  const [view, setView] = useState<"list" | "add">("list");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [institution, setInstitution] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentToggle, setPaymentToggle] = useState<"Paid" | "Unpaid">("Unpaid");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [formInvoiceDate, setFormInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [formPaymentDate, setFormPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [showExport, setShowExport] = useState(false);
  
  // Form State
  const [formEngagement, setFormEngagement] = useState("");
  const [formInstitution, setFormInstitution] = useState("");
  const [formServiceType, setFormServiceType] = useState("");
  const [formPaymentMode, setFormPaymentMode] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  
  // Modal Unit States
  const [modalUnits, setModalUnits] = useState([
    { id: "1", unit: "1", number: "Technology", name: "Bio Technology" },
    { id: "2", unit: "2", number: "Engineering", name: "Civil" },
    { id: "3", unit: "2", number: "Engineering", name: "Civil" },
    { id: "4", unit: "2", number: "Engineering", name: "Civil" }
  ]);
  const [unitNumber, setUnitNumber] = useState("");
  const [unitName, setUnitName] = useState("");

  const handleAddUnit = () => {
    if (!unitNumber || !unitName) return;
    const newUnit = {
      id: Math.random().toString(36).substr(2, 9),
      unit: (modalUnits.length + 1).toString(),
      number: unitNumber,
      name: unitName
    };
    setModalUnits([...modalUnits, newUnit]);
    setUnitNumber("");
    setUnitName("");
  };

  const handleDeleteUnit = (id: string) => {
    setModalUnits(units => units.filter(u => u.id !== id));
  };
  
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
    { id: "1", planType: "", planAmount: 499, discount: 0, totalUsers: 0, amount: 0, tax: 0 },
    { id: "2", planType: "", planAmount: 499, discount: 0, totalUsers: 0, amount: 0, tax: 0 },
  ]);

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormEngagement(invoice.engagementModel);
    setFormInstitution(invoice.institutionName);
    setFormServiceType(invoice.serviceType);
    setView("add");
  };

  const updateServiceItem = (id: string, field: keyof ServiceItem, value: string | number) => {
    setServiceItems(items => items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingItemId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!deletingItemId) return;
    const currentId = deletingItemId;
    // Set to null first to avoid glitch if component re-renders
    setDeletingItemId(null);
    setShowDeleteModal(false);
    
    // Perform actual deletion with a slight delay to allow modal animation
    setTimeout(() => {
      setServiceItems(items => items.filter(item => item.id !== currentId));
    }, 100);
  };

  const columns: Column<Invoice>[] = [
    { key: "invoiceDate", header: "Invoice Date" },
    { key: "invoiceNumber", header: "Invoice Number" },
    { key: "institutionName", header: "Institution Name", className: "font-bold text-gray-700" },
    { key: "institutionType", header: "Institution Type" },
    { key: "engagementModel", header: "Engagement Model" },
    { key: "planType", header: "Plan Type" },
    { key: "serviceType", header: "Service Type" },
    { key: "total", header: "Total", className: "font-bold" },
    { key: "amountPaid", header: "Amount Paid" },
    { key: "remainingAmount", header: "Remaining Amount" },
    { key: "paymentStatus", header: "Payment Status" },
    { key: "createdBy", header: "Created By" },
    { 
      key: "status", 
      header: "Status",
      render: (row) => (
        <span className={`px-4 py-1 rounded-full text-[11px] font-bold border ${
          row.status === "Saved" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      key: "actions", 
      header: "Actions", 
      stickyRight: true,
      className: "",
      render: (row) => <RowActions row={row} onEdit={handleEdit} />
    },
  ];

  if (view === "add") {
    return (
      <div className="animate-in fade-in duration-500 pb-10 space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-[16px] font-bold text-gray-900 pb-4 mb-8 border-b border-gray-100">
            {selectedInvoice ? "Edit" : "Add"} Service Invoice
          </h1>
          
          <div className="space-y-8">
            {/* Top Fields */}
            <div className="space-y-6">
              <div className="max-w-xs space-y-2">
                <label className="text-[13px] font-semibold text-gray-600">Engagement Model</label>
                <CustomDropdown 
                  options={["Subscription (SaaS)", "Custom"]}
                  value={formEngagement}
                  onChange={setFormEngagement}
                  placeholder="Select"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600">Institution Name</label>
                  <CustomDropdown
                    options={["Supplier", "Techworld Solutions", "Edutech Solutions"]}
                    value={formInstitution}
                    onChange={setFormInstitution}
                    placeholder="Select"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600">Type Of Service</label>
                  <CustomDropdown
                    options={["New", "Renewal"]}
                    value={formServiceType}
                    onChange={setFormServiceType}
                    placeholder="Select"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600">Invoice Date</label>
                  <DatePicker value={formInvoiceDate} onChange={setFormInvoiceDate} className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600">Invoice Number</label>
                  <input type="text" placeholder="Enter" className="w-full h-10 px-4 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]/30" />
                </div>
              </div>
            </div>

            {/* Service Section */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-gray-900">Service</h3>
                <button 
                  onClick={() => setShowAddUnitModal(true)}
                  className="flex items-center gap-2 px-4 h-9 border border-[#1D6BA3] text-[#1D6BA3] text-[13px] font-bold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Plus size={18} />
                  Add New
                </button>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-visible">
                <table className="w-full text-[13px]">
                  <thead className="bg-[#EFF6FF] border-b border-gray-100">
                    <tr>
                      <th className="w-12 px-4 py-3"><input type="checkbox" className="rounded" /></th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Plan Type</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Plan Amount</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Discount</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Total Users</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Tax (%)</th>
                      <th className="w-24 px-4 py-3 text-center font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {serviceItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]" />
                        </td>
                        <td className="px-4 py-4 overflow-visible">
                          <CustomDropdown 
                            options={["Starter", "Growth", "Enterprise"]}
                            value={item.planType}
                            onChange={(val) => updateServiceItem(item.id, "planType", val)}
                            className="w-[180px]"
                            placeholder="Select"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="relative">
                            <input 
                              type="text" 
                              readOnly
                              value="499" 
                              className="w-full h-10 px-3 bg-gray-50/80 border border-gray-200 rounded-lg text-[13px] text-right font-medium text-gray-700" 
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="number" 
                            defaultValue={0} 
                            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-[13px] text-left focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]/30" 
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="number" 
                            defaultValue={0} 
                            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-[13px] text-left focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]/30" 
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="text" 
                            readOnly
                            value="0" 
                            className="w-full h-10 px-3 bg-gray-50/80 border border-gray-200 rounded-lg text-[13px] text-right font-medium text-gray-500" 
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <input type="text" defaultValue="0" className="w-14 h-10 border border-gray-200 rounded-lg text-[13px] text-right px-2 focus:outline-none" />
                            <input type="text" defaultValue="0" className="w-14 h-10 border border-gray-200 rounded-lg text-[13px] text-right px-2 focus:outline-none" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button 
                            onClick={(e) => confirmDelete(e, item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              {/* Payment Toggle Area */}
              <div className="bg-gray-50/30 border border-gray-100 rounded-2xl p-6 min-h-[300px]">
                <div className="flex bg-white/50 p-1 rounded-xl w-fit shadow-sm border border-gray-100 mb-8">
                  <button 
                    onClick={() => setPaymentToggle("Paid")}
                    className={`px-8 py-2 rounded-lg text-[14px] font-bold transition-all ${paymentToggle === "Paid" ? "bg-[#1D6BA3] text-white shadow-md shadow-blue-100" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    Paid
                  </button>
                  <button 
                    onClick={() => setPaymentToggle("Unpaid")}
                    className={`px-8 py-2 rounded-lg text-[14px] font-bold transition-all ${paymentToggle === "Unpaid" ? "bg-[#1D6BA3] text-white shadow-md shadow-blue-100" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    Unpaid
                  </button>
                </div>
                
                {paymentToggle === "Paid" ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6 animate-in fade-in duration-300">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600">Payment Mode</label>
                      <CustomDropdown
                        options={["Cash", "Card", "Online", "Cheque"]}
                        value={formPaymentMode}
                        onChange={setFormPaymentMode}
                        placeholder="Select"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600">Reference No.</label>
                      <input type="text" placeholder="Enter" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600">Amount Paid</label>
                      <input type="text" placeholder="Enter" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600">Payment Date</label>
                      <DatePicker value={formPaymentDate} onChange={setFormPaymentDate} className="w-full" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-80 animate-in fade-in duration-300">
                    <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                      <Search size={22} className="text-[#1D6BA3]" />
                    </div>
                    <p className="text-[14px] font-bold text-gray-500">No Paid Data</p>
                  </div>
                )}
              </div>

              {/* Totals Area */}
              <div className="bg-[#F0FDF4]/50 border border-[#DCFCE7] rounded-2xl p-8 space-y-6">
                <h4 className="text-[16px] font-bold text-gray-800">Total</h4>
                <div className="space-y-6 border-t border-[#DCFCE7] pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-bold text-[#166534]">Sub Total</span>
                    <span className="text-[18px] font-bold text-[#166534]">0.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-bold text-[#166534]">Grand Total</span>
                    <span className="text-[22px] font-bold text-[#166534]">0.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-dashed border-gray-200 flex justify-end gap-4">
             <button 
                onClick={() => { setView("list"); setSelectedInvoice(null); }}
                className="px-10 h-11 border border-[#1D6BA3] text-[#1D6BA3] font-bold rounded-lg hover:bg-blue-50 transition-colors"
             >
               Cancel
             </button>
             <button 
                onClick={() => { setView("list"); setSelectedInvoice(null); }}
                className="px-12 h-11 bg-[#1D6BA3] text-white font-bold rounded-lg hover:bg-[#1D6BA3]/90 transition-colors shadow-lg shadow-blue-100"
             >
               Save
             </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={<span className="text-red-600">Confirm Deletion</span>}
          footer={
            <>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-6 h-10 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-6 h-10 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
              >
                Delete
              </button>
            </>
          }
        >
          <div className="py-2">
            <p className="text-[14px] text-gray-600">
              Are you sure you want to delete this service item? This action cannot be undone.
            </p>
          </div>
        </Modal>

        {/* Create Units To Subject Modal */}
        <Modal
          isOpen={showAddUnitModal}
          onClose={() => setShowAddUnitModal(false)}
          title="Create Units To Subject"
          size="custom"
          footer={
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => setShowAddUnitModal(false)}
                className="w-full sm:px-8 h-10 border border-[#1D6BA3] text-[#1D6BA3] font-bold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddUnitModal(false)}
                className="w-full sm:px-10 h-10 bg-[#1D6BA3] text-white font-bold rounded-lg hover:bg-[#1D6BA3]/90 transition-colors shadow-lg shadow-blue-100"
              >
                Save
              </button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="p-4 sm:p-6 border border-gray-100 rounded-xl space-y-6">
              <h4 className="text-[14px] font-bold text-gray-800">Units</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600">Unit Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter" 
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    className="w-full h-11 px-4 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]/30" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600">Unit Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter" 
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    className="w-full h-11 px-4 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]/30" 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleAddUnit}
                  className="flex items-center gap-2 text-[#1D6BA3] text-[13px] font-bold hover:underline"
                >
                  <Plus size={16} />
                  Add Unit
                </button>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] min-w-[500px]">
                  <thead className="bg-[#EFF6FF] border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Units</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Unit Number</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Unit Name</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {modalUnits.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-gray-600">{item.unit}</td>
                        <td className="px-4 py-3 text-gray-600">{item.number}</td>
                        <td className="px-4 py-3 text-gray-600">{item.name}</td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => handleDeleteUnit(item.id)}
                            className="text-[#1D6BA3] hover:text-[#1D6BA3]/80 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500 mb-10">
      {/* ── Top Header Section ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h1 className="text-sm font-bold text-gray-900">Service Invoice</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowExport(!showExport)}
              className="flex items-center justify-between w-28 h-9 px-4 border border-gray-200 rounded-md text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Export
              <ChevronDown className={`transition-transform duration-200 ${showExport ? 'rotate-180' : ''}`} size={14} />
            </button>
            
            {showExport && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => {
                    exportToExcel(MOCK_INVOICES, "Service Invoices", "Service_Invoices.xlsx");
                    setShowExport(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors border-b border-gray-50"
                >
                  <div className="w-5 h-5 rounded bg-green-50 flex items-center justify-center text-green-600">
                    <FileSpreadsheet size={12} />
                  </div>
                  Export As Excel
                </button>
                <button 
                  onClick={async () => {
                    const canvas = await html2canvas(document.querySelector(".overflow-x-auto") as HTMLElement);
                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF("l", "mm", "a4");
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
                    pdf.save("Service_Invoices.pdf");
                    setShowExport(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors border-b border-gray-50"
                >
                  <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center text-red-600">
                    <FileText size={12} />
                  </div>
                  Export As PDF
                </button>
                <button 
                  onClick={() => {
                    exportToCSV(MOCK_INVOICES, "Service_Invoices.csv");
                    setShowExport(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                    <FileJson size={12} />
                  </div>
                  Export As CSV
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setView("add")}
            className="flex items-center gap-2 px-4 h-9 bg-[#1D6BA3] hover:bg-[#1A5F91] text-white text-xs font-bold rounded-md transition-all shadow-sm"
          >
            <Plus size={16} />
            Create New
          </button>
        </div>
      </div>

      {/* ── Stats Cards Section ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-b border-gray-50">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-gray-500 leading-tight">
                Total Invoice Amount Recorded is
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">64,00,000</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Wallet className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-gray-500 leading-tight">
                Total Outstanding Payment of
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">34,00,000</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Coins className="text-amber-500" size={24} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-gray-500 leading-tight">Total Tax Paid</p>
              <p className="text-xl font-bold text-gray-900 mt-1">2,213.000</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar Section ───────────────────────────────────────────────── */}
      <div className="px-6 py-5 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <CustomDropdown
            placeholder="Search by Invoice No"
            value={invoiceNo}
            options={["TEC/25-26/23", "EDU/25-26/009"]}
            onChange={setInvoiceNo}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <CustomDropdown
            placeholder="Institution Name"
            value={institution}
            options={["Techworld Solutions", "Edutech Solutions"]}
            onChange={setInstitution}
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <CustomDropdown
            placeholder="Payment Status"
            value={paymentStatus}
            options={["Paid", "Unpaid", "Partially Paid"]}
            onChange={setPaymentStatus}
          />
        </div>

        <div className="flex-1 min-w-[180px] space-y-1.5">
          <label className="text-[12px] font-bold text-gray-700">Start Date</label>
          <DatePicker value={startDate} onChange={setStartDate} className="w-full" />
        </div>

        <div className="flex-1 min-w-[180px] space-y-1.5">
          <label className="text-[12px] font-bold text-gray-700">End Date</label>
          <DatePicker value={endDate} onChange={setEndDate} className="w-full" />
        </div>

        <button className="h-10 px-6 bg-[#1D6BA3] hover:bg-[#1A5F91] text-white text-xs font-bold rounded-lg transition-all shadow-sm">
          Search
        </button>
        <button
          onClick={() => {
            setInvoiceNo("");
            setInstitution("");
            setPaymentStatus("");
          }}
          className="h-10 px-6 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-all shadow-sm"
        >
          Clear
        </button>
      </div>

      {/* ── Table Section ────────────────────────────────────────────────────── */}
      <div className="px-6 pb-6">
        <DataTable
          data={MOCK_INVOICES}
          columns={columns}
          tableStyle={{ minWidth: "1600px" }}
          containerClassName="rounded-lg border border-gray-200"
          headerRowClassName="bg-blue-50 border-b border-gray-200"
          emptyMessage="No invoices found matching your criteria"
        />
      </div>
    </div>
  );
};

export default SuperAdminServiceInvoice;
