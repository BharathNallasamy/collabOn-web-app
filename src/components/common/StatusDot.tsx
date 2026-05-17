interface StatusDotProps {
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  label?: string;
  className?: string;
}

/**
 * Small indicator dot for statuses, often used in tables.
 */
const StatusDot = ({ variant = "neutral", label, className = "" }: StatusDotProps) => {
  const colors = {
    success: "bg-green-500",
    warning: "bg-amber-400",
    error: "bg-rose-500",
    info: "bg-blue-500",
    neutral: "bg-gray-400",
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${colors[variant]}`} />
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    </div>
  );
};

export default StatusDot;
