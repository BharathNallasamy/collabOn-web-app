
const AssetManagement = () => (
  <div className="space-y-4">
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h1 className="text-base font-bold text-gray-800">Asset Management</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-14 h-14 rounded-full bg-[#EFF6FF] flex items-center justify-center">
          <svg className="w-7 h-7 text-[#1D6BA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-600">Asset Management</p>
        <p className="text-xs text-gray-400">This section is under development</p>
      </div>
    </div>
  </div>
);

export default AssetManagement;
