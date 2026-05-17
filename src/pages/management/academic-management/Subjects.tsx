import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../../../components/common/Button/Button";
import {
  ITEMS_PER_PAGE, DEPARTMENTS, PROGRAM_TYPES, SUBJECT_TYPES,
  CURRICULA_OPTS, YEAR_OPTS,
} from "../../../constants";
import { findField, readXlsxFile, exportToExcel } from "../../../utils/excel";
import {
  UploadIcon, PlusIcon, PencilIcon, EditIcon, DocumentIcon, TrashIcon,
  XIcon, CheckIcon, CheckSmIcon, XSmIcon, ChevronDown, SearchIcon, ExportIcon,
} from "../../../components/common/Icons/PageIcons";
import Pagination from "../../../components/common/Pagination/Pagination";
import { type Subject, type Unit, type SubUnit, type SubUnitDraft } from "../../../types/interfaces";
import { SEED_SUBJECTS } from "../../../types/mockData";

type UploadResult = { fileName: string; added: number; skipped: number; errors: string[] } | null;

// ── ID Generation ─────────────────────────────────────────────────────────────
let globalIdCounter = Date.now();
const getNextId = () => {
  globalIdCounter += 1;
  return globalIdCounter;
};


// ── Excel parsing (page-specific) ─────────────────────────────────────────────
const parseXlsxRows = (rows: Record<string, unknown>[]): { added: Subject[]; skipped: string[] } => {
  const added: Subject[]  = [];
  const skipped: string[] = [];
  rows.forEach((row, i) => {
    const subjectName = String(findField(row, "subject name", "subject") ?? "").trim();
    const subjectCode = String(findField(row, "subject code", "code") ?? "").trim();
    const curriculum  = String(findField(row, "curriculum", "regulation") ?? "").trim();
    const department  = String(findField(row, "department") ?? "").trim();
    const subjectType = String(findField(row, "subject type", "type") ?? "").trim();
    const programType = String(findField(row, "program type", "program") ?? "UG").trim();
    const professors  = String(findField(row, "professors", "professor") ?? "").trim();
    const credits     = String(findField(row, "credits") ?? "").trim();
    if (!subjectName) { skipped.push(`Row ${i + 2} — missing subject name`); return; }
    added.push({ id: Date.now() + i, subjectName, subjectCode, curriculum: curriculum ? [curriculum] : [], department: department ? [department] : [], subjectType: subjectType ? [subjectType] : [],
      programType: programType ? [programType] : ["UG"], professors, credits, year: [], semester: [], units: [], status: "Active" });
  });
  return { added, skipped };
};


// ── Shared UI helpers ─────────────────────────────────────────────────────────
const IconBtn = ({ children, title, onClick }: { children: React.ReactNode; title: string; onClick?: () => void }) => (
  <button title={title} onClick={onClick}
    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors">
    {children}
  </button>
);

const SubjectTypeBadge = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    Major: "text-[#1D6BA3]", Allied: "text-teal-600", Elective: "text-purple-600",
    Core: "text-amber-600", Foundation: "text-green-600", "Skill-Based": "text-rose-600",
  };
  return <span className={`font-medium text-sm ${colors[type] ?? "text-gray-600"}`}>{type}</span>;
};

const ProgramBadge = ({ type }: { type: string }) => (
  <span className="text-[#1D6BA3] font-semibold text-sm">{type}</span>
);

// ── Success Popup ─────────────────────────────────────────────────────────────
const SuccessPopup = ({ title, message, onClose }: { title: string; message: string; onClose: () => void }) => {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>
        <div className="flex flex-col items-center py-10 px-5 gap-3">
          <div className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30">
            <CheckIcon />
          </div>
          <p className="text-[13px] font-bold text-gray-800 text-center mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};


// ── Multi-select Checkbox Dropdown ────────────────────────────────────────────
const MultiSelect = ({ label, options, selected, onChange, placeholder = "Select", error }: {
  label: string; options: readonly string[]; selected: string[];
  onChange: (vals: string[]) => void; placeholder?: string; error?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val]);
  const displayText = selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} selected`;
  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={["w-full flex items-center justify-between px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer text-left",
          error ? "border-red-400" : "border-gray-200", selected.length === 0 ? "text-gray-400" : "text-gray-800"].join(" ")}>
        <span className="truncate">{displayText}</span>
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-44 overflow-y-auto py-1">
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#1D6BA3] accent-[#1D6BA3] cursor-pointer" />
                {opt}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Field primitives ──────────────────────────────────────────────────────────
const inputCls = (err?: boolean) =>
  `w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400 ${err ? "border-red-400" : "border-gray-200"}`;


const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-sm font-medium text-gray-700 mb-2">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

// ── Unit Card Cell ────────────────────────────────────────────────────────────
const UnitCell = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50/60 flex-1">
    <p className="text-[10px] text-gray-400 font-medium mb-0.5">{label}</p>
    <p className="text-sm font-bold text-gray-800">{value || "—"}</p>
  </div>
);

// ── Inline sub-unit text input ─────────────────────────────────────────────────
const SubInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder="Enter"
    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400" />
);

// ── Add Unit Portal Modal — supports staging multiple units before saving ──────
interface StagedUnit { stageId: number; unitNumber: string; unitName: string; }
interface AddUnitModalProps { onClose: () => void; onSave: (units: StagedUnit[]) => void; }

const AddUnitModal = ({ onClose, onSave }: AddUnitModalProps) => {
  const [unitNumber, setUnitNumber] = useState("");
  const [unitName,   setUnitName]   = useState("");
  const [staged,     setStaged]     = useState<StagedUnit[]>([]);
  const [errors,     setErrors]     = useState<{ unitNumber?: string; unitName?: string }>({});

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const handleAddToList = () => {
    const e: typeof errors = {};
    if (!unitNumber.trim()) e.unitNumber = "Required";
    if (!unitName.trim())   e.unitName   = "Required";
    setErrors(e);
    if (Object.keys(e).length) return;
    setStaged(prev => [...prev, { stageId: Date.now(), unitNumber: unitNumber.trim(), unitName: unitName.trim() }]);
    setUnitNumber(""); setUnitName(""); setErrors({});
  };

  const handleRemoveStaged = (stageId: number) =>
    setStaged(prev => prev.filter(s => s.stageId !== stageId));

  const handleSave = () => {
    // If user filled inputs but forgot to click "+ Add Unit", stage it automatically
    if (unitNumber.trim() || unitName.trim()) {
      const e: typeof errors = {};
      if (!unitNumber.trim()) e.unitNumber = "Required";
      if (!unitName.trim())   e.unitName   = "Required";
      if (Object.keys(e).length) { setErrors(e); return; }
      const all = [...staged, { stageId: Date.now(), unitNumber: unitNumber.trim(), unitName: unitName.trim() }];
      if (all.length === 0) return;
      onSave(all);
      return;
    }
    if (staged.length === 0) return;
    onSave(staged);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">Add Unit</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Input form */}
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-800 mb-4">Units</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Unit Number</label>
                <input type="text" value={unitNumber}
                  onChange={e => { setUnitNumber(e.target.value); setErrors(p => ({ ...p, unitNumber: undefined })); }}
                  onKeyDown={e => e.key === "Enter" && handleAddToList()}
                  placeholder="Enter"
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400 ${errors.unitNumber ? "border-red-400" : "border-gray-200"}`} />
                {errors.unitNumber && <p className="mt-1 text-xs text-red-500">{errors.unitNumber}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Unit Name</label>
                <input type="text" value={unitName}
                  onChange={e => { setUnitName(e.target.value); setErrors(p => ({ ...p, unitName: undefined })); }}
                  onKeyDown={e => e.key === "Enter" && handleAddToList()}
                  placeholder="Enter"
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400 ${errors.unitName ? "border-red-400" : "border-gray-200"}`} />
                {errors.unitName && <p className="mt-1 text-xs text-red-500">{errors.unitName}</p>}
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={handleAddToList}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#1D6BA3] hover:text-[#1D6BA3]/80 transition-colors">
                <PlusIcon /> Add Unit
              </button>
            </div>
          </div>

          {/* Staged units table */}
          {staged.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EFF6FF] border-b border-gray-100">
                    {["Units", "Unit Number", "Unit Name", "Actions"].map((h, i) => (
                      <th key={h} className={["py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide",
                        i === 3 ? "pr-4 text-right text-[#1D6BA3]" : "px-4 text-left"].join(" ")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staged.map((s, idx) => (
                    <tr key={s.stageId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-2.5 text-gray-500 text-sm">{idx + 1}</td>
                      <td className="px-4 py-2.5 text-gray-700">{s.unitNumber}</td>
                      <td className="px-4 py-2.5 text-gray-700">{s.unitName}</td>
                      <td className="pr-4 py-2.5 text-right">
                        <button onClick={() => handleRemoveStaged(s.stageId)}
                          className="text-[#1D6BA3] hover:text-red-500 transition-colors" title="Remove">
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button variant="ghost"   size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave}
            disabled={staged.length === 0 && !unitNumber.trim() && !unitName.trim()}>
            Save
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Edit Unit Portal Modal ────────────────────────────────────────────────────
interface EditUnitModalProps { unit: Unit; onClose: () => void; onSave: (unitNumber: string, unitName: string) => void; }

const EditUnitModal = ({ unit, onClose, onSave }: EditUnitModalProps) => {
  const [unitNumber, setUnitNumber] = useState(unit.unitNumber);
  const [unitName,   setUnitName]   = useState(unit.unitName);
  const [errors,     setErrors]     = useState<{ unitNumber?: string; unitName?: string }>({});

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSave = () => {
    const e: typeof errors = {};
    if (!unitNumber.trim()) e.unitNumber = "Required";
    if (!unitName.trim())   e.unitName   = "Required";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave(unitNumber.trim(), unitName.trim());
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">Edit Unit</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>
        <div className="px-6 py-5">
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-800 mb-4">Units</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Unit Number</label>
                <input type="text" value={unitNumber}
                  onChange={e => { setUnitNumber(e.target.value); setErrors(p => ({ ...p, unitNumber: undefined })); }}
                  placeholder="Enter"
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400 ${errors.unitNumber ? "border-red-400" : "border-gray-200"}`} />
                {errors.unitNumber && <p className="mt-1 text-xs text-red-500">{errors.unitNumber}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Unit Name</label>
                <input type="text" value={unitName}
                  onChange={e => { setUnitName(e.target.value); setErrors(p => ({ ...p, unitName: undefined })); }}
                  placeholder="Enter"
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400 ${errors.unitName ? "border-red-400" : "border-gray-200"}`} />
                {errors.unitName && <p className="mt-1 text-xs text-red-500">{errors.unitName}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button variant="ghost"   size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Sub-Unit Table ────────────────────────────────────────────────────────────
// Handles saved rows (with pencil edit) + draft rows (inline inputs with ✓ ✗)
interface SubUnitTableProps {
  subUnits: SubUnit[];
  drafts: SubUnitDraft[];
  editingSubUnitId: number | null;
  subEditDraft: Omit<SubUnit, "id">;
  onAddDraft: () => void;
  onChangeDraft: (draftId: number, field: keyof Omit<SubUnitDraft, "draftId">, value: string) => void;
  onSaveDraft: (draftId: number) => void;
  onRemoveDraft: (draftId: number) => void;
  onEditSubUnit: (su: SubUnit) => void;
  onChangeSubEdit: (field: keyof Omit<SubUnit, "id">, value: string) => void;
  onSaveSubEdit: () => void;
  onCancelSubEdit: () => void;
  onDeleteSubUnit: (id: number) => void;
}

const SubUnitTable = ({
  subUnits, drafts, editingSubUnitId, subEditDraft,
  onAddDraft, onChangeDraft, onSaveDraft, onRemoveDraft,
  onEditSubUnit, onChangeSubEdit, onSaveSubEdit, onCancelSubEdit,
  onDeleteSubUnit,
}: SubUnitTableProps) => {
  const hasRows = subUnits.length > 0 || drafts.length > 0;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <p className="text-sm font-bold text-gray-800">Sub - Unit</p>
        <button onClick={onAddDraft}
          className="flex items-center gap-1 text-sm font-semibold text-[#1D6BA3] hover:text-[#1D6BA3]/80 transition-colors">
          <PlusIcon /> Add Sub-Unit
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {["Sub - Unit", "Sub - Unit Number", "Sub - Unit Name", "Action"].map((h, i) => (
              <th key={h} className={["py-2.5 text-xs font-semibold text-gray-600 tracking-wide",
                i === 3 ? "pr-4 text-right w-24" : "px-4 text-left"].join(" ")}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* No data */}
          {!hasRows && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <SearchIcon /> No Data Found
                </div>
              </td>
            </tr>
          )}

          {/* Saved sub-unit rows */}
          {subUnits.map(su => (
            <tr key={su.id} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
              {editingSubUnitId === su.id ? (
                // Edit mode — inline inputs
                <>
                  <td className="px-4 py-2">
                    <SubInput value={subEditDraft.subUnit} onChange={v => onChangeSubEdit("subUnit", v)} />
                  </td>
                  <td className="px-4 py-2">
                    <SubInput value={subEditDraft.subUnitNumber} onChange={v => onChangeSubEdit("subUnitNumber", v)} />
                  </td>
                  <td className="px-4 py-2">
                    <SubInput value={subEditDraft.subUnitName} onChange={v => onChangeSubEdit("subUnitName", v)} />
                  </td>
                  <td className="pr-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={onSaveSubEdit}
                        className="text-green-500 hover:text-green-600 transition-colors" title="Save">
                        <CheckSmIcon />
                      </button>
                      <button onClick={onCancelSubEdit}
                        className="text-red-400 hover:text-red-500 transition-colors" title="Cancel">
                        <XSmIcon />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                // View mode
                <>
                  <td className="px-4 py-2.5 text-gray-700">{su.subUnit || "—"}</td>
                  <td className="px-4 py-2.5 text-gray-600">{su.subUnitNumber || "-"}</td>
                  <td className="px-4 py-2.5 text-gray-600">{su.subUnitName || "—"}</td>
                  <td className="pr-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEditSubUnit(su)}
                        className="text-[#1D6BA3] hover:text-[#1D6BA3]/70 transition-colors" title="Edit">
                        <PencilIcon />
                      </button>
                      <button onClick={() => onDeleteSubUnit(su.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors" title="Delete">
                        <XSmIcon />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}

          {/* Draft (new) rows — inline inputs */}
          {drafts.map(draft => (
            <tr key={draft.draftId} className="border-t border-gray-100 bg-blue-50/20">
              <td className="px-4 py-2">
                <SubInput value={draft.subUnit}
                  onChange={v => onChangeDraft(draft.draftId, "subUnit", v)} />
              </td>
              <td className="px-4 py-2">
                <SubInput value={draft.subUnitNumber}
                  onChange={v => onChangeDraft(draft.draftId, "subUnitNumber", v)} />
              </td>
              <td className="px-4 py-2">
                <SubInput value={draft.subUnitName}
                  onChange={v => onChangeDraft(draft.draftId, "subUnitName", v)} />
              </td>
              <td className="pr-4 py-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onSaveDraft(draft.draftId)}
                    className="text-green-500 hover:text-green-600 transition-colors" title="Save">
                    <CheckSmIcon />
                  </button>
                  <button onClick={() => onRemoveDraft(draft.draftId)}
                    className="text-red-400 hover:text-red-500 transition-colors" title="Remove">
                    <XSmIcon />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Syllabus Units Manager ────────────────────────────────────────────────────
interface SyllabusUnitsProps { units: Unit[]; onChange: (units: Unit[]) => void; }

const SyllabusUnitsManager = ({ units, onChange }: SyllabusUnitsProps) => {
  // Modal state
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [editingUnit,   setEditingUnit]   = useState<Unit | null>(null);
  // Which unit's sub-section is expanded
  const [expandedId,    setExpandedId]    = useState<number | null>(null);
  // Draft sub-unit rows per unit (unsaved inline input rows)
  const [subDrafts,     setSubDrafts]     = useState<Record<number, SubUnitDraft[]>>({});
  // Which saved sub-unit is in edit mode
  const [editingSubUnit, setEditingSubUnit] = useState<{ unitId: number; subUnitId: number } | null>(null);
  const [subEditDraft,  setSubEditDraft]  = useState<Omit<SubUnit, "id">>({ subUnit: "", subUnitNumber: "", subUnitName: "" });

  // ── Unit CRUD ──────────────────────────────────────────────────────────────
  const handleAddUnit = (newUnits: StagedUnit[]) => {
    const toAdd: Unit[] = newUnits.map((u, i) => ({
      id: getNextId() + i, unitNumber: u.unitNumber, unitName: u.unitName, subUnits: [],
    }));
    onChange([...units, ...toAdd]);
    setShowAddModal(false);
  };

  const handleEditUnit = (unitNumber: string, unitName: string) => {
    if (!editingUnit) return;
    onChange(units.map(u => u.id === editingUnit.id ? { ...u, unitNumber, unitName } : u));
    setEditingUnit(null);
  };

  // ── Sub-unit drafts ────────────────────────────────────────────────────────
  const addDraft = (unitId: number) => {
    setSubDrafts(prev => ({
      ...prev,
      [unitId]: [...(prev[unitId] ?? []), { draftId: getNextId(), subUnit: "", subUnitNumber: "", subUnitName: "" }],
    }));
  };

  const changeDraft = (unitId: number, draftId: number, field: keyof Omit<SubUnitDraft, "draftId">, value: string) => {
    setSubDrafts(prev => ({
      ...prev,
      [unitId]: (prev[unitId] ?? []).map(d => d.draftId === draftId ? { ...d, [field]: value } : d),
    }));
  };

  const saveDraft = (unitId: number, draftId: number) => {
    const draft = (subDrafts[unitId] ?? []).find(d => d.draftId === draftId);
    if (!draft) return;
    const newSubUnit: SubUnit = {
      id: getNextId(), // Unique enough for local
      subUnit: draft.subUnit.trim(),
      subUnitNumber: draft.subUnitNumber.trim(),
      subUnitName: draft.subUnitName.trim(),
    };
    onChange(units.map(u => u.id === unitId ? { ...u, subUnits: [...u.subUnits, newSubUnit] } : u));
    setSubDrafts(prev => ({ ...prev, [unitId]: (prev[unitId] ?? []).filter(d => d.draftId !== draftId) }));
  };

  const removeDraft = (unitId: number, draftId: number) => {
    setSubDrafts(prev => ({ ...prev, [unitId]: (prev[unitId] ?? []).filter(d => d.draftId !== draftId) }));
  };

  // ── Sub-unit edit (saved rows) ─────────────────────────────────────────────
  const startSubEdit = (unitId: number, su: SubUnit) => {
    setEditingSubUnit({ unitId, subUnitId: su.id });
    setSubEditDraft({ subUnit: su.subUnit, subUnitNumber: su.subUnitNumber, subUnitName: su.subUnitName });
  };

  const saveSubEdit = () => {
    if (!editingSubUnit) return;
    onChange(units.map(u => u.id === editingSubUnit.unitId
      ? { ...u, subUnits: u.subUnits.map(s => s.id === editingSubUnit.subUnitId ? { ...s, ...subEditDraft } : s) }
      : u));
    setEditingSubUnit(null);
  };

  const deleteSubUnit = (unitId: number, subId: number) => {
    onChange(units.map(u => u.id === unitId ? { ...u, subUnits: u.subUnits.filter(s => s.id !== subId) } : u));
    if (editingSubUnit?.unitId === unitId && editingSubUnit.subUnitId === subId) setEditingSubUnit(null);
  };

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-800">Syllabus Units</p>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#1D6BA3] border border-dashed border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 transition-colors">
          <PlusIcon /> Add Unit
        </button>
      </div>

      {/* Empty state */}
      {units.length === 0 && (
        <div className="border border-dashed border-gray-200 rounded-xl py-12 flex items-center justify-center bg-gray-50/50">
          <p className="text-sm text-gray-400">No Units added Yet. Click "Add Unit" to Define The Syllabus Structure</p>
        </div>
      )}

      {/* Units table */}
      {units.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Table header row */}
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 bg-[#EFF6FF] border-b border-gray-100">
            {["Unit", "Unit Number", "Unit Name", "Action"].map((h, i) => (
              <span key={h} className={`text-xs font-semibold text-gray-600 uppercase tracking-wide ${i === 3 ? "text-right min-w-[220px]" : ""}`}>{h}</span>
            ))}
          </div>

          {units.map((unit, idx) => {
            const isExpanded = expandedId === unit.id;
            const drafts = subDrafts[unit.id] ?? [];

            return (
              <div key={unit.id} className="border-b border-gray-100 last:border-b-0">
                {/* Unit data row */}
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center px-4 py-3">
                  <UnitCell label="Unit" value={`Unit ${idx + 1}`} />
                  <UnitCell label="Unit" value={unit.unitNumber} />
                  <UnitCell label="Unit" value={unit.unitName} />

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 justify-end min-w-[220px]">
                    {/* Manage Unit / Hide toggle */}
                    {isExpanded ? (
                      <button onClick={() => setExpandedId(null)}
                        className="px-3.5 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Hide
                      </button>
                    ) : (
                      <button onClick={() => { setExpandedId(unit.id); setEditingSubUnit(null); }}
                        className="px-3.5 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Manage Unit
                      </button>
                    )}

                    {/* Edit Units — opens portal modal */}
                    <button onClick={() => setEditingUnit(unit)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors whitespace-nowrap">
                      <PencilIcon /> Edit Units
                    </button>
                  </div>
                </div>

                {/* Sub-unit expanded panel */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <SubUnitTable
                      subUnits={unit.subUnits}
                      drafts={drafts}
                      editingSubUnitId={editingSubUnit?.unitId === unit.id ? editingSubUnit.subUnitId : null}
                      subEditDraft={subEditDraft}
                      onAddDraft={() => addDraft(unit.id)}
                      onChangeDraft={(draftId, field, value) => changeDraft(unit.id, draftId, field, value)}
                      onSaveDraft={(draftId) => saveDraft(unit.id, draftId)}
                      onRemoveDraft={(draftId) => removeDraft(unit.id, draftId)}
                      onEditSubUnit={(su) => startSubEdit(unit.id, su)}
                      onChangeSubEdit={(field, value) => setSubEditDraft(p => ({ ...p, [field]: value }))}
                      onSaveSubEdit={saveSubEdit}
                      onCancelSubEdit={() => setEditingSubUnit(null)}
                      onDeleteSubUnit={(subId) => deleteSubUnit(unit.id, subId)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddUnitModal onClose={() => setShowAddModal(false)} onSave={handleAddUnit} />
      )}
      {editingUnit && (
        <EditUnitModal unit={editingUnit} onClose={() => setEditingUnit(null)} onSave={handleEditUnit} />
      )}
    </div>
  );
};

// ── Subject Form — Add & Edit (inline full-page view) ─────────────────────────
interface SubjectFormErrors { subjectName?: string; subjectCode?: string; }

interface SubjectFormProps {
  initial: Omit<Subject, "id"> & { id?: number };
  onClose: () => void;
  onSave: (data: Omit<Subject, "id">) => void;
}

const SubjectForm = ({ initial, onClose, onSave }: SubjectFormProps) => {
  const [subjectName, setSubjectName] = useState(initial.subjectName);
  const [subjectCode, setSubjectCode] = useState(initial.subjectCode);
  const [subjectType, setSubjectType] = useState<string[]>(initial.subjectType);
  const [curriculum,  setCurriculum]  = useState<string[]>(initial.curriculum);
  const [programType, setProgramType] = useState<string[]>(initial.programType);
  const [year,        setYear]        = useState<string[]>(initial.year);
  const [semester,    setSemester]    = useState<string[]>(initial.semester);
  const [credits,     setCredits]     = useState(initial.credits);
  const [professors,  setProfessors]  = useState(initial.professors);
  const [department,  setDepartment]  = useState<string[]>(initial.department);
  const [units,       setUnits]       = useState<Unit[]>(initial.units);
  const [errors,      setErrors]      = useState<SubjectFormErrors>({});

  const validate = (): boolean => {
    const e: SubjectFormErrors = {};
    if (!subjectName.trim()) e.subjectName = "Required";
    if (!subjectCode.trim()) e.subjectCode = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ subjectName: subjectName.trim(), subjectCode: subjectCode.trim(), subjectType, curriculum,
      programType, year, semester, credits: credits.trim(), professors: professors.trim(), department, units });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h1 className="text-base font-bold text-gray-900">Subjects Repository</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-4 gap-5">
          <div>
            <FieldLabel required>Subject Name</FieldLabel>
            <input type="text" value={subjectName}
              onChange={e => { setSubjectName(e.target.value); setErrors(p => ({ ...p, subjectName: undefined })); }}
              placeholder="Enter" className={inputCls(!!errors.subjectName)} />
            {errors.subjectName && <p className="mt-1 text-xs text-red-500">{errors.subjectName}</p>}
          </div>
          <div>
            <FieldLabel required>Subject Code</FieldLabel>
            <input type="text" value={subjectCode}
              onChange={e => { setSubjectCode(e.target.value); setErrors(p => ({ ...p, subjectCode: undefined })); }}
              placeholder="Enter" className={inputCls(!!errors.subjectCode)} />
            {errors.subjectCode && <p className="mt-1 text-xs text-red-500">{errors.subjectCode}</p>}
          </div>
          <MultiSelect label="Subject Type" options={SUBJECT_TYPES} selected={subjectType} onChange={setSubjectType} placeholder="Select" />
          <MultiSelect label="Curriculum/Regulation" options={CURRICULA_OPTS} selected={curriculum} onChange={setCurriculum} placeholder="Select" />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-4 gap-5">
          <MultiSelect label="Program Type" options={PROGRAM_TYPES} selected={programType} onChange={setProgramType} placeholder="Select" />
          <MultiSelect label="Year"         options={YEAR_OPTS}     selected={year}        onChange={setYear}        placeholder="Select" />
          <MultiSelect label="Semester"     options={["Odd", "Even"]} selected={semester}    onChange={setSemester}    placeholder="Select" />
          <div>
            <FieldLabel>Credits</FieldLabel>
            <input type="text" value={credits} onChange={e => setCredits(e.target.value)} placeholder="Enter" className={inputCls()} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-4 gap-5">
          <MultiSelect label="Department" options={DEPARTMENTS} selected={department} onChange={setDepartment} placeholder="Select" />
          <div className="col-span-3">
            <FieldLabel>Professors</FieldLabel>
            <input type="text" value={professors} onChange={e => setProfessors(e.target.value)}
              placeholder="Enter professor name" className={inputCls()} />
          </div>
        </div>

        {/* Syllabus Units */}
        <SyllabusUnitsManager units={units} onChange={setUnits} />
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
        <Button variant="ghost"   size="md" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="md" onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};

// ── Export Dropdown ────────────────────────────────────────────────────────────
const ExportDropdown = ({ subjects }: { subjects: Subject[] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const exportCSV = () => {
    const headers = ["Subject Code", "Subject Name", "Curriculum", "Department", "Subject Type", "Program Type", "Professors", "Credits", "Units", "Status"];
    const rows = subjects.map(s => [s.subjectCode, s.subjectName, s.curriculum.join("; "), s.department.join("; "), s.subjectType.join("; "), s.programType.join("; "), s.professors, s.credits, String(s.units?.length || 0), s.status || "Active"]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "subjects.csv"; a.click();
    setOpen(false);
  };

  const exportXLSX = () => {
    exportToExcel(
      subjects.map(s => ({
        "Subject Code": s.subjectCode, "Subject Name": s.subjectName, "Curriculum": s.curriculum.join("; "),
        "Department": s.department.join("; "), "Subject Type": s.subjectType.join("; "), "Program Type": s.programType.join("; "),
        "Professors": s.professors, "Credits": s.credits, "Units": String(s.units?.length || 0), "Status": s.status || "Active",
      })),
      "Subjects",
      "subjects.xlsx",
    );
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 transition-colors">
        <ExportIcon /> Export
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
          <button onClick={exportCSV} className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors">Export CSV</button>
          <button onClick={exportXLSX} className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100">Export Excel</button>
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const SubjectsRepository = () => {
  const [subjects,       setSubjects]      = useState<Subject[]>(SEED_SUBJECTS);
  const [view,           setView]          = useState<"list" | "add" | "edit">("list");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [successMode,    setSuccessMode]   = useState<"add" | "edit" | null>(null);

  const [filterDept,    setFilterDept]    = useState("");
  const [filterCurr,    setFilterCurr]    = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterType,    setFilterType]    = useState("");
  const [searchInput,   setSearchInput]   = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [currentPage,   setCurrentPage]   = useState(1);

  const [uploadResult,  setUploadResult]  = useState<UploadResult>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = subjects.filter(s =>
    (!searchApplied || s.subjectName.toLowerCase().includes(searchApplied.toLowerCase()) || s.subjectCode.toLowerCase().includes(searchApplied.toLowerCase()))
    && (!filterDept    || s.department.includes(filterDept))
    && (!filterCurr    || s.curriculum.includes(filterCurr))
    && (!filterProgram || s.programType.includes(filterProgram))
    && (!filterType    || s.subjectType.includes(filterType))
  );

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIdx   = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems  = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => { setSearchApplied(searchInput); setCurrentPage(1); };
  const handleClear  = () => { setSearchInput(""); setSearchApplied(""); setFilterDept(""); setFilterCurr(""); setFilterProgram(""); setFilterType(""); setCurrentPage(1); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = ""; setUploadLoading(true); setUploadResult(null);
    try {
      const rows = await readXlsxFile(file);
      const { added, skipped } = parseXlsxRows(rows);
      const existingCodes = new Set(subjects.map(s => s.subjectCode.toLowerCase()));
      const toAdd    = added.filter(s => !existingCodes.has(s.subjectCode.toLowerCase()));
      const dupNames = added.filter(s =>  existingCodes.has(s.subjectCode.toLowerCase())).map(s => `"${s.subjectCode}" already exists`);
      if (toAdd.length > 0) { setSubjects(prev => [...prev, ...toAdd]); setCurrentPage(1); }
      setUploadResult({ fileName: file.name, added: toAdd.length, skipped: skipped.length + dupNames.length, errors: [...skipped, ...dupNames] });
    } catch {
      setUploadResult({ fileName: file.name, added: 0, skipped: 0, errors: ["Failed to parse file — ensure it is a valid .xlsx or .csv"] });
    } finally { setUploadLoading(false); }
  };

  const handleAddSave  = (data: Omit<Subject, "id">) => { setSubjects(prev => [{ id: getNextId(), ...data }, ...prev]); setCurrentPage(1); setView("list"); setSuccessMode("add"); };
  const handleEditSave = (data: Omit<Subject, "id">) => {
    if (!editingSubject) return;
    setSubjects(prev => prev.map(s => s.id === editingSubject.id ? { ...s, ...data } : s));
    setEditingSubject(null); setView("list"); setSuccessMode("edit");
  };

  if (view === "add") {
    return (
      <>
        <SubjectForm
          initial={{ subjectName: "", subjectCode: "", subjectType: [], curriculum: [], programType: [], professors: "", year: [], semester: [], credits: "", department: [], units: [] }}
          onClose={() => setView("list")} onSave={handleAddSave} />
        {successMode === "add" && <SuccessPopup title="Add" message="New Subject Added Successfully" onClose={() => setSuccessMode(null)} />}
      </>
    );
  }

  if (view === "edit" && editingSubject) {
    return (
      <>
        <SubjectForm initial={editingSubject}
          onClose={() => { setView("list"); setEditingSubject(null); }} onSave={handleEditSave} />
        {successMode === "edit" && <SuccessPopup title="Edit" message="Subject Updated Successfully" onClose={() => setSuccessMode(null)} />}
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Subjects Repository</h1>
          <div className="flex items-center gap-2">
            <ExportDropdown subjects={filtered} />
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 disabled:opacity-60 transition-colors">
              <UploadIcon /> {uploadLoading ? "Importing…" : "Bulk Upload"}
            </button>
            <button onClick={() => setView("add")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors">
              <PlusIcon /> Add Subject
            </button>
          </div>
        </div>

        {/* Upload result banner */}
        {uploadResult && (
          <div className={["flex items-start gap-3 px-5 py-3 border-b text-xs",
            uploadResult.added > 0 ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"].join(" ")}>
            <div className="flex-1 min-w-0">
              <p className={["font-semibold", uploadResult.added > 0 ? "text-green-700" : "text-amber-700"].join(" ")}>
                {uploadResult.fileName} — {uploadResult.added} subject{uploadResult.added !== 1 ? "s" : ""} added
                {uploadResult.skipped > 0 && `, ${uploadResult.skipped} skipped`}
              </p>
              {uploadResult.errors.slice(0, 3).map((err, i) => <p key={i} className="text-amber-600 mt-0.5 truncate">{err}</p>)}
              {uploadResult.errors.length > 3 && <p className="text-amber-500 mt-0.5">+{uploadResult.errors.length - 3} more issues</p>}
            </div>
            <button onClick={() => setUploadResult(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"><XIcon /></button>
          </div>
        )}

        {/* Filter row */}
        <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 border-b border-gray-100">
          {[
            { value: filterDept,    setter: setFilterDept,    opts: DEPARTMENTS,    label: "Department" },
            { value: filterCurr,    setter: setFilterCurr,    opts: CURRICULA_OPTS, label: "Curriculum" },
            { value: filterProgram, setter: setFilterProgram, opts: PROGRAM_TYPES,  label: "Program Type" },
            { value: filterType,    setter: setFilterType,    opts: SUBJECT_TYPES,  label: "Subject Type" },
          ].map(({ value, setter, opts, label }) => (
            <div key={label} className="relative">
              <select value={value} onChange={e => { setter(e.target.value); setCurrentPage(1); }}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 cursor-pointer min-w-[130px]">
                <option value="">{label}</option>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown /></div>
            </div>
          ))}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <input type="text" placeholder="Search by Subject name" value={searchInput}
              onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 placeholder-gray-400" />
            {searchInput && (
              <button onClick={() => setSearchInput("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><XIcon /></button>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={handleSearch}>Search</Button>
          <Button variant="ghost"   size="sm" onClick={handleClear}>Clear</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                {["Subject Code", "Subject Name", "Curriculum", "Department", "Subject Type", "Program Type", "Professors", "Units", "Status", "Actions"].map(h => (
                  <th key={h} className={["py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap",
                    h === "Actions" ? "pr-5 text-right" : "px-4 text-left"].join(" ")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length > 0 ? pageItems.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-gray-700 whitespace-nowrap">{s.subjectCode}</td>
                  <td className="px-4 py-3.5 text-gray-800 font-medium whitespace-nowrap">{s.subjectName}</td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{s.curriculum.join(", ")}</td>
                  <td className="px-4 py-3.5 text-gray-600 max-w-[140px] truncate">{s.department.join(", ")}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">{s.subjectType.map(t => <SubjectTypeBadge key={t} type={t} />)}</div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">{s.programType.map(pt => <ProgramBadge key={pt} type={pt} />)}</div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 max-w-[130px] truncate">{s.professors}</td>
                  <td className="px-4 py-3.5 text-gray-700 font-medium whitespace-nowrap">{s.units?.length || 0}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border text-green-600 border-green-400 bg-green-50">{s.status || "Active"}</span>
                  </td>
                  <td className="pr-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <IconBtn title="Edit" onClick={() => { setEditingSubject(s); setView("edit"); }}><EditIcon /></IconBtn>
                      <IconBtn title="View Details"><DocumentIcon /></IconBtn>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">No subjects found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} startIdx={startIdx}
          itemsPerPage={ITEMS_PER_PAGE} onPageChange={p => { if (p >= 1 && p <= totalPages) setCurrentPage(p); }} />
      </div>

      {successMode === "add"  && <SuccessPopup title="Add"  message="New Subject Added Successfully" onClose={() => setSuccessMode(null)} />}
      {successMode === "edit" && <SuccessPopup title="Edit" message="Subject Updated Successfully"   onClose={() => setSuccessMode(null)} />}
    </>
  );
};

export default SubjectsRepository;
