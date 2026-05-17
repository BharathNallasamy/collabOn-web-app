import React from "react";

const StudentManagement = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h1 className="text-base font-bold text-gray-800">Student Management</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-14 h-14 rounded-full bg-[#EFF6FF] flex items-center justify-center">
          <svg className="w-7 h-7 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-600">Student Management</p>
        <p className="text-xs text-gray-400">This section is under development</p>
      </div>
    </div>
  </div>
);

export default StudentManagement;
