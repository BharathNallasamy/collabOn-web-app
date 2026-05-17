import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomDropdown = ({ options, value, onChange, placeholder = "Select", className = "" }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 flex items-center justify-between bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 hover:border-[#1D6BA3]/50 transition-all focus:outline-none"
      >
        <span className={`whitespace-nowrap overflow-hidden text-ellipsis ${!value ? "text-gray-400" : "text-gray-700"}`}>
          {value || placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 ml-2 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-fit min-w-full bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-[100] py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-[13px] whitespace-nowrap transition-colors hover:bg-gray-50 ${
                  value === option ? "text-[#1D6BA3] font-bold bg-[#1D6BA3]/5" : "text-gray-600 font-medium"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
