import { type ReactNode, type CSSProperties } from "react";
import { SearchIcon, ChevronDownIcon } from "../Icons";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  stickyRight?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  searchable?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showPagination?: boolean;
  containerClassName?: string;
  tableClassName?: string;
  tableStyle?: CSSProperties;
  headerRowClassName?: string;
  bodyRowClassName?: (item: T) => string;
}

/**
 * Reusable Data Table Component
 * Supports pagination, search, sorting, and custom rendering
 */
export function DataTable<T extends object>({
  data,
  columns,
  onRowClick,
  emptyMessage = "No data available",
  isLoading = false,
  pagination,
  showPagination = true,
  searchable = false,
  onSearch,
  searchPlaceholder = "Search...",
  containerClassName = "",
  tableClassName = "",
  tableStyle,
  headerRowClassName = "bg-[#EBF5FB]",
  bodyRowClassName,
}: DataTableProps<T>) {
  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }
    return String((item as Record<string, unknown>)[column.key] ?? "");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D6BA3]"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search Bar */}
      {searchable && onSearch && (
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] sm:text-sm transition-all"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`overflow-x-auto relative ${containerClassName}`}>
        <table className={`min-w-full divide-y divide-gray-100 border-separate border-spacing-0 ${tableClassName}`} style={tableStyle}>
          <thead className={headerRowClassName}>
            <tr className="border-b border-gray-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`py-4 text-left text-[13px] font-bold whitespace-nowrap ${
                    column.stickyRight
                      ? "sticky right-0 z-30 bg-blue-50 px-4 text-center !text-gray-400"
                      : "px-6 text-gray-700"
                  } ${column.className || ""}`}
                  style={column.stickyRight ? { boxShadow: "-1px 0 0 0 #e5e7eb, -8px 0 8px -4px rgba(0,0,0,0.06)" } : undefined}
                >
                  <div className={`flex items-center gap-2 ${column.stickyRight ? "justify-center" : ""}`}>
                    {column.header}
                    {column.sortable && <ChevronDownIcon size={14} className="text-gray-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-[13px] text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(item)}
                  className={`${
                    onRowClick ? "cursor-pointer hover:bg-gray-50/50" : "hover:bg-gray-50/50"
                  } transition-colors group ${bodyRowClassName ? bodyRowClassName(item) : ""}`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`py-5 text-[13px] text-gray-600 whitespace-nowrap ${
                        column.stickyRight
                          ? "sticky right-0 z-20 bg-white group-hover:bg-gray-50 transition-colors px-4 text-center"
                          : "px-6"
                      } ${column.className || ""}`}
                      style={column.stickyRight ? { boxShadow: "-1px 0 0 0 #e5e7eb, -8px 0 8px -4px rgba(0,0,0,0.06)" } : undefined}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination &&
        pagination &&
        (pagination.totalPages > 1 || pagination.total > data.length) && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <div className="text-[12px] font-medium text-gray-500">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {(pagination.currentPage - 1) * pagination.pageSize + 1}
              </span>{" "}
              To{" "}
              <span className="font-bold text-gray-900">
                {Math.min(
                  (pagination.currentPage - 1) * pagination.pageSize + data.length,
                  pagination.total
                )}
              </span>{" "}
              Of <span className="font-bold text-gray-900">{pagination.total}</span> Results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {(() => {
                  const pages: (number | string)[] = [];
                  const { currentPage, totalPages } = pagination;

                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push("...");

                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);

                    for (let i = start; i <= end; i++) pages.push(i);

                    if (currentPage < totalPages - 2) pages.push("...");
                    pages.push(totalPages);
                  }

                  return pages.map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof page === "number" && pagination.onPageChange(page)}
                      disabled={typeof page !== "number"}
                      className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-colors ${
                        page === currentPage
                          ? "bg-[#EBF5FB] text-[#1D6BA3] border border-[#1D6BA3]/20"
                          : typeof page === "number"
                            ? "text-gray-600 hover:bg-gray-50 border border-transparent"
                            : "text-gray-400 cursor-default"
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}
              </div>

              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

export default DataTable;
