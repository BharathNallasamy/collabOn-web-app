import { useState } from "react";
import { ChevronLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";

const AdmissionRollNumberSequence = () => {
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // ADMISSION NUMBER FORMAT
  const [admPrefix, setAdmPrefix] = useState("ADM");
  const [admRunningNum, setAdmRunningNum] = useState("0001");
  const [admIncludeYear, setAdmIncludeYear] = useState(false);

  // ROLL NUMBER FORMAT
  const [rollDeptCode, setRollDeptCode] = useState("CSE");
  const [rollBatchYear, setRollBatchYear] = useState("2026");
  const [rollRunningNum, setRollRunningNum] = useState("001");

  // TEACHING STAFF SCHEDULE (Reset logic per mockup)
  const [resetEveryYear, setResetEveryYear] = useState(false);
  const [resetPerDept, setResetPerDept] = useState(false);

  // STUDENT ID FORMAT
  const [stuIdPattern, setStuIdPattern] = useState("{Prefix} - {Year} - {Department} - {SEQ}");
  const [stuPrefix, setStuPrefix] = useState("STU");
  const [stuSeqLength, setStuSeqLength] = useState("4");
  const [stuStartNum, setStuStartNum] = useState("1");

  const handleSave = () => {
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      navigate('/layout/settings');
    }, 1500);
  };

  /* Preview Generators */
  const getAdmPreview = () => {
    const prefix = admPrefix || "";
    const paddingStr = prefix ? " - " : "";
    const yearSnippet = admIncludeYear ? `${paddingStr}${new Date().getFullYear()}` : "";
    const numPadding = prefix || admIncludeYear ? " - " : "";
    return `Preview: ${prefix}${yearSnippet}${numPadding}${admRunningNum || "0001"}`;
  };

  const getRollPreview = () => {
    const dept = rollDeptCode || "CSE";
    const year = rollBatchYear || "2026";
    const code = rollRunningNum || "001";
    return `Preview: ${dept} - ${year} - ${code}`;
  };

  const generateStudentIdPreview = () => {
    const padLength = parseInt(stuSeqLength, 10) || 1;
    let paddedNum = stuStartNum;
    if (paddedNum.length < padLength && !isNaN(parseInt(paddedNum))) {
      paddedNum = paddedNum.padStart(padLength, '0');
    }
    const prefix = stuPrefix || "{Prefix}";
    return `${prefix} - 2026 - CSE - ${paddedNum}`;
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
          <p className="text-[16px] font-bold text-gray-900">Admission & Roll Number Settings Saved Successfully</p>
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
          <h1 className="text-[16px] font-bold text-gray-900">Admission & Roll Number Sequence</h1>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 w-full">
        <div className="max-w-6xl">

          {/* SECTION 1: ADMISSION NUMBER FORMAT */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              ADMISSION NUMBER FORMAT
            </h2>

            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
              <div className="flex-1 max-w-sm">
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Prefix</label>
                <input 
                  type="text" 
                  value={admPrefix} 
                  onChange={(e) => setAdmPrefix(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
              <div className="flex-1 max-w-sm">
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Running Number</label>
                <input 
                  type="text" 
                  value={admRunningNum} 
                  onChange={(e) => setAdmRunningNum(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
              <div className="w-56 flex items-center justify-between bg-gray-50/50 border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
                <span className="text-[13px] font-semibold text-gray-700 mr-3">
                  Include Year
                </span>
                <button 
                  type="button" 
                  onClick={() => setAdmIncludeYear(!admIncludeYear)} 
                  className={`w-10 h-5 rounded-full relative transition-colors ${admIncludeYear ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${admIncludeYear ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
            <p className="text-[13px] text-gray-500 font-medium">{getAdmPreview()}</p>
          </div>

          {/* SECTION 2: ROLL NUMBER FORMAT */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              ROLL NUMBER FORMAT
            </h2>

            <div className="flex flex-col md:flex-row gap-6 mb-4">
              <div className="flex-1 max-w-sm">
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Department Code</label>
                <input 
                  type="text" 
                  value={rollDeptCode} 
                  onChange={(e) => setRollDeptCode(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
              <div className="flex-1 max-w-sm">
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Batch Year</label>
                <input 
                  type="text" 
                  value={rollBatchYear} 
                  onChange={(e) => setRollBatchYear(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
              <div className="flex-1 max-w-sm">
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Running Number</label>
                <input 
                  type="text" 
                  value={rollRunningNum} 
                  onChange={(e) => setRollRunningNum(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
            </div>
            <p className="text-[13px] text-gray-500 font-medium">{getRollPreview()}</p>
          </div>

          {/* SECTION 3: TEACHING STAFF SCHEDULE (Reset logic) */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              TEACHING STAFF SCHEDULE
            </h2>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 max-w-md flex items-center justify-between bg-gray-50/50 border border-gray-200 rounded-lg px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="text-[13px] font-semibold text-gray-700">
                  Reset Every Academic Year
                </span>
                <button 
                  type="button" 
                  onClick={() => setResetEveryYear(!resetEveryYear)} 
                  className={`w-10 h-5 rounded-full relative transition-colors ${resetEveryYear ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${resetEveryYear ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="flex-1 max-w-md flex items-center justify-between bg-gray-50/50 border border-gray-200 rounded-lg px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="text-[13px] font-semibold text-gray-700">
                  Reset Per Department
                </span>
                <button 
                  type="button" 
                  onClick={() => setResetPerDept(!resetPerDept)} 
                  className={`w-10 h-5 rounded-full relative transition-colors ${resetPerDept ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${resetPerDept ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4: STUDENT ID FORMAT */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-2">
              STUDENT ID FORMAT
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">Define The Pattern for generating unique student ID across the institution</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">ID Pattern</label>
                <input 
                  type="text" 
                  value={stuIdPattern} 
                  onChange={(e) => setStuIdPattern(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors font-mono line-clamp-1"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Prefix Code</label>
                <input 
                  type="text" 
                  value={stuPrefix} 
                  onChange={(e) => setStuPrefix(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Sequence Length</label>
                <input 
                  type="number" 
                  min="1"
                  value={stuSeqLength} 
                  onChange={(e) => setStuSeqLength(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
                <p className="text-[12px] text-gray-400 mt-2">Number of digits for the sequence (eg. 4 for 00001)</p>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Starting Number</label>
                <input 
                  type="number" 
                  min="1"
                  value={stuStartNum} 
                  onChange={(e) => setStuStartNum(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 p-6 bg-[#FFF4ED] rounded-xl flex items-center gap-6 border border-[#FFD9C2]/30">
              <div className="w-12 h-12 bg-[#FFD1B3] rounded-lg flex items-center justify-center text-[#CC5A14]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[12px] text-[#CC5A14] font-bold mb-1 uppercase tracking-wider">Generated ID Preview</p>
                <p className="text-[24px] font-black text-[#E66A1A] tracking-wide font-mono">
                  {generateStudentIdPreview()}
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

export default AdmissionRollNumberSequence;
