import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building, 
  PhoneCall, 
  Calendar, 
  ListChecks, 
  UserCheck, 
  Users, 
  ListOrdered, 
  CreditCard, 
  Wallet,
  ChevronRight
} from "lucide-react";

type TabOption = "Institution" | "Academic" | "Numbering" | "Finance";

interface SettingCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path?: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabOption>("Institution");

  const TABS: TabOption[] = ["Institution", "Academic", "Numbering", "Finance"];

  const INSTITUTION_CARDS: SettingCard[] = [
    {
      title: "Institution Details",
      description: "Manage basic information, accreditation, and legal details of your institution.",
      icon: <Building className="w-5 h-5 text-[#1D6BA3]" />,
      path: "/layout/settings/institution-details"
    },
    {
      title: "Contact Details",
      description: "Configure primary, administrative, and emergency contact information.",
      icon: <PhoneCall className="w-5 h-5 text-[#1D6BA3]" />,
      path: "/layout/settings/contact-details"
    }
  ];

  const ACADEMIC_CARDS: SettingCard[] = [
    {
      title: "Academic Schedule Configuration",
      description: "Set working days, opening hours, periods, and academic systems.",
      icon: <Calendar className="w-5 h-5 text-[#1D6BA3]" />,
      path: "/layout/settings/academic-schedule"
    },
    {
      title: "Exam Configuration",
      description: "Configure exam types, sessions, internal assessments, and schedules.",
      icon: <ListChecks className="w-5 h-5 text-[#1D6BA3]" />,
      path: "/layout/settings/exam-configuration"
    },
    {
      title: "Student Attendance Settings",
      description: "Define attendance methods, grace times, and locking rules for students.",
      icon: <UserCheck className="w-5 h-5 text-[#1D6BA3]" />,
      path: "/layout/settings/student-attendance"
    },
    {
      title: "Staff Attendance Settings",
      description: "Configure staff check-in/out, GPS validation, and late entry rules.",
      icon: <Users className="w-5 h-5 text-[#1D6BA3]" />,
      path: "/layout/settings/staff-attendance"
    }
  ];

  const NUMBERING_CARDS: SettingCard[] = [
    {
      title: "Admission & Roll Number Sequence",
      description: "Configure formats for student admissions and roll number generation.",
      icon: <ListOrdered className="w-5 h-5 text-[#1D6BA3]" />,
      path: "/layout/settings/numbering-sequence"
    }
  ];

  const FINANCE_CARDS: SettingCard[] = [
    {
      title: "Fees Calculation",
      description: "Manage fee structures, categories, discounts, and penalty rules.",
      icon: <CreditCard className="w-5 h-5 text-[#1D6BA3]" />,
      path: "/layout/settings/fee-calculation"
    },
    {
      title: "Payment Configuration",
      description: "Set up payment gateways, transaction handling, and receipt settings.",
      icon: <Wallet className="w-5 h-5 text-[#1D6BA3]" />,
      path: "/layout/settings/payment-configuration"
    }
  ];

  const renderCards = (cards: SettingCard[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            onClick={() => {
              if (card.path) {
                navigate(card.path);
              }
            }}
            className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] hover:border-[#1D6BA3]/20 transition-all cursor-pointer flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#F0F7FB] flex items-center justify-center group-hover:bg-[#1D6BA3]/10 transition-colors">
                {card.icon}
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#F0F7FB] transition-colors">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#1D6BA3] transition-colors" />
              </div>
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-tight">
              {card.title}
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed flex-grow pr-4">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const activeCards = 
    activeTab === "Institution" ? INSTITUTION_CARDS :
    activeTab === "Academic" ? ACADEMIC_CARDS :
    activeTab === "Numbering" ? NUMBERING_CARDS :
    FINANCE_CARDS;

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-100px)] bg-gray-50/50 p-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header Title */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-[16px] font-bold text-gray-900">System Configuration</h1>
        </div>
        
        {/* Tab Navigation */}
        <div className="px-8 border-b border-gray-100">
          <div className="flex items-center gap-10">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-[3px] text-[14px] transition-colors ${
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

        {/* Content Area */}
        <div className="p-8 pb-12 bg-white min-h-[500px]">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-[12px] font-bold text-[#1D6BA3] tracking-[0.1em] uppercase">
              {activeTab}
            </h2>
            <div className="h-[1px] bg-gray-100 flex-grow"></div>
          </div>
          
          {renderCards(activeCards)}
        </div>
      </div>
    </div>
  );
};

export default Settings;
