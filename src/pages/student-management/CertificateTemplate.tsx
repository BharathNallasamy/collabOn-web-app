import { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { XIcon, CheckIcon } from "../../components/common/Icons/PageIcons";
import { type StudentOption } from "../../types/interfaces";

import { MOCK_CERT_STUDENTS as STUDENTS } from "../../types/mockData";

// ── Certificate types ─────────────────────────────────────────────────────────
const CERT_TYPES = [
  "Transfer Certificate",
  "Course Completion Certificate",
  "Bonafide Certificate",
  "Conduct Certificate",
  "Medium of Instruction Certificate",
] as const;
type CertType = (typeof CERT_TYPES)[number];

// ── Cert-specific field config ────────────────────────────────────────────────
const CERT_FIELDS: Record<CertType, { label: string; key: string; type?: "text" | "date" | "select"; options?: string[] }[]> = {
  "Transfer Certificate": [
    { label: "Reason for Leaving", key: "reasonLeaving" },
    { label: "Date of Leaving", key: "dateLeaving", type: "date" },
    { label: "Conduct and Character", key: "conduct", type: "select", options: ["Good", "Very Good", "Excellent", "Satisfactory"] },
  ],
  "Course Completion Certificate": [
    { label: "CGPA / Percentage", key: "cgpa" },
    { label: "Date of Completion", key: "dateCompletion", type: "date" },
  ],
  "Bonafide Certificate": [
    { label: "Purpose", key: "purpose" },
  ],
  "Conduct Certificate": [
    { label: "Period (e.g. Jun 2023 – May 2026)", key: "period" },
    { label: "Conduct and Character", key: "conduct", type: "select", options: ["Good", "Very Good", "Excellent", "Satisfactory"] },
  ],
  "Medium of Instruction Certificate": [
    { label: "Medium of Instruction", key: "medium", type: "select", options: ["Tamil", "English", "Tamil & English"] },
  ],
};

// ── Certificate preview renderers ─────────────────────────────────────────────
const Row = ({ no, label, value }: { no: number; label: string; value: string }) => (
  <div className="flex items-start py-2 border-b border-gray-100 last:border-0 text-[12px]">
    <span className="w-6 flex-shrink-0 text-gray-500">{no}.</span>
    <span className="flex-1 text-gray-600">{label}</span>
    <span className="font-bold text-gray-900 text-right">{value || <span className="text-gray-300 italic">—</span>}</span>
  </div>
);

const CertHeader = ({ title }: { title: string }) => (
  <h2 className="text-[17px] font-black tracking-widest text-center text-gray-900 mb-5 uppercase">
    {title}
  </h2>
);

const SigRow = () => (
  <div className="flex justify-between items-end mt-8 pt-4 border-t border-gray-200 text-[11px] text-gray-500">
    <div className="text-center">
      <div className="w-20 h-px bg-gray-400 mb-1" />
      Institution Seal
    </div>
    <div className="text-center">
      <div className="w-20 h-px bg-gray-400 mb-1" />
      Authorized Signatory
    </div>
  </div>
);

const TransferPreview = ({ s, f }: { s: StudentOption; f: Record<string, string> }) => (
  <div className="p-6 border border-gray-200 rounded-lg bg-white">
    <CertHeader title="Transfer Certificate" />
    <Row no={1}  label="Name of the student"       value={s.name} />
    <Row no={2}  label="Register Number"            value={s.rollNo} />
    <Row no={3}  label="Name of Parent / Guardian"  value={s.parentName} />
    <Row no={4}  label="Date Of Birth"              value={s.dob} />
    <Row no={5}  label="Gender"                     value={s.gender} />
    <Row no={6}  label="Nationality"                value={s.nationality} />
    <Row no={7}  label="Course Name"                value={s.course} />
    <Row no={8}  label="Date Of Admission"          value={s.admissionDate} />
    <Row no={9}  label="Date Of Leaving"            value={f.dateLeaving || s.leaveDate} />
    <Row no={10} label="Reason for Leaving"         value={f.reasonLeaving || "—"} />
    <Row no={11} label="Conduct and Character"      value={f.conduct || "Good"} />
    <SigRow />
  </div>
);

const BonafidePreview = ({ s, f }: { s: StudentOption; f: Record<string, string> }) => (
  <div className="p-8 border border-gray-200 rounded-lg bg-white">
    <CertHeader title="Bonafide Certificate" />
    <div className="space-y-4 text-[12px] text-gray-700 leading-relaxed text-center">
      <p>
        This is to certify that <strong>{s.name}</strong>, bearing roll number{" "}
        <strong>{s.rollNo}</strong>, is a bonafide student of this institution
        enrolled in the <strong>{s.course}</strong> program, Batch{" "}
        <strong>{s.batch}</strong>.
      </p>
      {f.purpose && (
        <p>
          This certificate is issued for the purpose of{" "}
          <strong>{f.purpose}</strong>.
        </p>
      )}
      <p>
        This certificate is issued as requested by the student.
      </p>
    </div>
    <SigRow />
  </div>
);

const ConductPreview = ({ s, f }: { s: StudentOption; f: Record<string, string> }) => (
  <div className="p-8 border border-gray-200 rounded-lg bg-white">
    <CertHeader title="Conduct Certificate" />
    <div className="space-y-4 text-[12px] text-gray-700 leading-relaxed text-center">
      <p>
        This is to certify that <strong>{s.name}</strong>, bearing roll number{" "}
        <strong>{s.rollNo}</strong>, was a student of this institution in
        the <strong>{s.course}</strong> program{f.period ? ` during the period ${f.period}` : ""}.
      </p>
      <p>
        Her/his conduct and character during the period of study were{" "}
        <strong>{f.conduct || "Satisfactory"}</strong>.
      </p>
    </div>
    <SigRow />
  </div>
);

const CourseCompletionPreview = ({ s, f }: { s: StudentOption; f: Record<string, string> }) => (
  <div className="p-8 border border-gray-200 rounded-lg bg-white">
    <CertHeader title="Course Completion Certificate" />
    <div className="space-y-4 text-[12px] text-gray-700 leading-relaxed text-center">
      <p>
        This is to certify that <strong>{s.name}</strong>, bearing roll number{" "}
        <strong>{s.rollNo}</strong> and admission number{" "}
        <strong>{s.admissionNo}</strong>, has successfully completed
        the <strong>{s.course}</strong> program at this institution.
      </p>
      {f.cgpa && (
        <p>
          She/He has obtained a CGPA / Percentage of <strong>{f.cgpa}</strong>.
        </p>
      )}
      {f.dateCompletion && (
        <p>
          Date of completion: <strong>{f.dateCompletion}</strong>.
        </p>
      )}
    </div>
    <SigRow />
  </div>
);

const MediumPreview = ({ s, f }: { s: StudentOption; f: Record<string, string> }) => (
  <div className="p-8 border border-gray-200 rounded-lg bg-white">
    <CertHeader title="Medium of Instruction Certificate" />
    <div className="space-y-4 text-[12px] text-gray-700 leading-relaxed text-center">
      <p>
        This is to certify that <strong>{s.name}</strong>, bearing roll number{" "}
        <strong>{s.rollNo}</strong>, studied in this institution and pursued
        the <strong>{s.course}</strong> program from{" "}
        <strong>{s.admissionDate}</strong> to <strong>{s.leaveDate}</strong>.
      </p>
      <p>
        The medium of instruction followed during the course was{" "}
        <strong>{f.medium || "English"}</strong>.
      </p>
    </div>
    <SigRow />
  </div>
);

// ── Success Popup ─────────────────────────────────────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Success</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
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

// ── Main Component ────────────────────────────────────────────────────────────
const CertificateTemplate = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [certType, setCertType] = useState<CertType | "">("");
  const [certTypeOpen, setCertTypeOpen] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [zoom, setZoom] = useState(100);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Student search filter ─────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase();
    if (!q) return STUDENTS;
    return STUDENTS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q)
    );
  }, [studentSearch]);

  const setField = (key: string, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleSelectStudent = (s: StudentOption) => {
    setSelectedStudent(s);
    setStudentSearch(s.name);
    setShowDropdown(false);
  };

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setFields({});
  };

  const handleGenerate = () => {
    if (!selectedStudent || !certType) return;
    setSuccessMsg(`Certificate generated for ${selectedStudent.name}.`);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Certificate</title><style>body{font-family:sans-serif;padding:32px}@media print{body{margin:0}}</style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const handleDownload = async () => {
    if (!printRef.current || !selectedStudent || !certType) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      const yOffset = imgH < pageH ? (pageH - imgH) / 2 : 0;
      pdf.addImage(imgData, "PNG", 0, yOffset, imgW, Math.min(imgH, pageH));
      pdf.save(`${certType.replace(/\s+/g, "_")}_${selectedStudent.rollNo}.pdf`);
      setSuccessMsg(`PDF downloaded for ${selectedStudent.name}.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasPreview = selectedStudent && certType;

  const certFieldConfig = certType ? CERT_FIELDS[certType] : [];

  const ZOOM_OPTIONS = [75, 100, 125, 150];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/layout/student-management/certificate-registry")}
          className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 hover:text-[#1D6BA3] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Certificate Registry
        </button>
        <h1 className="text-base font-bold text-gray-800">Template</h1>
        <div className="w-24" />
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 items-start">

        {/* ── Left: Generate form ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-[14px] font-bold text-gray-800">Certificate Generate</h2>
          </div>

          <div className="px-5 py-5 space-y-5">
            {/* Search Student */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Search Student
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value) handleClearStudent();
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search by name, roll no, adm no..."
                  className="w-full h-9 pl-8 pr-8 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]"
                />
                {studentSearch && (
                  <button
                    onClick={handleClearStudent}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Dropdown */}
                {showDropdown && !selectedStudent && filteredStudents.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl max-h-52 overflow-y-auto">
                    {filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        onMouseDown={() => handleSelectStudent(s)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#1D6BA3] flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-gray-900 truncate">{s.name}</p>
                          <p className="text-[10px] text-gray-500">{s.course} • {s.batch}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected student card */}
            {selectedStudent && (
              <div className="rounded-xl border border-[#1D6BA3]/20 bg-blue-50/50 p-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1D6BA3] flex items-center justify-center flex-shrink-0 shadow">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900">{selectedStudent.name}</p>
                  <p className="text-[11px] text-gray-500">{selectedStudent.course} • {selectedStudent.batch}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] text-gray-600 font-medium">
                      Adm No : {selectedStudent.admissionNo}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] text-gray-600 font-medium">
                      Email : {selectedStudent.email}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] text-gray-600 font-medium">
                      Roll No : {selectedStudent.rollNo}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Type */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Select Certificate Type
              </label>
              <div className="relative">
                <button
                  onClick={() => setCertTypeOpen((o) => !o)}
                  className="w-full h-9 px-3 flex items-center justify-between rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]"
                >
                  <span className={certType ? "text-gray-900" : "text-gray-400"}>
                    {certType || "Select"}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${certTypeOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {certTypeOpen && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                    {CERT_TYPES.map((ct) => (
                      <button
                        key={ct}
                        onMouseDown={() => {
                          setCertType(ct);
                          setCertTypeOpen(false);
                          setFields({});
                        }}
                        className={[
                          "w-full text-left px-4 py-2.5 text-[12px] font-medium transition-colors hover:bg-blue-50 hover:text-[#1D6BA3]",
                          certType === ct ? "bg-blue-50 text-[#1D6BA3]" : "text-gray-700",
                        ].join(" ")}
                      >
                        {ct}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Specific Fields */}
            {certType && certFieldConfig.length > 0 && (
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                  Certificate Specific Fields
                </label>
                <div className="space-y-2">
                  {certFieldConfig.map((f) =>
                    f.type === "select" ? (
                      <div key={f.key} className="relative">
                        <select
                          value={fields[f.key] ?? ""}
                          onChange={(e) => setField(f.key, e.target.value)}
                          className="appearance-none w-full h-9 pl-3 pr-8 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]"
                        >
                          <option value="">{f.label}</option>
                          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    ) : (
                      <input
                        key={f.key}
                        type={f.type === "date" ? "date" : "text"}
                        value={fields[f.key] ?? ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                        placeholder={f.label}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] placeholder:text-gray-400"
                      />
                    )
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handlePrint}
                disabled={!hasPreview}
                className="h-8 px-4 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Print
              </button>
              <button
                onClick={handleDownload}
                disabled={!hasPreview || isGenerating}
                className="h-8 px-4 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isGenerating ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  "Download PDF"
                )}
              </button>
              <button
                onClick={handleGenerate}
                disabled={!hasPreview}
                className="h-8 px-4 rounded-lg bg-[#1D6BA3] text-white text-[12px] font-semibold hover:bg-[#1558a0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate Certification
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-gray-800">Live Preview</h2>
            <div className="flex items-center gap-3">
              {/* Zoom */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-gray-500">Zoom:</span>
                <div className="relative">
                  <button
                    onClick={() => setZoomOpen((o) => !o)}
                    className="h-7 px-2.5 flex items-center gap-1 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {zoom}%
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {zoomOpen && (
                    <div className="absolute z-20 right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden w-20">
                      {ZOOM_OPTIONS.map((z) => (
                        <button
                          key={z}
                          onMouseDown={() => { setZoom(z); setZoomOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 text-[11px] font-medium hover:bg-blue-50 hover:text-[#1D6BA3] ${zoom === z ? "bg-blue-50 text-[#1D6BA3]" : "text-gray-700"}`}
                        >
                          {z}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Refresh */}
              <button
                onClick={() => setFields({ ...fields })}
                className="h-7 px-2.5 flex items-center gap-1 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6 min-h-[480px] flex items-start justify-center bg-gray-50">
            {!hasPreview ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <svg className="w-10 h-10 text-[#1D6BA3]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-[12px] text-gray-400 font-medium">Live Certification Preview</p>
                <p className="text-[11px] text-gray-300">Select a student and certificate type to preview</p>
              </div>
            ) : (
              <div
                ref={printRef}
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top center",
                  width: `${10000 / zoom}%`,
                  maxWidth: `${10000 / zoom}%`,
                }}
              >
                {certType === "Transfer Certificate"             && <TransferPreview s={selectedStudent} f={fields} />}
                {certType === "Bonafide Certificate"             && <BonafidePreview s={selectedStudent} f={fields} />}
                {certType === "Conduct Certificate"              && <ConductPreview  s={selectedStudent} f={fields} />}
                {certType === "Course Completion Certificate"    && <CourseCompletionPreview s={selectedStudent} f={fields} />}
                {certType === "Medium of Instruction Certificate" && <MediumPreview  s={selectedStudent} f={fields} />}
              </div>
            )}
          </div>
        </div>
      </div>

      {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />}
    </div>
  );
};

export default CertificateTemplate;
