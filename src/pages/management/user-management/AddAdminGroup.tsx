import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Button from "../../../components/common/Button/Button";
import { useGroups } from "../../../contexts/GroupsContext";
import {
  RIGHTS_MODULES,
  REPORT_MODULES,
  SHOW_ONLY_MODULES,
  makeDefaultPerms,
  type PermMap,
} from "../../../types/groups";



const PermTable = ({
  modules,
  perms,
  setPerms,
  col1Label,
  col2Label,
}: {
  modules: string[];
  perms: PermMap;
  setPerms: (p: PermMap) => void;
  col1Label: string;
  col2Label: string;
}) => {
  const allChecked = modules.every((m) => {
    const isShowOnly = SHOW_ONLY_MODULES.includes(m);
    return isShowOnly ? perms[m].col1 : perms[m].col1 && perms[m].col2;
  });

  const toggle = (module: string, col: "col1" | "col2") =>
    setPerms({ ...perms, [module]: { ...perms[module], [col]: !perms[module][col] } });

  const selectAll = () => {
    const next = !allChecked;
    setPerms(
      Object.fromEntries(
        modules.map((m) => [
          m,
          { col1: next, col2: SHOW_ONLY_MODULES.includes(m) ? false : next },
        ])
      )
    );
  };

  return (
    <div className="border border-[#D1E4FA] rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="flex items-center gap-3 px-5 py-3 bg-[#EAF2FC] border-b border-[#D1E4FA]">
        <input
          type="checkbox"
          id={`select-all-${col1Label}`}
          checked={allChecked}
          onChange={selectAll}
          className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/20 cursor-pointer"
        />
        <label
          htmlFor={`select-all-${col1Label}`}
          className="text-[13px] font-bold text-gray-700 cursor-pointer"
        >
          Select All
        </label>
      </div>
      <div className="divide-y divide-gray-100">
        {modules.map((module) => {
          const isShowOnly = SHOW_ONLY_MODULES.includes(module);
          return (
            <div
              key={module}
              className="flex items-center px-5 py-3.5 hover:bg-gray-50/50 transition-colors group"
            >
              <span className="flex-1 text-[13px] font-medium text-gray-600 group-hover:text-[#1D6BA3] transition-colors">
                {module}
              </span>
              <div className="flex gap-10 min-w-[240px] justify-end">
                <label className="flex items-center gap-3 cursor-pointer group/label">
                  <input
                    type="checkbox"
                    checked={perms[module].col1}
                    onChange={() => toggle(module, "col1")}
                    className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/20"
                  />
                  <span className="text-[13px] font-bold text-gray-600 group-hover/label:text-gray-900 min-w-[40px]">
                    {isShowOnly ? "Show" : col1Label}
                  </span>
                </label>
                {!isShowOnly && (
                  <label className="flex items-center gap-3 cursor-pointer group/label">
                    <input
                      type="checkbox"
                      checked={perms[module].col2}
                      onChange={() => toggle(module, "col2")}
                      className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3]/20"
                    />
                    <span className="text-[13px] font-bold text-gray-600 group-hover/label:text-gray-900 min-w-[40px]">
                      {col2Label}
                    </span>
                  </label>
                )}
                {isShowOnly && <div className="w-[73px]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AddAdminGroup = () => {
  const navigate = useNavigate();
  const { setGroups } = useGroups();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [activeTab, setActiveTab] = useState<"rights" | "report">("rights");
  const [rightsPerms, setRightsPerms] = useState<PermMap>(makeDefaultPerms(RIGHTS_MODULES));
  const [reportPerms, setReportPerms] = useState<PermMap>(makeDefaultPerms(REPORT_MODULES));

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setGroups((prev) => [
      { id: Date.now(), name: name.trim(), rightsPerms, reportPerms },
      ...prev,
    ]);
    navigate("/layout/user-management/group-access");
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]/50 -m-6 p-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl font-semibold text-[#1e293b]">Add Admin Group</h1>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="max-w-xl">
              <label className="block text-[13px] font-bold text-gray-800 mb-3">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(false);
                }}
                className={[
                  "w-full h-12 px-5 text-sm border rounded-xl bg-gray-50/30 focus:outline-none focus:ring-4 focus:ring-[#1D6BA3]/5 focus:border-[#1D6BA3] transition-all placeholder:text-gray-400 font-medium",
                  nameError ? "border-red-400 ring-red-50 bg-red-50/10" : "border-gray-200",
                ].join(" ")}
              />
              {nameError && (
                <p className="mt-2 text-[12px] font-bold text-red-500 ml-1">Name is required.</p>
              )}
            </div>

            <div className="border-b border-gray-200">
              <div className="flex gap-12">
                {(["rights", "report"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={[
                      "pb-4 px-2 text-sm font-semibold transition-all relative border-b-2",
                      activeTab === tab
                        ? "border-[#1D6BA3] text-black"
                        : "border-transparent text-gray-400 hover:text-gray-600",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-1.5">
                      {tab === "rights" ? "Rights" : "Report Rights"}
                      <span className="text-red-500 font-black">*</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-6">
                {activeTab === "rights" ? (
                  <PermTable
                    modules={RIGHTS_MODULES}
                    perms={rightsPerms}
                    setPerms={setRightsPerms}
                    col1Label="Read"
                    col2Label="Write"
                  />
                ) : (
                  <PermTable
                    modules={REPORT_MODULES}
                    perms={reportPerms}
                    setPerms={setReportPerms}
                    col1Label="Show"
                    col2Label="Export"
                  />
                )}
            </div>
            <div className="pt-8 flex justify-end gap-4 border-t border-gray-100 mt-8">
              <button
                onClick={() => navigate(-1)}
                className="px-8 py-2.5 text-[13px] font-semibold text-[#1D6BA3] border border-[#1D6BA3] rounded-xl hover:bg-blue-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="px-10 py-2.5 h-auto bg-[#1D6BA3] hover:bg-[#155280] text-white font-semibold rounded-xl shadow-lg shadow-blue-600/10 transition-all active:scale-95"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdminGroup;
