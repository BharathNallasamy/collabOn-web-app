import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users2,
  ClipboardList,
  UserCog,
  BarChart2,
  Headphones,
  Settings,
  ChevronRight,
} from "lucide-react";

const FINANCE_SUB_ITEMS = [
  { label: "Service Invoice", path: "/super-admin/finance/service-invoice" },
  { label: "Payment Report", path: "/super-admin/finance/payment-report" },
  { label: "Expenses", path: "/super-admin/finance/expenses" },
];

const NAV_ITEMS = [
  { label: "Dashboard", path: "/super-admin", end: true, Icon: LayoutDashboard },
  { label: "CRM", path: "/super-admin/crm", end: false, Icon: Users2 },
  { label: "Registrations", path: "/super-admin/registrations", end: false, Icon: ClipboardList },
  { label: "User Management", path: "/super-admin/user-management", end: false, Icon: UserCog },
  { label: "Finance", path: "/super-admin/finance", end: false, Icon: BarChart2, hasSubmenu: true },
  { label: "Support Ticket", path: "/super-admin/support", end: false, Icon: Headphones },
  { label: "Reports", path: "/super-admin/reports", end: false, Icon: BarChart2 },
  { label: "Settings", path: "/super-admin/settings", end: false, Icon: Settings },
] as const;

const SuperAdminSidebar = () => {
  const [openFlyout, setOpenFlyout] = useState<string | null>(null);
  const [flyoutTop, setFlyoutTop] = useState(0);
  const financeBtnRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const currentPath = location.pathname;

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!openFlyout) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!flyoutRef.current?.contains(target) && !financeBtnRef.current?.contains(target)) {
        setOpenFlyout(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openFlyout]);

  const handleToggleFlyout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (openFlyout === "finance") {
      setOpenFlyout(null);
      return;
    }
    if (financeBtnRef.current) {
      const rect = financeBtnRef.current.getBoundingClientRect();
      setFlyoutTop(rect.top);
    }
    setOpenFlyout("finance");
  };

  return (
    <div className="relative flex">
      <div className="w-24 flex-shrink-0 h-screen bg-[#1D6BA3] flex flex-col overflow-hidden z-40">
        {/* Logo */}
        <div className="flex flex-col items-center pt-7 pb-4 px-2 flex-shrink-0">
          <svg viewBox="0 0 132 84" className="w-[74px] h-[46px]" role="img" aria-label="CollabOn">
            <path
              d="M56 14a26 26 0 1 0 0 52"
              fill="none"
              stroke="white"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <circle cx="88" cy="40" r="23.5" fill="white" />
          </svg>
          <span className="text-white text-[13px] font-normal leading-none mt-0.5 tracking-tight">
            CollabOn
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 w-full px-2 space-y-0.5 overflow-y-auto pt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = item.end 
              ? currentPath === item.path 
              : currentPath.startsWith(item.path);

            if (item.label === "Finance") {
              return (
                <div key={item.path} ref={financeBtnRef} className="relative">
                  <button
                    onClick={handleToggleFlyout}
                    title={item.label}
                    className={[
                      "flex flex-col items-center w-full py-1 rounded-lg transition-colors",
                      isActive || openFlyout === "finance" ? "bg-white/10" : "hover:bg-white/5",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "w-11 h-9 flex items-center justify-center rounded-xl transition-all duration-150",
                        isActive ? "bg-white text-[#1D6BA3]" : "bg-white/10 text-white",
                      ].join(" ")}
                    >
                      <item.Icon size={20} />
                    </div>
                    <span
                      className={[
                        "text-[10px] font-medium leading-tight text-center mt-0.5",
                        isActive ? "text-white" : "text-white/70",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>
                  </button>
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                title={item.label}
                className="flex flex-col items-center w-full py-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={[
                        "w-11 h-9 flex items-center justify-center rounded-xl transition-all duration-150",
                        isActive ? "bg-white text-[#1D6BA3]" : "bg-white/10 text-white",
                      ].join(" ")}
                    >
                      <item.Icon size={20} />
                    </div>
                    <span
                      className={[
                        "text-[10px] font-medium leading-tight text-center mt-0.5",
                        isActive ? "text-white" : "text-white/70",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Flyout Submenu */}
      {openFlyout === "finance" && (
        <div
          ref={flyoutRef}
          style={{ position: "fixed", left: 96, top: Math.max(10, flyoutTop) }}
          className="z-50 drop-shadow-2xl animate-in slide-in-from-left-2 duration-200"
        >
          <div className="w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="text-[14px] font-bold text-gray-900">Finance</h3>
            </div>
            <ul className="py-2">
              {FINANCE_SUB_ITEMS.map((subItem) => (
                <li key={subItem.path}>
                  <NavLink
                    to={subItem.path}
                    onClick={() => setOpenFlyout(null)}
                    className={({ isActive }) =>
                      [
                        "flex items-center justify-between px-5 py-2.5 text-[13px] font-medium transition-all group",
                        isActive
                          ? "bg-[#1D6BA3]/5 text-[#1D6BA3]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#1D6BA3]",
                      ].join(" ")
                    }
                  >
                    <span>{subItem.label}</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSidebar;
