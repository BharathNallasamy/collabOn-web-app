import { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  LayoutGrid,
  X,
  GraduationCap,
  LogOut,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Modal from "../common/Modal/Modal";
import Button from "../common/Button/Button";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeInstitution, setActiveInstitution] = useState("Administration");

  const mode = searchParams.get("mode");
  const isInstitutionPage = location.pathname.includes("manage-institution");
  const showGroupView = isInstitutionPage && mode === "add";

  const institutions = [
    "Rajiv Gandhi Engineering College",
    "Rajiv Gandhi Arts & Science",
    "Rajiv Gandhi Nursing College",
    "Rajiv Gandhi Dental College",
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex-shrink-0 z-50 px-6">
      <div className="grid grid-cols-3 h-full items-center w-full">
        {/* Left Column: Group View */}
        <div className="flex items-center">
          {showGroupView && (
            <div className="flex items-center gap-3 pr-6 border-r border-gray-100 transition-all animate-in fade-in slide-in-from-left-4">
              <LayoutGrid size={20} className="text-gray-400" />
              <div
                className="flex flex-col cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
                onClick={() => setIsSelectOpen(true)}
              >
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                  Group View
                </span>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-sm font-bold text-gray-800">{activeInstitution}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Column: Perfectly Centered Search */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full h-10 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/30 placeholder-gray-400 transition-all font-medium text-center"
            />
            {/* <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-400" /> */}
          </div>
        </div>

        {/* Right Column: Profile Actions */}
        <div className="flex items-center justify-end gap-5">
          <button className="relative text-gray-400 hover:text-[#1D6BA3] transition-all p-2 rounded-full hover:bg-gray-50">
            <Bell size={21} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>

          <div className="h-8 w-px bg-gray-200 opacity-60" />

          <div className="relative">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="text-right leading-tight">
                <p className="text-sm font-bold text-gray-800 group-hover:text-[#1D6BA3] transition-colors">
                  {user?.name || "Administration"}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {user?.role || "Super Admin"}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#1D6BA3] flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-gray-50 transition-transform group-hover:scale-105">
                {user?.name?.charAt(0) || "A"}
              </div>
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-sm font-bold text-gray-900">
                      {user?.name || "Administration"}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {user?.email || "admin@collabon.com"}
                    </p>
                  </div>

                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1D6BA3] transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={18} className="text-gray-400" />
                    <span className="font-medium">My Profile</span>
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1D6BA3] transition-colors"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/super-admin/settings");
                    }}
                  >
                    <SettingsIcon size={18} className="text-gray-400" />
                    <span className="font-medium">Settings</span>
                  </button>

                  <div className="h-px bg-gray-50 my-1" />

                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      navigate("/login");
                    }}
                  >
                    <LogOut size={18} />
                    <span className="font-bold">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Select Institution Modal */}
      <Modal
        isOpen={isSelectOpen}
        onClose={() => setIsSelectOpen(false)}
        title={
          <span className="text-[22px] font-bold text-gray-400 italic font-serif">
            Select Institution
          </span>
        }
        size="md"
        footer={
          <div className="flex justify-end gap-3 w-full border-t border-gray-100 pt-3">
            <Button
              variant="ghost"
              className="border border-[#1D6BA3] text-[#1D6BA3] px-8 font-bold h-10 rounded-lg"
              onClick={() => setIsSelectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] px-10 font-bold h-10 rounded-lg"
              onClick={() => setIsSelectOpen(false)}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Institution"
              className="w-full h-11 pl-4 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3]"
            />
            <X
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
            />
          </div>

          <div className="space-y-3 pt-2">
            {institutions.map((inst) => (
              <div
                key={inst}
                className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50/80 hover:border-[#1D6BA3]/30 cursor-pointer transition-all group shadow-sm"
                onClick={() => {
                  setActiveInstitution(inst);
                  setIsSelectOpen(false);
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                  <GraduationCap size={20} className="text-gray-400 group-hover:text-[#1D6BA3]" />
                </div>
                <span className="text-[14px] font-semibold text-gray-700 group-hover:text-gray-900">
                  {inst}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default Navbar;
