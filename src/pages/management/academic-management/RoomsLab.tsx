import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
// import Button from "../../../components/common/Button/Button";
import { ITEMS_PER_PAGE, DEPARTMENTS } from "../../../constants";
import { readXlsxFile, findField } from "../../../utils/excel";
import {
  UploadIcon,
  PlusIcon,
  EditIcon,
  DocumentIcon,
  ChevronDown,
  XIcon,
  CheckIcon,
} from "../../../components/common/Icons/PageIcons";
import Pagination from "../../../components/common/Pagination/Pagination";

// ── Constants ─────────────────────────────────────────────────────────────────
const ROOM_TYPES = ["Theory Class", "Lab", "Meeting Room", "Auditorium"] as const;
type RoomTypeKey = (typeof ROOM_TYPES)[number];

const TYPE_DISPLAY: Record<RoomTypeKey, { label: string; color: string }> = {
  "Theory Class": { label: "THEORY", color: "text-[#1D6BA3] font-semibold" },
  Lab: { label: "LAB", color: "text-teal-600 font-semibold" },
  "Meeting Room": { label: "MEETING", color: "text-purple-600 font-semibold" },
  Auditorium: { label: "AUDITORIUM", color: "text-orange-600 font-semibold" },
};

// ── Types ─────────────────────────────────────────────────────────────────────
import { type Room } from "../../../types/interfaces";
import { SEED_ROOMS } from "../../../types/mockData";

interface FormState {
  roomName: string;
  roomType: RoomTypeKey;
  capacity: string;
  department: string;
}

type UploadResult = { fileName: string; added: number; skipped: number; errors: string[] } | null;

const BLANK_FORM: FormState = {
  roomName: "",
  roomType: "Theory Class",
  capacity: "",
  department: "",
};


// ── SuccessPopup ───────────────────────────────────────────────────────────────
const SuccessPopup = ({
  title,
  message,
  mode,
  onClose,
}: {
  title: string;
  message: string;
  mode: "add" | "edit";
  onClose: () => void;
}) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>
        <div className="flex flex-col items-center py-8 px-5 gap-3">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${mode === "add" ? "bg-[#7AC142] shadow-[#7AC142]/30" : "bg-[#1D6BA3] shadow-[#1D6BA3]/30"}`}
          >
            <CheckIcon />
          </div>
          <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">{message}</p>
        </div>
      </div>
    </div>,
    document.body
  );

// ── RoomModal ──────────────────────────────────────────────────────────────────
interface RoomModalProps {
  mode: "add" | "edit";
  form: FormState;
  onChange: (f: FormState) => void;
  onSave: () => void;
  onClose: () => void;
}

const RoomModal = ({ mode, form, onChange, onSave, onClose }: RoomModalProps) => {
  const set = (patch: Partial<FormState>) => onChange({ ...form, ...patch });

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">
            {mode === "add" ? "Add New Room/Labs" : "Edit New Room/Labs"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Room Name/Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Room Name/Number</label>
            <input
              type="text"
              value={form.roomName}
              onChange={(e) => set({ roomName: e.target.value })}
              placeholder="Enter"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors"
            />
          </div>

          {/* Room Type + Seating Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Room Type</label>
              <div className="relative">
                <select
                  value={form.roomType}
                  onChange={(e) => set({ roomType: e.target.value as RoomTypeKey })}
                  className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors pr-8 bg-white"
                >
                  {ROOM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <ChevronDown />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Seating Capacity</label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => set({ capacity: e.target.value })}
                placeholder="60"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors"
              />
            </div>
          </div>

          {/* Owner Department */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Owner Department</label>
            <div className="relative">
              <select
                value={form.department}
                onChange={(e) => set({ department: e.target.value })}
                className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors pr-8 bg-white text-gray-500"
              >
                <option value="">Select</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <ChevronDown />
              </div>
            </div>
          </div>

          {/* Hint */}
          <p className="text-[11px] text-gray-400">
            Department Can Prioritize Their Own Room During Scheduling
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
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

// ── SelectFilter ───────────────────────────────────────────────────────────────
const SelectFilter = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] bg-white text-gray-600 transition-colors min-w-[110px]"
    >
      <option value="">{placeholder}</option>
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
);

// ── Main Component ─────────────────────────────────────────────────────────────
const RoomsLab = () => {
  const [rooms, setRooms] = useState<Room[]>(SEED_ROOMS);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);

  const [successState, setSuccessState] = useState<{
    message: string;
    mode: "add" | "edit";
  } | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Filter logic ──────────────────────────────────────────────────────────
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedType, setAppliedType] = useState("");
  const [appliedDept, setAppliedDept] = useState("");

  const filtered = rooms.filter((r) => {
    const matchSearch =
      !appliedSearch || r.roomName.toLowerCase().includes(appliedSearch.toLowerCase());
    const matchType =
      !appliedType || TYPE_DISPLAY[r.roomType as RoomTypeKey]?.label === appliedType || r.roomType === appliedType;
    const matchDept = !appliedDept || r.department === appliedDept;
    return matchSearch && matchType && matchDept;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const pageRows = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = () => {
    setAppliedSearch(searchText);
    setAppliedType(filterType);
    setAppliedDept(filterDept);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearchText("");
    setFilterType("");
    setFilterDept("");
    setAppliedSearch("");
    setAppliedType("");
    setAppliedDept("");
    setCurrentPage(1);
  };

  // ── Add ───────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(BLANK_FORM);
    setModalMode("add");
    setEditId(null);
    setShowModal(true);
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (room: Room) => {
    setForm({
      roomName: room.roomName,
      roomType: room.roomType as RoomTypeKey,
      capacity: String(room.capacity),
      department: room.department,
    });
    setModalMode("edit");
    setEditId(room.id);
    setShowModal(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.roomName.trim()) return;
    const cap = parseInt(form.capacity) || 0;

    if (modalMode === "add") {
      const newRoom: Room = {
        id: Date.now(),
        roomName: form.roomName.trim(),
        roomType: form.roomType,
        capacity: cap,
        department: form.department,
      };
      setRooms((prev) => [newRoom, ...prev]);
      setSuccessState({ message: "Room/Lab Added Successfully", mode: "add" });
    } else {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === editId
            ? {
                ...r,
                roomName: form.roomName.trim(),
                roomType: form.roomType,
                capacity: cap,
                department: form.department,
              }
            : r
        )
      );
      setSuccessState({ message: "Room/Lab Edited Successfully", mode: "edit" });
    }
    setShowModal(false);
    setCurrentPage(1);
  };

  // ── Bulk Upload ───────────────────────────────────────────────────────────
  const handleBulkUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    e.target.value = "";
    try {
      const rows = await readXlsxFile(file);
      const added: Room[] = [];
      const errors: string[] = [];

      rows.forEach((row, i) => {
        const roomName = String(
          findField(row, "room name", "room number", "roomname") ?? ""
        ).trim();
        const rawType = String(findField(row, "room type", "type") ?? "").trim();
        const rawCap = findField(row, "capacity", "seating capacity");
        const dept = String(findField(row, "department", "owner department", "dept") ?? "").trim();

        if (!roomName) {
          errors.push(`Row ${i + 2}: missing Room Name`);
          return;
        }

        const matched =
          ROOM_TYPES.find((t) => t.toLowerCase() === rawType.toLowerCase()) ?? "Theory Class";
        const cap = parseInt(String(rawCap)) || 0;

        added.push({
          id: Date.now() + i,
          roomName,
          roomType: matched,
          capacity: cap,
          department: dept,
        });
      });

      setRooms((prev) => [...added, ...prev]);
      setUploadResult({ fileName: file.name, added: added.length, skipped: 0, errors });
    } catch {
      setUploadResult({
        fileName: file.name,
        added: 0,
        skipped: 0,
        errors: ["Failed to parse file"],
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Rooms &amp; Labs</h1>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={handleBulkUploadClick}
              disabled={uploadLoading}
              title="Upload .xlsx or .csv — columns: Room Name | Room Type | Capacity | Department"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 disabled:opacity-60 transition-colors"
            >
              <UploadIcon />
              {uploadLoading ? "Importing…" : "Bulk Upload"}
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors"
            >
              <PlusIcon />
              Add Room/Lab
            </button>
          </div>
        </div>

        {/* Upload result banner */}
        {uploadResult && (
          <div
            className={[
              "flex items-start gap-3 px-5 py-3 border-b text-xs",
              uploadResult.added > 0
                ? "bg-green-50 border-green-100"
                : "bg-amber-50 border-amber-100",
            ].join(" ")}
          >
            <div className="flex-1 min-w-0">
              <p
                className={[
                  "font-semibold",
                  uploadResult.added > 0 ? "text-green-700" : "text-amber-700",
                ].join(" ")}
              >
                {uploadResult.fileName} — {uploadResult.added} room
                {uploadResult.added !== 1 ? "s" : ""} added
                {uploadResult.skipped > 0 && `, ${uploadResult.skipped} skipped`}
              </p>
              {uploadResult.errors.slice(0, 3).map((err, i) => (
                <p key={i} className="text-amber-600 mt-0.5 truncate">
                  {err}
                </p>
              ))}
              {uploadResult.errors.length > 3 && (
                <p className="text-amber-500 mt-0.5">
                  +{uploadResult.errors.length - 3} more issues
                </p>
              )}
            </div>
            <button
              onClick={() => setUploadResult(null)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
            >
              <XIcon />
            </button>
          </div>
        )}

        {/* Search & filter row */}
        <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by Room Name"
              className="pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] transition-colors"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/90 transition-colors"
          >
            Search
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <SelectFilter
            value={filterType}
            onChange={setFilterType}
            options={ROOM_TYPES}
            placeholder="Room Type"
          />
          <SelectFilter
            value={filterDept}
            onChange={setFilterDept}
            options={DEPARTMENTS}
            placeholder="Department"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  Room Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  Capacity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  Department Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                    No rooms found.
                  </td>
                </tr>
              ) : (
                pageRows.map((room) => {
                  const badge = TYPE_DISPLAY[room.roomType as RoomTypeKey];
                  return (
                    <tr key={room.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-800">{room.roomName}</td>
                      <td className={`px-4 py-3 text-xs ${badge.color}`}>{badge.label}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{room.capacity}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{room.department}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(room)}
                            title="Edit"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#1D6BA3] hover:bg-[#1D6BA3]/10 transition-colors"
                          >
                            <EditIcon />
                          </button>
                          <button
                            title="View"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#1D6BA3] hover:bg-[#1D6BA3]/10 transition-colors"
                          >
                            <DocumentIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          startIdx={startIdx}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <RoomModal
          mode={modalMode}
          form={form}
          onChange={setForm}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Success popup */}
      {successState && (
        <SuccessPopup
          title={successState.mode === "add" ? "Add" : "Edit"}
          message={successState.message}
          mode={successState.mode}
          onClose={() => setSuccessState(null)}
        />
      )}
    </div>
  );
};

export default RoomsLab;
