import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStaff } from "../../../contexts/StaffContext";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button/Button";
import {
  CheckIcon,
  UploadIcon,
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  ChevronDownIcon,
} from "../../../components/common/Icons";

// ── Types ────────────────────────────────────────────────────────────────────
const STEPS = [
  "Basic Details",
  "Bank Details",
  "Legal Documents",
  "Emergency Contact Information",
  "Personal Information",
  "Employee Reference",
] as const;

import { type EmployeeReference } from "../../../types/interfaces";

interface FormData {
  // Step 1: Basic Details
  employeeCode: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  gender: string;
  staffCategory: string;
  institutionName: string;
  department: string;
  designation: string;
  employeeType: string;
  salaryType: string;
  salaryValue: string;
  pf: string;
  uan: string;
  esic: string;
  address: string;

  // Step 2: Bank Details
  bankName: string;
  branchName: string;
  accountNo: string;
  ifscCode: string;

  // Step 3: Legal Documents
  adharCard: File | null;
  panCard: File | null;
  experienceCertificate: File | null;
  passportPhoto: File | null;

  // Step 4: Emergency Contact
  emergencyContact: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyAddress: string;

  // Step 5: Personal Info
  dob: string;
  doj: string;
  doe: string;

  // Step 6: References
  references: EmployeeReference[];
}

const INITIAL_FORM_DATA: FormData = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  mobileNumber: "",
  email: "",
  gender: "Male",
  staffCategory: "Academic",
  institutionName: "",
  department: "",
  designation: "",
  employeeType: "",
  salaryType: "Monthly",
  salaryValue: "",
  pf: "",
  uan: "",
  esic: "",
  address: "",
  bankName: "",
  branchName: "",
  accountNo: "",
  ifscCode: "",
  adharCard: null,
  panCard: null,
  experienceCertificate: null,
  passportPhoto: null,
  emergencyContact: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyAddress: "",
  dob: "",
  doj: "",
  doe: "",
  references: [{ id: Date.now(), name: "", contactNumber: "", designation: "" }],
};

// ... (references type)

const EmployeeAddition = () => {
  const navigate = useNavigate();
  const { addEmployee } = useStaff();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const handleCancel = () => {
    navigate("/layout/staff-management/employees");
  };

  const handleNext = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Handle Save logic
      addEmployee({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        department: formData.department || "-",
        designation: formData.designation || "-",
        masterBranch: formData.institutionName || "Main Campus",
      });
      
      // Navigate to directory and show success there
      navigate("/layout/staff-management/employees", { state: { addedSuccess: true } });
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const currentStep = STEPS[currentStepIdx];


  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <Card noPadding className="border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-base font-bold text-gray-900">Add Employee</h1>
        </div>
      </Card>

      {/* Stepper Card */}
      <Card className="border-gray-200 py-2">
        <div className="relative flex justify-between items-start px-4 py-8">
          {/* Progress Line */}
          <div className="absolute top-[46px] left-[8%] right-[8%] h-[1.5px] bg-gray-100 -z-0">
            <div
              className="h-full bg-[#1D6BA3] transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isActive = idx === currentStepIdx;

            return (
              <div key={step} className="flex flex-col items-center gap-3 relative z-10 w-32">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 border-[1.5px] ${
                    isCompleted
                      ? "bg-[#1D6BA3] border-[#1D6BA3] text-white"
                      : isActive
                        ? "bg-white border-[#1D6BA3]"
                        : "bg-white border-gray-200"
                  }`}
                >
                  {isCompleted ? (
                    <CheckIcon size={14} className="stroke-[3]" />
                  ) : isActive ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1D6BA3] animate-pulse" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold text-center leading-tight transition-colors duration-300 max-w-[100px] ${
                    isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Form Content Area */}
      <div className="space-y-6">
        <Card className="border-gray-200 pb-8">
          <div className="px-4 py-2">
            <h2 className="text-lg font-bold text-gray-900 mb-8 border-b border-gray-100 pb-5">
              {currentStep}
            </h2>

            {currentStepIdx === 0 && (
              <Step1BasicDetails formData={formData} updateFormData={updateFormData} />
            )}
            {currentStepIdx === 1 && (
              <Step2BankDetails formData={formData} updateFormData={updateFormData} />
            )}
            {currentStepIdx === 2 && (
              <Step3LegalDocuments formData={formData} updateFormData={updateFormData} />
            )}
            {currentStepIdx === 3 && (
              <Step4EmergencyContact formData={formData} updateFormData={updateFormData} />
            )}
            {currentStepIdx === 4 && (
              <Step5PersonalInformation formData={formData} updateFormData={updateFormData} />
            )}
            {currentStepIdx === 5 && (
              <Step6EmployeeReference formData={formData} updateFormData={updateFormData} />
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          {currentStepIdx === 0 && (
            <Button
              variant="ghost"
              className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 h-10 px-8 font-semibold"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
          {currentStepIdx > 0 && (
            <Button
              variant="ghost"
              className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 h-10 px-8 font-semibold"
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          <Button
            variant="primary"
            className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-10 px-8 font-semibold"
            onClick={handleNext}
          >
            {currentStepIdx === STEPS.length - 1 ? "Save" : "Next"}
          </Button>
        </div>
      </div>

    </div>
  );
};

// ── Sub-Components ──────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
}

const InputField = ({
  label,
  required = false,
  placeholder = "Enter Name",
  type = "text",
  value,
  onChange,
  prefix,
}: InputFieldProps) => (
  <div className="space-y-2 flex-1 min-w-[280px]">
    <label className="text-sm font-semibold text-gray-700 block">
      {label} {required && <span className="text-red-500 font-bold">*</span>}
    </label>
    <div className="relative group">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold bg-gray-50/50 px-1 py-0.5 rounded">
          {prefix}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${
          prefix ? "pl-14" : "px-4"
        } py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] placeholder-gray-400 font-medium`}
      />
    </div>
  </div>
);

interface SelectFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}

const SelectField = ({
  label,
  required = false,
  value,
  onChange,
  options = [],
}: SelectFieldProps) => (
  <div className="space-y-2 flex-1 min-w-[280px]">
    <label className="text-sm font-semibold text-gray-700 block">
      {label} {required && <span className="text-red-500 font-bold">*</span>}
    </label>
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] cursor-pointer font-medium"
      >
        <option value="" disabled>
          Select
        </option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
        <ChevronDownIcon size={16} />
      </div>
    </div>
  </div>
);

interface RadioGroupProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const RadioGroup = ({ label, options, value, onChange }: RadioGroupProps) => (
  <div className="space-y-3 flex-1 min-w-[280px]">
    <label className="text-sm font-semibold text-gray-700 block">{label}</label>
    <div className="flex flex-wrap gap-6 py-1">
      {options.map((opt: string) => (
        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              name={label}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="appearance-none w-5 h-5 rounded-full border-[1.5px] border-gray-300 checked:border-[#1D6BA3] transition-all duration-200 group-hover:border-[#1D6BA3]/50"
            />
            {value === opt && (
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#1D6BA3] animate-in fade-in zoom-in duration-300" />
            )}
          </div>
          <span
            className={`text-sm font-medium transition-colors duration-200 ${
              value === opt ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"
            }`}
          >
            {opt}
          </span>
        </label>
      ))}
    </div>
  </div>
);

interface StepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

const Step1BasicDetails = ({ formData, updateFormData }: StepProps) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-x-8 gap-y-6">
        <InputField
          label="Employee Code"
          required
          value={formData.employeeCode}
          onChange={(v: string) => updateFormData({ employeeCode: v })}
        />
        <InputField
          label="First Name"
          required
          value={formData.firstName}
          onChange={(v: string) => updateFormData({ firstName: v })}
        />
        <InputField
          label="Last Name"
          value={formData.lastName}
          onChange={(v: string) => updateFormData({ lastName: v })}
        />
        <InputField
          label="Mobile Number"
          prefix="+91"
          placeholder=""
          value={formData.mobileNumber}
          onChange={(v: string) => updateFormData({ mobileNumber: v })}
        />
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-6 items-end">
        <div className="min-w-[400px]">
          <InputField
            label="Email"
            placeholder="Enter"
            value={formData.email}
            onChange={(v: string) => updateFormData({ email: v })}
          />
        </div>
        <RadioGroup
          label="Gender"
          options={["Male", "Female", "Other"]}
          value={formData.gender}
          onChange={(v: string) => updateFormData({ gender: v })}
        />
        <RadioGroup
          label="Staff Category"
          options={["Academic", "Non Academic"]}
          value={formData.staffCategory}
          onChange={(v: string) => updateFormData({ staffCategory: v })}
        />
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-6">
        <SelectField
          label="Institution Name"
          required
          value={formData.institutionName}
          onChange={(v: string) => updateFormData({ institutionName: v })}
          options={["Main Campus", "South Campus"]}
        />
        <SelectField
          label="Department"
          required
          value={formData.department}
          onChange={(v: string) => updateFormData({ department: v })}
          options={["Computer Science", "Mathematics", "Tamil"]}
        />
        <SelectField
          label="Designation"
          required
          value={formData.designation}
          onChange={(v: string) => updateFormData({ designation: v })}
          options={["Professor", "Associate Professor", "Librarian"]}
        />
        <SelectField
          label="Employee Type"
          required
          value={formData.employeeType}
          onChange={(v: string) => updateFormData({ employeeType: v })}
          options={["Full Time", "Part Time", "Contract"]}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 block">
          Salary Type <span className="text-red-500">*</span>{" "}
          <span className="text-[10px] text-gray-400 font-normal ml-1">
            ( Once an Employee is added, the salary type cannot be modified )
          </span>
        </label>
        <div className="flex items-center gap-8">
          <div className="flex gap-8">
            {["Monthly", "Hourly"].map((opt) => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    checked={formData.salaryType === opt}
                    onChange={() => updateFormData({ salaryType: opt })}
                    className="appearance-none w-5 h-5 rounded-full border-2 border-gray-300 checked:border-[#1D6BA3]"
                  />
                  {formData.salaryType === opt && (
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[#1D6BA3]" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-600">{opt}</span>
              </label>
            ))}
          </div>
          <div className="max-w-[300px] flex-1">
            <input
              type="text"
              placeholder="Enter"
              value={formData.salaryValue}
              onChange={(e) => updateFormData({ salaryValue: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50"
            />
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 my-8" />

      <div className="flex flex-wrap gap-x-8 gap-y-6">
        <InputField
          label="Provident Fund (PF)"
          placeholder="Enter"
          value={formData.pf}
          onChange={(v: string) => updateFormData({ pf: v })}
        />
        <InputField
          label="Universal Account Number (UAN)"
          placeholder="Enter"
          value={formData.uan}
          onChange={(v: string) => updateFormData({ uan: v })}
        />
        <InputField
          label="Employee State Insurance Corporation (ESIC)"
          placeholder="Enter"
          value={formData.esic}
          onChange={(v: string) => updateFormData({ esic: v })}
        />
      </div>

      <div className="space-y-1.5 w-full">
        <label className="text-sm font-medium text-gray-700 block">Address</label>
        <textarea
          placeholder="Enter"
          rows={4}
          value={formData.address}
          onChange={(e) => updateFormData({ address: e.target.value })}
          className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50 placeholder-gray-400"
        />
      </div>
    </div>
  );
};

// ── Step 2 Components ────────────────────────────────────────────────────────
const Step2BankDetails = ({ formData, updateFormData }: StepProps) => {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-6">
      <InputField
        label="Bank Name"
        placeholder="Enter Name"
        value={formData.bankName}
        onChange={(v: string) => updateFormData({ bankName: v })}
      />
      <InputField
        label="Branch Name"
        placeholder="Enter Name"
        value={formData.branchName}
        onChange={(v: string) => updateFormData({ branchName: v })}
      />
      <InputField
        label="Account No"
        placeholder="Enter Name"
        value={formData.accountNo}
        onChange={(v: string) => updateFormData({ accountNo: v })}
      />
      <InputField
        label="IFSC Code"
        prefix="+91"
        placeholder=""
        value={formData.ifscCode}
        onChange={(v: string) => updateFormData({ ifscCode: v })}
      />
    </div>
  );
};

// ── Step 3 Components ────────────────────────────────────────────────────────
interface UploadBoxProps {
  title: string;
  value: File | null;
  onChange: (file: File | null) => void;
}

const UploadBox = ({ title, value, onChange }: UploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 block">{title}</label>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf"
      />
      <div
        onClick={() => inputRef.current?.click()}
        className={`w-full h-32 border-[1.5px] border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer group ${
          value
            ? "border-[#1D6BA3] bg-[#1D6BA3]/[0.02]"
            : "border-gray-200 hover:border-[#1D6BA3]/50 hover:bg-[#1D6BA3]/[0.02]"
        }`}
      >
        <div
          className={`p-2.5 rounded-full transition-all duration-300 ${
            value
              ? "bg-[#1D6BA3] text-white shadow-lg shadow-[#1D6BA3]/20"
              : "text-[#1D6BA3] bg-[#1D6BA3]/10 group-hover:bg-[#1D6BA3]/20 group-hover:scale-110"
          }`}
        >
          {value ? <CheckIcon size={20} /> : <UploadIcon size={20} />}
        </div>
        <p className="text-xs text-gray-500">
          {value ? (
            <span className="font-semibold text-[#1D6BA3]">{value.name}</span>
          ) : (
            <>
              <span className="font-semibold text-gray-700">Drop Files here or</span>{" "}
              <span className="text-[#1D6BA3] underline">Choose file</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

const Step3LegalDocuments = ({ formData, updateFormData }: StepProps) => {
  return (
    <div className="space-y-8 pb-4">
      <UploadBox
        title="Adhar Card"
        value={formData.adharCard}
        onChange={(f) => updateFormData({ adharCard: f })}
      />
      <UploadBox
        title="PAN Card"
        value={formData.panCard}
        onChange={(f) => updateFormData({ panCard: f })}
      />
      <UploadBox
        title="Experience Certificate"
        value={formData.experienceCertificate}
        onChange={(f) => updateFormData({ experienceCertificate: f })}
      />
      <UploadBox
        title="Passport Size Photo"
        value={formData.passportPhoto}
        onChange={(f) => updateFormData({ passportPhoto: f })}
      />
    </div>
  );
};

// ── Step 4 Components ────────────────────────────────────────────────────────
const Step4EmergencyContact = ({ formData, updateFormData }: StepProps) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-x-8 gap-y-6">
        <InputField
          label="Contact Number"
          prefix="+91"
          placeholder=""
          value={formData.emergencyContact}
          onChange={(v: string) => updateFormData({ emergencyContact: v })}
        />
        <InputField
          label="Contact Person Name"
          placeholder="Enter"
          value={formData.emergencyName}
          onChange={(v: string) => updateFormData({ emergencyName: v })}
        />
        <InputField
          label="Relation With The Contact"
          placeholder="Enter"
          value={formData.emergencyRelation}
          onChange={(v: string) => updateFormData({ emergencyRelation: v })}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 block">Address</label>
        <textarea
          placeholder="Enter"
          rows={4}
          value={formData.emergencyAddress}
          onChange={(e) => updateFormData({ emergencyAddress: e.target.value })}
          className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50 placeholder-gray-400"
        />
      </div>
    </div>
  );
};

// ── Step 5 Components ────────────────────────────────────────────────────────
interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const DateField = ({ label, value, onChange }: DateFieldProps) => (
  <div className="space-y-2 flex-1 min-w-[280px]">
    <label className="text-sm font-semibold text-gray-700 block">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1D6BA3] transition-colors">
        <CalendarIcon size={18} />
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors">
        <ChevronDownIcon size={16} />
      </div>
      <input
        type="text"
        placeholder="YYYY-MM-DD"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-11 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] placeholder-gray-400 font-medium"
      />
    </div>
  </div>
);

const Step5PersonalInformation = ({ formData, updateFormData }: StepProps) => {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-6">
      <DateField
        label="Date Of Birth"
        value={formData.dob}
        onChange={(v: string) => updateFormData({ dob: v })}
      />
      <DateField
        label="Date Of Joining"
        value={formData.doj}
        onChange={(v: string) => updateFormData({ doj: v })}
      />
      <DateField
        label="Date Of Exit / Relived"
        value={formData.doe}
        onChange={(v: string) => updateFormData({ doe: v })}
      />
    </div>
  );
};

// ── Step 6 Components ────────────────────────────────────────────────────────
interface ReferenceRowProps {
  reference: EmployeeReference;
  onUpdate: (updates: Partial<EmployeeReference>) => void;
  onDelete: () => void;
  showDelete: boolean;
}

const ReferenceRow = ({ reference, onUpdate, onDelete, showDelete }: ReferenceRowProps) => (
  <div className="flex flex-wrap gap-x-8 gap-y-6 relative group">
    <InputField
      label="Name"
      placeholder="Enter"
      value={reference.name}
      onChange={(v: string) => onUpdate({ name: v })}
    />
    <InputField
      label="Contact Number"
      prefix="+91"
      placeholder=""
      value={reference.contactNumber}
      onChange={(v: string) => onUpdate({ contactNumber: v })}
    />
    <InputField
      label="Designation"
      placeholder="Enter"
      value={reference.designation}
      onChange={(v: string) => onUpdate({ designation: v })}
    />
    {showDelete && (
      <button
        onClick={onDelete}
        className="w-10 h-10 mt-7 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
      >
        <TrashIcon size={18} />
      </button>
    )}
  </div>
);

const Step6EmployeeReference = ({ formData, updateFormData }: StepProps) => {
  const addReference = () => {
    updateFormData({
      references: [
        ...formData.references,
        { id: Date.now(), name: "", contactNumber: "", designation: "" },
      ],
    });
  };

  const removeReference = (id: number) => {
    updateFormData({
      references: formData.references.filter((r: EmployeeReference) => r.id !== id),
    });
  };

  const updateReference = (id: number, updates: Partial<EmployeeReference>) => {
    updateFormData({
      references: formData.references.map((r: EmployeeReference) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {formData.references.map((ref: EmployeeReference) => (
          <ReferenceRow
            key={ref.id}
            reference={ref}
            onUpdate={(updates) => updateReference(ref.id, updates)}
            onDelete={() => removeReference(ref.id)}
            showDelete={formData.references.length > 1}
          />
        ))}
      </div>

      <button
        onClick={addReference}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1D6BA3] border border-[#1D6BA3] border-dashed rounded-lg hover:bg-[#1D6BA3]/5 transition-colors"
      >
        <PlusIcon size={16} />
        Add More
      </button>
    </div>
  );
};

export default EmployeeAddition;
