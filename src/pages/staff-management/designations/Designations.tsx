import { useState, useRef } from "react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button/Button";
import DataTable, { type Column } from "../../../components/common/Table/DataTable";
import {
  EditIcon,
  DocumentIcon,
  PlusIcon,
  UploadIcon,
  CheckIcon,
  type LucideIcon,
} from "../../../components/common/Icons";
import Modal from "../../../components/common/Modal/Modal";
import { MOCK_DESIGNATIONS } from "../../../types/mockData";
import { type DesignationItem } from "../../../types/interfaces";


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

const Designations = () => {
  const [designations, setDesignations] = useState<DesignationItem[]>(MOCK_DESIGNATIONS);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [designationName, setDesignationName] = useState("");

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
        const added: DesignationItem[] = [];
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

          const nameRaw = find("name", "designation name", "designation", "desig name");
          const empCountRaw = find("employee count", "employees", "staff count", "count");

          const name = String(nameRaw ?? "").trim();
          const employeeCount = Math.max(0, parseInt(String(empCountRaw ?? "0"), 10) || 0);

          if (!name) {
            skipped.push(`Line ${i + 1} — missing name`);
            continue;
          }

          added.push({ id: Date.now() + i, name, employeeCount });
        }

        const existingNames = new Set(designations.map((d) => d.name.toLowerCase()));
        const toAdd = added.filter((d) => !existingNames.has(d.name.toLowerCase()));
        const dupNames = added
          .filter((d) => existingNames.has(d.name.toLowerCase()))
          .map((d) => `"${d.name}" already exists`);

        if (toAdd.length > 0) {
          setDesignations((prev) => [...toAdd, ...prev]);
          setCurrentPage(1);
        }

        setUploadResult({
          fileName: file.name,
          added: toAdd.length,
          skipped: skipped.length + dupNames.length,
          errors: [...skipped, ...dupNames],
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

  const handleSave = () => {
    if (!designationName.trim()) return;

    const newDesignation = {
      id: designations.length + 1,
      name: designationName.trim(),
      employeeCount: 0,
    };

    setDesignations([newDesignation, ...designations]);
    setShowSuccess(true);
    setDesignationName("");

    // Auto-close modal after 2 seconds
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setShowSuccess(false);
    setDesignationName("");
  };

  // Client-side pagination logic
  const totalItems = designations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDesignations = designations.slice(startIndex, startIndex + itemsPerPage);

  const columns: Column<(typeof INITIAL_DESIGNATIONS)[0]>[] = [
    {
      key: "name",
      header: "Name",
      className: "px-6 py-5 text-sm font-medium text-gray-700",
    },
    {
      key: "employeeCount",
      header: "Employee Count",
      className: "px-6 py-5 text-sm font-medium text-gray-700",
    },
    {
      key: "actions",
      header: "Actions",
      className: "px-6 py-4 text-sm text-gray-700 flex justify-center",
      render: () => (
        <div className="flex items-center justify-center gap-3">
          <ActionBtn icon={EditIcon} title="Edit" />
          <ActionBtn icon={DocumentIcon} title="View" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card noPadding className="border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-base font-bold text-gray-900">Designation</h1>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
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
              onClick={() => setIsModalOpen(true)}
              icon={<PlusIcon size={18} />}
            >
              <span className="font-semibold text-sm">Add New</span>
            </Button>
          </div>
        </div>

        {/* Upload Result Banner */}
        {uploadResult && (
          <div
            className={`flex items-start gap-3 px-6 py-3 border-b text-xs ${
              uploadResult.added > 0
                ? "bg-green-50 border-green-100"
                : "bg-amber-50 border-amber-100"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold ${
                  uploadResult.added > 0 ? "text-green-700" : "text-amber-700"
                }`}
              >
                {uploadResult.fileName} — {uploadResult.added} designation
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
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Table Container */}
        <div className="border-t border-gray-100">
          <DataTable
            data={currentDesignations}
            columns={columns}
            headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
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

      {/* Add New Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={showSuccess ? "Add" : "Add Details"}
        size="md"
        footer={
          !showSuccess && (
            <>
              <Button variant="ghost" className="border border-gray-200" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </>
          )
        }
      >
        {showSuccess ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30">
              <CheckIcon size={32} className="text-white" />
            </div>
            <p className="text-lg font-bold text-gray-800">Designation Added Successfully</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter"
                value={designationName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDesignationName(e.target.value)
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]/50 placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Designations;
