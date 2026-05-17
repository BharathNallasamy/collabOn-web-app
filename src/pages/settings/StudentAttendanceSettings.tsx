import { useState } from "react";
import { ChevronLeft, Smartphone, ListChecks, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";

const StudentAttendanceSettings = () => {
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // ATTENDANCE STRATEGY
  const [markingPattern, setMarkingPattern] = useState("Hourly Attendance");

  // INITIAL MARKING & LOCK TIME
  const [markingStartTime, setMarkingStartTime] = useState("00:00");
  const [lockTimeMinutes, setLockTimeMinutes] = useState("0");

  // ATTENDANCE EDITS & APPROVALS
  const [isLateApprovalRequired, setIsLateApprovalRequired] = useState(false);
  const [lateApprovalAuthority, setLateApprovalAuthority] = useState("Principal");

  const [isSubmitEditApprovalRequired, setIsSubmitEditApprovalRequired] = useState(false);

  const [isEditApprovalRequired, setIsEditApprovalRequired] = useState(false);
  const [editApprovalAuthority, setEditApprovalAuthority] = useState("Principal");

  const handleSave = () => {
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      navigate("/layout/settings");
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col min-h-screen">
      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        size="md"
      >
        <div className="py-20 flex flex-col items-center text-center px-6">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5">
            <svg
              className="w-7 h-7 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-[16px] font-bold text-gray-900">
            Student Attendance Settings Saved Successfully
          </p>
        </div>
      </Modal>

      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 w-full">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/layout/settings")}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-[16px] font-bold text-gray-900">Student Attendance Settings</h1>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 w-full">
        <div className="max-w-6xl">
          {/* SECTION 1: ATTENDANCE STRATEGY */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              ATTENDANCE STRATEGY
            </h2>

            <div className="p-4 border border-[#1D6BA3]/20 bg-[#F0F7FB] rounded-xl mb-6 flex items-start gap-4 max-w-sm cursor-default">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
                <Smartphone className="w-5 h-5 text-[#1D6BA3]" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#1D6BA3] mb-1">Mobile App Only</h3>
                <p className="text-[12px] text-[#1D6BA3]/80 leading-relaxed font-medium">
                  Attendance Is Exclusively Marked By Facility Via The Mobile App.
                </p>
              </div>
            </div>

            <div className="max-w-sm">
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                Marking Pattern
              </label>
              <select
                value={markingPattern}
                onChange={(e) => setMarkingPattern(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors appearance-none"
              >
                <option value="Hourly Attendance">Hourly Attendance</option>
                <option value="Daily Attendance">Daily Attendance</option>
                <option value="Half-Day Attendance">Half-Day Attendance</option>
              </select>
              <p className="text-[12px] text-gray-400 mt-2">
                Choose how frequently facility should mark attendance during the day
              </p>
            </div>
          </div>

          {/* SECTION 2: INITIAL MARKING & LOCK TIME */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              INITIAL MARKING & LOCK TIME
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Marking Start Time
                </label>
                <input
                  type="time"
                  value={markingStartTime}
                  onChange={(e) => setMarkingStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
                <p className="text-[12px] text-gray-400 mt-2">
                  Facility can begin marking attendance from this time
                </p>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Lock Time (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={lockTimeMinutes}
                  onChange={(e) => setLockTimeMinutes(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
                <p className="text-[12px] text-gray-400 mt-2">
                  Time Window (in mins) After Period start to mark without approval.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: ATTENDANCE EDITS & APPROVALS */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              ATTENDANCE EDITS & APPROVALS
            </h2>

            <div className="space-y-4">
              {/* Box 1: Late Marking */}
              <div className="border border-gray-200 rounded-xl bg-[#F8FAFC]/50 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="p-5">
                  <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2 mb-1">
                    <ListChecks className="w-4 h-4 text-gray-600" />
                    Late Marking Approval (After Lock Time)
                  </h3>
                  <p className="text-[13px] text-gray-500 mb-6 pl-6">
                    Marking Attendance After the Lock Time Automatically Triggers an Approval
                    Request If Enabled.
                  </p>

                  <div className="flex flex-col md:flex-row md:items-end gap-6 pl-6">
                    {/* Toggle pill */}
                    <div className="w-80 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
                      <span className="text-[13px] font-semibold text-gray-700 mr-3">
                        Approval Required For Late Marking
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLateApprovalRequired(!isLateApprovalRequired)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${isLateApprovalRequired ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isLateApprovalRequired ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                    </div>

                    <div className="flex-1 max-w-sm">
                      <label className="block text-[13.5px] font-semibold text-gray-700 mb-2">
                        Late Marking Approval Authority
                      </label>
                      <select
                        value={lateApprovalAuthority}
                        onChange={(e) => setLateApprovalAuthority(e.target.value)}
                        disabled={!isLateApprovalRequired}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors appearance-none disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        <option value="Principal">Principal</option>
                        <option value="Vice Principal">Vice Principal</option>
                        <option value="HOD">HOD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Submit Edit */}
              <div className="border border-gray-200 rounded-xl bg-[#F8FAFC]/50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between flex-wrap gap-4 pl-6">
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900 mb-1">
                      Approval Required To Edit The Marked Attendance
                    </h3>
                    <p className="text-[13px] text-gray-500">
                      Editing the Attendance After submitting the Attendance Triggers an Approval
                      Request If Enabled.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSubmitEditApprovalRequired(!isSubmitEditApprovalRequired)}
                    className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${isSubmitEditApprovalRequired ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isSubmitEditApprovalRequired ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Box 3: Edit Flow */}
              <div className="border border-gray-200 rounded-xl bg-[#F8FAFC]/50 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="p-5">
                  <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2 mb-1">
                    <Edit3 className="w-4 h-4 text-gray-600" />
                    Edit Approval Work Flow
                  </h3>
                  <p className="text-[13px] text-gray-500 mb-6 pl-6">
                    Configure if edits to submitted attendance records require approval
                  </p>

                  <div className="flex flex-col md:flex-row md:items-end gap-6 pl-6">
                    {/* Toggle pill */}
                    <div className="w-80 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
                      <span className="text-[13px] font-semibold text-gray-700">
                        Approval Required For Edits
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditApprovalRequired(!isEditApprovalRequired)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${isEditApprovalRequired ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isEditApprovalRequired ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                    </div>

                    <div className="flex-1 max-w-sm">
                      <label className="block text-[13.5px] font-semibold text-gray-700 mb-2">
                        Edit Approval Authority
                      </label>
                      <select
                        value={editApprovalAuthority}
                        onChange={(e) => setEditApprovalAuthority(e.target.value)}
                        disabled={!isEditApprovalRequired}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors appearance-none disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        <option value="Principal">Principal</option>
                        <option value="Vice Principal">Vice Principal</option>
                        <option value="HOD">HOD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => navigate("/layout/settings")}
              className="px-6 py-2 bg-white border border-gray-200 rounded-[8px] text-[13px] font-semibold text-[#1D6BA3] hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#1D6BA3] rounded-[8px] text-[13px] font-semibold text-white hover:bg-[#1D6BA3]/90 transition-colors shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceSettings;
