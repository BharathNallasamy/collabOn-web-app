import { Fragment } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIdx: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage, totalPages, totalItems, startIdx, itemsPerPage, onPageChange,
}: PaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-700">{totalItems > 0 ? startIdx + 1 : 0}</span> To{" "}
        <span className="font-semibold text-gray-700">{Math.min(startIdx + itemsPerPage, totalItems)}</span> Of{" "}
        <span className="font-semibold text-gray-700">{totalItems}</span> Results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Previous
        </button>
        {pages.map((page, i) => {
          const prev = pages[i - 1];
          return (
            <Fragment key={page}>
              {prev !== undefined && page - prev > 1 && (
                <span className="px-1 text-xs text-gray-400">…</span>
              )}
              <button
                onClick={() => onPageChange(page)}
                className={[
                  "w-7 h-7 text-xs rounded-md font-medium transition-colors",
                  page === currentPage ? "bg-[#1D6BA3] text-white" : "text-gray-600 hover:bg-gray-100",
                ].join(" ")}>
                {page}
              </button>
            </Fragment>
          );
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
