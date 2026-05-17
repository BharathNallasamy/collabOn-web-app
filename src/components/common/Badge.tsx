import { type ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  pill?: boolean;
}

/**
 * Reusable Badge component for status labels and tags.
 */
const Badge = ({ children, variant = "neutral", className = "", pill = false }: BadgeProps) => {
  const variants: Record<BadgeVariant, string> = {
    success: "bg-green-50 text-green-700 border-green-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-rose-50 text-rose-700 border-rose-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    neutral: "bg-gray-50 text-gray-700 border-gray-100",
  };

  return (
    <span
      className={`
      inline-flex items-center px-2.5 py-0.5 border text-xs font-semibold
      ${pill ? "rounded-full" : "rounded-md"}
      ${variants[variant]}
      ${className}
    `}
    >
      {children}
    </span>
  );
};

export default Badge;
