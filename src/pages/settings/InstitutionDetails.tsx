import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";

const InstitutionDetails = () => {
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: "Rajiv Gandhi College of Engineering",
    shortName: "RGEC",
    institutionCode: "LC1291",
    institutionType: "University",
    boardAffiliation: "Affiliated",
    establishedYear: "1920",
    institutionWeb: "www.rgec.edu.in",
    naacGrade: "A++",
    nbaAccreditation: false,
    nirfParticipate: false,
    addressLine1: "1",
    addressLine2: "Nemili",
    city: "Sriperambadur",
    district: "Chengalpet",
    state: "Tamil Nadu",
    country: "India",
    pincode: "602304",
    trustName: "",
    registrationName: "",
    panNumber: "",
    gstNumber: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggle = (name: string) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name as keyof typeof formData] }));
  };

  const handleSave = () => {
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      navigate('/layout/settings');
    }, 1500);
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
          <p className="text-[16px] font-bold text-gray-900">Institution Details Saved Successfully</p>
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
          <h1 className="text-[16px] font-bold text-gray-900">Institution Details</h1>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 w-full">
        <div className="max-w-6xl">
          {/* section: BASIC INFORMATION */}
          <div className="mb-8">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-5">
              BASIC INFORMATION
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Institution Name</label>
                <input
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Short Name</label>
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Institution Code</label>
                <input
                  type="text"
                  name="institutionCode"
                  value={formData.institutionCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Institution Type</label>
                <select
                  name="institutionType"
                  value={formData.institutionType}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors appearance-none"
                >
                  <option value="University">University</option>
                  <option value="College">College</option>
                  <option value="School">School</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Board/Affiliation</label>
                <input
                  type="text"
                  name="boardAffiliation"
                  value={formData.boardAffiliation}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Established Year</label>
                <input
                  type="text"
                  name="establishedYear"
                  value={formData.establishedYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Institution Web</label>
                <input
                  type="text"
                  name="institutionWeb"
                  value={formData.institutionWeb}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* section: ACCREDITATION DETAILS */}
          <div className="mb-8">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-5">
              ACCREDITATION DETAILS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">NAAC Grade</label>
                <input
                  type="text"
                  name="naacGrade"
                  value={formData.naacGrade}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              
              <div className="flex flex-col">
                 <label className="block text-[13px] font-semibold text-gray-700 mb-2 invisible">Spacer</label>
                 <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2.5 h-[42px]">
                   <span className="text-[13px] font-semibold text-gray-700">NBA Accreditation</span>
                   <button 
                     type="button"
                     onClick={() => handleToggle('nbaAccreditation')}
                     className={`w-10 h-5 rounded-full relative transition-colors ${formData.nbaAccreditation ? "bg-[#1D6BA3]" : "bg-gray-200"}`}
                   >
                     <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.nbaAccreditation ? "translate-x-5" : "translate-x-0"}`} />
                   </button>
                 </div>
              </div>

              <div className="flex flex-col">
                 <label className="block text-[13px] font-semibold text-gray-700 mb-2 invisible">Spacer</label>
                 <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2.5 h-[42px]">
                   <span className="text-[13px] font-semibold text-gray-700">NIRF Participate</span>
                   <button 
                     type="button"
                     onClick={() => handleToggle('nirfParticipate')}
                     className={`w-10 h-5 rounded-full relative transition-colors ${formData.nirfParticipate ? "bg-[#1D6BA3]" : "bg-gray-200"}`}
                   >
                     <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.nirfParticipate ? "translate-x-5" : "translate-x-0"}`} />
                   </button>
                 </div>
              </div>
            </div>
          </div>

          {/* section: ADDRESS DETAILS */}
          <div className="mb-8">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-5">
              ADDRESS DETAILS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* section: LEGAL DETAILS */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-5">
              LEGAL DETAILS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Trust/Society Name</label>
                <input
                  type="text"
                  name="trustName"
                  value={formData.trustName}
                  onChange={handleChange}
                  placeholder="Enter"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Registration Name</label>
                <input
                  type="text"
                  name="registrationName"
                  value={formData.registrationName}
                  onChange={handleChange}
                  placeholder="Enter"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="Enter"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
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

export default InstitutionDetails;
