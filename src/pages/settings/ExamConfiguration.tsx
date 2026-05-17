import { useState } from "react";
import { ChevronLeft, Trash2, Plus, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";

import { type ExamType, type ExamSession, type AssessmentComponent, type ExamScheduleOverride } from "../../types/interfaces";




const ExamConfiguration = () => {
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // MANAGE EXAM TYPES
  const [examTypes, setExamTypes] = useState<ExamType[]>([
    { id: "1", name: "Internal Assessment", durationMin: "90", minGapDays: "1", maxMarks: "50", passMarks: "20" },
    { id: "2", name: "Internal Assessment", durationMin: "90", minGapDays: "1", maxMarks: "50", passMarks: "20" },
    { id: "3", name: "Internal Assessment", durationMin: "90", minGapDays: "1", maxMarks: "40", passMarks: "20" }
  ]);

  // MANAGE EXAM SESSIONS
  const [examSessions, setExamSessions] = useState<ExamSession[]>([
    { id: "1", sessionName: "Morning", startTime: "09:30", endTime: "12:30" },
    { id: "2", sessionName: "Afternoon", startTime: "01:00", endTime: "04:00" },
    { id: "3", sessionName: "Evening", startTime: "04:30", endTime: "06:30" }
  ]);

  // INTERNAL ASSESSMENT CONFIGURATION
  const [enableWeightage, setEnableWeightage] = useState(false);
  const [aggregationMethod, setAggregationMethod] = useState("Sum");
  const [assessmentComponents, setAssessmentComponents] = useState<AssessmentComponent[]>([
    { id: "1", componentName: "Internal Assessment 1", maxMarks: "5" },
    { id: "2", componentName: "Internal Assessment 2", maxMarks: "5" },
    { id: "3", componentName: "Attendance", maxMarks: "5" },
    { id: "4", componentName: "Projects", maxMarks: "5" }
  ]);

  // EXAM SCHEDULE OVERRIDES
  const [scheduleOverrides, setScheduleOverrides] = useState<ExamScheduleOverride[]>([
    { id: "1", examType: "Internal Assessment", classYear: "CSE - 2nd Year", session: "Morning", examTiming: "09:30 - 12:30" }
  ]);

  const handleSave = () => {
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      navigate('/layout/settings');
    }, 1500);
  };

  /* Helper functions for Lists */
  const addExamType = () => setExamTypes([...examTypes, { id: Date.now().toString(), name: "", durationMin: "", minGapDays: "", maxMarks: "", passMarks: "" }]);
  const removeExamType = (id: string) => setExamTypes(examTypes.filter(i => i.id !== id));
  const updateExamType = (id: string, field: keyof ExamType, value: string) => {
    setExamTypes(examTypes.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const addSession = () => setExamSessions([...examSessions, { id: Date.now().toString(), sessionName: "", startTime: "", endTime: "" }]);
  const removeSession = (id: string) => setExamSessions(examSessions.filter(i => i.id !== id));
  const updateSession = (id: string, field: keyof ExamSession, value: string) => {
    setExamSessions(examSessions.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const addComponent = () => setAssessmentComponents([...assessmentComponents, { id: Date.now().toString(), componentName: "", maxMarks: "" }]);
  const removeComponent = (id: string) => setAssessmentComponents(assessmentComponents.filter(i => i.id !== id));
  const updateComponent = (id: string, field: keyof AssessmentComponent, value: string) => {
    setAssessmentComponents(assessmentComponents.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const addOverride = () => setScheduleOverrides([...scheduleOverrides, { id: Date.now().toString(), examType: "", classYear: "", session: "", examTiming: "" }]);
  const removeOverride = (id: string) => setScheduleOverrides(scheduleOverrides.filter(i => i.id !== id));
  const updateOverride = (id: string, field: keyof ExamScheduleOverride, value: string) => {
    setScheduleOverrides(scheduleOverrides.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // Calculations
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return "Total Duration: 0h";
    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const sMin = parseTime(start);
    let eMin = parseTime(end);
    // basic fix for 12hr wrap pm (if end time is earlier than start time, assume 12 hrs added e.g. 1:00 PM)
    if (eMin < sMin) eMin += 12 * 60;
    
    const diff = eMin - sMin;
    if (diff <= 0) return "Total Duration: 0h";
    
    const hrs = diff / 60;
    return `Total Duration: ${Math.round(hrs * 10) / 10}h`;
  };

  const totalMaxMarks = assessmentComponents.reduce((sum, comp) => sum + (parseFloat(comp.maxMarks) || 0), 0);
  
  const calculateWeightage = (marks: string) => {
    const num = parseFloat(marks) || 0;
    if (totalMaxMarks === 0) return "0.0%";
    return `${((num / totalMaxMarks) * 100).toFixed(1)}%`;
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
          <p className="text-[16px] font-bold text-gray-900">Exam Configuration Saved Successfully</p>
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
          <h1 className="text-[16px] font-bold text-gray-900">System Configuration - Academic - Exam Configuration</h1>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 w-full">
        <div className="max-w-6xl">

          {/* SECTION 1: MANAGE EXAM TYPES */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-2">
              MANAGE EXAM TYPES
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">Define different types of examinations and their default settings.</p>

            <div className="space-y-4">
              {examTypes.map((exam) => (
                <div key={exam.id} className="border border-gray-200 rounded-xl bg-[#F4F8FA]/50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative group pr-16 transition-all hover:bg-[#F4F8FA]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-1">
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Exam Type Name</label>
                      <input type="text" value={exam.name} onChange={(e) => updateExamType(exam.id, 'name', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Default Duration (min)</label>
                      <input type="text" value={exam.durationMin} onChange={(e) => updateExamType(exam.id, 'durationMin', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Min Gap (days)</label>
                      <input type="text" value={exam.minGapDays} onChange={(e) => updateExamType(exam.id, 'minGapDays', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Maximum Marks</label>
                      <input type="text" value={exam.maxMarks} onChange={(e) => updateExamType(exam.id, 'maxMarks', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Passing Marks</label>
                      <input type="text" value={exam.passMarks} onChange={(e) => updateExamType(exam.id, 'passMarks', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                  </div>
                  {examTypes.length > 1 && (
                    <button onClick={() => removeExamType(exam.id)} className="absolute right-5 bottom-8 text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-white rounded-lg">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                onClick={addExamType} 
                className="w-full py-4 border border-dashed border-[#1D6BA3]/40 rounded-xl bg-white text-[#1D6BA3] text-[13px] font-semibold hover:bg-[#F0F7FB] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Exam Type
              </button>
            </div>
          </div>

          {/* SECTION 2: MANAGE EXAM SESSIONS */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-2">
              MANAGE EXAM SESSIONS
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">Define standard time slots for examinations.</p>

            <div className="space-y-4">
              {examSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-xl bg-[#F4F8FA]/50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative group pr-20 transition-all hover:bg-[#F4F8FA]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Session Name</label>
                      <input type="text" value={session.sessionName} onChange={(e) => updateSession(session.id, 'sessionName', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Start Time</label>
                      <input type="time" value={session.startTime} onChange={(e) => updateSession(session.id, 'startTime', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">End Time</label>
                      <div className="relative">
                        <input type="time" value={session.endTime} onChange={(e) => updateSession(session.id, 'endTime', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                        <span className="absolute -bottom-5 left-0 text-[10px] text-gray-400">
                          {calculateDuration(session.startTime, session.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {examSessions.length > 1 && (
                    <button onClick={() => removeSession(session.id)} className="absolute right-5 inset-y-0 pb-[23px] my-auto h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-white rounded-lg">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                onClick={addSession} 
                className="w-full py-4 border border-dashed border-[#1D6BA3]/40 rounded-xl bg-white text-[#1D6BA3] text-[13px] font-semibold hover:bg-[#F0F7FB] transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" /> Add New Session
              </button>
            </div>
          </div>

          {/* SECTION 3: INTERNAL ASSESSMENT CONFIGURATION */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              INTERNAL ASSESSMENT CONFIGURATION
            </h2>

            <div className="p-5 border border-gray-200 bg-gray-50/50 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-5">
                 <div className="flex items-center gap-3">
                   <Calculator className="w-5 h-5 text-[#1D6BA3]" />
                   <h3 className="text-[14px] font-bold text-gray-900">Final Internal Calculation Rule</h3>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-[13px] font-semibold text-gray-700">Enable Weightage</span>
                   <button type="button" onClick={() => setEnableWeightage(!enableWeightage)} className={`w-10 h-5 rounded-full relative transition-colors ${enableWeightage ? "bg-[#1D6BA3]" : "bg-gray-300"}`}>
                     <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enableWeightage ? "translate-x-5" : "translate-x-0"}`} />
                   </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Aggregation Method</label>
                  <select value={aggregationMethod} onChange={(e) => setAggregationMethod(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors appearance-none">
                    <option value="Sum">Sum</option>
                    <option value="Average">Average</option>
                    <option value="Max">Max</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2 invisible">Description</label>
                  <div className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-lg text-[13px] text-gray-600">
                    Total internal marks will be the sum of all components.
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-[14px] font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Assessment Components
            </h3>
            <p className="text-[13px] text-gray-500 mb-5">Define the individual parts that make up the internal assessment.</p>

            <div className="space-y-4">
              {assessmentComponents.map((comp) => (
                <div key={comp.id} className="border border-gray-200 rounded-xl bg-[#F4F8FA]/50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative group pr-20 transition-all hover:bg-[#F4F8FA]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Component Name</label>
                      <input type="text" value={comp.componentName} onChange={(e) => updateComponent(comp.id, 'componentName', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Maximum Marks</label>
                      <input type="number" min="0" value={comp.maxMarks} onChange={(e) => updateComponent(comp.id, 'maxMarks', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors font-mono" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Weightage</label>
                      <div className="relative">
                        <input type="text" readOnly value={calculateWeightage(comp.maxMarks)} className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none transition-colors" />
                        <span className="absolute -bottom-5 left-0 text-[10px] text-gray-400 italic">
                          Auto-calculated
                        </span>
                      </div>
                    </div>
                  </div>
                  {assessmentComponents.length > 1 && (
                    <button onClick={() => removeComponent(comp.id)} className="absolute right-5 inset-y-0 pb-[23px] my-auto h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-white rounded-lg">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}

              <div className="py-4 flex justify-between items-center border-t border-b border-gray-200 px-6 bg-gray-50/30">
                <span className="text-[13px] font-bold text-gray-900">Configuration Summary</span>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">TOTAL MAX MARKS</span>
                  <span className="text-[18px] font-bold text-gray-900">{totalMaxMarks}</span>
                </div>
              </div>
              
              <button 
                onClick={addComponent} 
                className="w-full py-4 border border-dashed border-[#1D6BA3]/40 rounded-xl bg-white text-[#1D6BA3] text-[13px] font-semibold hover:bg-[#F0F7FB] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Component
              </button>
            </div>
          </div>

          {/* SECTION 4: EXAM SCHEDULE OVERRIDES */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              EXAM SCHEDULE OVERRIDES
            </h2>

            <div className="space-y-4">
              {scheduleOverrides.map((override) => (
                <div key={override.id} className="border border-gray-200 rounded-xl bg-[#F4F8FA]/50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative group pr-20 transition-all hover:bg-[#F4F8FA]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Exam Type</label>
                      <input type="text" value={override.examType} onChange={(e) => updateOverride(override.id, 'examType', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Class/Year</label>
                      <input type="text" value={override.classYear} onChange={(e) => updateOverride(override.id, 'classYear', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Session</label>
                      <input type="text" value={override.session} onChange={(e) => updateOverride(override.id, 'session', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Exam Timing</label>
                      <input type="text" value={override.examTiming} onChange={(e) => updateOverride(override.id, 'examTiming', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                  </div>
                  {scheduleOverrides.length > 1 && (
                    <button onClick={() => removeOverride(override.id)} className="absolute right-5 inset-y-0 pb-0 my-auto h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-white rounded-lg">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                onClick={addOverride} 
                className="w-full py-4 border border-dashed border-[#1D6BA3]/40 rounded-xl bg-white text-[#1D6BA3] text-[13px] font-semibold hover:bg-[#F0F7FB] transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" /> Add Exam Schedule
              </button>
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

export default ExamConfiguration;
