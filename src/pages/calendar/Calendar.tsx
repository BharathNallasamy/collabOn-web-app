const CalendarPage = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h1 className="text-base font-bold text-gray-800">Calendar</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-14 h-14 rounded-full bg-[#EFF6FF] flex items-center justify-center">
          <svg
            className="w-7 h-7 text-[#1D6BA3]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-600">Calendar</p>
        <p className="text-xs text-gray-400">This section is under development</p>
      </div>
    </div>
  </div>
);

export default CalendarPage;
