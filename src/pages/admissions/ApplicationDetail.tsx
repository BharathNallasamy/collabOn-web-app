import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { XIcon, DocumentIcon } from "../../components/common/Icons/PageIcons";

// ── Types ─────────────────────────────────────────────────────────────────────
import { SEED_ADMISSION_APP_DATA as SEED_DATA } from "../../types/mockData";

// ── State types ───────────────────────────────────────────────────────────────
type DialogType = "shortlist" | "waiting" | "reject" | "accept" | null;

// ── Section helpers ───────────────────────────────────────────────────────────
const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-[13px] font-bold text-[#1D6BA3] mb-3">{title}</h3>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs font-semibold text-gray-900 text-right ml-4">{value || "-"}</span>
  </div>
);

// ── Animation keyframes (injected once) ──────────────────────────────────────
const ANIM_STYLES = `
  @keyframes adm-pop-in {
    0%   { transform: scale(0);    opacity: 0; }
    55%  { transform: scale(1.18); opacity: 1; }
    75%  { transform: scale(0.92);             }
    100% { transform: scale(1);               }
  }
  @keyframes adm-draw-check {
    0%   { stroke-dashoffset: 60; opacity: 0; }
    25%  { opacity: 1; }
    100% { stroke-dashoffset: 0;  opacity: 1; }
  }
  @keyframes adm-bounce-warn {
    0%   { transform: scale(0);    opacity: 0; }
    50%  { transform: scale(1.22); opacity: 1; }
    70%  { transform: scale(0.88);             }
    85%  { transform: scale(1.06);             }
    100% { transform: scale(1);               }
  }
  @keyframes adm-pulse-excl {
    0%, 100% { transform: scaleY(1);    }
    30%       { transform: scaleY(1.18); }
    60%       { transform: scaleY(0.88); }
  }
`;

// ── Shared components ─────────────────────────────────────────────────────────
const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) =>
  createPortal(
    <>
      <style>{ANIM_STYLES}</style>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-[14px] font-bold text-gray-900">Saved</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
            >
              <XIcon />
            </button>
          </div>
          <div className="flex flex-col items-center py-8 px-5 gap-3">
            {/* Animated circle — pops in with bounce */}
            <div
              style={{ animation: "adm-pop-in 0.55s cubic-bezier(0.22,1,0.36,1) both" }}
              className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30"
            >
              {/* Animated checkmark — draws itself in */}
              <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="white"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="60"
                  style={{ animation: "adm-draw-check 0.45s ease 0.3s both" }}
                />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">{message}</p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );

const ConfirmDialog = ({
  title,
  message,
  onNo,
  onYes,
}: {
  title: string;
  message: string;
  onNo: () => void;
  onYes: () => void;
}) =>
  createPortal(
    <>
      <style>{ANIM_STYLES}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-[14px] font-bold text-gray-900">{title}</h3>
            <button
              onClick={onNo}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
            >
              <XIcon />
            </button>
          </div>
          <div className="flex flex-col items-center py-8 px-5 gap-3">
            {/* Animated warning circle — bounces in */}
            <div
              style={{ animation: "adm-bounce-warn 0.6s cubic-bezier(0.22,1,0.36,1) both" }}
              className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
            >
              {/* Animated ! — pulses once */}
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ animation: "adm-pulse-excl 0.5s ease 0.45s both" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 8v4m0 4h.01"
                />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-gray-800 text-center mt-1">{message}</p>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
            <button
              onClick={onNo}
              className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              No
            </button>
            <button
              onClick={onYes}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1a5f91]"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );

// ── Fees Structure Modal ──────────────────────────────────────────────────────
const FeesStructureModal = ({
  courseOffer,
  setCourseOffer,
  scholarship,
  setScholarship,
  discount,
  setDiscount,
  discountAmount,
  setDiscountAmount,
  onClose,
  onGenerate,
}: {
  courseOffer: string;
  setCourseOffer: (v: string) => void;
  scholarship: string;
  setScholarship: (v: string) => void;
  discount: string;
  setDiscount: (v: string) => void;
  discountAmount: string;
  setDiscountAmount: (v: string) => void;
  onClose: () => void;
  onGenerate: () => void;
}) =>
  createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-[14px] font-bold text-gray-900">Fees Structure</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Course offer radio */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Course Offer</p>
            <div className="flex items-center gap-5">
              {["Statistics", "Mathematics"].map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="courseOffer"
                    value={c}
                    checked={courseOffer === c}
                    onChange={() => setCourseOffer(c)}
                    className="accent-[#1D6BA3]"
                  />
                  <span className="text-xs text-gray-700">{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fees table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                    Course Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                    Program Type
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                    Fee Type
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2.5 text-xs text-gray-700" rowSpan={3}>
                    Statistics
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-700" rowSpan={3}>
                    UG
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-700">Admission</td>
                  <td className="px-4 py-2.5 text-xs text-gray-700 text-right">Rs 55,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-xs text-gray-700">Transport</td>
                  <td className="px-4 py-2.5 text-xs text-gray-700 text-right">Rs 15,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-xs text-gray-700">Hostel</td>
                  <td className="px-4 py-2.5 text-xs text-gray-700 text-right">Rs 25,000</td>
                </tr>
                {/* Grand total row */}
                <tr className="bg-gray-50">
                  <td colSpan={2} className="px-4 py-2.5 text-xs font-bold text-gray-800">
                    Grand Total
                  </td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">
                    <span className="line-through text-gray-400 mr-2">Rs 90,000</span>
                    <span className="text-green-600 font-bold">Rs 82,000</span>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            {/* Discount banner */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1D6BA3] text-white">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span className="text-xs font-semibold">Discount Applied</span>
            </div>
          </div>

          {/* Scholarship */}
          <div className="flex items-center gap-6">
            <p className="text-xs font-semibold text-gray-700 w-24">Scholarship</p>
            <div className="flex items-center gap-5">
              {["Yes", "No"].map((v) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scholarship"
                    value={v}
                    checked={scholarship === v}
                    onChange={() => setScholarship(v)}
                    className="accent-[#1D6BA3]"
                  />
                  <span className="text-xs text-gray-700">{v}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div className="flex items-center gap-6">
            <p className="text-xs font-semibold text-gray-700 w-24">Discount</p>
            <div className="flex items-center gap-5">
              {["Yes", "No"].map((v) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="discount"
                    value={v}
                    checked={discount === v}
                    onChange={() => setDiscount(v)}
                    className="accent-[#1D6BA3]"
                  />
                  <span className="text-xs text-gray-700">{v}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-6">
            <p className="text-xs font-semibold text-gray-700 w-24">Amount</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                ₹
              </span>
              <input
                type="text"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="0"
                className="pl-7 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/30 focus:border-[#1D6BA3] w-40"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onGenerate}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#1D6BA3] rounded-lg hover:bg-[#1a5f91]"
          >
            Generate Payment Link
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

// ── Document card ─────────────────────────────────────────────────────────────
const DocCard = ({ name }: { name: string }) => (
  <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
    <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#1D6BA3]">
      <DocumentIcon />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
      <p className="text-[10px] text-green-600 mt-0.5">Updated: 2024/01/15</p>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const ApplicationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const entry = SEED_DATA.find((e) => e.id === Number(id));

  // Modal & dialog state
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [showFees, setShowFees] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Photo upload
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/jpg"].includes(file.type)) {
      setPhotoError("Only JPG / JPEG files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("File size must be under 2 MB.");
      return;
    }
    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Fees modal state
  const [courseOffer, setCourseOffer] = useState("Statistics");
  const [scholarship, setScholarship] = useState("No");
  const [discount, setDiscount] = useState("Yes");
  const [discountAmount, setDiscountAmount] = useState("");

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-sm font-semibold text-gray-600">Application not found.</p>
        <button
          onClick={() => navigate("/layout/admissions/application-review")}
          className="text-xs text-[#1D6BA3] underline"
        >
          Back to Application Review
        </button>
      </div>
    );
  }

  const handleDialogYes = () => {
    if (activeDialog === "shortlist") {
      setActiveDialog(null);
      setSuccessMsg("Application Shortlisted Successfully");
    } else if (activeDialog === "waiting") {
      setActiveDialog(null);
      setSuccessMsg("Application Added to Waitlist Successfully");
    } else if (activeDialog === "reject") {
      setActiveDialog(null);
      setSuccessMsg("Application Rejected Successfully");
    } else if (activeDialog === "accept") {
      setActiveDialog(null);
      setShowFees(true);
    }
  };

  const handleGeneratePaymentLink = () => {
    setShowFees(false);
    setSuccessMsg("Payment Link Generated Successfully");
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/layout/admissions/application-review")}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Applicant Personal Details</h1>
      </div>

      {/* Sub-header row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-gray-800">{entry.appNo}</span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          Application Received : 23/06/2024
        </span>
        <div className="flex-1" />
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          Application Received
        </span>
      </div>

      {/* Row 1: App Metadata + Personal Details */}
      <div className="grid grid-cols-2 gap-4">
        {/* Application Metadata */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
          <SectionTitle title="Application Metadata" />
          <DetailRow label="App No" value={entry.appNo} />
          <DetailRow label="Received Date" value="23/06/2024" />
          <DetailRow label="Admission Type" value={entry.admissionType} />
          <DetailRow label="Academic Year" value="2024 - 2026" />
          <DetailRow label="Course Name - 1" value="Statistics" />
          <DetailRow label="Course Name - 2" value="Mathematics" />
          {/* Upload Photo */}
          <div className="flex items-start justify-between py-3 border-b border-gray-50 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Upload Photo</span>
              <span className="text-[10px] text-gray-400">JPG / JPEG only · Max 2 MB</span>
              <button
                onClick={() => photoInputRef.current?.click()}
                className="mt-1 px-3 py-1 text-[11px] font-semibold text-[#1D6BA3] border border-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 transition-colors w-fit"
              >
                {photoUrl ? "Change Photo" : "Upload"}
              </button>
              {photoError && (
                <span className="text-[10px] text-red-500 font-medium mt-0.5">{photoError}</span>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            {photoUrl ? (
              <div className="relative flex-shrink-0">
                <img
                  src={photoUrl}
                  alt="Applicant"
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#1D6BA3]/30 shadow-sm"
                />
                <button
                  onClick={() => setPhotoUrl(null)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  title="Remove photo"
                >
                  <svg
                    className="w-2.5 h-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1D6BA3] to-blue-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {entry.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Application Personal Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
          <SectionTitle title="Application Personal Details" />
          <DetailRow label="Name" value="Kiran" />
          <DetailRow label="Date Of Birth" value="09/05/2000" />
          <DetailRow label="Age (Auto Calculated)" value="18" />
          <DetailRow label="Gender" value="Male" />
          <DetailRow label="Aadhar Number" value="098765" />
          <DetailRow label="EMIS Number" value="-" />
          <DetailRow label="Nationality" value="Indian" />
          <DetailRow label="Religion" value="Hindu" />
          <DetailRow label="Place Of Birth" value="Salem" />
          <DetailRow label="Mother Tongue" value="Tamil" />
        </div>
      </div>

      {/* Row 2: Educational Qualification — full width */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
        <SectionTitle title="Educational Qualification" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                  Qualification
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                  Institution/School
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                  Board/Univ
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                  Register Number
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Year</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                  %/CGPA
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="px-4 py-3 text-xs text-[#1D6BA3] font-semibold">HSC</td>
                <td className="px-4 py-3 text-xs text-gray-700">Dav School</td>
                <td className="px-4 py-3 text-xs text-gray-700">CBSE</td>
                <td className="px-4 py-3 text-xs text-gray-700">Dav School</td>
                <td className="px-4 py-3 text-xs text-gray-700">2023</td>
                <td className="px-4 py-3 text-xs text-gray-700">88%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Community & Reservation + Parents/Guardian */}
      <div className="grid grid-cols-2 gap-4">
        {/* Community & Reservation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
          <SectionTitle title="Community & Reservation" />
          <DetailRow label="Community Category" value="0986532fyh" />
          <DetailRow label="Sub-Caste" value="0" />
          <DetailRow label="Physically Handicapped/Differently Abled" value="No" />
        </div>

        {/* Parents/Guardian Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
          <SectionTitle title="Parents/Guardian Info" />
          <DetailRow label="Father's Name" value="-" />
          <DetailRow label="Occupation" value="Agriculture" />
          <DetailRow label="Annual Income" value="1.8 Lakhs" />
          <DetailRow label="Father's Mobile" value="123456789" />
          <div className="border-t border-gray-100 my-2" />
          <DetailRow label="Mother's Name" value="-" />
          <DetailRow label="Occupation" value="Home Maker" />
          <DetailRow label="Annual Income" value="0" />
          <DetailRow label="Mother's Mobile" value="3254597666" />
        </div>
      </div>

      {/* Row 4: Bank Details + Documents */}
      <div className="grid grid-cols-2 gap-4">
        {/* Bank Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
          <SectionTitle title="Bank Details For Scholarship" />
          <DetailRow label="Account Holder Name" value="Kiran" />
          <DetailRow label="Bank Name" value="SBI" />
          <DetailRow label="Account Number" value="180018001800" />
          <DetailRow label="IFSC Code" value="SBIN001254" />
          <DetailRow label="Branch Name" value="Salem" />
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
          <SectionTitle title="Documents" />
          <div className="grid grid-cols-2 gap-3">
            <DocCard name="10th Marksheet" />
            <DocCard name="12th Marksheet" />
            <DocCard name="Transfer Certificate" />
            <DocCard name="Community Certificate" />
            <DocCard name="Aadhar Card" />
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 -mx-4">
        <button
          onClick={() => setActiveDialog("shortlist")}
          className="px-5 py-2 text-sm font-semibold border border-[#1D6BA3] text-[#1D6BA3] rounded-lg hover:bg-[#1D6BA3]/5 transition-colors"
        >
          Shortlist
        </button>
        <button
          onClick={() => setActiveDialog("waiting")}
          className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Waiting
        </button>
        <button
          onClick={() => setActiveDialog("reject")}
          className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          Reject
        </button>
        <button
          onClick={() => setActiveDialog("accept")}
          className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          Accept Admission
        </button>
      </div>

      {/* Confirm dialogs */}
      {activeDialog === "shortlist" && (
        <ConfirmDialog
          title="Shortlist List"
          message="Are You Sure Do You Want To Shortlist This Application?"
          onNo={() => setActiveDialog(null)}
          onYes={handleDialogYes}
        />
      )}
      {activeDialog === "waiting" && (
        <ConfirmDialog
          title="Waitlist List"
          message="Are You Sure Do You Want To Move This Application To Wait List?"
          onNo={() => setActiveDialog(null)}
          onYes={handleDialogYes}
        />
      )}
      {activeDialog === "reject" && (
        <ConfirmDialog
          title="Reject Application?"
          message="Are You Sure Do You Want To Reject This Application"
          onNo={() => setActiveDialog(null)}
          onYes={handleDialogYes}
        />
      )}
      {activeDialog === "accept" && (
        <ConfirmDialog
          title="Accept Application?"
          message="Are You Sure Do You Want To Accept This Application"
          onNo={() => setActiveDialog(null)}
          onYes={handleDialogYes}
        />
      )}

      {/* Fees Structure Modal */}
      {showFees && (
        <FeesStructureModal
          courseOffer={courseOffer}
          setCourseOffer={setCourseOffer}
          scholarship={scholarship}
          setScholarship={setScholarship}
          discount={discount}
          setDiscount={setDiscount}
          discountAmount={discountAmount}
          setDiscountAmount={setDiscountAmount}
          onClose={() => setShowFees(false)}
          onGenerate={handleGeneratePaymentLink}
        />
      )}

      {/* Success popup */}
      {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg(null)} />}
    </div>
  );
};

export default ApplicationDetail;
