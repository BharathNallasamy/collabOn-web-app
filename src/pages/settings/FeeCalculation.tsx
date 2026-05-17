import { useState } from "react";
import { ChevronLeft, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";

import { type Scholarship, type Concession, type FineRule } from "../../types/interfaces";



const FeeCalculation = () => {
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // SCHOLARSHIPS
  const [scholarships, setScholarships] = useState<Scholarship[]>([
    { id: "1", name: "SC/ST", type: "Academic", value: "2000", percentageFixed: "Fixed" },
    { id: "2", name: "7.5 - Govt Quota", type: "Academic", value: "7.5", percentageFixed: "Percentage" }
  ]);

  // CONCESSION/DISCOUNTS
  const [concessions, setConcessions] = useState<Concession[]>([
    { id: "1", componentName: "General Fee Concession", type: "Concession", value: "2000", percentageFixed: "Fixed" },
    { id: "2", componentName: "Management Fee discount", type: "Discount", value: "10000", percentageFixed: "Fixed" }
  ]);

  // FINE PAYMENT RULES
  const [fineRules, setFineRules] = useState<FineRule[]>([
    { id: "1", componentName: "Attendance - 74% to 60%", type: "Fine", amountValue: "500", frequency: "One Time" },
    { id: "2", componentName: "Late Fee Payment", type: "Fine", amountValue: "100", frequency: "Daily" }
  ]);

  const handleSave = () => {
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      navigate('/layout/settings');
    }, 1500);
  };

  /* Helper functions for Lists */
  const addScholarship = () => setScholarships([...scholarships, { id: Date.now().toString(), name: "", type: "", value: "", percentageFixed: "" }]);
  const removeScholarship = (id: string) => setScholarships(scholarships.filter(i => i.id !== id));
  const updateScholarship = (id: string, field: keyof Scholarship, value: string) => {
    setScholarships(scholarships.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const addConcession = () => setConcessions([...concessions, { id: Date.now().toString(), componentName: "", type: "", value: "", percentageFixed: "" }]);
  const removeConcession = (id: string) => setConcessions(concessions.filter(i => i.id !== id));
  const updateConcession = (id: string, field: keyof Concession, value: string) => {
    setConcessions(concessions.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const addFineRule = () => setFineRules([...fineRules, { id: Date.now().toString(), componentName: "", type: "", amountValue: "", frequency: "" }]);
  const removeFineRule = (id: string) => setFineRules(fineRules.filter(i => i.id !== id));
  const updateFineRule = (id: string, field: keyof FineRule, value: string) => {
    setFineRules(fineRules.map(i => i.id === id ? { ...i, [field]: value } : i));
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
          <p className="text-[16px] font-bold text-gray-900">Fee Calculation Rules Saved</p>
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
          <h1 className="text-[16px] font-bold text-gray-900">System Configuration - Finance - Fee Calculation</h1>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 w-full">
        <div className="max-w-6xl">

          {/* SECTION 1: SCHOLARSHIPS */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-2">
              SCHOLARSHIPS
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">Define the individual parts that make up the internal assessment.</p>

            <div className="space-y-4">
              {scholarships.map((comp) => (
                <div key={comp.id} className="border border-gray-200 rounded-xl bg-[#F4F8FA]/50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative group pr-20 transition-all hover:bg-[#F4F8FA]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Scholarship Name</label>
                      <input type="text" value={comp.name} onChange={(e) => updateScholarship(comp.id, 'name', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Scholarship Type</label>
                      <input type="text" value={comp.type} onChange={(e) => updateScholarship(comp.id, 'type', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Value</label>
                      <div className="relative">
                        <input type="text" value={comp.value} onChange={(e) => updateScholarship(comp.id, 'value', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                        <span className="absolute -bottom-5 left-0 text-[10px] text-gray-400 italic">Auto-calculated</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Percentage/Fixed</label>
                      <div className="relative">
                        <input type="text" value={comp.percentageFixed} onChange={(e) => updateScholarship(comp.id, 'percentageFixed', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                        <span className="absolute -bottom-5 left-0 text-[10px] text-gray-400 italic">Auto-calculated</span>
                      </div>
                    </div>
                  </div>
                  {scholarships.length > 1 && (
                    <button onClick={() => removeScholarship(comp.id)} className="absolute right-5 inset-y-0 pb-[18px] my-auto h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-white rounded-lg">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                onClick={addScholarship} 
                className="w-full py-4 border border-dashed border-[#1D6BA3]/40 rounded-xl bg-white text-[#1D6BA3] text-[13px] font-semibold hover:bg-[#F0F7FB] transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" /> Add Component
              </button>
            </div>
          </div>

          {/* SECTION 2: CONCESSION/DISCOUNTS */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-2">
              CONCESSION/DISCOUNTS
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">Define the individual parts that make up the Concession and Discounts in the Fee Structure</p>

            <div className="space-y-4">
              {concessions.map((comp) => (
                <div key={comp.id} className="border border-gray-200 rounded-xl bg-[#F4F8FA]/50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative group pr-20 transition-all hover:bg-[#F4F8FA]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Component Name</label>
                      <input type="text" value={comp.componentName} onChange={(e) => updateConcession(comp.id, 'componentName', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Type / Scholarship Type</label>
                      <input type="text" value={comp.type} onChange={(e) => updateConcession(comp.id, 'type', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Value</label>
                      <div className="relative">
                        <input type="text" value={comp.value} onChange={(e) => updateConcession(comp.id, 'value', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                        <span className="absolute -bottom-5 left-0 text-[10px] text-gray-400 italic">Auto-calculated</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Percentage/Fixed</label>
                      <div className="relative">
                        <input type="text" value={comp.percentageFixed} onChange={(e) => updateConcession(comp.id, 'percentageFixed', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                        <span className="absolute -bottom-5 left-0 text-[10px] text-gray-400 italic">Auto-calculated</span>
                      </div>
                    </div>
                  </div>
                  {concessions.length > 1 && (
                    <button onClick={() => removeConcession(comp.id)} className="absolute right-5 inset-y-0 pb-[18px] my-auto h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-white rounded-lg">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                onClick={addConcession} 
                className="w-full py-4 border border-dashed border-[#1D6BA3]/40 rounded-xl bg-white text-[#1D6BA3] text-[13px] font-semibold hover:bg-[#F0F7FB] transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" /> Add Component
              </button>
            </div>
          </div>

          {/* SECTION 3: FINE PAYMENT RULES */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-2">
              FINE PAYMENT RULES
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">Define the individual parts that make up the internal assessment.</p>

            <div className="space-y-4">
              {fineRules.map((comp) => (
                <div key={comp.id} className="border border-gray-200 rounded-xl bg-[#F4F8FA]/50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative group pr-20 transition-all hover:bg-[#F4F8FA]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Component Name</label>
                      <input type="text" value={comp.componentName} onChange={(e) => updateFineRule(comp.id, 'componentName', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Type</label>
                      <input type="text" value={comp.type} onChange={(e) => updateFineRule(comp.id, 'type', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Amount/Value</label>
                      <div className="relative">
                        <input type="text" value={comp.amountValue} onChange={(e) => updateFineRule(comp.id, 'amountValue', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                        <span className="absolute -bottom-5 left-0 text-[10px] text-gray-400 italic">Auto-calculated</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">Frequency</label>
                      <div className="relative">
                        <input type="text" value={comp.frequency} onChange={(e) => updateFineRule(comp.id, 'frequency', e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors" />
                        <span className="absolute -bottom-5 left-0 text-[10px] text-gray-400 italic">Auto-calculated</span>
                      </div>
                    </div>
                  </div>
                  {fineRules.length > 1 && (
                    <button onClick={() => removeFineRule(comp.id)} className="absolute right-5 inset-y-0 pb-[18px] my-auto h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-white rounded-lg">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                onClick={addFineRule} 
                className="w-full py-4 border border-dashed border-[#1D6BA3]/40 rounded-xl bg-white text-[#1D6BA3] text-[13px] font-semibold hover:bg-[#F0F7FB] transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" /> Add Component
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

export default FeeCalculation;
