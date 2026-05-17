import { useState } from "react";
import {
  Plus,
  X,
  Search,
  ChevronDown,
  GraduationCap,
  MapPin,
  Bell,
  LayoutGrid,
} from "lucide-react";
import Button from "../../components/common/Button/Button";
import Card from "../../components/common/Card";
import Modal from "../../components/common/Modal/Modal";

interface InputFieldProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value?: string;
  onChange?: (val: string) => void;
  defaultValue?: string;
}

const InputField = ({
  label,
  placeholder,
  required = false,
  type = "text",
  value,
  onChange,
  defaultValue,
}: InputFieldProps) => (
  <div className="flex-1 min-w-[200px] space-y-1.5">
    <label className="text-[14px] font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className="w-full h-11 px-4 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] transition-all"
    />
  </div>
);

interface SelectFieldProps {
  label: string;
  required?: boolean;
  value?: string;
  onChange?: (val: string) => void;
}

const SelectField = ({ label, required = false, value, onChange }: SelectFieldProps) => (
  <div className="flex-1 min-w-[200px] space-y-1.5">
    <label className="text-[14px] font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full h-11 px-4 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] transition-all appearance-none bg-white"
      >
        <option>Select</option>
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
    </div>
  </div>
);

const ManageInstitution = () => {
  const [view, setView] = useState<"list" | "add">("list");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [activeInstitution, setActiveInstitution] = useState("Administration");

  const institutions = [
    "Rajiv Gandhi Engineering College",
    "Rajiv Gandhi Arts & Science",
    "Rajiv Gandhi Nursing College",
    "Rajiv Gandhi Dental College",
  ];

  if (view === "list") {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 leading-none">Manage Institution</h1>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 gap-2 h-10 px-6 rounded-lg font-semibold"
              onClick={() => setView("add")}
            >
              <Plus size={18} /> Add Institution
            </Button>
          </div>
          <div className="border-t border-gray-100 flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-[#1D6BA3]" />
            </div>
            <p className="text-base font-bold text-gray-800">Manage Institution</p>
            <p className="text-sm text-gray-400">Add an institution to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-gray-200 -mt-6 -mx-8 px-8 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <LayoutGrid size={20} className="text-gray-400" />
            <div
              className="flex flex-col cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
              onClick={() => setIsSelectOpen(true)}
            >
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Group View
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-gray-800">{activeInstitution}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="relative w-[400px]">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search"
              className="w-full h-10 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-800">Administration</p>
              <p className="text-[10px] text-gray-400 font-medium">Super Admin</p>
            </div>
            <div className="w-9 h-9 bg-[#2AB4D1] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
              A
            </div>
          </div>
        </div>
      </div>

      {/* Page Title Card */}
      <div className="bg-white rounded-lg border border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-base font-bold text-gray-900">Add Institution</h1>
      </div>

      {/* Main Form */}
      <div className="space-y-6">
        <Card noPadding className="border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
            <h2 className="text-[15px] font-bold text-gray-700">Institution Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <InputField label="Institution Name" placeholder="Enter Name" required />
              <InputField label="Phone Number" placeholder="+91" required />
              <InputField label="Email" placeholder="Enter" required />
              <InputField label="Point of Contact" placeholder="Enter" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-gray-700">Address</label>
              <textarea
                rows={4}
                placeholder="Enter"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] resize-none"
              />
            </div>

            <div className="grid grid-cols-4 gap-6">
              <InputField label="Landmark" placeholder="Enter" />
              <SelectField label="Pin Code" />
              <SelectField label="City" />
              <SelectField label="State" />
            </div>

            <div className="grid grid-cols-4 gap-6 items-end">
              <SelectField label="County" />
              <SelectField label="Institution Code" />
              <div className="space-y-1.5">
                <p className="text-[14px] font-medium text-gray-700">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-5 bg-[#1D6BA3] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card noPadding className="border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <h2 className="text-[15px] font-bold text-gray-700">Geo Fencing Details</h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 h-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                <MapPin size={14} /> Find Current Location
              </button>
              <button className="flex items-center gap-2 px-4 h-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                <MapPin size={14} /> Find Location From Address
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-8">
              <InputField label="Latitude" placeholder="Enter Name" required />
              <InputField label="Longitude" placeholder="Enter Name" required />
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-gray-700">
                  Allowed Radius (max 200 Meter) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3]"
                    defaultValue="10"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col scale-75">
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronDown className="rotate-180" size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button className="text-[13px] font-bold text-[#1D6BA3] hover:underline">
              See Location On Map
            </button>
          </div>
        </Card>

        <div className="bg-white rounded-xl px-5 py-3.5 shadow-sm border border-gray-200 flex justify-end gap-3">
          <Button
            variant="ghost"
            className="border border-[#1D6BA3] text-[#1D6BA3] hover:bg-[#1D6BA3]/5 h-10 px-8 rounded-lg font-bold"
            onClick={() => setView("list")}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-10 px-10 rounded-lg font-bold shadow-lg shadow-[#1D6BA3]/20"
            onClick={() => setView("list")}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Select Institution Modal */}
      <Modal
        isOpen={isSelectOpen}
        onClose={() => setIsSelectOpen(false)}
        title={<span className="text-xl font-bold text-gray-400 italic">Select Institution</span>}
        size="md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="ghost"
              className="border border-[#1D6BA3] text-[#1D6BA3] px-8 font-bold"
              onClick={() => setIsSelectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-[#1D6BA3] px-10 font-bold"
              onClick={() => setIsSelectOpen(false)}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Institution"
              className="w-full h-11 pl-4 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3]"
            />
            <X
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            />
          </div>

          <div className="space-y-3 pt-2">
            {institutions.map((inst) => (
              <div
                key={inst}
                className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50/80 hover:border-[#1D6BA3]/30 cursor-pointer transition-all group"
                onClick={() => {
                  setActiveInstitution(inst);
                  setIsSelectOpen(false);
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                  <GraduationCap size={20} className="text-gray-500 group-hover:text-[#1D6BA3]" />
                </div>
                <span className="text-[14px] font-semibold text-gray-700 group-hover:text-gray-900">
                  {inst}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageInstitution;
