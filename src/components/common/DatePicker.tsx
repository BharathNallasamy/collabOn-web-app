import { useState, useRef, useEffect } from "react";
import { CalendarIcon } from "./Icons";

// ── Helpers ────────────────────────────────────────────────────────────────────
const toIso = (d: Date) => d.toISOString().split("T")[0];
const toDisplay = (iso: string) => iso.split("-").reverse().join("/");

// ── DatePicker ─────────────────────────────────────────────────────────────────
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface DatePickerProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

const DatePicker = ({ value, onChange, className = "" }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => +value.split("-")[0] || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (+value.split("-")[1] || 1) - 1);
  const ref = useRef<HTMLDivElement>(null);

  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setViewYear(+value.split("-")[0]);
    setViewMonth(+value.split("-")[1] - 1);
  }

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const todayIso = toIso(new Date());

  const prevMonth = () =>
    viewMonth === 0 ? (setViewMonth(11), setViewYear((y) => y - 1)) : setViewMonth((m) => m - 1);
  const nextMonth = () =>
    viewMonth === 11 ? (setViewMonth(0), setViewYear((y) => y + 1)) : setViewMonth((m) => m + 1);

  const selectDay = (day: number) => {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(iso);
    setOpen(false);
  };

  const goToday = () => {
    onChange(todayIso);
    setOpen(false);
  };

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMon = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMon }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          "flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg shadow-sm text-sm font-medium transition-colors select-none",
          open
            ? "border-[#1D6BA3] text-[#1D6BA3]"
            : "border-gray-200 text-gray-600 hover:border-[#1D6BA3]/50 hover:text-[#1D6BA3]",
        ].join(" ")}
      >
        <CalendarIcon size={16} />
        <span>{toDisplay(value)}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1D6BA3]">
            <button
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-sm font-bold text-white tracking-wide">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-400">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 px-3 pb-1 gap-y-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSel = iso === value;
              const isToday = iso === todayIso;
              return (
                <button
                  key={i}
                  onClick={() => selectDay(day)}
                  className={[
                    "w-8 h-8 mx-auto flex items-center justify-center rounded-full text-[13px] font-medium transition-all duration-100",
                    isSel
                      ? "bg-[#1D6BA3] text-white font-bold shadow-sm"
                      : isToday
                        ? "bg-[#1D6BA3]/10 text-[#1D6BA3] font-semibold ring-1 ring-[#1D6BA3]/30"
                        : "text-gray-700 hover:bg-gray-100",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center items-center px-4 py-1 border-t border-gray-100 bg-gray-50/60">
            <button
              onClick={goToday}
              className="text-[12px] font-bold text-[#1D6BA3] hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
