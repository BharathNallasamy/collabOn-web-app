import React, { useState } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";
import StatsCard from "../../components/common/StatsCard";
import DataTable from "../../components/common/Table/DataTable";
import Badge from "../../components/common/Badge";
import {
  CalendarIcon,
  ChevronDownIcon,
} from "../../components/common/Icons";

// --- Types & Constants ---
const STEPS = [
  "Workload Analysis",
  "Faculty Allocation",
  "Timetable Generation",
  "Manual Adjustment",
  "Approval & Publish",
] as const;

import {
  type AllocationData,
} from "../../types/interfaces";
import {
  SEED_WORKLOAD_BREAKDOWN as STEP1_MOCK,
  SEED_ALLOCATION_DATA as STEP2_ALLOCATION_MOCK,
  SEED_FACULTY_CAPACITY as FACULTY_MOCK,
  SEED_TIMETABLE_MOCK as TIMETABLE_MOCK,
} from "../../types/mockData";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = [
  "9:00 - 10:00 AM",
  "10:00 - 11:00 AM",
  "11:00 - 12:00 PM",
  "12:00 - 1:00 PM",
];


// --- Custom Icons ---
const FolderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
);
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const DocumentPenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
);
const UsersIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const UserIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const BuildingIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="2" /><line x1="15" y1="22" x2="15" y2="2" /><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="10" x2="20" y2="10" /><line x1="4" y1="14" x2="20" y2="14" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
);
const GlobeGridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
);
const RotateIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
);
const AlertTriangleIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
const BoltIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
);
const BrainIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A5 5 0 0 1 12 7.3V12h4.5a1.5 1.5 0 0 1 1.5 1.5V18a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V13.5a1.5 1.5 0 0 1 1.5-1.5H12V7.3A5 5 0 0 1 14.5 2h-5z" /><path d="M12 12H7.5A1.5 1.5 0 0 0 6 13.5V18a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-4.5a1.5 1.5 0 0 0-1.5-1.5H12z" /></svg>
);
const CheckIcon = ({ size = 14, strokeWidth = 5 }: { size?: number; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

// --- Helper Components ---
const FilterSelect = ({ label, options }: { label: string; options: string[] }) => (
  <div className="flex-1 min-w-[130px]">
    <div className="relative group">
      <select className="w-full appearance-none px-4 py-2 text-sm border border-gray-100 rounded-lg bg-white text-gray-500 font-medium focus:outline-none focus:ring-1 focus:ring-gray-200 cursor-pointer">
        <option value="" disabled selected>{label}</option>
        {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronDownIcon size={12} /></div>
    </div>
  </div>
);

const ProgressBar = ({ value, max, color = "bg-[#1D6BA3]" }: { value: number; max: number; color?: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

const StaffWorkload = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [generationMode, setGenerationMode] = useState<"quick" | "smart">("smart");

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((prev) => prev + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  // --- Step 1 Render ---
  const renderStep1 = () => {
    const columns = [
      { key: "subjectName", header: "Subject Name", className: "font-semibold" },
      { key: "subjectType", header: "Subject Type" },
      { key: "weeklyHours", header: "Weekly Hours" },
      { key: "owningDept", header: "Owning Department" },
      { key: "trackingDept", header: "Tracking Department" },
    ];
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between gap-4">
          <h1 className="text-base font-bold text-gray-800 shrink-0">Staff Workload</h1>
          <div className="flex items-center gap-3 flex-grow justify-end max-w-4xl">
            <FilterSelect label="Department" options={["CSE", "ECE", "MECH"]} />
            <FilterSelect label="Program Type" options={["UG", "PG", "PhD"]} />
            <FilterSelect label="Semester" options={["1", "2", "3", "4", "5", "6", "7", "8"]} />
            <FilterSelect label="Class" options={["A", "B", "C"]} />
            <div className="relative group min-w-[150px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><CalendarIcon size={14} /></div>
              <input type="text" placeholder="Academic Year" className="w-full pl-9 pr-4 py-2 text-sm border border-gray-100 rounded-lg bg-white text-gray-400 font-bold focus:outline-none" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard label="Total Subjects" value="12" variant="horizontal" layout="label-first" icon={<FolderIcon />} bgClassName="bg-blue-50" iconColorClassName="text-[#1D6BA3]" />
          <StatsCard label="Total Weekly Hours" value="42 hrs" variant="horizontal" layout="label-first" icon={<ClockIcon />} bgClassName="bg-orange-50" iconColorClassName="text-[#F59E0B]" />
          <StatsCard label="External Dept Subjects" value="6 hrs" variant="horizontal" layout="label-first" icon={<DocumentPenIcon />} bgClassName="bg-green-50" iconColorClassName="text-[#10B981]" />
          <StatsCard label="Cross Dept Teaching" value="4 hrs" variant="horizontal" layout="label-first" icon={<UsersIcon />} bgClassName="bg-rose-50" iconColorClassName="text-[#EF4444]" />
          <StatsCard label="Net Teaching Demand" value="40 hrs" variant="horizontal" layout="label-first" icon={<GlobeGridIcon />} bgClassName="bg-sky-50" iconColorClassName="text-[#0EA5E9]" />
        </div>
        <Card noPadding className="border-gray-200 shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-white"><h3 className="text-[13px] font-bold text-gray-800">Subject Workload Breakdown</h3></div>
          <div className="px-6 py-4 overflow-x-auto">
            <DataTable data={STEP1_MOCK} columns={columns} showPagination={false} headerRowClassName="bg-[#F0F7FF]" containerClassName="border border-gray-200 rounded-lg" />
          </div>
        </Card>
      </div>
    );
  };

  // --- Step 2 Render ---
  const renderStep2 = () => {
    const columns = [
      { key: "subjectCode", header: "Subject Code" },
      { key: "subjectName", header: "Subject Name", className: "font-semibold" },
      { key: "subjectType", header: "Subject Type", render: (item: AllocationData) => <Badge variant={item.subjectType === "Core" ? "neutral" : "success"} className={item.subjectType === "Core" ? "bg-purple-50 text-purple-700 border-purple-100" : ""}>{item.subjectType}</Badge> },
      { key: "weeklyHours", header: "Weekly Hours" },
      { key: "suggestedFaculty", header: "Suggested Faculty", render: (item: AllocationData) => <div className="max-w-[180px]"><input type="text" readOnly value={item.suggestedFaculty} className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded bg-gray-50 text-gray-500" /></div> },
      { key: "assignedFaculty", header: "Assigned Faculty", render: () => <div className="relative group max-w-[180px]"><select className="w-full appearance-none px-3 py-1.5 text-xs border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] cursor-pointer"><option value="">-- Unassigned --</option><option value="1">Dr. C Devi</option></select><div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronDownIcon size={12} /></div></div> },
    ];
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        <Card className="border-gray-200 shadow-sm py-8">
          <div className="flex flex-col gap-6">
            <h2 className="text-sm font-bold text-gray-800">Department Capacity Overview</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">6 Subjects Unassigned</span>
                <div className="flex items-center gap-4 text-xs font-bold leading-none"><span className="text-[#1D6BA3]">Weekly Subjects Demand : 22 hrs</span><span className="text-gray-300">|</span><span className="text-green-600">Overall Faculty Weekly Capacity : 64 hrs</span></div>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden"><div className="h-full bg-[#1D6BA3] rounded-full" style={{ width: "65%" }} /></div>
            </div>
          </div>
        </Card>
        <Card noPadding className="border-gray-200 shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-white"><h3 className="text-[13px] font-bold text-gray-800">Subject Workload Breakdown</h3></div>
          <div className="px-6 py-4 overflow-x-auto">
            <DataTable data={STEP2_ALLOCATION_MOCK} columns={columns} showPagination={false} headerRowClassName="bg-[#F0F7FF]" containerClassName="border border-gray-200 rounded-lg" />
          </div>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FACULTY_MOCK.map((faculty, idx) => (
            <Card key={idx} className={`border ${faculty.isOverCapacity ? "border-rose-200 bg-rose-50/10" : "border-gray-200"} relative`}>
              {faculty.isOverCapacity && (<div className="absolute top-3 right-4 text-rose-500"><AlertTriangleIcon /></div>)}
              <div className="space-y-4">
                <div className="space-y-0.5"><p className="text-[10px] font-bold text-gray-400">{faculty.designation}</p><p className="text-sm font-bold text-gray-800">{faculty.name}</p></div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold"><span className="text-gray-600">Assigned : {faculty.assigned}hrs</span><span className="text-gray-400">Max : {faculty.max}hrs</span></div>
                  <ProgressBar value={faculty.assigned} max={faculty.max} color={faculty.isOverCapacity ? "bg-rose-600" : "bg-green-600"} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // --- Step 3 Render (Timetable Generation Selection) ---
  const renderStep3 = () => {
    const constraints = [
      "Faculty availability",
      "Room availability",
      "Student Timetable Conflicts",
      "Cross Department Subjects",
      "Maximum Teaching Hours Per Faculty",
      "Lab Session Requirements",
    ];

    const ModeCard = ({ mode, title, desc, icon, color }: { mode: "quick" | "smart"; title: string; desc: string; icon: React.ReactNode; color: string }) => {
      const isSelected = generationMode === mode;
      return (
        <div 
          onClick={() => setGenerationMode(mode)}
          className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 w-full group ${isSelected ? "border-[#6B46C1] bg-white shadow-xl translate-y-[-4px]" : "border-gray-100 bg-white hover:border-gray-300"}`}
        >
          <div className="flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} text-white shadow-md transition-transform group-hover:scale-110`}>{icon}</div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">{desc}</p>
            </div>
            <div className="space-y-3 pt-2">
              {["Generates in seconds", "Basic conflict resolution", "Standard faculty availability"].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="bg-green-50 p-0.5 rounded-full text-green-500"><CheckIcon size={12} /></div>
                  <span className="text-[11px] font-bold text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        <div className="space-y-1.5 py-2">
          <h1 className="text-base font-bold text-gray-800">Generate Timetable</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">Select a generation mode based on your requirements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <ModeCard mode="quick" title="Quick Generate" color="bg-blue-400" icon={<BoltIcon />} desc="Fast Timetable Generation Using Greedy Heuristic Algorithms. Best For Simple Schedules With Fewer Constraints." />
          <ModeCard mode="smart" title="Smart AI Generation" color="bg-[#6B46C1]" icon={<BrainIcon />} desc="Advanced Timetable Generation using Neural Optimization. Handles complex overlaps and special constraints efficiently." />
        </div>

        <Card className="border-gray-200 shadow-sm mt-8 py-10">
          <div className="space-y-8">
            <h3 className="text-sm font-bold text-gray-800">Constraints Considered</h3>
            <div className="flex flex-wrap gap-4">
              {constraints.map((c) => (
                <div key={c} className="px-6 py-3 rounded-full bg-gray-50/50 border border-gray-100 text-[11px] font-bold text-gray-600 hover:bg-white transition-colors cursor-default shadow-sm">{c}</div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // --- Step 4 Render (Manual Adjustment) ---
  const renderStep4 = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        {/* Step 4 Header Component */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-base font-bold text-gray-800">Manual Timetable Adjustment.</h1>
            <p className="text-[11px] text-gray-400 font-bold">Drag and drop to swap classes. System will alert on conflicts.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 border border-[#1D6BA3]/30 bg-white px-4 py-2 rounded-lg text-[#1D6BA3] hover:bg-blue-50 transition-colors shadow-sm group">
              <RotateIcon size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Regenerate</span>
            </button>
            <button className="flex items-center gap-2 border border-rose-200 bg-rose-50/30 px-4 py-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors shadow-sm">
              <AlertTriangleIcon size={14} />
              <span className="text-[10px] font-bold tracking-wider uppercase">Conflict Detected</span>
            </button>
          </div>
        </div>

        <Card noPadding className="border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 border-r border-gray-100 w-32">Time</th>
                  {DAYS.map((day) => (<th key={day} className="px-4 py-4 text-xs font-bold text-gray-500 border-r border-gray-100 min-w-[180px]">{day}</th>))}
                </tr>
              </thead>
              <tbody>
                {TIMES.map((time, rowIdx) => (
                  <tr key={time} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-8 text-[11px] font-bold text-gray-400 text-center border-r border-gray-100 bg-gray-50/30">{time}</td>
                    {TIMETABLE_MOCK[rowIdx].map((slot, colIdx) => (
                      <td key={`${rowIdx}-${colIdx}`} className="p-2 border-r border-gray-100 last:border-r-0 align-top">
                        {slot ? (
                          <div className={`p-4 rounded-xl border transition-all cursor-move bg-white ${slot.hasConflict ? "border-rose-400 bg-rose-50/20" : "border-gray-100 shadow-sm hover:shadow-md"}`}>
                            <div className="flex justify-between items-start mb-3"><h4 className="text-[11px] font-bold text-gray-800 leading-tight">{slot.subject}</h4>{slot.hasConflict && <div className="text-rose-500"><AlertTriangleIcon size={14} /></div>}</div>
                            <div className="space-y-1.5"><div className="flex items-center gap-2 text-gray-400"><UserIcon /><span className="text-[10px] font-bold">{slot.faculty}</span></div><div className="flex items-center gap-2 text-gray-400"><BuildingIcon /><span className="text-[10px] font-bold">{slot.room}</span></div></div>
                          </div>
                      ) : (<div className="h-full min-h-[100px] rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/20" />)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 font-sans">
      {/* 1. Stepper Section */}
      <Card noPadding className="border-gray-200 shadow-sm mb-2">
        <div className="px-6 py-12 overflow-x-auto">
          <div className="flex items-start justify-between min-w-[900px] max-w-6xl mx-auto relative px-10">
            <div className="absolute top-[15px] left-[13%] right-[13%] h-[1.8px] bg-gray-100 -z-0">
              <div className="h-full bg-[#1D6BA3] transition-all duration-500" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
            </div>
            {STEPS.map((step, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              return (
                <div key={step} className="flex flex-col items-center gap-4 relative z-10 w-44">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? "border-[#1D6BA3] bg-white text-[#1D6BA3]" : isCompleted ? "border-[#1D6BA3] bg-[#1D6BA3] text-white" : "border-gray-200 bg-white text-gray-400"}`}>
                    {isActive && <div className="w-3 h-3 rounded-full bg-[#1D6BA3]" />}
                    {isCompleted && (<CheckIcon size={14} strokeWidth={5} />)}
                  </div>
                  <span className={`text-[11px] font-bold text-center leading-tight transition-colors ${isActive || isCompleted ? "text-[#1D6BA3]" : "text-gray-400"}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Conditional Content Rendering */}
      {currentStep === 0 && renderStep1()}
      {currentStep === 1 && renderStep2()}
      {currentStep === 2 && renderStep3()}
      {currentStep === 3 && renderStep4()}

      {/* Footer Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-end gap-3 transition-all mt-8">
        {/* Secondary Buttons (Only for first two steps) */}
        {currentStep < 2 && (
          <>
            <Button variant="ghost" onClick={handleBack} className="px-7 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold rounded-lg">
              {currentStep === 0 ? "Cancel" : "Back"}
            </Button>
            {currentStep === 1 ? (
              <Button variant="ghost" className="px-7 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold rounded-lg cursor-default">Cancel</Button>
            ) : (
              <Button variant="ghost" className="px-7 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold rounded-lg">Save Draft</Button>
            )}
          </>
        )}

        {/* Primary Action Button */}
        <Button 
          variant="primary" 
          onClick={currentStep >= 3 ? undefined : handleNext} 
          className={`px-10 py-2.5 bg-[#1D6BA3] hover:bg-[#1a5f91] font-bold rounded-lg shadow-sm ${currentStep >= 3 ? "text-sm shadow-lg cursor-default" : "text-xs"}`}
        >
          {currentStep >= 3 ? "Publish" : currentStep === 2 ? "Generate Timetable" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default StaffWorkload;
