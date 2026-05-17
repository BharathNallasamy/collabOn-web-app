import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  BackArrow,
  CheckIcon,
  XIcon,
  UploadIcon,
  PlusIcon,
  EditIcon,
} from "../../components/common/Icons/PageIcons";

// ── Constants ──────────────────────────────────────────────────────────────────
const COURSE_OPTIONS = [
  "B.Tech CSE", "B.E CSE", "B.Sc Computer Science", "B.Com", "M.Tech CSE",
  "MBA", "B.Sc Mathematics", "B.A English", "M.Sc Physics", "B.Sc Chemistry",
  "M.Com", "BCA", "MCA", "PhD Computer Science",
] as const;

const PROGRAM_TYPES = ["UG", "PG", "PHD", "Diploma"] as const;
const GENDER_OPTS   = ["Male", "Female", "Other"] as const;
const BLOOD_GROUPS  = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
const COMMUNITY_CATS = ["OC", "BC", "MBC", "SC", "ST"] as const;
const QUALIFICATION_OPTS = ["SSLC", "HSC", "Diploma", "UG", "PG"] as const;
const PAYMENT_MODES = ["Cash", "Online", "DD", "Cheque"] as const;
const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"] as const;

const STEPS = [
  "Application",
  "Personal Details",
  "Contact Details",
  "Community & Reservation",
  "Educational Qualification & Marks",
  "Parents / Guardian Info",
  "Bank Details",
  "Document Uploads",
  "Payment",
  "Declaration",
  "Preview",
] as const;

// ── Reusable field helpers ─────────────────────────────────────────────────────
interface TextFieldProps {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
  className?: string;
}
const TextField = ({
  label, value, onChange, required = false, placeholder = "", readOnly = false, type = "text", className = "",
}: TextFieldProps) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[11px] font-semibold text-gray-600 leading-none">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className={[
        "h-9 px-3 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] transition-colors",
        readOnly ? "bg-gray-50 text-gray-500 cursor-default" : "bg-white text-gray-800",
      ].join(" ")}
    />
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  required?: boolean;
  placeholder?: string;
  className?: string;
}
const SelectField = ({
  label, value, onChange, options, required = false, placeholder = "Select", className = "",
}: SelectFieldProps) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[11px] font-semibold text-gray-600 leading-none">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 pl-3 pr-8 text-xs rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  </div>
);

interface RadioGroupProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  className?: string;
}
const RadioGroup = ({ label, value, onChange, options, className = "" }: RadioGroupProps) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-[11px] font-semibold text-gray-600 leading-none">{label}</label>
    <div className="flex items-center gap-4">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="w-3.5 h-3.5 text-[#1D6BA3] border-gray-300 focus:ring-[#1D6BA3]/30"
          />
          <span className="text-xs text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

// ── Section heading ────────────────────────────────────────────────────────────
const SectionHeading = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
    <h2 className="text-[13px] font-bold text-gray-800">{title}</h2>
    {action}
  </div>
);

// ── Stepper ────────────────────────────────────────────────────────────────────
const Stepper = ({ current }: { current: number }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 overflow-x-auto">
      <div className="flex items-start min-w-max">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < current;
          const isCurrent   = idx === current;
          return (
            <React.Fragment key={step}>
              {/* Connector line (before each step except first) */}
              {idx > 0 && (
                <div className="flex-1 mt-4 mx-1" style={{ minWidth: "20px" }}>
                  <div
                    className="h-0.5 w-full"
                    style={{ backgroundColor: isCompleted ? "#1D6BA3" : "#e5e7eb" }}
                  />
                </div>
              )}
              <div className="flex flex-col items-center gap-1.5" style={{ minWidth: "64px" }}>
                {/* Circle */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all"
                  style={{
                    backgroundColor: isCompleted ? "#1D6BA3" : "white",
                    borderColor: isCompleted || isCurrent ? "#1D6BA3" : "#d1d5db",
                  }}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1D6BA3]" />
                  ) : (
                    null
                  )}
                </div>
                {/* Label */}
                <span
                  className="text-[9px] font-semibold text-center leading-tight"
                  style={{ color: isCompleted || isCurrent ? "#1D6BA3" : "#374151", maxWidth: "60px" }}
                >
                  {step}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  </div>
);

// ── Success Popup ──────────────────────────────────────────────────────────────
const SuccessPopup = ({ onClose }: { onClose: () => void }) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Success</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>
        <div className="flex flex-col items-center py-10 px-5 gap-3">
          <div className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center shadow-lg shadow-green-500/30">
            <CheckIcon />
          </div>
          <p className="text-[13px] font-bold text-gray-800 text-center mt-1">
            Application Has Been Submitted Successfully
          </p>
        </div>
      </div>
    </div>,
    document.body
  );

// ── Qualification block ────────────────────────────────────────────────────────
interface Qualification {
  id: number;
  qualification: string;
  school: string;
  board: string;
  registerNo: string;
  yearPassing: string;
  percentage: string;
}

const QualBlock = ({
  qual,
  idx,
  onChange,
  onDelete,
}: {
  qual: Qualification;
  idx: number;
  onChange: (id: number, field: keyof Qualification, val: string) => void;
  onDelete: (id: number) => void;
}) => {
  const num = String(idx + 1).padStart(2, "0");
  return (
    <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#1D6BA3] text-white text-[10px] font-bold flex items-center justify-center">
            {num}
          </span>
          <span className="text-xs font-semibold text-gray-700">Education</span>
        </div>
        {idx > 0 && (
          <button
            onClick={() => onDelete(qual.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SelectField
          label="Qualification"
          value={qual.qualification}
          onChange={(v) => onChange(qual.id, "qualification", v)}
          options={QUALIFICATION_OPTS}
        />
        <TextField
          label="School / College Name"
          value={qual.school}
          onChange={(v) => onChange(qual.id, "school", v)}
        />
        <TextField
          label="Board / University"
          value={qual.board}
          onChange={(v) => onChange(qual.id, "board", v)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TextField
          label="Register Number"
          value={qual.registerNo}
          onChange={(v) => onChange(qual.id, "registerNo", v)}
        />
        <TextField
          label="Month & Year of Passing"
          value={qual.yearPassing}
          onChange={(v) => onChange(qual.id, "yearPassing", v)}
          type="month"
        />
        <TextField
          label="Overall % or CGPA"
          value={qual.percentage}
          onChange={(v) => onChange(qual.id, "percentage", v)}
          required
        />
      </div>
    </div>
  );
};

// ── Document upload zone ───────────────────────────────────────────────────────
const DocUploadZone = ({ label }: { label: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFileName(f.name);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-gray-600">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-[#1D6BA3]/40 hover:bg-blue-50/30 transition-colors"
      >
        <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {fileName ? (
          <span className="text-[10px] text-gray-600 text-center break-all">{fileName}</span>
        ) : (
          <p className="text-[10px] text-gray-400 text-center">
            Drop Files here or{" "}
            <span className="text-[#1D6BA3] font-semibold">Choose file</span>
          </p>
        )}
      </div>
      <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
    </div>
  );
};

// ── Preview field row ──────────────────────────────────────────────────────────
const PreviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
    <span className="text-[11px] text-gray-500">{label}</span>
    <span className="text-[11px] font-semibold text-gray-800 text-right ml-4">{value || "—"}</span>
  </div>
);

// ── Preview section card ───────────────────────────────────────────────────────
const PreviewSection = ({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2.5 bg-[#1D6BA3]/10">
      <span className="text-[11px] font-bold text-[#1D6BA3] uppercase tracking-wide">{title}</span>
      <button
        onClick={onEdit}
        className="flex items-center gap-1 text-[10px] text-[#1D6BA3] hover:text-[#1a5f91] font-semibold"
      >
        <EditIcon />
        Edit
      </button>
    </div>
    <div className="px-4 py-3">{children}</div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const ManualAdmissionEntry = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Step 1: Application ──
  const [programType, setProgramType]     = useState("");
  const [appNo]                           = useState("APP-2024-001");
  const [appDate, setAppDate]             = useState("");
  const [academicYear]                    = useState("2024 - 2026");
  const [photoFile, setPhotoFile]         = useState<string>("");
  const [courseName1, setCourseName1]     = useState("");
  const [courseName2, setCourseName2]     = useState("");
  const [transport, setTransport]         = useState("No");
  const [hostel, setHostel]               = useState("No");
  const photoRef = useRef<HTMLInputElement>(null);

  // ── Step 2: Personal Details ──
  const [pName, setPName]               = useState("");
  const [pDob, setPDob]                 = useState("");
  const [pAge]                          = useState("18");
  const [pGender, setPGender]           = useState("");
  const [pAadhar, setPAadhar]           = useState("");
  const [pEmis, setPEmis]               = useState("");
  const [pNationality, setPNationality] = useState("");
  const [pReligion, setPReligion]       = useState("");
  const [pPlaceBirth, setPPlaceBirth]   = useState("");
  const [pMotherTongue, setPMotherTongue] = useState("");
  const [pBloodGroup, setPBloodGroup]   = useState("");
  const [pMarital, setPMarital]         = useState("");
  const [pNative, setPNative]           = useState("");
  const [pIdMark1, setPIdMark1]         = useState("");
  const [pIdMark2, setPIdMark2]         = useState("");

  // ── Step 3: Contact Details ──
  const [cEmail, setCEmail]       = useState("");
  const [cMobile, setCMobile]     = useState("");
  const [cResAddr, setCResAddr]   = useState("");
  const [cAddr1, setCAddr1]       = useState("");
  const [cAddr2, setCAddr2]       = useState("");
  const [cCity, setCCity]         = useState("");
  const [cDistrict, setCDistrict] = useState("");
  const [cState, setCState]       = useState("");
  const [cCountry, setCCountry]   = useState("");
  const [cPinCode, setCPinCode]   = useState("");

  // ── Step 4: Community & Reservation ──
  const [community, setCommunity]       = useState("");
  const [subCaste, setSubCaste]         = useState("");
  const [physicallyHandicapped, setPhysicallyHandicapped] = useState(false);

  // ── Step 5: Educational Qualifications ──
  const [qualifications, setQualifications] = useState<Qualification[]>([
    { id: 1, qualification: "", school: "", board: "", registerNo: "", yearPassing: "", percentage: "" },
  ]);

  const addQualification = () => {
    setQualifications((prev) => [
      ...prev,
      { id: Date.now(), qualification: "", school: "", board: "", registerNo: "", yearPassing: "", percentage: "" },
    ]);
  };

  const updateQualification = (id: number, field: keyof Qualification, val: string) => {
    setQualifications((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: val } : q))
    );
  };

  const deleteQualification = (id: number) => {
    setQualifications((prev) => prev.filter((q) => q.id !== id));
  };

  // ── Step 6: Parents / Guardian ──
  const [fName, setFName]             = useState("");
  const [fOccupation, setFOccupation] = useState("");
  const [fIncome, setFIncome]         = useState("");
  const [fMobile, setFMobile]         = useState("");
  const [mName, setMName]             = useState("");
  const [mOccupation, setMOccupation] = useState("");
  const [mIncome, setMIncome]         = useState("");
  const [mMobile, setMMobile]         = useState("");

  // ── Step 7: Bank Details ──
  const [bankHolder, setBankHolder]   = useState("");
  const [bankName, setBankName]       = useState("");
  const [bankAccNo, setBankAccNo]     = useState("");
  const [bankIfsc, setBankIfsc]       = useState("");
  const [bankBranch, setBankBranch]   = useState("");

  // ── Step 9: Payment ──
  const [payMode, setPayMode]         = useState("");
  const [appFees, setAppFees]         = useState("");
  const [payRef, setPayRef]           = useState("");
  const [payDate, setPayDate]         = useState("");

  // ── Step 10: Declaration ──
  const [declared, setDeclared]       = useState(false);

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const goNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };
  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const isLastStep = currentStep === STEPS.length - 1;

  const handleSubmit = () => {
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/layout/admissions/overview");
  };

  // ── Step renderers ─────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <>
      <SectionHeading title="Application" />
      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField
            label="Program Type"
            value={programType}
            onChange={setProgramType}
            options={PROGRAM_TYPES}
          />
          <TextField
            label="Application No."
            value={appNo}
            readOnly
            placeholder="APP-2024-001"
          />
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-600 leading-none">Date</label>
            <div className="relative">
              <input
                type="date"
                value={appDate}
                onChange={(e) => setAppDate(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] appearance-none"
              />
            </div>
          </div>
          <TextField
            label="Academic Year"
            value={academicYear}
            readOnly
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Upload Photo */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-600 leading-none">Upload Photo</label>
            <div className="flex items-center h-9 border border-gray-200 rounded-lg overflow-hidden text-xs">
              <span className="flex-1 px-3 text-gray-400 truncate">
                {photoFile || "No File Chosen"}
              </span>
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="px-3 h-full bg-[#1D6BA3] text-white font-semibold text-[11px] hover:bg-[#1a5f91] transition-colors flex-shrink-0 flex items-center gap-1"
              >
                <UploadIcon />
                Upload
              </button>
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPhotoFile(e.target.files?.[0]?.name ?? "")}
            />
          </div>
          <SelectField
            label="Course Name - 1"
            value={courseName1}
            onChange={setCourseName1}
            options={COURSE_OPTIONS}
          />
          <SelectField
            label="Course Name - 2"
            value={courseName2}
            onChange={setCourseName2}
            options={COURSE_OPTIONS}
          />
        </div>
        <div className="flex items-center gap-8 flex-wrap">
          <RadioGroup label="Transport" value={transport} onChange={setTransport} options={["Yes", "No"]} />
          <RadioGroup label="Hostel" value={hostel} onChange={setHostel} options={["Yes", "No"]} />
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <SectionHeading title="Applicant Personal Details" />
      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Name" value={pName} onChange={setPName} required />
          <TextField label="Date Of Birth" value={pDob} onChange={setPDob} type="date" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextField label="Age Auto Calculated" value={pAge} readOnly />
          <SelectField label="Gender" value={pGender} onChange={setPGender} options={GENDER_OPTS} required />
          <TextField label="Aadhar Number" value={pAadhar} onChange={setPAadhar} required />
          <TextField label="EMIS Number (If Available)" value={pEmis} onChange={setPEmis} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextField label="Nationality" value={pNationality} onChange={setPNationality} required />
          <TextField label="Religion" value={pReligion} onChange={setPReligion} />
          <TextField label="Place Of Birth" value={pPlaceBirth} onChange={setPPlaceBirth} />
          <TextField label="Mother Tongue" value={pMotherTongue} onChange={setPMotherTongue} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField label="Blood Group" value={pBloodGroup} onChange={setPBloodGroup} options={BLOOD_GROUPS} />
          <SelectField label="Martial Status" value={pMarital} onChange={setPMarital} options={MARITAL_STATUS} />
          <TextField label="Native Place" value={pNative} onChange={setPNative} />
          <TextField label="Identification Mark 1" value={pIdMark1} onChange={setPIdMark1} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <TextField label="Identification Mark 2" value={pIdMark2} onChange={setPIdMark2} />
        </div>
      </div>
    </>
  );

  const CITY_OPTS   = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"] as const;
  const DIST_OPTS   = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Erode"] as const;
  const STATE_OPTS  = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Maharashtra"] as const;
  const COUNTRY_OPTS = ["India", "USA", "UK", "Canada", "Australia"] as const;

  const renderStep3 = () => (
    <>
      <SectionHeading title="Contact Information" />
      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Email ID" value={cEmail} onChange={setCEmail} type="email" required />
          <TextField label="Mobile Number" value={cMobile} onChange={setCMobile} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField label="Residential Address" value={cResAddr} onChange={setCResAddr} />
          <TextField label="Address Line 1" value={cAddr1} onChange={setCAddr1} />
          <TextField label="Address Line 2" value={cAddr2} onChange={setCAddr2} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField label="City" value={cCity} onChange={setCCity} options={CITY_OPTS} />
          <SelectField label="District" value={cDistrict} onChange={setCDistrict} options={DIST_OPTS} />
          <SelectField label="State" value={cState} onChange={setCState} options={STATE_OPTS} />
          <SelectField label="Country" value={cCountry} onChange={setCCountry} options={COUNTRY_OPTS} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Pin Code" value={cPinCode} onChange={setCPinCode} />
        </div>
      </div>
    </>
  );

  const renderStep4 = () => (
    <>
      <SectionHeading title="Community & Reservation" />
      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Community Category"
            value={community}
            onChange={setCommunity}
            options={COMMUNITY_CATS}
          />
          <TextField label="Sub-Caste" value={subCaste} onChange={setSubCaste} />
        </div>
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={physicallyHandicapped}
              onChange={(e) => setPhysicallyHandicapped(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/30"
            />
            <span className="text-xs text-gray-700 font-medium">
              Physically Handicapped / Differently Abled?
            </span>
          </label>
        </div>
      </div>
    </>
  );

  const renderStep5 = () => (
    <>
      <SectionHeading
        title="Educational Qualification & Marks"
        action={
          <button
            onClick={addQualification}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1D6BA3] text-white text-[11px] font-semibold hover:bg-[#1a5f91] transition-colors"
          >
            <PlusIcon />
            Add Qualification
          </button>
        }
      />
      <div className="p-5 flex flex-col gap-4">
        {qualifications.map((q, idx) => (
          <QualBlock
            key={q.id}
            qual={q}
            idx={idx}
            onChange={updateQualification}
            onDelete={deleteQualification}
          />
        ))}
      </div>
    </>
  );

  const renderStep6 = () => (
    <>
      <SectionHeading title="Parents / Guardian Information" />
      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextField label="Father's Name" value={fName} onChange={setFName} required />
          <TextField label="Occupation" value={fOccupation} onChange={setFOccupation} required />
          <TextField label="Annual Income" value={fIncome} onChange={setFIncome} required />
          <TextField label="Father's Mobile" value={fMobile} onChange={setFMobile} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextField label="Mother's Name" value={mName} onChange={setMName} required />
          <TextField label="Occupation" value={mOccupation} onChange={setMOccupation} required />
          <TextField label="Annual Income" value={mIncome} onChange={setMIncome} required />
          <TextField label="Mother's Mobile" value={mMobile} onChange={setMMobile} required />
        </div>
      </div>
    </>
  );

  const renderStep7 = () => (
    <>
      <SectionHeading title="Bank Details For Scholarship" />
      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextField label="Account Holder Name" value={bankHolder} onChange={setBankHolder} />
          <TextField label="Bank Name" value={bankName} onChange={setBankName} />
          <TextField label="Account Number" value={bankAccNo} onChange={setBankAccNo} />
          <TextField label="IFSC Code" value={bankIfsc} onChange={setBankIfsc} />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <TextField label="Branch Name" value={bankBranch} onChange={setBankBranch} className="col-span-1" />
        </div>
      </div>
    </>
  );

  const DOC_LABELS = [
    "10th Marksheet",
    "12th Marksheet",
    "Transfer Certificate",
    "Community Certificate",
    "Adhaar Card",
    "Income Certificate",
  ] as const;

  const renderStep8 = () => (
    <>
      <SectionHeading title="Document Uploads" />
      <div className="p-5 flex flex-col gap-4">
        {/* Warning banner */}
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-xs text-amber-700 font-medium">
            Maximum File Size Allowed Is 2MB Per Document
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DOC_LABELS.map((label) => (
            <DocUploadZone key={label} label={label} />
          ))}
        </div>
      </div>
    </>
  );

  const LinkIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );

  const renderStep9 = () => (
    <>
      <SectionHeading title="Administrative Payment Entry" />
      <div className="p-5 flex flex-col gap-4">
        <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <SelectField
              label="Payment Mode"
              value={payMode}
              onChange={setPayMode}
              options={PAYMENT_MODES}
            />
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-600 leading-none">
                Application Form Fees ₹
              </label>
              <input
                type="text"
                value={appFees}
                onChange={(e) => setAppFees(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3]"
              />
            </div>
            <button className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1a5f91] transition-colors self-end">
              <LinkIcon />
              Generate Link
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Reference Number / Receipt No."
              value={payRef}
              onChange={setPayRef}
            />
            <TextField
              label="Payment Date"
              value={payDate}
              onChange={setPayDate}
              type="date"
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderStep10 = () => (
    <>
      <SectionHeading title="Declaration" />
      <div className="p-5 flex flex-col gap-4">
        <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
          <p className="text-xs text-gray-700 leading-relaxed">
            I Hereby Declare That The Details Furnished Above Are The True And Correct To The Best Of The My Knowledge<br />
            I Undertake To Abide By The Rules And Regulations Of The College And The University
          </p>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/30"
            />
            <span className="text-xs text-gray-700 font-medium">
              I Agree to the above undertaking and declaration
            </span>
          </label>
        </div>
      </div>
    </>
  );

  const renderStep11 = () => (
    <>
      <SectionHeading title="Preview" />
      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Application Metadata */}
          <PreviewSection title="Application Metadata" onEdit={() => setCurrentStep(0)}>
            <PreviewRow label="App No." value={appNo} />
            <PreviewRow label="Received Date" value={appDate} />
            <PreviewRow label="Admission Type" value={programType} />
            <PreviewRow label="Academic Year" value={academicYear} />
            <PreviewRow label="Course Name - 1" value={courseName1} />
            <PreviewRow label="Course Name - 2" value={courseName2} />
            <PreviewRow label="Upload Photo" value={photoFile || "Not uploaded"} />
          </PreviewSection>

          {/* Personal Details */}
          <PreviewSection title="Applicant Personal Details" onEdit={() => setCurrentStep(1)}>
            <PreviewRow label="Name" value={pName} />
            <PreviewRow label="Date of Birth" value={pDob} />
            <PreviewRow label="Age" value={pAge} />
            <PreviewRow label="Gender" value={pGender} />
            <PreviewRow label="Aadhar Number" value={pAadhar} />
            <PreviewRow label="EMIS Number" value={pEmis} />
            <PreviewRow label="Nationality" value={pNationality} />
            <PreviewRow label="Religion" value={pReligion} />
            <PreviewRow label="Place of Birth" value={pPlaceBirth} />
            <PreviewRow label="Mother Tongue" value={pMotherTongue} />
          </PreviewSection>
        </div>

        {/* Educational Qualification — full width */}
        <PreviewSection title="Educational Qualification" onEdit={() => setCurrentStep(4)}>
          {qualifications.length === 0 ? (
            <p className="text-xs text-gray-400">No qualifications added.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Qualification", "Institution / School", "Board / University", "Register Number", "Year", "% / CGPA"].map((h) => (
                      <th key={h} className="px-2 py-1.5 text-left font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {qualifications.map((q) => (
                    <tr key={q.id} className="border-b border-gray-50">
                      <td className="px-2 py-1.5 text-gray-700">{q.qualification || "—"}</td>
                      <td className="px-2 py-1.5 text-gray-700">{q.school || "—"}</td>
                      <td className="px-2 py-1.5 text-gray-700">{q.board || "—"}</td>
                      <td className="px-2 py-1.5 text-gray-700">{q.registerNo || "—"}</td>
                      <td className="px-2 py-1.5 text-gray-700">{q.yearPassing || "—"}</td>
                      <td className="px-2 py-1.5 text-gray-700">{q.percentage || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PreviewSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Community & Reservation */}
          <PreviewSection title="Community & Reservation" onEdit={() => setCurrentStep(3)}>
            <PreviewRow label="Community Category" value={community} />
            <PreviewRow label="Sub-Caste" value={subCaste} />
            <PreviewRow label="Physically Handicapped" value={physicallyHandicapped ? "Yes" : "No"} />
          </PreviewSection>

          {/* Parents / Guardian */}
          <PreviewSection title="Parents / Guardian Info" onEdit={() => setCurrentStep(5)}>
            <PreviewRow label="Father's Name" value={fName} />
            <PreviewRow label="Father's Occupation" value={fOccupation} />
            <PreviewRow label="Father's Income" value={fIncome} />
            <PreviewRow label="Father's Mobile" value={fMobile} />
            <PreviewRow label="Mother's Name" value={mName} />
            <PreviewRow label="Mother's Occupation" value={mOccupation} />
            <PreviewRow label="Mother's Income" value={mIncome} />
            <PreviewRow label="Mother's Mobile" value={mMobile} />
          </PreviewSection>
        </div>
      </div>
    </>
  );

  const stepRenderers = [
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderStep5,
    renderStep6,
    renderStep7,
    renderStep8,
    renderStep9,
    renderStep10,
    renderStep11,
  ];

  return (
    <div className="flex flex-col min-h-0 h-full px-6 py-5 gap-4">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
        >
          <BackArrow />
        </button>
        <h1 className="text-[18px] font-bold text-gray-900">Manual Admission Entry</h1>
      </div>

      {/* ── Stepper ── */}
      <Stepper current={currentStep} />

      {/* ── Content card ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Scrollable step body — footer stays pinned */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 370px)" }}>
          {stepRenderers[currentStep]?.()}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => navigate("/layout/admissions/overview")}
            className="h-9 px-5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={goBack}
                className="h-9 px-5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
            )}
            {!isLastStep ? (
              <>
                <button
                  onClick={() => {}}
                  className="h-9 px-5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  Save
                </button>
                <button
                  onClick={goNext}
                  className="h-9 px-5 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1a5f91] transition-colors"
                >
                  Next
                </button>
              </>
            ) : (
              <button
                onClick={handleSubmit}
                className="h-9 px-5 rounded-lg bg-[#1D6BA3] text-white text-xs font-semibold hover:bg-[#1a5f91] transition-colors"
              >
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Success Popup ── */}
      {showSuccess && <SuccessPopup onClose={handleSuccessClose} />}
    </div>
  );
};

export default ManualAdmissionEntry;
