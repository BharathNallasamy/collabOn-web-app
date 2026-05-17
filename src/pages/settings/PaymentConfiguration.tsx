import { useState } from "react";
import { ChevronLeft, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";

const PaymentConfiguration = () => {
  const navigate = useNavigate();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // PAYMENT GATEWAY
  const [phonePeMerchantId, setPhonePeMerchantId] = useState("");
  const [phonePeApiKey, setPhonePeApiKey] = useState("");
  const [phonePeWebhookUrl, setPhonePeWebhookUrl] = useState("");

  // PAYMENT OPTIONS
  const [allowFullPayment, setAllowFullPayment] = useState(false);
  const [allowPartialPayment, setAllowPartialPayment] = useState(false);

  // RECEIPT SETTINGS
  const [autoGenerateReceipt, setAutoGenerateReceipt] = useState(false);
  const [emailReceipt, setEmailReceipt] = useState(false);
  const [receiptNumberFormat, setReceiptNumberFormat] = useState("RGEC-FeeReceipt-001");

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
          <p className="text-[16px] font-bold text-gray-900">Payment Configuration Saved Successfully</p>
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
          <h1 className="text-[16px] font-bold text-gray-900">Payment Configuration</h1>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 w-full">
        <div className="max-w-6xl">

          {/* SECTION 1: PAYMENT GATEWAY */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              PAYMENT GATEWAY
            </h2>

            <div className="p-4 border border-[#1D6BA3]/20 bg-[#F4F8FA] rounded-xl mb-6 flex items-center gap-5 max-w-4xl">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100 shadow-[#1D6BA3]/5">
                <Wallet className="w-5 h-5 text-[#1D6BA3]" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#1D6BA3] mb-0.5">PhonePe Business</h3>
                <p className="text-[13px] text-[#1D6BA3]/80 font-medium">
                  UPI, Cards, Net Banking, Wallets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">PhonePe Merchant ID</label>
                <input 
                  type="text" 
                  placeholder="Enter"
                  value={phonePeMerchantId} 
                  onChange={(e) => setPhonePeMerchantId(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">API Key</label>
                <input 
                  type="text" 
                  placeholder="-"
                  value={phonePeApiKey} 
                  onChange={(e) => setPhonePeApiKey(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Webhook URL</label>
                <input 
                  type="url" 
                  placeholder="URL"
                  value={phonePeWebhookUrl} 
                  onChange={(e) => setPhonePeWebhookUrl(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PAYMENT OPTIONS */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              PAYMENT OPTIONS
            </h2>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 max-w-md flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:border-[#1D6BA3]/30">
                <span className="text-[13px] font-semibold text-gray-700">
                  Allow Full Payment
                </span>
                <button 
                  type="button" 
                  onClick={() => setAllowFullPayment(!allowFullPayment)} 
                  className={`w-10 h-5 rounded-full relative transition-colors ${allowFullPayment ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${allowFullPayment ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="flex-1 max-w-md flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:border-[#1D6BA3]/30">
                <span className="text-[13px] font-semibold text-gray-700">
                  Allow Partial Payment
                </span>
                <button 
                  type="button" 
                  onClick={() => setAllowPartialPayment(!allowPartialPayment)} 
                  className={`w-10 h-5 rounded-full relative transition-colors ${allowPartialPayment ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${allowPartialPayment ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: RECEIPT SETTINGS */}
          <div className="mb-10">
            <h2 className="text-[13px] font-bold text-[#1D6BA3] uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
              RECEIPT SETTINGS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl items-end">
              <div className="flex items-center justify-between bg-gray-50/50 border border-gray-200 rounded-xl px-5 h-[50px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="text-[13px] font-semibold text-gray-700">
                  Auto Generate Receipt
                </span>
                <button 
                  type="button" 
                  onClick={() => setAutoGenerateReceipt(!autoGenerateReceipt)} 
                  className={`w-10 h-5 rounded-full relative transition-colors ${autoGenerateReceipt ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${autoGenerateReceipt ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between bg-gray-50/50 border border-gray-200 rounded-xl px-5 h-[50px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="text-[13px] font-semibold text-gray-700">
                  Email Receipt
                </span>
                <button 
                  type="button" 
                  onClick={() => setEmailReceipt(!emailReceipt)} 
                  className={`w-10 h-5 rounded-full relative transition-colors ${emailReceipt ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${emailReceipt ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Receipt Number Format</label>
                <input 
                  type="text" 
                  placeholder="RGEC-FeeReceipt-001"
                  value={receiptNumberFormat} 
                  onChange={(e) => setReceiptNumberFormat(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-[#1D6BA3] transition-colors"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-10">
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

export default PaymentConfiguration;
