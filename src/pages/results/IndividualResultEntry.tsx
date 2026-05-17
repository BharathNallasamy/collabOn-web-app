import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";

// ── Custom Radio ─────────────────────────────────────────────────────────────
const CustomRadio = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <button type="button" onClick={onChange} className="flex items-center gap-2 group outline-none">
    <div className={["w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", 
      checked ? "border-[#1D6BA3]" : "border-gray-300 group-hover:border-gray-400"].join(" ")}>
      {checked && <div className="w-2.5 h-2.5 rounded-full bg-[#1D6BA3]" />}
    </div>
    <span className="text-sm font-semibold text-gray-700 uppercase tracking-tight">{label}</span>
  </button>
);

// ── Custom Dropdown ───────────────────────────────────────────────────────────
const FormDropdown = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 hover:border-gray-300 transition-colors outline-none focus:ring-2 focus:ring-[#1D6BA3]/10">
        <span>{value || label}</span>
        <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
          <ul className="py-1">
            {options.map(opt => (
              <li key={opt}>
                <button type="button" onClick={() => { onChange(opt); setOpen(false); }}
                  className={["w-full text-left px-4 py-2.5 text-sm transition-colors", 
                    opt === value ? "text-[#1D6BA3] font-semibold bg-[#EFF6FF]" : "text-gray-700 hover:bg-gray-50"].join(" ")}>
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

const IndividualResultEntry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    department: "",
    studentName: "",
    program: "UG",
    semester: 0,
    subject: "",
    examType: "",
    marks: "",
    grade: "",
    resultStatus: "Pass"
  });

  return (
    <div className="space-y-4 pb-20">
      <Card noPadding className="border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-400">Add Individual Results</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Row 1: Dept, Name, Program */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Department</label>
              <FormDropdown label="Select" value={formData.department} onChange={(v) => setFormData({...formData, department: v})} 
                options={["Computer Science", "Information Technology", "Bio Technology", "Chemistry"]} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Student Name / ID</label>
              <input type="text" placeholder="Enter Name" value={formData.studentName} onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Program</label>
              <div className="flex items-center gap-6 h-10">
                <CustomRadio label="UG" checked={formData.program === "UG"} onChange={() => setFormData({...formData, program: "UG"})} />
                <CustomRadio label="PG" checked={formData.program === "PG"} onChange={() => setFormData({...formData, program: "PG"})} />
              </div>
            </div>
          </div>

          {/* Row 2: Semester, Subject, Exam Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Semester</label>
              <input type="number" placeholder="0" value={formData.semester} onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Subject</label>
              <input type="text" placeholder="Enter Name" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Exam Type</label>
              <FormDropdown label="Select" value={formData.examType} onChange={(v) => setFormData({...formData, examType: v})}
                options={["Internal Exams", "External Exams", "Mid-Semester Exams", "Practical Exams / Lab Exams", "Arrear Exams"]} />
            </div>
          </div>

          <div className="border-t border-dashed border-gray-100 my-6" />

          {/* Row 3: Marks, Grade, Result Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Marks</label>
              <input type="text" placeholder="0 - 100 Enter" value={formData.marks} onChange={(e) => setFormData({...formData, marks: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Grade</label>
              <FormDropdown label="Select" value={formData.grade} onChange={(v) => setFormData({...formData, grade: v})}
                options={["A", "B+", "C", "D", "E"]} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Results</label>
              <div className="flex items-center gap-6 h-10">
                <CustomRadio label="Pass" checked={formData.resultStatus === "Pass"} onChange={() => setFormData({...formData, resultStatus: "Pass"})} />
                <CustomRadio label="Fail" checked={formData.resultStatus === "Fail"} onChange={() => setFormData({...formData, resultStatus: "Fail"})} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="ghost" className="border border-[#1D6BA3] text-[#1D6BA3] h-10 px-6 font-semibold" onClick={() => navigate("/layout/results")}>Cancel</Button>
          <Button variant="ghost" className="border border-[#1D6BA3] text-[#1D6BA3] h-10 px-6 font-semibold">Save Draft</Button>
          <Button variant="primary" className="bg-[#1D6BA3] hover:bg-[#1A5F91] h-10 px-8 font-semibold" onClick={() => navigate("/layout/results")}>Submit</Button>
        </div>
      </Card>
    </div>
  );
};

export default IndividualResultEntry;
