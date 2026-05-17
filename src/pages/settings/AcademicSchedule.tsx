import React, { useState } from "react";
import { ChevronLeft, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";

type TabOption = "Daily Schedule" | "Academic System" | "Break Management" | "Schedule Overrides" | "Class/Year";

import { type Break, type AcademicScheduleOverride, type ClassOverride } from "../../types/interfaces";



const AcademicSchedule = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabOption>("Daily Schedule");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    days: [] as string[],
    institutionOpeningTime: "",
    institutionClosingTime: "",
    numberPeriodPerDay: "",
    numberTermsSemesterDaily: "",
    academicSystem: "",
    numberTermsSemesterAcademic: "",
    holidayOverride: false,
    halfDayToggle: false,
  });

  const [breaks, setBreaks] = useState<Break[]>([
    { id: "1", name: "", startTime: "", endTime: "" }
  ]);
  
  const [scheduleOverrides, setScheduleOverrides] = useState<AcademicScheduleOverride[]>([
    { id: "1", fromDate: "", toDate: "", type: "", timeTableOrder: "", reason: "" }
  ]);

  const [classOverrides, setClassOverrides] = useState<ClassOverride[]>([
    { id: "1", classYear: "", closeTime: "", breakTime: "" }
  ]);

  const TABS: TabOption[] = ["Daily Schedule", "Academic System", "Break Management", "Schedule Overrides", "Class/Year"];
  const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggle = (name: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSave = () => {
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      navigate('/layout/settings');
    }, 1500);
  };

  /* List Helpers */
  const addBreak = () => setBreaks([...breaks, { id: Date.now().toString(), name: "", startTime: "", endTime: "" }]);
  const removeBreak = (id: string) => setBreaks(breaks.filter(b => b.id !== id));
  const updateBreak = (id: string, field: keyof Break, value: string) => {
    setBreaks(breaks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const addScheduleOverride = () => setScheduleOverrides([...scheduleOverrides, { id: Date.now().toString(), fromDate: "", toDate: "", type: "", timeTableOrder: "", reason: "" }]);
  const removeScheduleOverride = (id: string) => setScheduleOverrides(scheduleOverrides.filter(s => s.id !== id));
  const updateScheduleOverride = (id: string, field: keyof AcademicScheduleOverride, value: string) => {
    setScheduleOverrides(scheduleOverrides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addClassOverride = () => setClassOverrides([...classOverrides, { id: Date.now().toString(), classYear: "", closeTime: "", breakTime: "" }]);
  const removeClassOverride = (id: string) => setClassOverrides(classOverrides.filter(c => c.id !== id));
  const updateClassOverride = (id: string, field: keyof ClassOverride, value: string) => {
    setClassOverrides(classOverrides.map(c => c.id === id ? { ...c, [field]: value } : c));
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
          <p className="text-[16px] font-bold text-gray-900">Academic Schedule Saved</p>
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
          <h1 className="text-[16px] font-bold text-gray-900">System Configuration - Academic</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-8 border-b border-gray-100 bg-white pt-2 sticky top-[73px] z-10 w-full">
        <div className="flex items-center gap-10">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-[3px] text-[13px] transition-colors ${
                activeTab === tab 
                  ? "border-[#1D6BA3] text-[#1D6BA3] font-bold" 
                  : "border-transparent text-gray-500 hover:text-gray-900 font-medium"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 w-full">
        <div className="max-w-6xl">
          
          {/* TAB 1: Daily Schedule */}
          {activeTab === "Daily Schedule" && (
            <div>
              <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
                ACADEMIC SCHEDULE CONFIGURATION
              </h2>
              <div className="mb-6">
                <label className="block text-[13px] font-semibold text-gray-700 mb-3">Daily Schedule</label>
                <div className="flex items-center gap-6 flex-wrap">
                  {WEEKDAYS.map(day => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${formData.days.includes(day) ? 'bg-[#1D6BA3] border-[#1D6BA3]' : 'bg-white border-gray-300'}`}>
                        {formData.days.includes(day) && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 14 14" fill="none"><path d="M1 7L5 11L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.days.includes(day)} onChange={() => handleDayToggle(day)} />
                      <span className="text-[13px] text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Institution Opening Time</label>
                  <input type="time" name="institutionOpeningTime" value={formData.institutionOpeningTime} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Institution Closing Time</label>
                  <input type="time" name="institutionClosingTime" value={formData.institutionClosingTime} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Number of Period Per Day</label>
                  <input type="text" placeholder="Enter" name="numberPeriodPerDay" value={formData.numberPeriodPerDay} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Number of Terms/Semester</label>
                  <input type="text" placeholder="Enter" name="numberTermsSemesterDaily" value={formData.numberTermsSemesterDaily} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Academic System */}
          {activeTab === "Academic System" && (
            <div>
              <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
                ACADEMIC SYSTEM
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Academic System</label>
                  <input type="text" placeholder="Enter" name="academicSystem" value={formData.academicSystem} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Number of Terms/Semesters</label>
                  <input type="text" placeholder="Enter" name="numberTermsSemesterAcademic" value={formData.numberTermsSemesterAcademic} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Break Management */}
          {activeTab === "Break Management" && (
            <div className="space-y-6">
              {breaks.map((brk, index) => (
                <div key={brk.id} className="border border-gray-200 rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative">
                  <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[12px] font-bold text-gray-600">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <h3 className="text-[14px] font-bold text-gray-900">Break Management</h3>
                    </div>
                    {breaks.length > 1 && (
                      <button onClick={() => removeBreak(brk.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Break Name</label>
                      <input type="time" value={brk.name} onChange={(e) => updateBreak(brk.id, 'name', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                      {/* Using time type as in mockup despite the label, since mockups sometimes use dummy data. Will leave standard input if preferred. Wait, mockup shows time input for Break Name in the expanded screenshot! That's odd. Will use text so user can enter something like 'Lunch'. Actually I'll use text, wait, mockup sets 00:00 for break name. I'll use text. */}
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Start Time</label>
                      <input type="time" value={brk.startTime} onChange={(e) => updateBreak(brk.id, 'startTime', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">End Time</label>
                      <input type="time" value={brk.endTime} onChange={(e) => updateBreak(brk.id, 'endTime', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={addBreak} 
                className="w-full py-3.5 border border-dashed border-[#1D6BA3]/40 rounded-xl bg-[#F0F7FB]/50 text-[#1D6BA3] text-[13px] font-semibold hover:bg-[#F0F7FB] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Break
              </button>
            </div>
          )}

          {/* TAB 4: Schedule Overrides */}
          {activeTab === "Schedule Overrides" && (
            <div>
              <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
                SCHEDULE OVERRIDES (HOLIDAYS/SUDDEN CHANGES)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="flex flex-col">
                   <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 h-[50px] bg-gray-50/50">
                     <span className="text-[13px] font-semibold text-gray-700">Holiday Override</span>
                     <button type="button" onClick={() => handleToggle('holidayOverride')} className={`w-10 h-5 rounded-full relative transition-colors ${formData.holidayOverride ? "bg-[#1D6BA3]" : "bg-gray-300"}`}>
                       <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.holidayOverride ? "translate-x-5" : "translate-x-0"}`} />
                     </button>
                   </div>
                </div>

                <div className="flex flex-col">
                   <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 h-[50px] bg-gray-50/50">
                     <span className="text-[13px] font-semibold text-gray-700">Half Day Toggle</span>
                     <button type="button" onClick={() => handleToggle('halfDayToggle')} className={`w-10 h-5 rounded-full relative transition-colors ${formData.halfDayToggle ? "bg-[#1D6BA3]" : "bg-gray-300"}`}>
                       <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.halfDayToggle ? "translate-x-5" : "translate-x-0"}`} />
                     </button>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                {scheduleOverrides.map((override, index) => (
                  <div key={override.id} className="border border-gray-200 rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative">
                    <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[12px] font-bold text-gray-600">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <h3 className="text-[14px] font-bold text-gray-900">Schedule Override</h3>
                      </div>
                      {scheduleOverrides.length > 1 && (
                        <button onClick={() => removeScheduleOverride(override.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-2">From Date</label>
                        <input type="date" value={override.fromDate} onChange={(e) => updateScheduleOverride(override.id, 'fromDate', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-2">To Date</label>
                        <input type="date" value={override.toDate} onChange={(e) => updateScheduleOverride(override.id, 'toDate', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-2">Type</label>
                        <select value={override.type} onChange={(e) => updateScheduleOverride(override.id, 'type', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors appearance-none">
                          <option value="">Select Type</option>
                          <option value="Holiday">Holiday</option>
                          <option value="Full Working Day">Full Working Day</option>
                          <option value="Half Day">Half Day</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-2">Time table/day order to follow</label>
                        <select value={override.timeTableOrder} onChange={(e) => updateScheduleOverride(override.id, 'timeTableOrder', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors appearance-none">
                          <option value="">None</option>
                          <option value="Monday Order">Monday Order</option>
                          <option value="Tuesday Order">Tuesday Order</option>
                        </select>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-[13px] font-semibold text-gray-700 mb-2">Reason/Description</label>
                        <input type="text" placeholder="Enter reason" value={override.reason} onChange={(e) => updateScheduleOverride(override.id, 'reason', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={addScheduleOverride} 
                  className="w-full py-3.5 border border-dashed border-[#1D6BA3]/40 rounded-xl bg-[#F0F7FB]/50 text-[#1D6BA3] text-[13px] font-semibold hover:bg-[#F0F7FB] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Schedule Override
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Class/Year Wise Overrides */}
          {activeTab === "Class/Year" && (
            <div>
              <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
                CLASS/YEAR WISE OVERRIDES
              </h2>

              <div className="space-y-6">
                {classOverrides.map((override, index) => (
                  <div key={override.id} className="border border-gray-200 rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative">
                    <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[12px] font-bold text-gray-600">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <h3 className="text-[14px] font-bold text-gray-900">Class/Year Wise Override</h3>
                      </div>
                      {classOverrides.length > 1 && (
                        <button onClick={() => removeClassOverride(override.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-2">Class/Year</label>
                        <input type="text" placeholder="Enter" value={override.classYear} onChange={(e) => updateClassOverride(override.id, 'classYear', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-2">Override Close Time</label>
                        <input type="time" value={override.closeTime} onChange={(e) => updateClassOverride(override.id, 'closeTime', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-2">Override Break Time</label>
                        <input type="text" placeholder="Enter" value={override.breakTime} onChange={(e) => updateClassOverride(override.id, 'breakTime', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={addClassOverride} 
                  className="w-full py-3.5 border border-dashed border-[#1D6BA3]/40 rounded-xl bg-[#F0F7FB]/50 text-[#1D6BA3] text-[13px] font-semibold hover:bg-[#F0F7FB] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Class Override
                </button>
              </div>
            </div>
          )}
          
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

export default AcademicSchedule;
