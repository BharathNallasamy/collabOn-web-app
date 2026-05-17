import { useState } from "react";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip,
} from "recharts";
import {
  Building2, Activity, UserPlus, Layers, UserMinus, TrendingUp,
  Calendar, Info,
} from "lucide-react";
import Card from "../../../components/common/Card";
import Badge from "../../../components/common/Badge";
import { type KpiCard, type PipelineRow } from "../../../types/interfaces";
import {
  SEED_SA_KPI_DATA,
  SEED_SA_PLAN_DATA,
  SEED_SA_ENGAGEMENT_METRICS,
  SEED_SA_GROWTH_FUNNEL,
  SEED_SA_SUPPORT_STATS,
  SEED_SA_SUPPORT_CATEGORIES,
  SEED_SA_EXPIRY_RISK,
  SEED_SA_ACTIVE_PIPELINE
} from "../../../types/mockData";

type PlanToggle = "Paid" | "Unpaid";

// ── Seed Data (swap with API when backend ready) ───────────────────────────

const KPI_WITH_ICONS = SEED_SA_KPI_DATA.map((kpi, idx) => ({
  ...kpi,
  icon: [
    <Building2 size={17} />,
    <Activity size={17} />,
    <UserPlus size={17} />,
    <Layers size={17} />,
    <UserMinus size={17} />,
    <TrendingUp size={17} />
  ][idx]
}));

// ── Shared Recharts tooltip style (mirrors Overview.tsx pattern) ───────────
const TooltipStyle: React.CSSProperties = {
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontSize: "12px",
};

// ── Section title (mirrors Overview.tsx SectionTitle) ─────────────────────
const SectionTitle = ({
  title, sub, action,
}: {
  title: string; sub?: string; action?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <p className="text-[13px] font-semibold text-gray-800 leading-tight">{title}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {action && <div className="flex-shrink-0 ml-2">{action}</div>}
  </div>
);

// ── Donut center label (mirrors Overview.tsx DonutCenter) ─────────────────
const DonutCenter = ({ value, label }: { value: string; label: string }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="text-center">
      <p className="text-xl font-bold text-gray-800 leading-tight">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  </div>
);

// ── Native <select> filter (mirrors Overview.tsx FilterSelect) ────────────
const FilterSelect = ({
  value, onChange, children, prefixIcon,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  prefixIcon?: React.ReactNode;
}) => (
  <div className="relative flex items-center">
    {prefixIcon && (
      <span className="absolute left-2.5 text-gray-400 pointer-events-none flex items-center">
        {prefixIcon}
      </span>
    )}
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`h-9 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1D6BA3] appearance-none cursor-pointer pr-7 ${prefixIcon ? "pl-8" : "pl-3"}`}
    >
      {children}
    </select>
    <svg className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

// ── KPI stat card ──────────────────────────────────────────────────────────
const KpiStatCard = ({ item }: { item: KpiCard }) => (
  <Card noPadding className="flex min-h-[94px] flex-col justify-between rounded-lg p-3">
    <div className="flex items-center justify-between">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg} ${item.iconColor}`}>
        {item.icon}
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
        item.changeUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
      }`}>
        {item.changeUp ? "↑" : "↓"} {item.change}
      </span>
    </div>
    <div>
      <p className="text-[11px] text-gray-600 font-semibold leading-none">{item.label}</p>
      <div className="flex items-baseline gap-1.5 mt-2">
        <p className="text-[14px] font-bold text-gray-900 leading-tight">{item.value}</p>
        {item.sub && <span className="text-[10px] font-semibold text-gray-500">{item.sub}</span>}
      </div>
    </div>
  </Card>
);

// ── Pipeline status badge (maps to Badge variants) ─────────────────────────
const PIPELINE_BADGE_VARIANT: Record<PipelineRow["status"], React.ComponentProps<typeof Badge>["variant"]> = {
  "Negotiation":  "info",
  "Trial Active": "success",
  "Hold":         "warning",
  "New":          "neutral",
};

const StatusBadge = ({ status }: { status: PipelineRow["status"] }) => (
  <Badge variant={PIPELINE_BADGE_VARIANT[status]} pill>
    {status}
  </Badge>
);

// ── Days-remaining badge for expiry table ─────────────────────────────────
const DaysBadge = ({ days }: { days: number }) => (
  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1D6BA3]">
    {days} Days
  </span>
);

// ── Progress bar row ───────────────────────────────────────────────────────
const ProgressRow = ({ label, pct, color }: { label: string; pct: number; color: string }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[12px] text-gray-600 font-medium">{label}</span>
      <span className="text-[12px] font-bold text-gray-800">{pct}%</span>
    </div>
    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

// ── Table header cell ──────────────────────────────────────────────────────
const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
    {children}
  </th>
);

// ═══════════════════════════════════════════════════════════════════════════
// Super Admin — College Dashboard
// ═══════════════════════════════════════════════════════════════════════════
const SuperAdminDashboard = () => {
  const [category,   setCategory]  = useState("");
  const [plan,       setPlan]      = useState("");
  const [dateRange,  setDateRange] = useState("last30");
  const [planView,   setPlanView]  = useState<PlanToggle>("Paid");
  const [isExporting, setIsExporting] = useState(false);

  const currentPlanSlices = SEED_SA_PLAN_DATA[planView];

  const handleExport = () => {
    setIsExporting(true);
    const wb   = XLSX.utils.book_new();
    const today = new Date().toLocaleDateString("en-IN");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["College Dashboard Export — CollabOn Super Admin"],
      [`Report Date: ${today}`],
      [],
      ["KPI METRICS"],
      ["Metric", "Value", "Change"],
      ...KPI_WITH_ICONS.map((k: KpiCard) => [k.label, k.value, `${k.changeUp ? "+" : "-"}${k.change}`]),
    ]), "KPI Metrics");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["PLAN DISTRIBUTION"],
      ["Plan", "Percentage"],
      ...currentPlanSlices.map(p => [p.name, `${p.value}%`]),
    ]), "Plan Distribution");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["EXPIRY RISK — NEXT 15 DAYS"],
      ["Institution", "Type", "Location", "Plan", "Expiry Date", "Days Remaining"],
      ...SEED_SA_EXPIRY_RISK.map(r => [r.institution, r.type, r.location, r.plan, r.expiry, r.days]),
    ]), "Expiry Risk");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["ACTIVE PIPELINE"],
      ["Prospect", "Source", "Engagement Model", "Exp. Revenue", "Status"],
      ...SEED_SA_ACTIVE_PIPELINE.map(r => [r.prospect, r.source, r.engagementModel, r.revenue, r.status]),
    ]), "Active Pipeline");

    XLSX.writeFile(wb, `SuperAdmin_Dashboard_${today.replaceAll("/", "-")}.xlsx`);
    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#dbeaf2]">
      <div className="flex-shrink-0 space-y-4 p-4 pb-5">
      {/* ── Sticky zone: title + filters + KPI tiles (never scrolls) ───── */}
      {/* -mx-6 -mt-6 cancels parent p-6 so the block spans edge-to-edge   */}
      <div className="rounded-md border border-gray-200 bg-white px-3 py-3 shadow-sm">

        {/* Title row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[15px] font-semibold text-gray-900">College Dashboard</h1>

          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect value={category} onChange={setCategory}>
              <option value="">All Institution Category</option>
              <option>School</option>
              <option>College</option>
              <option>Polytechnic College</option>
              <option>University</option>
              <option>Training Institute</option>
              <option>PlaySchool</option>
            </FilterSelect>

            <FilterSelect value={plan} onChange={setPlan}>
              <option value="">All Plans</option>
              <option>Starter</option>
              <option>Growth</option>
              <option>Enterprise</option>
            </FilterSelect>

            <FilterSelect
              value={dateRange}
              onChange={setDateRange}
              prefixIcon={<Calendar size={13} />}
            >
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="custom">Custom Date Range</option>
            </FilterSelect>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="hidden h-9 px-3 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Exporting…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </>
              )}
            </button>
          </div>
        </div>

        {/* Six KPI tiles — static, never scroll */}
        <div className="hidden">
          {KPI_WITH_ICONS.map(k => <KpiStatCard key={k.label} item={k} />)}
        </div>

      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {KPI_WITH_ICONS.map(k => <KpiStatCard key={k.label} item={k} />)}
      </div>
      </div>

      {/* ── Scrollable content — flows below the sticky zone ─────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
      <div className="flex flex-col gap-4">

      {/* ── Plan Distribution + Engagement Metrics ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Plan Distribution donut */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-gray-800">Plan Distribution</p>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              {(["Paid", "Unpaid"] as PlanToggle[]).map(t => (
                <button
                  key={t}
                  onClick={() => setPlanView(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    planView === t
                      ? "bg-[#1D6BA3] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Donut */}
            <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentPlanSlices}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={74}
                    dataKey="value"
                    startAngle={90} endAngle={-270}
                    paddingAngle={2}
                  >
                    {currentPlanSlices.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TooltipStyle} formatter={v => [`${Number(v)}%`]} />
                </PieChart>
              </ResponsiveContainer>
              <DonutCenter value="1.2k" label="Total" />
            </div>

            {/* Legend */}
            <div className="space-y-3.5 flex-1">
              {currentPlanSlices.map(d => (
                <div key={d.name} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-[12px] text-gray-600 flex-1">{d.name}</span>
                  <span className="text-[13px] font-bold text-gray-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <SectionTitle title="Engagement Metrics" />
          <div className="space-y-5 mt-1">
            {SEED_SA_ENGAGEMENT_METRICS.map(m => (
              <ProgressRow key={m.label} label={m.label} pct={m.pct} color={m.color} />
            ))}
          </div>
        </Card>
      </div>

      {/* ── Growth Funnel + Support Ops ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Growth Funnel */}
        <Card>
          <SectionTitle title="Growth Funnel" />
          <div className="space-y-1 mt-1">
            {SEED_SA_GROWTH_FUNNEL.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                  i % 2 === 0 ? "bg-green-50/50" : "bg-white"
                }`}
              >
                <span className="text-[13px] font-medium text-gray-700">{item.label}</span>
                <span className="text-[13px] font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Support Ops */}
        <Card>
          <SectionTitle title="Support Ops" />

          {/* Top stat trio */}
          <div className="grid grid-cols-3 gap-2 mb-5 pb-5 border-b border-gray-100">
            <div className="text-center">
              <p className="text-[22px] font-bold text-gray-800 leading-tight">{SEED_SA_SUPPORT_STATS.openTickets}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Open Ticket</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-[22px] font-bold text-gray-800 leading-tight">{SEED_SA_SUPPORT_STATS.avgResolution}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Avg Resolution</p>
            </div>
            <div className="text-center">
              <p className="text-[22px] font-bold text-red-500 leading-tight">{SEED_SA_SUPPORT_STATS.escalated}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Escalated</p>
            </div>
          </div>

          {/* Category bars */}
          <div className="space-y-3">
            {SEED_SA_SUPPORT_CATEGORIES.map(c => (
              <ProgressRow key={c.label} label={c.label} pct={c.pct} color={c.color} />
            ))}
          </div>
        </Card>
      </div>

      {/* ── Expiry Risk Table ─────────────────────────────────────────────── */}
      <Card noPadding className="p-4">
        {/* Section header as a callout box */}
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50/60 p-4 border border-red-100 border-l-4 border-red-500">
          <Info size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-[13px] font-bold text-red-500">Expiry Risk (Next 15 Days)</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50/50 border-b border-gray-100">
                <TH>Institution Name</TH>
                <TH>Institution Type</TH>
                <TH>Location</TH>
                <TH>Plan</TH>
                <TH>Expiry Date</TH>
                <TH>Days</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {SEED_SA_EXPIRY_RISK.map(row => (
                <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-gray-800">{row.institution}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">{row.type}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">{row.location}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">{row.plan}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">{row.expiry}</td>
                  <td className="px-5 py-3.5">
                    <DaysBadge days={row.days} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Active Pipeline Table ─────────────────────────────────────────── */}
      <Card noPadding className="p-4">
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-[13px] font-bold text-gray-800">Active Pipeline</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50/50 border-b border-gray-100">
                <TH>Prospect</TH>
                <TH>Source</TH>
                <TH>Engagement Model</TH>
                <TH>Exp. Revenue</TH>
                <TH>Status</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SEED_SA_ACTIVE_PIPELINE.map(row => (
                <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-gray-800">{row.prospect}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">{row.source}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">{row.engagementModel}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-gray-800">{row.revenue}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      </div>{/* end scrollable content */}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
