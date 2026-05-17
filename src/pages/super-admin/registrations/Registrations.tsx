import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  CalendarDays,
  Check,
  Download,
  FileText,
  Info,
  MoreVertical,
  Network,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { SEED_INSTITUTIONS as INSTITUTIONS } from "../../../types/mockData";

type RowActionsProps = { onEdit: () => void };

const RowActions = ({ onEdit }: RowActionsProps) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + window.scrollY + 8, left: rect.right - 140 });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onEdit}
        className="p-1.5 text-[#1D6BA3] hover:bg-blue-50 rounded-lg transition-colors"
        title="Edit"
      >
        <Pencil size={15} />
      </button>

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          className={`p-1.5 text-[#1D6BA3] hover:bg-blue-50 rounded-lg transition-colors ${open ? "bg-blue-50 ring-1 ring-[#1D6BA3]/20" : ""}`}
          title="More options"
        >
          <MoreVertical size={15} />
        </button>

        {open &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[999]"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
              />
              <div
                style={{ top: coords.top - window.scrollY, left: coords.left }}
                className="fixed bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-[1000] min-w-[140px] p-1.5 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Network size={14} className="text-[#1D6BA3]" />
                  View Hierarchy
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FileText size={14} className="text-[#1D6BA3]" />
                  View Document
                </button>
              </div>
            </>,
            document.body
          )}
      </div>
    </div>
  );
};

const STEPS = ["Institution Details", "Compliance & KYC", "Access Config", "Review"];

const Required = () => <span className="text-red-500">*</span>;

type FieldProps = {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  icon?: "calendar";
};

const TextField = ({
  label,
  required = false,
  placeholder = "Enter",
  type = "text",
  icon,
}: FieldProps) => (
  <label className="flex flex-col gap-1.5 text-xs font-medium text-gray-700">
    <span>
      {label} {required && <Required />}
    </span>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-9 px-3 pr-9 border border-gray-200 rounded-md bg-white text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]"
      />
      {icon === "calendar" && (
        <CalendarDays
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      )}
    </div>
  </label>
);

type SelectFieldProps = {
  label: string;
  required?: boolean;
  options?: string[];
};

const SelectField = ({ label, required = false, options = [] }: SelectFieldProps) => (
  <label className="flex flex-col gap-1.5 text-xs font-medium text-gray-700">
    <span>
      {label} {required && <Required />}
    </span>
    <div className="relative">
      <select className="w-full h-9 pl-3 pr-8 border border-gray-200 rounded-md bg-white text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none">
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <svg
        className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </label>
);

type StepperProps = {
  currentStep: number;
};

const Stepper = ({ currentStep }: StepperProps) => (
  <div className="bg-white rounded-md border border-gray-200 px-8 py-5">
    <div className="grid grid-cols-4 items-start">
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div key={step} className="relative flex flex-col items-center gap-3">
            {index < STEPS.length - 1 && (
              <span
                className={`absolute left-1/2 top-3 h-px w-full ${
                  isCompleted ? "bg-[#1D6BA3]" : "bg-gray-300"
                }`}
              />
            )}
            <span
              className={[
                "relative z-10 h-6 w-6 rounded-full border flex items-center justify-center bg-white",
                isCompleted
                  ? "border-[#1D6BA3] bg-[#1D6BA3] text-white"
                  : isActive
                    ? "border-[#1D6BA3] text-[#1D6BA3]"
                    : "border-gray-300 text-gray-300",
              ].join(" ")}
            >
              {isCompleted ? (
                <Check size={14} />
              ) : isActive ? (
                <span className="h-3 w-3 rounded-full bg-[#1D6BA3]" />
              ) : null}
            </span>
            <span className="text-[11px] font-medium text-gray-900 text-center">{step}</span>
          </div>
        );
      })}
    </div>
  </div>
);

type RegistrationWizardProps = {
  onCancel: () => void;
};

const APPLICATION_RIGHT_GROUPS = [
  {
    title: "Core Application",
    rights: ["Dashboard", "User Management", "Settings"],
  },
  {
    title: "Academic Modules",
    rights: ["Academic Structure", "Student Info", "Attendance", "Results", "OBE/IQAC"],
  },
  {
    title: "Administrative Modules",
    rights: ["Admission", "Fee Management", "Staff Management", "Payroll"],
  },
  {
    title: "Campus Services",
    rights: ["Campus Communications", "Transport", "Library", "Hostel"],
  },
  {
    title: "Advanced",
    rights: ["Reports", "Advanced Analytics", "API Access", "Audit Logs"],
  },
];

const RegistrationWizard = ({ onCancel }: RegistrationWizardProps) => {
  const [step, setStep] = useState(1);
  const [structure, setStructure] = useState<"single" | "group">("single");
  const [engagementModel, setEngagementModel] = useState<"subscription" | "custom">("subscription");
  const [accessLevel, setAccessLevel] = useState<"starter" | "growth" | "enterprise">("starter");
  const [accessMode, setAccessMode] = useState<"trial" | "paid">("trial");

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md border border-gray-200 px-4 py-5">
        <h1 className="text-sm font-bold text-gray-900">New Registration</h1>
      </div>

      <Stepper currentStep={step} />

      {step === 1 ? (
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="p-5">
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-5">
              <p className="text-xs font-bold text-[#1D6BA3] mb-2">Institution Structure</p>
              <p className="text-[11px] text-[#1D6BA3] mb-4">
                Are you onboarding a single school/college or a group (Trust/Society) managing
                multiple campuses?
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setStructure("single")}
                  className={[
                    "h-16 rounded-md border flex items-center justify-center gap-3 bg-white text-left transition-colors",
                    structure === "single" ? "border-[#1D6BA3]" : "border-transparent",
                  ].join(" ")}
                >
                  <Building2
                    size={22}
                    className={structure === "single" ? "text-[#1D6BA3]" : "text-gray-500"}
                  />
                  <span>
                    <span className="block text-xs font-bold text-[#1D6BA3]">
                      Single Institution
                    </span>
                    <span className="block text-[11px] text-[#1D6BA3]">
                      One campus, One admin root
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStructure("group")}
                  className={[
                    "h-16 rounded-md border flex items-center justify-center gap-3 bg-white text-left transition-colors",
                    structure === "group" ? "border-[#1D6BA3]" : "border-transparent",
                  ].join(" ")}
                >
                  <Network
                    size={22}
                    className={structure === "group" ? "text-[#1D6BA3]" : "text-gray-500"}
                  />
                  <span>
                    <span className="block text-xs font-bold text-gray-700">
                      Group of Institutions
                    </span>
                    <span className="block text-[11px] text-gray-500">
                      Multiple branches, HQ Admin
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <SelectField
                label="Institution Name"
                required
                options={["Xavier Group of Schools", "Green Valley University"]}
              />
              <SelectField
                label="Institution Category"
                options={[
                  "School",
                  "College",
                  "Polytechnic College",
                  "University",
                  "Training Institute",
                  "PlaySchool",
                ]}
              />
              <SelectField
                label="Ownership Type"
                options={["Government", "Autonomous", "Private / Aided"]}
              />
              <TextField label="Year of Establishment" required placeholder="YYYY" />
              <TextField
                label="Academic Year Start"
                required
                placeholder="dd/mm/yyyy"
                icon="calendar"
              />
              <TextField label="Email ID (Official)" required />
              <TextField label="Phone Number" required placeholder="+91" />
              <SelectField label="Country" required options={["India"]} />
              <TextField label="State / Province" required placeholder="" />
              {structure === "group" && (
                <TextField label="No of Branches" required placeholder="Enter" />
              )}
            </div>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-gray-700 mt-4">
              <span>
                Address <Required />
              </span>
              <textarea
                rows={4}
                placeholder="Enter"
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] resize-none"
              />
            </label>
          </div>

          <div className="border-t border-gray-200 px-4 py-4 flex items-center justify-between">
            <button
              type="button"
              className="h-9 px-4 rounded-md bg-[#1D6BA3] text-white text-xs font-bold hover:bg-[#1A5F91] transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save Draft
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="h-9 px-4 rounded-md border border-[#1D6BA3]/30 text-[#1D6BA3] text-xs font-semibold hover:bg-blue-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-9 px-5 rounded-md bg-[#1D6BA3] text-white text-xs font-bold hover:bg-[#1A5F91] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : step === 2 ? (
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="p-5">
            <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 mb-5 flex items-center gap-3">
              <Info size={16} className="text-amber-500" />
              <p className="text-[11px] text-amber-700">
                Mandatory Regulatory Information. These details are required for gathering statutory
                reports and fee receipts.
              </p>
            </div>

            <section className="pb-5 border-b border-gray-200">
              <h2 className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#1D6BA3]" />
                Legal Entity & Compliance
              </h2>
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                <TextField label="Registration Number / Trust ID" />
                <TextField label="Tax ID (PAN / EIN / GSTIN)" />
                <SelectField label="Regulatory Body" options={["UGC", "AICTE", "NIRF", "NAAC"]} />
              </div>
            </section>

            <section className="py-5 border-b border-gray-200">
              <h2 className="text-xs font-bold text-gray-900 mb-4">Affiliation & Accreditation</h2>
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                <SelectField
                  label="Primary Affiliation Board"
                  options={["State Board", "CBSE", "ICSE", "Matriculation", "NAAC", "AICTE"]}
                />
                <TextField label="Affiliation Code / School Code" />
              </div>
            </section>

            <section className="py-5 border-b border-gray-200">
              <h2 className="text-xs font-bold text-gray-900 mb-4">Authorized Signatory (KYC)</h2>
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                <TextField label="Full Name (Principal / Trustee)" />
                <TextField label="Official Email" />
                <TextField label="Official Phone Number" />
              </div>
            </section>

            <section className="pt-5">
              <h2 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users size={16} className="text-[#1D6BA3]" />
                Primary Admin
              </h2>
              <label className="inline-flex items-center gap-2 text-xs text-gray-700 mb-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 accent-[#1D6BA3]"
                />
                Admin is the same as Authorized Signatory
              </label>
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                <TextField label="Admin Name" required />
                <TextField label="Admin Email" required />
                <TextField label="Admin Phone" required />
              </div>
              <p className="mt-2 text-[10px] text-gray-500">
                * An email will be sent to this address to set up the password. Initial permissions
                will be set to Full Access.
              </p>
            </section>
          </div>

          <div className="border-t border-gray-200 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="h-9 px-4 rounded-md border border-[#1D6BA3]/30 text-[#1D6BA3] text-xs font-semibold hover:bg-blue-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-9 px-4 rounded-md bg-[#1D6BA3] text-white text-xs font-bold hover:bg-[#1A5F91] transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Save Draft
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-9 px-4 rounded-md border border-[#1D6BA3]/30 text-[#1D6BA3] text-xs font-semibold hover:bg-blue-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-9 px-5 rounded-md bg-[#1D6BA3] text-white text-xs font-bold hover:bg-[#1A5F91] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : step === 3 ? (
        <div className="space-y-4">
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h2 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#1D6BA3]" />
                  Institution Access Configuration
                </h2>
                <p className="text-[11px] text-gray-500 mt-1">
                  Manage platform access level and enabled applications.
                </p>
              </div>
              <div className="h-9 px-4 rounded-md bg-gray-50 text-xs text-gray-600 flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                Environment: Production
              </div>
            </div>

            <div className="p-5">
              <p className="text-xs font-bold text-gray-900 mb-3 uppercase">Engagement Model</p>
              <div className="grid grid-cols-2 gap-5">
                <button
                  type="button"
                  onClick={() => setEngagementModel("subscription")}
                  className={[
                    "min-h-16 rounded-md border px-4 py-3 text-left transition-colors",
                    engagementModel === "subscription"
                      ? "border-[#1D6BA3] bg-blue-50"
                      : "border-gray-200 bg-white",
                  ].join(" ")}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className={[
                        "mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center",
                        engagementModel === "subscription" ? "border-[#1D6BA3]" : "border-gray-300",
                      ].join(" ")}
                    >
                      {engagementModel === "subscription" && (
                        <span className="h-2 w-2 rounded-full bg-[#1D6BA3]" />
                      )}
                    </span>
                    <span>
                      <span className="block text-xs font-bold text-[#1D6BA3]">
                        Subscription (SaaS)
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-1">
                        Pre-packaged plan shared infrastructure.
                      </span>
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setEngagementModel("custom")}
                  className={[
                    "min-h-16 rounded-md border px-4 py-3 text-left transition-colors",
                    engagementModel === "custom"
                      ? "border-[#1D6BA3] bg-blue-50"
                      : "border-gray-200 bg-white",
                  ].join(" ")}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className={[
                        "mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center",
                        engagementModel === "custom" ? "border-[#1D6BA3]" : "border-gray-300",
                      ].join(" ")}
                    >
                      {engagementModel === "custom" && (
                        <span className="h-2 w-2 rounded-full bg-[#1D6BA3]" />
                      )}
                    </span>
                    <span>
                      <span className="block text-xs font-bold text-[#1D6BA3]">
                        Custom (White-Labelling)
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-1">
                        Custom domains, bespoke modules, custom pricing
                      </span>
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {engagementModel === "subscription" && (
            <div className="bg-white rounded-md border border-gray-200 p-5">
              <p className="text-xs font-bold text-gray-900 mb-3 uppercase">
                Select Plan Access Level
              </p>
              <div className="grid grid-cols-3 gap-5">
                {[
                  {
                    key: "starter",
                    title: "Starter Access",
                    desc: "Core academic and administrative features for small institutions.",
                  },
                  {
                    key: "growth",
                    title: "Growth Access",
                    desc: "Enhanced modules including financial and communication tools.",
                  },
                  {
                    key: "enterprise",
                    title: "Enterprise Access",
                    desc: "Full suite with advanced analytics, compliance and API access.",
                  },
                ].map((plan) => (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => setAccessLevel(plan.key as "starter" | "growth" | "enterprise")}
                    className={[
                      "min-h-16 rounded-md border px-4 py-3 text-left transition-colors",
                      accessLevel === plan.key
                        ? "border-[#1D6BA3] bg-blue-50"
                        : "border-gray-200 bg-white",
                    ].join(" ")}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={[
                          "mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center",
                          accessLevel === plan.key ? "border-[#1D6BA3]" : "border-gray-300",
                        ].join(" ")}
                      >
                        {accessLevel === plan.key && (
                          <span className="h-2 w-2 rounded-full bg-[#1D6BA3]" />
                        )}
                      </span>
                      <span>
                        <span className="block text-xs font-bold text-[#1D6BA3]">{plan.title}</span>
                        <span className="block text-[11px] text-gray-500 mt-1">{plan.desc}</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Application Rights Included</h2>
              <p className="text-[11px] text-gray-500 mt-1">
                Modules Enabled for this institution under starter access.
              </p>
            </div>

            <div className="px-8 py-6 grid grid-cols-3 gap-x-20 gap-y-8">
              {APPLICATION_RIGHT_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="text-xs font-bold text-gray-800 mb-4">{group.title}</h3>
                  <div className="space-y-3">
                    {group.rights.map((right) => (
                      <label key={right} className="flex items-center gap-2 text-xs text-gray-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 accent-[#1D6BA3]"
                        />
                        {right}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {engagementModel === "subscription" && accessLevel === "starter" && (
              <div className="px-5 pb-5">
                <div className="bg-blue-50 rounded-md px-4 py-3 flex items-center gap-3 text-xs text-[#1D6BA3]">
                  <Info size={16} />
                  Enabled Applications will automatically appear in the institution portals and
                  navigation sidebar.
                </div>
              </div>
            )}
          </div>

          {engagementModel === "subscription" && accessLevel === "starter" && (
            <div className="grid grid-cols-3 gap-5">
              <div className="bg-white rounded-md border border-gray-200 p-5 min-h-[170px]">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Access Mode</h2>
                <div className="h-12 rounded-md border border-gray-200 px-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-800">Trial</span>
                  <button
                    type="button"
                    onClick={() => setAccessMode((mode) => (mode === "trial" ? "paid" : "trial"))}
                    className={[
                      "relative h-5 w-10 rounded-full transition-colors",
                      accessMode === "paid" ? "bg-[#1D6BA3]" : "bg-gray-300",
                    ].join(" ")}
                    aria-label="Access mode"
                    aria-pressed={accessMode === "paid"}
                  >
                    <span
                      className={[
                        "absolute top-1 h-3 w-3 rounded-full bg-white transition-transform",
                        accessMode === "paid" ? "translate-x-6" : "translate-x-1",
                      ].join(" ")}
                    />
                  </button>
                  <span className="text-xs font-medium text-gray-800">Paid</span>
                </div>
                <p className="text-xs text-gray-700 mt-4">Full Production Access Enabled</p>
              </div>

              <div className="bg-white rounded-md border border-gray-200 p-5 min-h-[170px]">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Access End Date</h2>
                <label className="flex flex-col gap-1.5 text-xs font-medium text-gray-700">
                  Date
                  <div className="relative">
                    <input
                      type="text"
                      value="10/05/2024"
                      readOnly
                      className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-md bg-white text-xs text-gray-700 focus:outline-none"
                    />
                    <CalendarDays
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </label>
              </div>

              <div className="bg-emerald-50 rounded-md border border-emerald-200 p-4">
                <div className="bg-white/70 rounded-md border border-emerald-100 px-4 py-5 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">Current Level</span>
                    <span className="font-bold text-gray-900">Starter Access</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">Enabled Modules</span>
                    <span className="font-bold text-gray-900">5 Apps</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">Last Updated by</span>
                    <span className="font-bold text-gray-900">Super Admin</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">Internal Notes</span>
                    <button type="button" className="font-bold text-[#1D6BA3]">
                      Add Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-md border border-gray-200 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="h-9 px-4 rounded-md border border-[#1D6BA3]/30 text-[#1D6BA3] text-xs font-semibold hover:bg-blue-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-9 px-4 rounded-md bg-[#1D6BA3] text-white text-xs font-bold hover:bg-[#1A5F91] transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Save Draft
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-9 px-4 rounded-md border border-[#1D6BA3]/30 text-[#1D6BA3] text-xs font-semibold hover:bg-blue-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="h-9 px-5 rounded-md bg-[#1D6BA3] text-white text-xs font-bold hover:bg-[#1A5F91] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="p-8 grid grid-cols-2 gap-10 items-start">
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-gray-500" />
                  Configuration Summary
                </h2>
              </div>

              <div className="px-5 py-3">
                {[
                  { label: "Institution Name", value: "" },
                  { label: "Institution Type", value: "" },
                  { label: "Primary Admin Institution", value: "" },
                  {
                    label: "Engagement Model",
                    value: "Subscription (SaaS)",
                    tone: "text-[#1D6BA3]",
                  },
                  { label: "Plan Type", value: "Starter Access", tone: "text-[#1D6BA3]" },
                  { label: "Access Mode", value: "ACTIVE", tone: "text-green-600 font-bold" },
                  { label: "Valid Until", value: "21-03-2027", tone: "text-gray-500" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="min-h-12 border-b border-gray-200 flex items-center justify-between gap-4"
                  >
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                    {item.value && (
                      <span className={`text-sm ${item.tone ?? "text-gray-700"}`}>
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}

                <div className="min-h-24 pt-4 flex items-start justify-between gap-4">
                  <span className="text-sm font-medium text-gray-900">Enabled Modules</span>
                  <div className="flex flex-wrap justify-end gap-2 max-w-[230px]">
                    {[
                      "Academic Structure",
                      "Attendance",
                      "Dashboard",
                      "Student Info",
                      "User Management",
                    ].map((module) => (
                      <span
                        key={module}
                        className="px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-500"
                      >
                        {module}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Provision Tenant</h2>
              <p className="text-xs text-gray-500 mb-5">
                This will create the institution database and enable selected modules.
              </p>
              <button
                type="button"
                className="w-full h-11 rounded-md bg-[#1D6BA3] text-white text-sm font-bold hover:bg-[#1A5F91] transition-colors"
              >
                Complete Registration
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 rounded-md border border-[#1D6BA3]/30 text-[#1D6BA3] text-xs font-semibold hover:bg-blue-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-9 px-4 rounded-md bg-[#1D6BA3] text-white text-xs font-bold hover:bg-[#1A5F91] transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Registrations = () => {
  const [view, setView] = useState<"list" | "new">("list");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([1]);
  const [action, setAction] = useState("");

  const filteredInstitutions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return INSTITUTIONS;

    return INSTITUTIONS.filter((institution) =>
      [
        institution.name,
        institution.adminName,
        institution.adminEmail,
        institution.structure,
        institution.engagementModel,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [search]);

  const visibleIds = filteredInstitutions.map((institution) => institution.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  };

  const exportCsv = () => {
    const rows = [
      [
        "Institution Name",
        "Institution Structure",
        "Admin Name",
        "Admin Email",
        "Engagement Model",
      ],
      ...filteredInstitutions.map((institution) => [
        institution.name,
        institution.structure,
        institution.adminName,
        institution.adminEmail,
        institution.engagementModel,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "institutions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (view === "new") {
    return <RegistrationWizard onCancel={() => setView("list")} />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-200">
        <h1 className="text-sm font-bold text-gray-900">Institutions</h1>

        <div className="flex items-center gap-3">
          <div className="relative w-[104px]">
            <select
              value={action}
              onChange={(event) => setAction(event.target.value)}
              className="w-full h-9 pl-3 pr-8 border border-gray-200 rounded-md bg-white text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none"
            >
              <option value="">Active</option>
              <option value="activate">Inactive</option>
              <option value="deactivate">Delete</option>
            </select>
            <svg
              className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="h-9 px-4 border border-gray-200 rounded-md text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download size={14} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => setView("new")}
            className="h-9 px-4 rounded-md bg-[#1D6BA3] text-white text-xs font-bold hover:bg-[#1A5F91] transition-colors flex items-center gap-2"
          >
            <Plus size={15} />
            New Institution
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 pb-5">
        <div className="relative w-[280px] mb-6">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter by name or admin..."
            className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-md bg-white text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3]"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm" style={{ minWidth: "1600px" }}>
            <thead>
              <tr className="bg-blue-50 border-b border-gray-200">
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 accent-[#1D6BA3]"
                    aria-label="Select all institutions"
                  />
                </th>
                {[
                  "Institution Name",
                  "Institution Structure",
                  "Admin Name",
                  "Admin Email",
                  "Engagement Model",
                  "Plan Type",
                  "Onboarded on",
                  "Plan Expire",
                  "Service Type",
                  "Status",
                ].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-800 whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
                <th
                  className="px-4 py-3 text-center text-xs font-bold text-gray-800 whitespace-nowrap sticky right-0 z-20 bg-blue-50"
                  style={{ boxShadow: "-1px 0 0 0 #e5e7eb, -8px 0 8px -4px rgba(0,0,0,0.06)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredInstitutions.map((institution) => (
                <tr key={institution.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(institution.id)}
                      onChange={() => toggleSelect(institution.id)}
                      className="h-4 w-4 rounded border-gray-300 accent-[#1D6BA3]"
                      aria-label={`Select ${institution.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${institution.avatarTone}`}
                      >
                        {institution.avatarText}
                      </span>
                      <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
                        {institution.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                    {institution.structure}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                    {institution.adminName}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                    {institution.adminEmail}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                    {institution.engagementModel}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                    {institution.planType || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                    {institution.onboardedOn}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                    {institution.planExpire}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                    {institution.serviceType || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        institution.status === "Active"
                          ? "bg-green-50 text-green-600 border border-green-100"
                          : "bg-red-50 text-red-600 border border-red-100"
                      }`}
                    >
                      {institution.status}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 sticky right-0 z-10 bg-white"
                    style={{ boxShadow: "-1px 0 0 0 #e5e7eb, -8px 0 8px -4px rgba(0,0,0,0.06)" }}
                  >
                    <RowActions onEdit={() => setView("new")} />
                  </td>
                </tr>
              ))}

              {filteredInstitutions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Users size={28} />
                      <p className="text-sm font-semibold">No institutions found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Registrations;
