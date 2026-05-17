import { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { exportToExcel, readXlsxFile } from "../../utils/excel";
import { ITEMS_PER_PAGE } from "../../constants";
import Pagination from "../../components/common/Pagination/Pagination";
import {
  EditIcon,
  PlusIcon,
  ChevronDown,
  XIcon,
  TrashIcon,
  UploadIcon,
  ExportIcon,
  DocumentIcon,
  CalendarIcon,
} from "../../components/common/Icons/PageIcons";

import { 
  type PurchaseRecord, 
  type AssetLine,
  type RecordStatus,
  type PaymentStatus 
} from "../../types/interfaces";
import { SEED_PURCHASES } from "../../types/mockData";

const STATS = {
  totalInvoice: "64,00.000",
  totalOutstanding: "34,00.000",
  taxPaid: "2,213.000",
};

const SUPPLIERS = [
  "EduTech Solutions", "Global Lab", "Campusfun", "TechMart",
  "LabSupplies Co", "SmartDesk", "FurniCo", "PrinterWorld",
];
const DEPARTMENTS = ["Science", "Commerce", "IT", "Arts", "Mathematics", "Physical Education"];
const ASSETS = [
  "Plastic Chair", "Whiteboard", "Microscope", "Desktop Computer",
  "Projector", "Wooden Table", "Cricket Bat", "Printer",
];
const UNITS = ["Nos", "Box", "Set", "Piece", "Kg", "Litre"];
const PAYMENT_MODES = ["Cash", "Cheque", "Bank Transfer", "UPI", "DD"];
const PURCHASE_TYPES = [
  "Asset Purchase", "Consumable Purchase", "Equipment Purchase", "Stationery Purchase",
];
const PAYMENT_STATUSES: Array<"Paid" | "Partially Paid" | "Unpaid"> = ["Paid", "Partially Paid", "Unpaid"];

// ── Shared form primitives ────────────────────────────────────────────────────
const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const InputField = ({
  placeholder = "Enter", value, onChange, type = "text",
}: {
  placeholder?: string; value: string | number; onChange: (v: string) => void; type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors placeholder-gray-400"
  />
);

const SelectInput = ({
  value, onChange, options, placeholder = "Select",
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={[
        "w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white",
        "focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors",
        !value ? "text-gray-400" : "text-gray-700",
      ].join(" ")}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
      <ChevronDown />
    </div>
  </div>
);

// ── Status Badges ─────────────────────────────────────────────────────────────
const RecordStatusBadge = ({ status }: { status: RecordStatus }) => {
  const styles: Record<RecordStatus, string> = {
    Saved: "bg-green-100 text-green-700",
    Cancelled: "border border-red-300 text-red-600 bg-white",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
};

// ── Success Popup (same pattern as AssetLibrary) ──────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">Success</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>
        <div className="px-5 py-5 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-700 text-center">{message}</p>
          <button
            onClick={onClose}
            className="mt-1 px-6 py-2 rounded-lg bg-[#1D6BA3] text-white text-sm font-semibold hover:bg-[#1D6BA3]/90 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

// ── Icons not yet in PageIcons ────────────────────────────────────────────────
const MoreVertIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

// ── Add Asset Purchase Form ───────────────────────────────────────────────────
const emptyLine = (id: number): AssetLine => ({ id, asset: "", unit: "", price: 0, qty: 0, amount: 0, tax: 0 });

interface AddAssetPurchaseFormProps {
  onCancel: () => void;
  onSave: (record: Omit<PurchaseRecord, "id">) => void;
  initialData?: PurchaseRecord;
}

const generateMockInvoiceNo = () => `INV-${Date.now()}`;

const AddAssetPurchaseForm = ({ onCancel, onSave, initialData }: AddAssetPurchaseFormProps) => {
  const isEdit = !!initialData;
  const [typeOfPurchase, setTypeOfPurchase] = useState(initialData?.typeOfPurchase ?? "");
  const [supplier, setSupplier] = useState(initialData?.supplier ?? "");
  const [department, setDepartment] = useState(initialData?.department ?? "");
  const [invoiceDate, setInvoiceDate] = useState(initialData?.invoiceDate ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNo ?? "");
  const [assetLines, setAssetLines] = useState<AssetLine[]>([emptyLine(1), emptyLine(2)]);
  const [paymentType, setPaymentType] = useState<"Paid" | "Unpaid">(
    initialData ? (initialData.amountPaid > 0 ? "Paid" : "Unpaid") : "Paid"
  );
  const [paymentMode, setPaymentMode] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [amountPaid, setAmountPaid] = useState(initialData?.amountPaid ? String(initialData.amountPaid) : "");
  const [paymentDate, setPaymentDate] = useState("");
  const [updateAssets, setUpdateAssets] = useState(true);

  const subTotal = assetLines.reduce((s, l) => s + l.amount, 0);
  const grandTotal = assetLines.reduce((s, l) => s + l.amount + (l.amount * l.tax) / 100, 0);

  const updateLine = (id: number, field: keyof AssetLine, val: string | number) => {
    setAssetLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const numVal = ["price", "qty", "tax"].includes(field) ? Number(val) : val;
        const updated = { ...l, [field]: numVal };
        if (field === "price" || field === "qty") {
          updated.amount =
            (field === "price" ? Number(val) : l.price) *
            (field === "qty" ? Number(val) : l.qty);
        }
        return updated;
      })
    );
  };

  const addLine = () => setAssetLines((prev) => [...prev, emptyLine(Date.now())]);
  const removeLine = (id: number) => setAssetLines((prev) => prev.filter((l) => l.id !== id));

  const handleSave = () => {
    const paid = paymentType === "Paid" ? Number(amountPaid) || grandTotal : 0;
    const ps: PaymentStatus = paid >= grandTotal ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid";
    const generatedInvoiceNo = generateMockInvoiceNo();
    onSave({
      invoiceNo: invoiceNumber || generatedInvoiceNo,
      typeOfPurchase,
      supplier,
      department,
      invoiceDate,
      total: grandTotal || initialData?.total || 0,
      amountPaid: paid,
      paymentStatus: ps,
      createdBy: initialData?.createdBy ?? "Admin",
      status: "Saved",
      tax: assetLines.reduce((s, l) => s + (l.amount * l.tax) / 100, 0),
    });
  };

  return (
    <div className="flex flex-col gap-5 px-6 py-5">
      {/* Page title */}
      <h1 className="text-[16px] font-bold text-gray-900">{isEdit ? "Edit Asset Purchase" : "Add Asset Purchase"}</h1>

      {/* Form card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5 flex flex-col gap-5">

        {/* Type Of Purchase */}
        <div className="max-w-xs">
          <Label>Type Of Purchase</Label>
          <SelectInput value={typeOfPurchase} onChange={setTypeOfPurchase} options={PURCHASE_TYPES} />
        </div>

        {/* Supplier / Department / Invoice Date / Invoice Number */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Supplier</Label>
            <SelectInput value={supplier} onChange={setSupplier} options={SUPPLIERS} placeholder="Supplier" />
          </div>
          <div>
            <Label>Department</Label>
            <SelectInput value={department} onChange={setDepartment} options={DEPARTMENTS} placeholder="Department" />
          </div>
          <div>
            <Label>Invoice Date</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <CalendarIcon />
              </span>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                placeholder="dd/mm/yyyy"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors text-gray-500"
              />
            </div>
          </div>
          <div>
            <Label>Invoice Number</Label>
            <InputField value={invoiceNumber} onChange={setInvoiceNumber} />
          </div>
        </div>

        {/* Asset Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-800">Asset</span>
            <button
              onClick={addLine}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1D6BA3] border border-dashed border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 transition-colors"
            >
              <PlusIcon />
              Add New
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-3 py-2.5 w-8">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Asset</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Unit</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Price</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Qty</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Amount</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Tax (%)</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assetLines.map((line) => (
                  <tr key={line.id} className="bg-white">
                    <td className="px-3 py-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-3 py-2 min-w-[130px]">
                      <SelectInput value={line.asset} onChange={(v) => updateLine(line.id, "asset", v)} options={ASSETS} />
                    </td>
                    <td className="px-3 py-2 min-w-[110px]">
                      <SelectInput value={line.unit} onChange={(v) => updateLine(line.id, "unit", v)} options={UNITS} />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={line.price || 0}
                        onChange={(e) => updateLine(line.id, "price", e.target.value)}
                        className="w-20 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={line.qty || 0}
                        onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                        className="w-20 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={line.amount}
                        readOnly
                        className="w-20 px-2 py-1.5 text-xs border border-gray-100 rounded-lg bg-gray-50 text-right text-gray-600 cursor-default"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={line.tax || 0}
                        onChange={(e) => updateLine(line.id, "tax", e.target.value)}
                        className="w-16 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] text-right"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => removeLine(line.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors mx-auto"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Details + Total */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Payment */}
          <div className="flex flex-col gap-4">
            {/* Paid / Unpaid toggle */}
            <div className="flex">
              <button
                onClick={() => setPaymentType("Paid")}
                className={[
                  "px-6 py-1.5 text-sm font-medium rounded-l-lg border transition-colors",
                  paymentType === "Paid"
                    ? "bg-[#1D6BA3] text-white border-[#1D6BA3]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                Paid
              </button>
              <button
                onClick={() => setPaymentType("Unpaid")}
                className={[
                  "px-6 py-1.5 text-sm font-medium rounded-r-lg border-t border-r border-b transition-colors",
                  paymentType === "Unpaid"
                    ? "bg-[#1D6BA3] text-white border-[#1D6BA3]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                Unpaid
              </button>
            </div>

            {paymentType === "Paid" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Payment Mode</Label>
                    <SelectInput value={paymentMode} onChange={setPaymentMode} options={PAYMENT_MODES} />
                  </div>
                  <div>
                    <Label>Reference No.</Label>
                    <InputField value={referenceNo} onChange={setReferenceNo} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Amount Paid</Label>
                    <InputField value={amountPaid} onChange={setAmountPaid} type="number" />
                  </div>
                  <div>
                    <Label>Payment Date</Label>
                    <InputField value={paymentDate} onChange={setPaymentDate} type="date" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Total */}
          <div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-bold text-gray-800 mb-3">Total</p>
              <div className="flex items-center justify-between py-2.5 border-b border-gray-200">
                <span className="text-sm text-gray-600">Sub Total</span>
                <span className="text-sm font-semibold text-[#1D6BA3]">{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-gray-600">Grand Total</span>
                <span className="text-sm font-semibold text-[#1D6BA3]">{grandTotal.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Update Available Assets */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="updateAssets"
            checked={updateAssets}
            onChange={(e) => setUpdateAssets(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/30 accent-[#1D6BA3]"
          />
          <label htmlFor="updateAssets" className="text-sm text-gray-700 cursor-pointer">
            Update Available Assets
          </label>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200" />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Purchase List ─────────────────────────────────────────────────────────────
const AssetPurchase = () => {
  const [view, setView] = useState<"list" | "create">("list");
  const [editRecord, setEditRecord] = useState<PurchaseRecord | null>(null);
  const [rows, setRows] = useState<PurchaseRecord[]>(SEED_PURCHASES);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("");
  const [startDate, setStartDate] = useState("2025-09-20");
  const [endDate, setEndDate] = useState("2025-09-20");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ fileName: string; added: number } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportToExcel(
      rows.map((r) => ({
        "Invoice No": r.invoiceNo,
        Supplier: r.supplier,
        Department: r.department,
        Total: r.total,
        "Amount Paid": r.amountPaid,
        "Payment Status": r.paymentStatus,
        "Created By": r.createdBy,
        Status: r.status,
      })),
      "PurchaseList",
      "Purchase_List.xlsx"
    );
  };

  const handleBulkUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadLoading(true);
    try {
      const data = await readXlsxFile(file);
      const timestamp = Date.now();
      const newRows: PurchaseRecord[] = data.map((r, i) => ({
        id: timestamp + i,
        invoiceNo: String(r["Invoice No"] ?? `INV-IMPORT-${i + 1}`),
        typeOfPurchase: String(r["Type"] ?? "New"),
        supplier: String(r["Supplier"] ?? ""),
        department: String(r["Department"] ?? ""),
        invoiceDate: String(r["Date"] ?? new Date().toISOString().split("T")[0]),
        total: Number(r["Total"] ?? 0),
        amountPaid: Number(r["Amount Paid"] ?? 0),
        paymentStatus: "Unpaid" as PaymentStatus,
        createdBy: String(r["Created By"] ?? "Admin"),
        status: "Saved" as RecordStatus,
        tax: 0,
      }));
      setRows((p) => [...newRows, ...p]);
      setUploadResult({ fileName: file.name, added: data.length });
    } catch {
      setUploadResult({ fileName: file.name, added: 0 });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSaveNew = (record: Omit<PurchaseRecord, "id">) => {
    const newId = Math.max(0, ...rows.map((r) => r.id)) + 1;
    setRows((prev) => [{ ...record, id: newId }, ...prev]);
    setView("list");
    setSuccessMsg("Asset Purchase saved successfully!");
  };

  const handleSaveEdit = (record: Omit<PurchaseRecord, "id">) => {
    setRows((prev) => prev.map((r) => r.id === editRecord!.id ? { ...record, id: r.id } : r));
    setEditRecord(null);
    setView("list");
    setSuccessMsg("Asset Purchase updated successfully!");
  };

  const handleEditClick = (record: PurchaseRecord) => {
    setEditRecord(record);
    setView("create");
  };

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const matchInvoice = searchActive
          ? r.invoiceNo.toLowerCase().includes(searchActive.toLowerCase())
          : true;
        const matchSupplier = supplierFilter ? r.supplier === supplierFilter : true;
        const matchStatus = statusFilter ? r.paymentStatus === statusFilter : true;
        return matchInvoice && matchSupplier && matchStatus;
      }),
    [rows, searchActive, supplierFilter, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => { setSearchActive(searchTerm); setCurrentPage(1); };
  const handleClear = () => {
    setSearchTerm(""); setSearchActive(""); setSupplierFilter(""); setStatusFilter(""); setCurrentPage(1);
  };

  // ── Create / Edit view ────────────────────────────────────────────────────
  if (view === "create") {
    return (
      <>
        <AddAssetPurchaseForm
          onCancel={() => { setView("list"); setEditRecord(null); }}
          onSave={editRecord ? handleSaveEdit : handleSaveNew}
          initialData={editRecord ?? undefined}
        />
        {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />}
      </>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0 px-6 py-5 gap-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-[18px] font-bold text-gray-900">Purchase List</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            <ExportIcon />
            Export
            <ChevronDown />
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
          <button
            onClick={handleBulkUpload}
            disabled={uploadLoading}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#1D6BA3] text-[#1D6BA3] text-xs font-medium hover:bg-[#1D6BA3]/5 disabled:opacity-60 transition-colors"
          >
            <UploadIcon />
            {uploadLoading ? "Importing…" : "Bulk Upload"}
          </button>
          <button
            onClick={() => setView("create")}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1D6BA3]/90 transition-colors shadow-sm"
          >
            <PlusIcon />
            Create New
          </button>
        </div>
      </div>

      {/* Upload result banner */}
      {uploadResult && (
        <div
          className={[
            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs border",
            uploadResult.added > 0
              ? "bg-green-50 border-green-100 text-green-700"
              : "bg-amber-50 border-amber-100 text-amber-700",
          ].join(" ")}
        >
          <span className="flex-1 font-medium">
            {uploadResult.fileName} — {uploadResult.added} record{uploadResult.added !== 1 ? "s" : ""} imported
          </span>
          <button onClick={() => setUploadResult(null)} className="text-gray-400 hover:text-gray-600">
            <XIcon />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Invoice */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 leading-tight">Total Purchase invoice amount recorded is</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{STATS.totalInvoice}</p>
          </div>
        </div>

        {/* Outstanding Payment */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 leading-tight">Total Outstanding Payment of</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{STATS.totalOutstanding}</p>
          </div>
        </div>

        {/* Tax Paid */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 leading-tight">Tax Paid to the seller</p>
            <p className="text-xl font-bold text-amber-500 mt-0.5">{STATS.taxPaid}</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-2 flex-wrap">
        {/* Invoice No search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search by Invoice No"
          className="h-9 px-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] w-44"
        />

        {/* Supplier */}
        <div className="relative">
          <select
            value={supplierFilter}
            onChange={(e) => { setSupplierFilter(e.target.value); setCurrentPage(1); }}
            className="appearance-none h-9 pl-3 pr-8 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 w-32"
          >
            <option value="">Supplier</option>
            {SUPPLIERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <ChevronDown />
          </span>
        </div>

        {/* Payment Status */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as PaymentStatus | ""); setCurrentPage(1); }}
            className="appearance-none h-9 pl-3 pr-8 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 w-36"
          >
            <option value="">Payment Status</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <ChevronDown />
          </span>
        </div>

        {/* Start Date */}
        <div className="flex items-center h-9 border border-gray-200 rounded-lg px-2.5 gap-1.5 bg-white">
          <span className="text-gray-400"><CalendarIcon /></span>
          <span className="text-xs text-gray-500 whitespace-nowrap">Start Date :</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-none outline-none text-xs text-[#1D6BA3] font-medium bg-transparent w-28"
          />
          <ChevronDown />
        </div>

        {/* End Date */}
        <div className="flex items-center h-9 border border-gray-200 rounded-lg px-2.5 gap-1.5 bg-white">
          <span className="text-gray-400"><CalendarIcon /></span>
          <span className="text-xs text-gray-500 whitespace-nowrap">End Date :</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-none outline-none text-xs text-[#1D6BA3] font-medium bg-transparent w-28"
          />
          <ChevronDown />
        </div>

        <button
          onClick={handleSearch}
          className="h-9 px-5 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1D6BA3]/90 transition-colors"
        >
          Search
        </button>
        <button
          onClick={handleClear}
          className="h-9 px-4 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Invoice Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Invoice Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Type of Purchase</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Amount Paid</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Payment Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Created By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Status</th>
                <th className="sticky right-0 bg-[#EFF6FF] px-4 py-3 text-center text-xs font-semibold text-gray-600 whitespace-nowrap shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-gray-400 text-xs">
                    No records found.
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{row.supplier}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {row.invoiceDate ? new Date(row.invoiceDate).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.invoiceNo}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.typeOfPurchase || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.department}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{row.total.toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{row.amountPaid.toFixed(3)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.paymentStatus}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.createdBy}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><RecordStatusBadge status={row.status} /></td>
                    <td className="sticky right-0 bg-white px-4 py-3 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          title="Edit"
                          onClick={() => handleEditClick(row)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors"
                        >
                          <EditIcon />
                        </button>
                        <button
                          title="Document"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                          <DocumentIcon />
                        </button>
                        <button
                          title="More"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                          <MoreVertIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          startIdx={startIdx}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Success popup */}
      {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />}
    </div>
  );
};

export default AssetPurchase;
