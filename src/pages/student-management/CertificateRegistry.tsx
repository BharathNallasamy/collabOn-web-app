import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";
import { ITEMS_PER_PAGE, DEPARTMENTS, PROGRAM_TYPES } from "../../constants";
import { DocumentIcon } from "../../components/common/Icons/PageIcons";

// ── Types ─────────────────────────────────────────────────────────────────────
import { type CertRecord } from "../../types/interfaces";
import { SEED_CERTS } from "../../types/mockData";


const CERT_TABS = [
  "All Certificates",
  "Transfer Certificate",
  "Course Completion Certificate",
  "Bonafide Certificate",
  "Conduct Certificate",
  "Medium Certificate",
] as const;

const TAB_FILTER_MAP: Record<string, string> = {
  "Transfer Certificate": "Transfer",
  "Course Completion Certificate": "Course Completion",
  "Bonafide Certificate": "Bonafide",
  "Conduct Certificate": "Conduct",
  "Medium Certificate": "Medium",
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={[
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border",
      status === "Active"
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-red-50 text-red-600 border-red-200",
    ].join(" ")}
  >
    {status}
  </span>
);


// ── Select helper ─────────────────────────────────────────────────────────────
const FilterSelect = ({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none h-9 pl-3 pr-7 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);


// ── Main Component ────────────────────────────────────────────────────────────
const CertificateRegistry = () => {
  const navigate = useNavigate();

  const [certs] = useState<CertRecord[]>(SEED_CERTS);
  const [activeTab, setActiveTab] = useState<string>("All Certificates");
  const [batchFilter, setBatchFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [searchName, setSearchName] = useState("");
  const [page, setPage] = useState(1);

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchName.toLowerCase();
    return certs.filter((c) => {
      if (activeTab !== "All Certificates" && c.certType !== TAB_FILTER_MAP[activeTab]) return false;
      if (batchFilter && c.batch !== batchFilter) return false;
      if (programFilter && c.programType !== programFilter) return false;
      if (deptFilter && c.department !== deptFilter) return false;
      if (q && !c.studentName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeTab, batchFilter, programFilter, deptFilter, searchName]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleClear = () => {
    setBatchFilter("");
    setProgramFilter("");
    setDeptFilter("");
    setSearchName("");
    setPage(1);
  };

  const BATCHES = ["2022-2026", "2023-2025", "2023-2026", "2024-2027", "2024-2028"];

  return (
    <>
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-800">Certificate Registry</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{filtered.length} certificates found</p>
          </div>
          <button
            onClick={() => navigate("/layout/student-management/certificate-registry/issue")}
            className="h-8 px-4 rounded-lg bg-[#1D6BA3] text-white text-[12px] font-semibold hover:bg-[#1558a0] flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + Issue Certificate
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          <FilterSelect value={batchFilter} onChange={(v) => { setBatchFilter(v); setPage(1); }} options={BATCHES} placeholder="Batches" />
          <FilterSelect value={programFilter} onChange={(v) => { setProgramFilter(v); setPage(1); }} options={[...PROGRAM_TYPES]} placeholder="Program Type" />
          <FilterSelect value={deptFilter} onChange={(v) => { setDeptFilter(v); setPage(1); }} options={[...DEPARTMENTS]} placeholder="Department" />
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={searchName}
              onChange={(e) => { setSearchName(e.target.value); setPage(1); }}
              placeholder="Search by Name"
              className="h-9 pl-8 pr-8 w-full rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]"
            />
            {searchName && (
              <button onClick={() => { setSearchName(""); setPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setPage(1)}
            className="h-9 px-4 rounded-lg bg-[#1D6BA3] text-white text-[12px] font-semibold hover:bg-[#1558a0] transition-colors"
          >
            Search
          </button>
          <button
            onClick={handleClear}
            className="h-9 px-4 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {CERT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={[
                "px-4 py-3 text-[12px] font-medium whitespace-nowrap transition-all duration-150 border-b-2 flex-shrink-0",
                activeTab === tab
                  ? "border-[#1D6BA3] text-[#1D6BA3]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[12px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Certificates Type", "Certificate Number", "Student Name", "Roll Number", "Admission Number", "Department", "Issue Date", "Issue By", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-[11px] text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-gray-400 text-sm">No certificates found.</td>
                </tr>
              ) : (
                paginated.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <td className="px-4 py-3 text-gray-800 text-[12px]">{c.certType}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{c.certNo}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{c.studentName}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.rollNo}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.admissionNo}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.department}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.issueDate}</td>
                    <td className="px-4 py-3 text-gray-600">{c.issuedBy}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/layout/student-management/certificate-registry/issue?cert=${c.id}`)}
                          title="View / Reprint"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1D6BA3]/10 text-[#1D6BA3] transition-colors"
                        >
                          <DocumentIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filtered.length}
          startIdx={(page - 1) * ITEMS_PER_PAGE}
        />
      </div>
    </div>

</>
  );
};

export default CertificateRegistry;
