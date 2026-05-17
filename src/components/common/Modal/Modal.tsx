import { type ReactNode, useState, useEffect } from "react";
import Card from "../Card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "custom";
}

/**
 * Enhanced Modal component with animations and better UX.
 */
const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }: ModalProps) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setShouldRender(true);
    } else {
      setIsAnimating(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else if (shouldRender) {
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-7xl",
    full: "max-w-[95%]",
    custom: "max-w-[65%]",
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300  ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      <Card
        noPadding
        className={`${sizes[size]} w-full max-h-[85vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-white border-none ${
          isAnimating ? "animate-zoom-in" : "animate-zoom-out"
        }`}
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-8 py-6 overflow-y-auto flex-1 custom-scrollbar">{children}</div>

        {footer && (
          <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Modal;
