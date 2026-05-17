import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────────────────────
type TabKey = "basic" | "parent" | "bank" | "education" | "documents";

import { type StudentFull } from "../../types/interfaces";
import { SEED_DETAIL } from "../../types/mockData";


const makeFallback = (id: number): StudentFull => ({
  id, rollNo: `ROLL-${id}`, admissionNo: `ADM-${id}`,
  name: "Student Name", course: "B.Tech CSE", department: "Computer Science",
  batch: "2024-2028", status: "Active", email: "student@student.edu",
  phone: "9876500000", gender: "Male", dob: "2006-01-01",
  bloodGroup: "B+", nationality: "Indian", religion: "Hindu",
  caste: "-", community: "OC", motherTongue: "Tamil",
  address: "1, Sample Street", city: "Chennai", state: "Tamil Nadu", pincode: "600001",
  programType: "UG", scholarship: "None",
  fatherName: "Father Name", fatherOccupation: "Business", fatherPhone: "9876500001", fatherEmail: "",
  motherName: "Mother Name", motherOccupation: "Homemaker", motherPhone: "9876500002", motherEmail: "",
  guardianName: "Father Name", guardianRelation: "Father", guardianPhone: "9876500001",
  accountHolder: "Student Name", accountNo: "0000000000000", bankName: "Bank Name",
  branchName: "Branch Name", ifsc: "BANK0000000", accountType: "Savings",
  tenthSchool: "School Name", tenthYear: "2022", tenthPercent: "85%", tenthBoard: "State Board",
  twelfthSchool: "School Name", twelfthYear: "2024", twelfthPercent: "80%", twelfthBoard: "State Board",
  ugCollege: "-", ugYear: "-", ugCgpa: "-", ugDegree: "-",
  docs: [
    { label: "10th Mark Sheet", status: "Uploaded" },
    { label: "12th Mark Sheet", status: "Pending" },
    { label: "Transfer Certificate", status: "Pending" },
    { label: "Aadhar Card", status: "Uploaded" },
  ],
});

// ── Success Popup ─────────────────────────────────────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) =>
  createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Success</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center py-8 px-5 gap-3">
          <div className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">{message}</p>
        </div>
      </div>
    </div>,
    document.body
  );

// ── Display-only Field ────────────────────────────────────────────────────────
const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-[13px] font-medium text-gray-800">{value || "-"}</span>
  </div>
);

// ── Editable Field ────────────────────────────────────────────────────────────
const EditField = ({
  label,
  value,
  isEditing,
  onChange,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
    {isEditing ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 px-2.5 rounded-lg border border-gray-300 bg-white text-[12px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] transition-colors"
      />
    ) : (
      <span className="text-[13px] font-medium text-gray-800">{value || "-"}</span>
    )}
  </div>
);

// ── Section wrapper ────────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
      <h4 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">{title}</h4>
    </div>
    <div className="px-4 py-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
      {children}
    </div>
  </div>
);

// ── Tab props ─────────────────────────────────────────────────────────────────
interface EditTabProps {
  s: StudentFull;
  isEditing: boolean;
  draft: StudentFull;
  onChange: (field: keyof StudentFull, value: string) => void;
}

// ── Basic Information Tab ─────────────────────────────────────────────────────
const BasicTab = ({ s, isEditing, draft, onChange }: EditTabProps) => {
  const data = isEditing ? draft : s;
  return (
    <div className="space-y-4">
      <Section title="Personal Information">
        <EditField label="Full Name"     value={data.name}        isEditing={isEditing} onChange={(v) => onChange("name", v)} />
        <EditField label="Date of Birth" value={data.dob}         isEditing={isEditing} onChange={(v) => onChange("dob", v)} />
        <EditField label="Gender"        value={data.gender}      isEditing={isEditing} onChange={(v) => onChange("gender", v)} />
        <EditField label="Blood Group"   value={data.bloodGroup}  isEditing={isEditing} onChange={(v) => onChange("bloodGroup", v)} />
        <EditField label="Nationality"   value={data.nationality} isEditing={isEditing} onChange={(v) => onChange("nationality", v)} />
        <EditField label="Religion"      value={data.religion}    isEditing={isEditing} onChange={(v) => onChange("religion", v)} />
        <EditField label="Caste"         value={data.caste}       isEditing={isEditing} onChange={(v) => onChange("caste", v)} />
        <EditField label="Community"     value={data.community}   isEditing={isEditing} onChange={(v) => onChange("community", v)} />
        <EditField label="Mother Tongue" value={data.motherTongue} isEditing={isEditing} onChange={(v) => onChange("motherTongue", v)} />
        <EditField label="Phone"         value={data.phone}       isEditing={isEditing} onChange={(v) => onChange("phone", v)} />
        <EditField label="Email"         value={data.email}       isEditing={isEditing} onChange={(v) => onChange("email", v)} />
      </Section>
      <Section title="Address">
        <EditField label="Address" value={data.address} isEditing={isEditing} onChange={(v) => onChange("address", v)} />
        <EditField label="City"    value={data.city}    isEditing={isEditing} onChange={(v) => onChange("city", v)} />
        <EditField label="State"   value={data.state}   isEditing={isEditing} onChange={(v) => onChange("state", v)} />
        <EditField label="Pincode" value={data.pincode} isEditing={isEditing} onChange={(v) => onChange("pincode", v)} />
      </Section>
      <Section title="Academic Details">
        <Field label="Roll Number"     value={data.rollNo} />
        <Field label="Admission No"    value={data.admissionNo} />
        <Field label="Program Type"    value={data.programType} />
        <Field label="Course / Program" value={data.course} />
        <Field label="Department"      value={data.department} />
        <Field label="Batch"           value={data.batch} />
        <EditField label="Scholarship" value={data.scholarship} isEditing={isEditing} onChange={(v) => onChange("scholarship", v)} />
      </Section>
    </div>
  );
};

// ── Parent Information Tab ────────────────────────────────────────────────────
const ParentTab = ({ s, isEditing, draft, onChange }: EditTabProps) => {
  const data = isEditing ? draft : s;
  return (
    <div className="space-y-4">
      <Section title="Father's Details">
        <EditField label="Father Name" value={data.fatherName}       isEditing={isEditing} onChange={(v) => onChange("fatherName", v)} />
        <EditField label="Occupation"  value={data.fatherOccupation} isEditing={isEditing} onChange={(v) => onChange("fatherOccupation", v)} />
        <EditField label="Phone"       value={data.fatherPhone}      isEditing={isEditing} onChange={(v) => onChange("fatherPhone", v)} />
        <EditField label="Email"       value={data.fatherEmail}      isEditing={isEditing} onChange={(v) => onChange("fatherEmail", v)} />
      </Section>
      <Section title="Mother's Details">
        <EditField label="Mother Name" value={data.motherName}       isEditing={isEditing} onChange={(v) => onChange("motherName", v)} />
        <EditField label="Occupation"  value={data.motherOccupation} isEditing={isEditing} onChange={(v) => onChange("motherOccupation", v)} />
        <EditField label="Phone"       value={data.motherPhone}      isEditing={isEditing} onChange={(v) => onChange("motherPhone", v)} />
        <EditField label="Email"       value={data.motherEmail}      isEditing={isEditing} onChange={(v) => onChange("motherEmail", v)} />
      </Section>
      <Section title="Guardian Details">
        <EditField label="Guardian Name" value={data.guardianName}     isEditing={isEditing} onChange={(v) => onChange("guardianName", v)} />
        <EditField label="Relation"      value={data.guardianRelation} isEditing={isEditing} onChange={(v) => onChange("guardianRelation", v)} />
        <EditField label="Phone"         value={data.guardianPhone}    isEditing={isEditing} onChange={(v) => onChange("guardianPhone", v)} />
      </Section>
    </div>
  );
};

// ── Bank Details Tab ──────────────────────────────────────────────────────────
const BankTab = ({ s, isEditing, draft, onChange }: EditTabProps) => {
  const data = isEditing ? draft : s;
  return (
    <div className="space-y-4">
      <Section title="Bank Account Details">
        <EditField label="Account Holder" value={data.accountHolder} isEditing={isEditing} onChange={(v) => onChange("accountHolder", v)} />
        <EditField label="Account Number" value={data.accountNo}     isEditing={isEditing} onChange={(v) => onChange("accountNo", v)} />
        <EditField label="Bank Name"      value={data.bankName}      isEditing={isEditing} onChange={(v) => onChange("bankName", v)} />
        <EditField label="Branch Name"    value={data.branchName}    isEditing={isEditing} onChange={(v) => onChange("branchName", v)} />
        <EditField label="IFSC Code"      value={data.ifsc}          isEditing={isEditing} onChange={(v) => onChange("ifsc", v)} />
        <EditField label="Account Type"   value={data.accountType}   isEditing={isEditing} onChange={(v) => onChange("accountType", v)} />
      </Section>
    </div>
  );
};

// ── Education Tab ─────────────────────────────────────────────────────────────
const EducationTab = ({ s, isEditing, draft, onChange }: EditTabProps) => {
  const data = isEditing ? draft : s;
  return (
    <div className="space-y-4">
      <Section title="10th Standard">
        <EditField label="School Name"       value={data.tenthSchool}   isEditing={isEditing} onChange={(v) => onChange("tenthSchool", v)} />
        <EditField label="Year of Passing"   value={data.tenthYear}     isEditing={isEditing} onChange={(v) => onChange("tenthYear", v)} />
        <EditField label="Percentage / CGPA" value={data.tenthPercent}  isEditing={isEditing} onChange={(v) => onChange("tenthPercent", v)} />
        <EditField label="Board"             value={data.tenthBoard}    isEditing={isEditing} onChange={(v) => onChange("tenthBoard", v)} />
      </Section>
      <Section title="12th Standard">
        <EditField label="School Name"       value={data.twelfthSchool}   isEditing={isEditing} onChange={(v) => onChange("twelfthSchool", v)} />
        <EditField label="Year of Passing"   value={data.twelfthYear}     isEditing={isEditing} onChange={(v) => onChange("twelfthYear", v)} />
        <EditField label="Percentage / CGPA" value={data.twelfthPercent}  isEditing={isEditing} onChange={(v) => onChange("twelfthPercent", v)} />
        <EditField label="Board"             value={data.twelfthBoard}    isEditing={isEditing} onChange={(v) => onChange("twelfthBoard", v)} />
      </Section>
      {data.ugCollege !== "-" && (
        <Section title="Undergraduate Degree">
          <EditField label="College Name"      value={data.ugCollege} isEditing={isEditing} onChange={(v) => onChange("ugCollege", v)} />
          <EditField label="Year of Passing"   value={data.ugYear}    isEditing={isEditing} onChange={(v) => onChange("ugYear", v)} />
          <EditField label="CGPA / Percentage" value={data.ugCgpa}    isEditing={isEditing} onChange={(v) => onChange("ugCgpa", v)} />
          <EditField label="Degree"            value={data.ugDegree}  isEditing={isEditing} onChange={(v) => onChange("ugDegree", v)} />
        </Section>
      )}
    </div>
  );
};

// ── Documents Tab (read-only) ─────────────────────────────────────────────────
const DocumentsTab = ({ docs }: { docs: StudentFull["docs"] }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
      <h4 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Documents</h4>
    </div>
    <div className="divide-y divide-gray-100">
      {docs.map((doc, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-[13px] font-medium text-gray-800">{doc.label}</span>
          </div>
          <span
            className={[
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold",
              doc.status === "Uploaded"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700",
            ].join(" ")}
          >
            {doc.status}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ── Editable tabs ─────────────────────────────────────────────────────────────
const EDITABLE_TABS: TabKey[] = ["basic", "parent", "bank", "education"];

// ── Main Component ────────────────────────────────────────────────────────────
const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);

  const [student, setStudent] = useState<StudentFull>(
    () => SEED_DETAIL[numId] ?? makeFallback(numId)
  );
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<StudentFull>(student);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const TABS: { key: TabKey; label: string }[] = [
    { key: "basic",     label: "Basic Information" },
    { key: "parent",    label: "Parent Information" },
    { key: "bank",      label: "Bank Details" },
    { key: "education", label: "Educational Qualification" },
    { key: "documents", label: "Documents" },
  ];

  const canEdit = EDITABLE_TABS.includes(activeTab);

  const handleEdit = () => {
    setDraft({ ...student });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraft(student);
  };

  const handleSave = () => {
    setStudent(draft);
    setIsEditing(false);
    const tabLabel = TABS.find((t) => t.key === activeTab)?.label ?? "Information";
    setSuccessMsg(`${tabLabel} updated successfully.`);
  };

  const handleChange = (field: keyof StudentFull, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (key: TabKey) => {
    if (isEditing) {
      setIsEditing(false);
      setDraft(student);
    }
    setActiveTab(key);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/layout/student-management/directory")}
          className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 hover:text-[#1D6BA3] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-[11px] text-gray-400">Student Detail</span>
      </div>

      {/* Preview card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-bold text-gray-800">Preview</h2>

          {/* Edit / Save / Cancel controls */}
          {canEdit && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="h-8 px-3.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="h-8 px-3.5 rounded-lg bg-[#1D6BA3] text-white text-[12px] font-semibold hover:bg-[#1558a0] flex items-center gap-1.5 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="h-8 px-3.5 rounded-lg border border-[#1D6BA3] text-[12px] font-semibold text-[#1D6BA3] hover:bg-[#1D6BA3]/5 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gradient-to-r from-[#EFF6FF] to-blue-50 rounded-xl border border-blue-100">
          <div className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center flex-shrink-0 shadow-md">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[16px] font-bold text-gray-900">{student.name}</h3>
              <span className={[
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                student.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600",
              ].join(" ")}>
                {student.status}
              </span>
            </div>
            <p className="text-[12px] text-gray-500 mt-0.5">{student.course} • {student.department}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] font-medium text-gray-700 shadow-sm">
                <svg className="w-3 h-3 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Adm No: {student.admissionNo}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] font-medium text-gray-700 shadow-sm">
                <svg className="w-3 h-3 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {student.email}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] font-medium text-gray-700 shadow-sm">
                <svg className="w-3 h-3 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Roll No: {student.rollNo}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#1D6BA3] text-white text-[11px] font-bold">
              Batch {student.batch}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={[
                "px-5 py-3.5 text-[12px] font-semibold whitespace-nowrap transition-all duration-150 border-b-2",
                activeTab === tab.key
                  ? "border-[#1D6BA3] text-[#1D6BA3] bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="p-5">
          {activeTab === "basic" && (
            <BasicTab s={student} isEditing={isEditing} draft={draft} onChange={handleChange} />
          )}
          {activeTab === "parent" && (
            <ParentTab s={student} isEditing={isEditing} draft={draft} onChange={handleChange} />
          )}
          {activeTab === "bank" && (
            <BankTab s={student} isEditing={isEditing} draft={draft} onChange={handleChange} />
          )}
          {activeTab === "education" && (
            <EducationTab s={student} isEditing={isEditing} draft={draft} onChange={handleChange} />
          )}
          {activeTab === "documents" && <DocumentsTab docs={student.docs} />}
        </div>
      </div>

      {/* Success popup */}
      {successMsg && (
        <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
    </div>
  );
};

export default StudentDetail;
