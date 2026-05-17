import { useState, useRef, useEffect } from "react";
import { AlertTriangle, Clock, Info, Calendar, User, Plus, X, Pencil, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";
import { ChevronDownIcon } from "../../components/common/Icons";

const MOCK_CIRCULARS = [
  {
    id: "1",
    mode: "Emergency",
    title: "Emergency : Campus Closure Due To Heavy Rain",
    date: "22/04/2020",
    author: "Karthik",
    description: "A Seminar On The Importance Of Cyber Security In The Modern World, All Students Requested To Attend.",
    addressedTo: ["All"],
  },
  {
    id: "2",
    mode: "Urgent",
    title: "Revised Guidelines For End semester Examinations",
    date: "22/04/2020",
    author: "Karthik",
    description: "A Seminar On The Importance Of Cyber Security In The Modern World, All Students Requested To Attend.",
    addressedTo: ["Faculty"],
  },
  {
    id: "3",
    mode: "Normal",
    title: "Faculty Development Program On AI Integration",
    date: "22/04/2020",
    author: "Karthik",
    description: "A Seminar On The Importance Of Cyber Security In The Modern World, All Students Requested To Attend.",
    addressedTo: ["Students", "Parents"],
  },
];

const MODE_CONFIG: Record<string, {
  icon: React.ReactNode;
  badgeClass: string;
}> = {
  Emergency: {
    icon: <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />,
    badgeClass: "bg-red-50 text-red-500 border border-red-200",
  },
  Urgent: {
    icon: <Clock className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />,
    badgeClass: "bg-orange-50 text-orange-500 border border-orange-200",
  },
  Normal: {
    icon: <Info className="w-5 h-5 text-[#1D6BA3] flex-shrink-0 mt-0.5" />,
    badgeClass: "bg-white text-[#1D6BA3] border border-[#1D6BA3]/30",
  },
};

// ── Custom Dropdown ───────────────────────────────────────────────────────────
const CustomDropdown = ({
  label, options, value, onChange,
}: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative min-w-[140px]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 bg-white hover:border-gray-300 transition-colors"
      >
        <span className={value ? "text-gray-700 font-medium" : ""}>{value || label}</span>
        <ChevronDownIcon size={16} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-full min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
          <ul className="py-1">
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => { onChange(opt === value ? "" : opt); setOpen(false); }}
                  className={[
                    "w-full text-left px-4 py-2.5 text-[13px] transition-colors",
                    opt === value ? "text-[#1D6BA3] font-semibold bg-[#F0F7FB]" : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const Circulars = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("");
  const [search, setSearch] = useState("");

  const filtered = MOCK_CIRCULARS.filter(c => {
    const matchMode = !mode || c.mode === mode;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchMode && matchSearch;
  });

  return (
    <div className="space-y-4">
      <Card noPadding className="border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-base font-bold text-gray-900">Circulars & Announcements</h1>
          <Button
            variant="primary"
            className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-10 px-4"
            icon={<Plus size={18} />}
            onClick={() => navigate("/layout/campus-comms/circulars/create")}
          >
            <span className="font-semibold text-sm">Create Circular</span>
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-4 flex flex-wrap items-center gap-3 bg-white border-y border-gray-100">
          <CustomDropdown
            label="Mode"
            value={mode}
            onChange={setMode}
            options={["Normal", "Urgent", "Emergency"]}
          />
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search by Name , Roll No, Phone No, Email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white h-9 px-4 text-sm font-medium"
            onClick={() => {}}
          >
            Search
          </Button>
          <Button
            variant="ghost"
            className="border border-[#1D6BA3] text-[#1D6BA3] hover:bg-[#1D6BA3]/5 h-9 px-4 text-sm font-medium"
            onClick={() => { setMode(""); setSearch(""); }}
          >
            Clear
          </Button>
        </div>

        {/* Circular Cards */}
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-gray-400">No circulars found.</div>
          )}
          {filtered.map((c) => {
            const cfg = MODE_CONFIG[c.mode];
            return (
              <div
                key={c.id}
                className="px-6 py-5 flex items-start gap-4 hover:bg-gray-50/60 transition-colors cursor-pointer"
              >
                {cfg.icon}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1.5">
                    <h2 className="text-sm font-bold text-gray-900">{c.title}</h2>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {c.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> {c.author}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{c.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Addressed To :</span>
                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                      {c.addressedTo.join(" | ")}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${cfg.badgeClass}`}>
                    {c.mode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate(`/layout/campus-comms/circulars/edit/${c.id}`)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1D6BA3]/10 text-[#1D6BA3] hover:bg-[#1D6BA3]/20 transition-colors"
                      title="Document"
                    >
                      <FileText size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Circulars;
