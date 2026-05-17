import { type ReactNode } from "react";
import Card from "./Card";

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: "vertical" | "horizontal";
  layout?: "value-first" | "label-first";
  bgClassName?: string;
  iconColorClassName?: string;
  valueColorClassName?: string;
  className?: string;
}

/**
 * Specialized card for displaying key performance indicators and statistics.
 */
const StatsCard = ({
  label,
  value,
  subValue,
  icon,
  trend,
  variant = "vertical",
  layout = "value-first",
  bgClassName = "bg-[#1D6BA3]/10",
  iconColorClassName = "text-[#1D6BA3]",
  valueColorClassName = "text-gray-900",
  className = "",
}: StatsCardProps) => {
  if (variant === "horizontal") {
    return (
      <Card className={`flex items-center gap-4 px-5 py-4 flex-1 min-w-0 ${className}`}>
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${bgClassName} ${iconColorClassName}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          {layout === "label-first" ? (
            <>
              <p className="text-xs text-gray-500 font-medium leading-tight">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${valueColorClassName}`}>{value}</p>
            </>
          ) : (
            <>
              <p className={`text-2xl font-bold leading-none ${valueColorClassName}`}>{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1 leading-tight">{label}</p>
            </>
          )}
          {subValue && <p className="text-xs text-gray-500 mt-0.5 truncate">{subValue}</p>}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`flex items-start justify-between ${className}`}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-1 truncate">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-bold ${valueColorClassName}`}>{value}</p>
          {trend && (
            <span
              className={`text-[10px] font-bold ${trend.isPositive ? "text-green-600" : "text-rose-600"}`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
        {subValue && <p className="text-xs font-medium text-gray-500 mt-1 truncate">{subValue}</p>}
      </div>

      {icon && (
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${bgClassName} ${iconColorClassName}`}
        >
          {icon}
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
