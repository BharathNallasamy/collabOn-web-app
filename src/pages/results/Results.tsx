import { useState } from "react";
import ResultsDashboard from "./ResultsDashboard";
import ResultsUpdate from "./ResultsUpdate";
import StudentResultExplorer from "./StudentResultExplorer";
import { 
  Layout, 
  ClipboardCheck, 
  Users, 
  BarChart3, 
  GraduationCap 
} from "lucide-react";

type TabKey = "dashboard" | "update" | "analysis" | "explorer";

const Results = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  const TABS: { key: TabKey; label: string }[] = [
    { key: "dashboard", label: "Results Dashboard" },
    { key: "update", label: "Results Update" },
    { key: "analysis", label: "Results Analysis" },
    { key: "explorer", label: "Student Result Explorer" },
  ];

  const STATS = [
    { label: "Total Appeared", value: "12", color: "blue", icon: Layout },
    { label: "Total Passed", value: "6 hrs", color: "green", icon: ClipboardCheck },
    { label: "Total Failed", value: "48", color: "red", icon: Users },
    { label: "Average Pass %", value: "90.8%", color: "indigo", icon: BarChart3 },
    { label: "Net Teaching Demand", value: "40 hrs", color: "sky", icon: GraduationCap },
  ];

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'blue': return { bg: 'bg-blue-50', icon: 'text-blue-500' };
      case 'green': return { bg: 'bg-green-50', icon: 'text-green-500' };
      case 'red': return { bg: 'bg-red-50', icon: 'text-red-500' };
      case 'indigo': return { bg: 'bg-indigo-50', icon: 'text-indigo-500' };
      case 'sky': return { bg: 'bg-sky-50', icon: 'text-sky-500' };
      default: return { bg: 'bg-gray-50', icon: 'text-gray-500' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Page Header */}
      <h1 className="text-2xl font-black text-gray-800 tracking-tight px-1">Results Management</h1>

      {/* Metrics Row - Only visible on Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATS.map(s => {
            const classes = getColorClasses(s.color);
            return (
              <div key={s.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                <div className={`p-4 ${classes.bg} rounded-xl`}>
                  <s.icon className={`w-6 h-6 ${classes.icon}`} />
                </div>
                <div className="flex flex-col min-w-0">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-tight truncate">{s.label}</span>
                   <span className="text-2xl font-black text-gray-800 leading-tight">
                      {s.value.split(' ')[0]} 
                      {s.value.includes(' ') && <span className="text-sm font-bold text-gray-400 ml-1">{s.value.split(' ')[1]}</span>}
                   </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Navigation in a white bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 px-6 gap-10 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                "pt-5 pb-4 text-sm font-bold transition-all whitespace-nowrap relative",
                activeTab === tab.key
                  ? "text-[#1D6BA3]"
                  : "text-gray-500 hover:text-gray-400",
              ].join(" ")}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D6BA3] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Rendering */}
      <div className="min-h-[600px]">
        {activeTab === "dashboard" && <ResultsDashboard />}
        {activeTab === "update" && <ResultsUpdate />}
        {activeTab === "explorer" && <StudentResultExplorer />}
        {activeTab === "analysis" && (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
             <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#1D6BA3]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
             </div>
             <p className="text-sm font-bold">Results Analysis</p>
             <p className="text-xs">Advanced analytical metrics coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
