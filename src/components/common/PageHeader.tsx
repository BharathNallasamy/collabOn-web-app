import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

/**
 * Standard page header with icon, title, subtitle, and optional action buttons.
 */
const PageHeader = ({ title, subtitle, icon, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl px-5 py-3.5 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-[#1D6BA3] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#1D6BA3]/20">
            <div className="text-white">{icon}</div>
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-gray-800 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2 ">{actions}</div>}
    </div>
  );
};

export default PageHeader;
