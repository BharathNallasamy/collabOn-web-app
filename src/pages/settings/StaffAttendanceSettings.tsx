import { useState } from "react";
import { ChevronLeft, Trash2, Plus, Info, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";

import { type StaffScheduleException } from "../../types/interfaces";

const StaffAttendanceSettings = () => {
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // LATE ATTENDANCE & APPROVALS
  const [isLateApprovalEnabled, setIsLateApprovalEnabled] = useState(false);
  const [approvalAuthority, setApprovalAuthority] = useState("Principal");
  const [lateEntryThreshold, setLateEntryThreshold] = useState("30");

  // STAFF SCHEDULE EXCEPTIONS
  const [scheduleExceptions, setScheduleExceptions] = useState<StaffScheduleException[]>([
    { id: "1", fromDate: "", toDate: "", type: "Holiday", applicableTo: "Teaching Staff" },
    { id: "2", fromDate: "", toDate: "", type: "Working day", applicableTo: "Non-Teaching Staff" },
    { id: "3", fromDate: "", toDate: "", type: "Working day", applicableTo: "Both" }
  ]);

  // EMPLOYEE ID FORMAT
  const [idPattern, setIdPattern] = useState("{Prefix} - {Department} - {SEQ}");
  const [prefixCode, setPrefixCode] = useState("EMP");
  const [sequenceLength, setSequenceLength] = useState("5");
  const [startingNumber, setStartingNumber] = useState("101");

  const handleSave = () => {
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      navigate('/layout/settings');
    }, 1500);
  };

  /* Schedule Exceptions Logic */
  const addException = () => setScheduleExceptions([...scheduleExceptions, { id: Date.now().toString(), fromDate: "", toDate: "", type: "", applicableTo: "" }]);
  const removeException = (id: string) => setScheduleExceptions(scheduleExceptions.filter(i => i.id !== id));
  const updateException = (id: string, field: keyof StaffScheduleException, value: string) => {
    setScheduleExceptions(scheduleExceptions.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  /* Preview Logic */
  const generatePreviewId = () => {
    const padLength = parseInt(sequenceLength, 10) || 1;
    let paddedNum = startingNumber;
    if (paddedNum.length < padLength && !isNaN(parseInt(paddedNum))) {
      paddedNum = paddedNum.padStart(padLength, '0');
    }
    const prefix = prefixCode || "{Prefix}";
    return `${prefix} - CSE - ${paddedNum}`;
  };

  return (
    <div className="w-full h-full bg-white flex flex-col min-h-screen">
      {/* Success Modal */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Success" size="md">
        <div className="py-20 flex flex-col items-center text-center px-6">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[16px] font-bold text-gray-900">Staff Attendance Settings Saved Successfully</p>
        </div>
      </Modal>

      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/layout/settings')}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-[16px] font-bold text-gray-900">Staff Attendance Settings</h1>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 w-full">
        <div className="max-w-6xl">

          {/* SECTION 1: LATE ATTENDANCE & APPROVALS */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              LATE ATTENDANCE & APPROVALS
            </h2>

            <div className="p-5 border border-gray-200 bg-gray-50/50 rounded-xl mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-gray-900 mb-1">Late Attendance Approval Flow</h3>
                <p className="text-[13px] text-gray-500">Required Administrative approval if staff check-in After the grace time</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsLateApprovalEnabled(!isLateApprovalEnabled)} 
                className={`w-10 h-5 rounded-full relative transition-colors ${isLateApprovalEnabled ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isLateApprovalEnabled ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Approval Person</label>
                <select 
                  value={approvalAuthority} 
                  onChange={(e) => setApprovalAuthority(e.target.value)} 
                  disabled={!isLateApprovalEnabled}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors appearance-none disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="Principal">Principal</option>
                  <option value="Vice Principal">Vice Principal</option>
                  <option value="HOD">HOD</option>
                </select>
                <p className="text-[12px] text-gray-400 mt-2">The Designated Authority To Approve Late Attendance Requests.</p>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Late Entry Threshold (Min)</label>
                <input 
                  type="number" 
                  value={lateEntryThreshold} 
                  onChange={(e) => setLateEntryThreshold(e.target.value)} 
                  disabled={!isLateApprovalEnabled}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                />
                <p className="text-[12px] text-gray-400 mt-2">Time After Grace Period When Approvals Becomes Mandatory</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#F0F7FB] border border-[#1D6BA3]/20 rounded-lg">
              <Info className="w-5 h-5 text-[#1D6BA3] mt-0.5 flex-shrink-0" />
              <p className="text-[13px] text-[#1D6BA3] font-medium leading-relaxed">
                Request Will Be Automatically Routed To The Selected Approval Persons Dashboard.
              </p>
            </div>
          </div>

          {/* SECTION 2: STAFF SCHEDULE EXCEPTIONS */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-2">
              STAFF SCHEDULE EXCEPTIONS (SUDDEN HOLIDAYS/WORKING DAYS)
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">Create temporary override for specific dates (e.g., Sudden Holidays Or exact Working Days)</p>

            <div className="space-y-4">
              {scheduleExceptions.map((exc) => (
                <div key={exc.id} className="border border-gray-200 rounded-xl bg-[#F4F8FA]/50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative group pr-20 transition-all hover:bg-[#F4F8FA]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">From Date</label>
                      <input type="date" value={exc.fromDate} onChange={(e) => updateException(exc.id, 'fromDate', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">To Date</label>
                      <input type="date" value={exc.toDate} onChange={(e) => updateException(exc.id, 'toDate', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Type</label>
                      <input type="text" value={exc.type} onChange={(e) => updateException(exc.id, 'type', e.target.value)} placeholder="Holiday / Working Day" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Applicable To</label>
                      <select value={exc.applicableTo} onChange={(e) => updateException(exc.id, 'applicableTo', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors appearance-none">
                        <option value="">Select Option</option>
                        <option value="Teaching Staff">Teaching Staff</option>
                        <option value="Non-Teaching Staff">Non-Teaching Staff</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                  </div>
                  {scheduleExceptions.length > 1 && (
                    <button onClick={() => removeException(exc.id)} className="absolute right-5 inset-y-0 pb-0 my-auto h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-white rounded-lg">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                onClick={addException} 
                className="w-full py-4 border border-dashed border-[#1D6BA3]/40 rounded-xl bg-white text-[#1D6BA3] text-[13px] font-semibold hover:bg-[#F0F7FB] transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" /> Add Schedule Exception
              </button>
            </div>
          </div>

          {/* SECTION 3: EMPLOYEE ID FORMAT */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-2">
              EMPLOYEE ID FORMAT
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">Configure the format for generating unique employee ID for staff members</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">ID Pattern</label>
                <input 
                  type="text" 
                  value={idPattern} 
                  onChange={(e) => setIdPattern(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Prefix Code</label>
                <input 
                  type="text" 
                  value={prefixCode} 
                  onChange={(e) => setPrefixCode(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Sequence Length</label>
                <input 
                  type="number" 
                  min="1"
                  value={sequenceLength} 
                  onChange={(e) => setSequenceLength(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
                <p className="text-[12px] text-gray-400 mt-2">Number of digits for the sequence (eg. 5 for 00001)</p>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Starting Number</label>
                <input 
                  type="number" 
                  min="1"
                  value={startingNumber} 
                  onChange={(e) => setStartingNumber(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 p-6 bg-[#FFF9E6] rounded-xl flex items-center gap-6 border border-[#FFDC73]/30">
              <div className="w-12 h-12 bg-[#FFE699] rounded-lg flex items-center justify-center text-[#B27B00]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[12px] text-[#B27B00] font-bold mb-1 uppercase tracking-wider">Generated ID Preview</p>
                <p className="text-[24px] font-black text-[#D99600] tracking-wide font-mono">
                  {generatePreviewId()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button 
              onClick={() => navigate('/layout/settings')}
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

export default StaffAttendanceSettings;
