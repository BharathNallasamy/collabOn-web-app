import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";

const ContactDetails = () => {
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    mainPhone: "",
    alternativePhone: "",
    officialEmail: "",
    principalName: "",
    principalEmail: "",
    principalNumber: "",
    admissionsEmail: "",
    accountsEmail: "",
    hrEmail: "",
    campusSecurity: "",
    medicalContact: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          <p className="text-[16px] font-bold text-gray-900">Contact Details Saved Successfully</p>
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
          <h1 className="text-[16px] font-bold text-gray-900">Contact Details</h1>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 w-full">
        <div className="max-w-6xl">
          {/* section: PRIMARY CONTACT */}
          <div className="mb-8">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-5">
              PRIMARY CONTACT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Main Phone Number</label>
                <input
                  type="text"
                  name="mainPhone"
                  value={formData.mainPhone}
                  onChange={handleChange}
                  placeholder="91+"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Alternative Phone Number</label>
                <input
                  type="text"
                  name="alternativePhone"
                  value={formData.alternativePhone}
                  onChange={handleChange}
                  placeholder="91+"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Official Email</label>
                <input
                  type="email"
                  name="officialEmail"
                  value={formData.officialEmail}
                  onChange={handleChange}
                  placeholder="Enter"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* section: ADMINISTRATION CONTACT */}
          <div className="mb-8">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-5">
              ADMINISTRATION CONTACT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Principal/Direct Name</label>
                <input
                  type="text"
                  name="principalName"
                  value={formData.principalName}
                  onChange={handleChange}
                  placeholder="Enter"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Principal Email</label>
                <input
                  type="email"
                  name="principalEmail"
                  value={formData.principalEmail}
                  onChange={handleChange}
                  placeholder="Enter"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Principal Number</label>
                <input
                  type="text"
                  name="principalNumber"
                  value={formData.principalNumber}
                  onChange={handleChange}
                  placeholder="91+"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* section: ADDRESS DETAILS */}
          <div className="mb-8">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-5">
              ADDRESS DETAILS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Admissions Office Email</label>
                <input
                  type="email"
                  name="admissionsEmail"
                  value={formData.admissionsEmail}
                  onChange={handleChange}
                  placeholder="Enter"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Accounts Office Email</label>
                <input
                  type="email"
                  name="accountsEmail"
                  value={formData.accountsEmail}
                  onChange={handleChange}
                  placeholder="Enter"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">HR Office Email</label>
                <input
                  type="email"
                  name="hrEmail"
                  value={formData.hrEmail}
                  onChange={handleChange}
                  placeholder="Enter"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* section: EMERGENCY CONTACTS */}
          <div className="mb-8">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-5">
              EMERGENCY CONTACTS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Campus Security Number</label>
                <input
                  type="text"
                  name="campusSecurity"
                  value={formData.campusSecurity}
                  onChange={handleChange}
                  placeholder="91+"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Medical Emergency Contact</label>
                <input
                  type="text"
                  name="medicalContact"
                  value={formData.medicalContact}
                  onChange={handleChange}
                  placeholder="91+"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* section: SOCIAL MEDIA */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-5">
              SOCIAL MEDIA
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Facebook</label>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="URL"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Instagram</label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="URL"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Linkedin</label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="URL"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] focus:ring-1 focus:ring-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Youtube</label>
                <input
                  type="text"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleChange}
                  placeholder="URL"
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

export default ContactDetails;
