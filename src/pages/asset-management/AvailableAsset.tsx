import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { exportToExcel } from "../../utils/excel";
import { ITEMS_PER_PAGE } from "../../constants";
import Pagination from "../../components/common/Pagination/Pagination";
import Modal from "../../components/common/Modal/Modal";
import Button from "../../components/common/Button/Button";
import {
  ChevronDown,
  UploadIcon,
  EditIcon,
  DocumentIcon,
  EyeIcon,
  CalendarIcon,
  CheckIcon,
  CheckSmIcon,
  XIcon,
  XSmIcon,
  SearchIcon,
} from "../../components/common/Icons/PageIcons";

// ── Types ─────────────────────────────────────────────────────────────────────
import { type AssetAvailabilityRow } from "../../types/interfaces";

interface UpdateConditionForm {
  assetName: string;
  department: string;
  totalAvailable: string;
  updateDate: string;
  good: string;
  replace: string;
  scrap: string;
  remark: string;
}

// ── Seed Data ─────────────────────────────────────────────────────────────────
import { SEED_ASSET_AVAILABILITY as SEED_REGISTER } from "../../types/mockData";

const STATS = {
  totalWorth: "79.25 Lakhs",
  totalUnit: 10,
  goodCondition: 6,
  scrapped: 6,
  replacement: 6,
};

const ASSET_NAMES = [
  "Plastic Chair", "Whiteboard", "Microscope", "Desktop Computer",
  "Projector", "Wooden Table", "Cricket Bat", "Printer",
];
const DEPARTMENTS  = ["Science", "Commerce", "IT", "Arts", "Mathematics", "Physical Education"];
const CATEGORIES   = ["Furniture", "Electronics", "Lab Equipment", "Sports", "Stationery", "IT Equipment"];
const ACADEMIC_YEARS = ["2023-24", "2024-25", "2025-26"];
const SUPPLIERS    = ["TechWorld Solutions", "Global Lab", "Campusfun", "EduTech Solutions", "FurniCo"];

const EMPTY_FORM: UpdateConditionForm = {
  assetName: "", department: "", totalAvailable: "",
  updateDate: "", good: "", replace: "", scrap: "", remark: "",
};

// ── Shared primitives (scoped to this file) ───────────────────────────────────
const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const TextInput = ({
  placeholder = "Enter", value, onChange, type = "text",
}: {
  placeholder?: string; value: string; onChange: (v: string) => void; type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors placeholder-gray-400"
  />
);

const SelectField = ({
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

// ── Success Popup (portal) ────────────────────────────────────────────────────
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

// ── Update Condition Modal ─────────────────────────────────────────────────────
interface UpdateConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: UpdateConditionForm) => void;
}

const UpdateConditionModal = ({ isOpen, onClose, onSave }: UpdateConditionModalProps) => {
  const [form, setForm] = useState<UpdateConditionForm>(EMPTY_FORM);

  const set = (field: keyof UpdateConditionForm) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const handleSave = () => {
    onSave(form);
    setForm(EMPTY_FORM);
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  const footer = (
    <>
      <Button variant="ghost" size="sm" onClick={handleClose}
        className="border border-gray-200 text-gray-600 hover:bg-gray-50">
        Cancel
      </Button>
      <Button variant="primary" size="sm" onClick={handleSave}>
        Save
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Asset Condition" size="md" footer={footer}>
      <div className="flex flex-col gap-4">

        {/* Asset Name */}
        <div>
          <FieldLabel required>Asset Name</FieldLabel>
          <SelectField value={form.assetName} onChange={set("assetName")} options={ASSET_NAMES} />
        </div>

        {/* Department + Total Available */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Department</FieldLabel>
            <SelectField value={form.department} onChange={set("department")} options={DEPARTMENTS} placeholder="Department" />
          </div>
          <div>
            <FieldLabel>Total Available</FieldLabel>
            <TextInput value={form.totalAvailable} onChange={set("totalAvailable")} type="number" />
          </div>
        </div>

        {/* Update Date */}
        <div>
          <FieldLabel>Update Date</FieldLabel>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <CalendarIcon />
            </span>
            <input
              type="date"
              value={form.updateDate}
              onChange={(e) => set("updateDate")(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors text-gray-500"
            />
          </div>
        </div>

        {/* Good / Replace / Scrap */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <FieldLabel>Good</FieldLabel>
            <TextInput value={form.good} onChange={set("good")} type="number" />
          </div>
          <div>
            <FieldLabel>Replace</FieldLabel>
            <TextInput value={form.replace} onChange={set("replace")} type="number" />
          </div>
          <div>
            <FieldLabel>Scrap</FieldLabel>
            <TextInput value={form.scrap} onChange={set("scrap")} type="number" />
          </div>
        </div>

        {/* Remark */}
        <div>
          <FieldLabel>Remark</FieldLabel>
          <textarea
            rows={3}
            value={form.remark}
            onChange={(e) => set("remark")(e.target.value)}
            placeholder="Add"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors placeholder-gray-400 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
}

const StatCard = ({ icon, iconBg, label, value }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-3 flex-1 min-w-0">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 leading-tight truncate">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5 truncate">{value}</p>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const AvailableAsset = () => {
  const [rows, setRows] = useState<AssetAvailabilityRow[]>(SEED_REGISTER);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<AssetAvailabilityRow | null>(null);

  const handleExport = () => {
    exportToExcel(
      rows.map((r) => ({
        "Asset Name": r.assetName,
        Department: r.department,
        Supplier: r.supplier,
        "Total Qty": r.totalQty,
        Good: r.good,
        Replace: r.replace,
        Scrap: r.scrap,
        "Avg Price": r.avgPrice,
        "Est Value": r.estValue,
        "Last Update": r.lastUpdate,
      })),
      "AssetRegister",
      "Available_Assets.xlsx"
    );
  };

  const handleApply = () => { setSearchActive(searchTerm); setCurrentPage(1); };
  const handleClear = () => {
    setCategoryFilter(""); setDepartmentFilter("");
    setAcademicYearFilter(""); setSupplierFilter("");
    setSearchTerm(""); setSearchActive(""); setCurrentPage(1);
  };

  const filtered = useMemo(
    () => rows.filter((r) => {
      const matchSearch = searchActive
        ? r.assetName.toLowerCase().includes(searchActive.toLowerCase()) ||
          r.supplier.toLowerCase().includes(searchActive.toLowerCase())
        : true;
      const matchSupplier = supplierFilter ? r.supplier === supplierFilter : true;
      return matchSearch && matchSupplier;
    }),
    [rows, searchActive, supplierFilter]
  );

  const openEdit = (row: AssetAvailabilityRow) => {
    setEditingId(row.id);
    setEditDraft({ ...row });
  };

  const cancelEdit = () => { setEditingId(null); setEditDraft(null); };

  const saveEdit = () => {
    if (!editDraft) return;
    setRows((prev) => prev.map((r) => (r.id === editDraft.id ? editDraft : r)));
    setEditingId(null);
    setEditDraft(null);
    setShowSuccess(true);
  };

  const setDraftField = (field: keyof AssetAvailabilityRow) => (val: string) =>
    setEditDraft((prev) => prev ? ({ ...prev, [field]: ["totalQty","good","replace","scrap","avgPrice","estValue"].includes(field as string) ? Number(val) : val }) : prev);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSaveCondition = (form: UpdateConditionForm) => {
    // Update row if supplier/asset matches; otherwise record is noted
    if (form.assetName || form.good || form.replace || form.scrap) {
      setRows((prev) =>
        prev.map((r) =>
          r.supplier === form.assetName
            ? {
                ...r,
                good: Number(form.good) || r.good,
                replace: Number(form.replace) || r.replace,
                scrap: Number(form.scrap) || r.scrap,
              }
            : r
        )
      );
    }
    setModalOpen(false);
    setShowSuccess(true);
  };

  return (
    <div className="flex flex-col h-full min-h-0 px-6 py-5 gap-4">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-[18px] font-bold text-gray-900">Available Asset</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#1D6BA3] text-[#1D6BA3] text-xs font-medium hover:bg-[#1D6BA3]/5 transition-colors"
          >
            <UploadIcon />
            Bulk Upload
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1D6BA3]/90 transition-colors shadow-sm"
          >
            Update Condition
          </button>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        {/* Total Asset Worth */}
        <StatCard
          iconBg="bg-purple-100"
          icon={
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          }
          label="Total Asset Worth"
          value={STATS.totalWorth}
        />

        {/* Total Unit */}
        <StatCard
          iconBg="bg-blue-100"
          icon={
            <svg className="w-5 h-5 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 21V12h6v9" />
            </svg>
          }
          label="Total Unit"
          value={STATS.totalUnit}
        />

        {/* Good Condition */}
        <StatCard
          iconBg="bg-green-100"
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l3 3 5-5" />
            </svg>
          }
          label="Good Condition"
          value={STATS.goodCondition}
        />

        {/* Scrapped */}
        <StatCard
          iconBg="bg-red-100"
          icon={
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6M15 9l-6 6" />
            </svg>
          }
          label="Scrapped"
          value={STATS.scrapped}
        />

        {/* Replacement */}
        <StatCard
          iconBg="bg-amber-100"
          icon={
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
          label="Replacement"
          value={<span className="text-amber-500">{STATS.replacement}</span>}
        />
      </div>

      {/* ── Asset Register Section ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">

        {/* Section header + filters */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-3">Asset Register</p>
          <div className="flex items-center gap-2 flex-wrap justify-end">

            {/* Search */}
            <div className="relative mr-auto">
              <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="Search asset or supplier"
                className="h-9 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] w-52"
              />
            </div>

            {/* Asset Category */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 w-36"
              >
                <option value="">Asset Category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown /></span>
            </div>

            {/* Department */}
            <div className="relative">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 w-32"
              >
                <option value="">Department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown /></span>
            </div>

            {/* Academic Year */}
            <div className="relative">
              <select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 w-32"
              >
                <option value="">Academic Year</option>
                {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown /></span>
            </div>

            {/* Supplier */}
            <div className="relative">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 w-36"
              >
                <option value="">Supplier</option>
                {SUPPLIERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown /></span>
            </div>

            <button
              onClick={handleApply}
              className="h-9 px-5 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1D6BA3]/90 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={handleClear}
              className="h-9 px-4 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* ── Inline Edit Panel ── shown when a row is being edited */}
        {editingId !== null && editDraft && (
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <FieldLabel>Asset Name</FieldLabel>
                <SelectField
                  value={editDraft.assetName}
                  onChange={setDraftField("assetName")}
                  options={ASSET_NAMES}
                />
              </div>
              <div>
                <FieldLabel>Department</FieldLabel>
                <SelectField
                  value={editDraft.department}
                  onChange={setDraftField("department")}
                  options={DEPARTMENTS}
                  placeholder="Department"
                />
              </div>
              <div>
                <FieldLabel>Total Available</FieldLabel>
                <TextInput
                  value={String(editDraft.totalQty)}
                  onChange={setDraftField("totalQty")}
                  type="number"
                />
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[1600px] w-full text-xs">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap w-[160px]">Asset Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap w-[160px]">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap w-[180px]">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap w-[110px]">Total Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap w-[120px]">Good</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap w-[140px]">Replace</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap w-[120px]">Scrap</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap w-[150px]">Avg Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap w-[150px]">Est Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap w-[160px]">Last Update</th>
                <th className="sticky right-0 bg-[#EFF6FF] px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap w-[140px] border-l border-gray-200">Actions</th>
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
                paginated.map((row) => {
                  const isEditing = editingId === row.id;
                  const d = isEditing && editDraft ? editDraft : row;

                  // Compact inline input used inside table cells
                  const CellInput = ({ field, color }: { field: keyof AssetAvailabilityRow; color?: string }) => (
                    <input
                      type="number"
                      value={Number((editDraft as AssetAvailabilityRow)[field])}
                      onChange={(e) => setDraftField(field)(e.target.value)}
                      className={`w-full px-2 py-1 text-xs border border-[#1D6BA3]/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] ${color ?? "text-gray-700"}`}
                    />
                  );

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${isEditing ? "bg-blue-50/40" : "hover:bg-gray-50/60"}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{d.assetName}</td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{d.department}</td>
                      <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{d.supplier}</td>
                      <td className="px-4 py-2.5 text-gray-700">{d.totalQty}</td>
                      <td className="px-4 py-2.5 text-green-600 font-medium">{d.good}</td>

                      {/* Editable: Replace */}
                      <td className="px-4 py-2.5">
                        {isEditing
                          ? <CellInput field="replace" color="text-amber-700" />
                          : <span className="text-amber-600 font-medium">{row.replace}</span>}
                      </td>

                      {/* Editable: Scrap */}
                      <td className="px-4 py-2.5">
                        {isEditing
                          ? <CellInput field="scrap" color="text-red-600" />
                          : <span className="text-red-500 font-medium">{row.scrap}</span>}
                      </td>

                      {/* Editable: Avg Price */}
                      <td className="px-4 py-2.5">
                        {isEditing
                          ? <CellInput field="avgPrice" />
                          : <span className="text-gray-700">{row.avgPrice.toLocaleString()}</span>}
                      </td>

                      {/* Editable: Est Value */}
                      <td className="px-4 py-2.5">
                        {isEditing
                          ? <CellInput field="estValue" />
                          : <span className="text-gray-700">{row.estValue.toLocaleString()}</span>}
                      </td>

                      {/* Editable: Last Update */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {isEditing
                          ? (
                            <input
                              type="date"
                              value={editDraft!.lastUpdate.split("/").reverse().join("-")}
                              onChange={(e) => {
                                const [y, m, dd] = e.target.value.split("-");
                                setDraftField("lastUpdate")(`${dd}/${m}/${y}`);
                              }}
                              className="w-full px-2 py-1 text-xs border border-[#1D6BA3]/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] text-gray-700"
                            />
                          )
                          : <span className="text-gray-600">{row.lastUpdate}</span>}
                      </td>

                      {/* Actions — sticky */}
                      <td className="sticky right-0 bg-white px-4 py-2.5 border-l border-gray-200">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                title="Save"
                                onClick={saveEdit}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              >
                                <CheckSmIcon />
                              </button>
                              <button
                                title="Cancel"
                                onClick={cancelEdit}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              >
                                <XSmIcon />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                title="View"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors"
                              >
                                <EyeIcon />
                              </button>
                              <button
                                title="Edit"
                                onClick={() => openEdit(row)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                              >
                                <EditIcon />
                              </button>
                              <button
                                title="Document"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                              >
                                <DocumentIcon />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* ── Update Condition Modal ──────────────────────────────────────────── */}
      <UpdateConditionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCondition}
      />

      {/* ── Success Popup ───────────────────────────────────────────────────── */}
      {showSuccess && (
        <SuccessPopup
          message="Asset Condition Updated Successfully"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default AvailableAsset;
