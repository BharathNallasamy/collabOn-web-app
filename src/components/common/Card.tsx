import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Common Card component with consistent shadow and rounded corners.
 */
const Card = ({ children, className = "", noPadding = false }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${
        !noPadding ? "p-5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
