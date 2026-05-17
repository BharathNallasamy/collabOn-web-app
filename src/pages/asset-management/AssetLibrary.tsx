import { useState, useMemo, useRef } from "react";
import { exportToExcel, readXlsxFile } from "../../utils/excel";
import { createPortal } from "react-dom";
import { ITEMS_PER_PAGE } from "../../constants";
import Pagination from "../../components/common/Pagination/Pagination";
import {
  EditIcon,
  PlusIcon,
  ChevronDown,
  XIcon,
  CheckIcon,
  UploadIcon,
  ExportIcon,
  DocumentIcon,
} from "../../components/common/Icons/PageIcons";

// ── Types ─────────────────────────────────────────────────────────────────────
import { type Asset, type TaxType, type AssetStatus } from "../../types/interfaces";
import { SEED_ASSETS as SEED } from "../../types/mockData";

const CATEGORIES = [
  "Furniture",
  "Electronics",
  "Lab Equipment",
  "Sports",
  "Stationery",
  "IT Equipment",
];
const DEPARTMENTS = [
  "EEE",
  "CSE",
  "ECE",
  "Bio Technology",
  "Computer Science",
  "Chemistry",
  "Admin",
  "Sports",
  "Seminar Hall",
];
const UNITS = ["Nos", "Set", "Box", "Kg", "Ltr"];
type ViewMode = "list" | "form";
const STATUSES: AssetStatus[] = ["Active", "Inactive"];

// ── Shared form primitives ─────────────────────────────────────────────────────
const TextField = ({
  label,
  value,
  onChange,
  required,
  placeholder,
  type,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      type={type ?? "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Enter"}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] transition-colors placeholder-gray-300"
    />
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] transition-colors",
          !value ? "text-gray-400" : "text-gray-700",
        ].join(" ")}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <ChevronDown />
      </div>
    </div>
  </div>
);

// ── Section Card wrapper ───────────────────────────────────────────────────────
const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

// ── BackArrow icon ────────────────────────────────────────────────────────────
const BackArrow = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

// ── SuccessPopup ──────────────────────────────────────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Saved</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>
        <div className="flex flex-col items-center py-8 px-5 gap-3">
          <div className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30">
            <CheckIcon />
          </div>
          <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">{message}</p>
        </div>
      </div>
    </div>,
    document.body
  );

// ── Asset Form (screen — used for Add) ────────────────────────────────────────
interface AssetFormProps {
  onSave: (a: Partial<Asset>) => void;
  onCancel: () => void;
}

const AssetForm = ({ onSave, onCancel }: AssetFormProps) => {
  const [form, setForm] = useState<Partial<Asset>>({
    status: "Active",
    taxType: "GST",
    tax: 0,
    purchasePrice: 0,
    reconPrice: 0,
    department: "",
    category: "",
    purchaseUnit: "",
    barcode: "",
    hsnCode: "",
    gtin: "",
    brandName: "",
  });

  const set = (field: keyof Asset) => (val: string) =>
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "purchasePrice" || field === "reconPrice" || field === "tax" ? Number(val) : val,
    }));

  return (
    <div className="flex flex-col gap-4">
      {/* Page-level title with back arrow */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <BackArrow />
        </button>
        <h1 className="text-base font-bold text-gray-900">Add Asset</h1>
      </div>

      {/* Basic Details */}
      <SectionCard title="Basic Details">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <TextField label="Name" value={form.name ?? ""} onChange={set("name")} required />
            <SelectField
              label="Purchase Unit"
              value={form.purchaseUnit ?? ""}
              onChange={set("purchaseUnit")}
              options={UNITS}
            />
            <SelectField
              label="Department"
              value={form.department ?? ""}
              onChange={set("department")}
              options={DEPARTMENTS}
              required
            />
            <TextField label="Category" value={form.category ?? ""} onChange={set("category")} />
          </div>
          <p className="text-xs text-gray-400 italic">
            Transactional data may change if a purchase unit is changed.
          </p>
        </div>
      </SectionCard>

      {/* Prices */}
      <SectionCard title="Prices">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Purchase Price"
            value={form.purchasePrice ?? ""}
            onChange={set("purchasePrice")}
            type="number"
            placeholder="Enter"
            required
          />
          <TextField
            label="Reconciliation Price"
            value={form.reconPrice ?? ""}
            onChange={set("reconPrice")}
            type="number"
            placeholder="Enter"
          />
        </div>
      </SectionCard>

      {/* Tax */}
      <SectionCard title="Prices">
        <div className="flex items-start gap-10 flex-wrap">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Type</p>
            <div className="flex items-center gap-6">
              {(["GST", "VAT"] as TaxType[]).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="taxType"
                    value={t}
                    checked={form.taxType === t}
                    onChange={() => setForm((p) => ({ ...p, taxType: t }))}
                    className="w-4 h-4 accent-[#1D6BA3]"
                  />
                  <span className="text-sm text-gray-700">{t}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="w-48">
            <TextField
              label="Tax(%)"
              value={form.tax ?? ""}
              onChange={set("tax")}
              type="number"
              placeholder="Enter"
            />
          </div>
        </div>
      </SectionCard>

      {/* Related Codes */}
      <SectionCard title="Related Codes">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Barcode/Short Code"
            value={form.barcode ?? ""}
            onChange={set("barcode")}
          />
          <TextField label="HSN Code" value={form.hsnCode ?? ""} onChange={set("hsnCode")} />
        </div>
      </SectionCard>

      {/* Excise Report */}
      <SectionCard title="Excise Report">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="GTIN" value={form.gtin ?? ""} onChange={set("gtin")} />
          <TextField label="Brand Name" value={form.brandName ?? ""} onChange={set("brandName")} />
        </div>
      </SectionCard>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 py-1">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          className="px-6 py-2 text-sm font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// ── Asset Modal (used for Edit) ───────────────────────────────────────────────
interface AssetModalProps {
  asset: Partial<Asset>;
  onClose: () => void;
  onSave: (a: Partial<Asset>) => void;
}

const AssetModal = ({ asset, onClose, onSave }: AssetModalProps) => {
  const [form, setForm] = useState<Partial<Asset>>({
    status: "Active",
    taxType: "GST",
    tax: 0,
    purchasePrice: 0,
    reconPrice: 0,
    barcode: "",
    hsnCode: "",
    gtin: "",
    brandName: "",
    ...asset,
  });

  const set = (field: keyof Asset) => (val: string) =>
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "purchasePrice" || field === "reconPrice" || field === "tax" ? Number(val) : val,
    }));

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-[15px] font-bold text-gray-900">Edit Asset</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="-mx-6 px-6 py-2 bg-gray-50 border-y border-gray-100">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Basic Details</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Name" value={form.name ?? ""} onChange={set("name")} required />
            <SelectField
              label="Department"
              value={form.department ?? ""}
              onChange={set("department")}
              options={DEPARTMENTS}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Category" value={form.category ?? ""} onChange={set("category")} />
            <SelectField
              label="Purchase Unit"
              value={form.purchaseUnit ?? ""}
              onChange={set("purchaseUnit")}
              options={UNITS}
            />
          </div>

          <div className="-mx-6 px-6 py-2 bg-gray-50 border-y border-gray-100">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Prices</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Purchase Price"
              value={form.purchasePrice ?? ""}
              onChange={set("purchasePrice")}
              type="number"
            />
            <TextField
              label="Reconciliation Price"
              value={form.reconPrice ?? ""}
              onChange={set("reconPrice")}
              type="number"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Type</p>
              <div className="flex items-center gap-4">
                {(["GST", "VAT"] as TaxType[]).map((t) => (
                  <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="taxType-modal"
                      value={t}
                      checked={form.taxType === t}
                      onChange={() => setForm((p) => ({ ...p, taxType: t }))}
                      className="w-3.5 h-3.5 accent-[#1D6BA3]"
                    />
                    <span className="text-xs text-gray-700">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <TextField label="Tax(%)" value={form.tax ?? ""} onChange={set("tax")} type="number" />
          </div>

          <div className="-mx-6 px-6 py-2 bg-gray-50 border-y border-gray-100">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Related Codes</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Barcode/Short Code"
              value={form.barcode ?? ""}
              onChange={set("barcode")}
            />
            <TextField label="HSN Code" value={form.hsnCode ?? ""} onChange={set("hsnCode")} />
          </div>

          <div className="-mx-6 px-6 py-2 bg-gray-50 border-y border-gray-100">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Excise Report</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="GTIN" value={form.gtin ?? ""} onChange={set("gtin")} />
            <TextField
              label="Brand Name"
              value={form.brandName ?? ""}
              onChange={set("brandName")}
            />
          </div>

          <div className="-mx-6 px-6 py-2 bg-gray-50 border-y border-gray-100">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Status</p>
          </div>
          <SelectField
            label="Status"
            value={form.status ?? ""}
            onChange={set("status")}
            options={STATUSES}
          />
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Status text (plain, matches Figma) ───────────────────────────────────────
const StatusBadge = ({ status }: { status: AssetStatus }) => (
  <span
    className={
      status === "Active"
        ? "text-green-600 font-medium text-xs"
        : "text-red-500 font-medium text-xs"
    }
  >
    {status}
  </span>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const AssetLibrary = () => {
  const [rows, setRows] = useState<Asset[]>(SEED);
  const [view, setView] = useState<ViewMode>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editAsset, setEditAsset] = useState<Partial<Asset> | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ fileName: string; added: number } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () =>
    exportToExcel(
      rows.map((r) => ({
        "Asset Name": r.name,
        Category: r.category,
        Department: r.department,
        "Purchase Price": r.purchasePrice,
        "GST/Tax": r.tax,
        Status: r.status,
      })),
      "AssetLibrary",
      "Asset_Library.xlsx"
    );

  const handleBulkUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadLoading(true);
    try {
      const data = await readXlsxFile(file);
      const newRows: Asset[] = data.map((r, i) => ({
        id: Date.now() + i,
        name: String(r["Asset Name"] ?? ""),
        category: String(r["Category"] ?? ""),
        department: String(r["Department"] ?? ""),
        purchaseUnit: "Nos",
        purchasePrice: Number(r["Purchase Price"] ?? 0),
        reconPrice: 0,
        taxType: "GST",
        tax: Number(r["GST/Tax"] ?? 0),
        barcode: "",
        hsnCode: "",
        gtin: "",
        brandName: "",
        status: "Active",
      }));
      setRows((p) => [...newRows, ...p]);
      setUploadResult({ fileName: file.name, added: data.length });
    } catch {
      setUploadResult({ fileName: file.name, added: 0 });
    } finally {
      setUploadLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const matchName = searchActive
          ? r.name.toLowerCase().includes(searchActive.toLowerCase())
          : true;
        const matchCat = categoryFilter ? r.category === categoryFilter : true;
        const matchDept = departmentFilter ? r.department === departmentFilter : true;
        return matchName && matchCat && matchDept;
      }),
    [rows, searchActive, categoryFilter, departmentFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => {
    setSearchActive(searchTerm);
    setCurrentPage(1);
  };
  const handleClear = () => {
    setSearchTerm("");
    setSearchActive("");
    setCategoryFilter("");
    setDepartmentFilter("");
    setCurrentPage(1);
  };

  const openCreate = () => setView("form");
  const openEdit = (a: Asset) => setEditAsset(a);

  const handleSave = (form: Partial<Asset>) => {
    if (form.id) {
      setRows((prev) => prev.map((r) => (r.id === form.id ? ({ ...r, ...form } as Asset) : r)));
      setEditAsset(null);
    } else {
      const newId = Math.max(0, ...rows.map((r) => r.id)) + 1;
      setRows((prev) => [...prev, { ...form, id: newId } as Asset]);
      setView("list");
    }
    setShowSuccess(true);
  };

  // ── Form screen ─────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <>
        <AssetForm onSave={handleSave} onCancel={() => setView("list")} />
        {showSuccess && (
          <SuccessPopup message="Asset Saved Successfully" onClose={() => setShowSuccess(false)} />
        )}
      </>
    );
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0 px-6 py-5 gap-4">
      {/* Upload banner outside the card */}
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
            {uploadResult.fileName} — {uploadResult.added} asset
            {uploadResult.added !== 1 ? "s" : ""} imported
          </span>
          <button
            onClick={() => setUploadResult(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon />
          </button>
        </div>
      )}

      {/* Single white card: title + filters + table + pagination */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        {/* Title row + action buttons */}
        <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-4 border-b border-gray-100">
          <h1 className="text-[18px] font-bold text-gray-900">Asset Library</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <ExportIcon />
              Export
              <ChevronDown />
            </button>
            <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
              Actions
              <ChevronDown />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={handleBulkUpload}
              disabled={uploadLoading}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#1D6BA3] text-[#1D6BA3] text-xs font-medium hover:bg-[#1D6BA3]/5 disabled:opacity-60 transition-colors"
            >
              <UploadIcon />
              {uploadLoading ? "Importing…" : "Bulk Upload"}
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1D6BA3]/90 transition-colors shadow-sm"
            >
              <PlusIcon />
              Create New
            </button>
          </div>
        </div>

        {/* Filter / Search row */}
        <div className="flex items-center gap-2 justify-end flex-wrap px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none h-9 pl-3 pr-8 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] w-36"
            >
              <option value="">Department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <ChevronDown />
            </span>
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none h-9 pl-3 pr-8 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] w-36"
            >
              <option value="">Asset Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <ChevronDown />
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by Asset Name"
              className="w-52 h-9 pl-3 pr-7 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSearchActive("");
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
              >
                <XIcon />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="h-9 px-4 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1D6BA3]/90 transition-colors"
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
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                  Asset Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                  Asset Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                  Purchase Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                  GST
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-xs">
                    No records found.
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.category}</td>
                    <td className="px-4 py-3 text-gray-600">{row.department}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {row.purchasePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.tax}%</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          title="Edit"
                          onClick={() => openEdit(row)}
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          startIdx={startIdx}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Edit Modal */}
      {editAsset && (
        <AssetModal asset={editAsset} onClose={() => setEditAsset(null)} onSave={handleSave} />
      )}

      {/* Success popup */}
      {showSuccess && (
        <SuccessPopup message="Asset Saved Successfully" onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
};

export default AssetLibrary;
