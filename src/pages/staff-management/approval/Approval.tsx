import { useState, useEffect } from "react";
import { Search, X, ChevronDown, Check, ClipboardList, Clock, AlertCircle } from "lucide-react";
import Pagination from "../../../components/common/Pagination/Pagination";
import Modal from "../../../components/common/Modal/Modal";

type TabType = "Pending" | "Approved" | "Rejected";
type RequestType = "Attendance" | "Leave" | "On Duty";

import { type ApprovalRequest } from "../../../types/interfaces";

// Generate Mock Data for 3 tabs
const generateMockData = (): ApprovalRequest[] => {
  const data: ApprovalRequest[] = [];
  const types: RequestType[] = ["Attendance", "Leave", "On Duty"];
  const statuses: TabType[] = ["Pending", "Approved", "Rejected"];
  
  const names = [
    "Mohan Kumar", "Priya Sharma", "Rajesh Singh", 
    "Anita Reddy", "Vikram Patel", "Divya Menon", "Suresh Rao"
  ];
  const designations = [
    "Professor", "Assistant Professor", "Lab Assistant", 
    "Admin Officer", "HOD", "Clerk", "Librarian"
  ];
  const departments = [
    "Management", "Computer Science", "Physics", 
    "HR", "Mathematics", "Accounting", "Library"
  ];
  const subTypes = ["New Punch Added", "Missed Punch", "Late Login", "Early Logout", "Regularization"];
  
  for (let i = 1; i <= 45; i++) {
    data.push({
      id: `req-${i}`,
      type: types[i % 3],
      subType: subTypes[i % 5],
      employeeId: `EMP00${(i % 7) + 1}`,
      employeeName: names[i % 7],
      designation: designations[i % 7],
      department: departments[i % 7],
      date: "04/11/2026",
      day: "Tuesday",
      status: statuses[i % 3],
      appliedOn: "27/02/2026",
      oldData: "-",
      newData: "11:49",
      employeeReason: i % 2 === 0 ? "Late Login Issue" : "Forgot to punch",
    });
  }
  return data;
};

const MOCK_DATA = generateMockData();

const PurpleIcon = () => (
  <div className="flex items-center justify-center w-11 h-11 bg-[#F4ECFC] text-[#6920AF] rounded-full shrink-0 relative">
    <ClipboardList size={18} strokeWidth={2.5} />
    <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
      <Clock size={12} className="text-[#6920AF]" strokeWidth={3} />
    </div>
  </div>
);

export default function Approval() {
  const [activeTab, setActiveTab] = useState<TabType>("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [reqTypeFilter, setReqTypeFilter] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState<ApprovalRequest[]>(MOCK_DATA);
  const [modalFlow, setModalFlow] = useState<"idle" | "confirm-approve" | "success-approve" | "confirm-reject" | "reason-reject" | "success-reject">("idle");
  const [activeReqId, setActiveReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const itemsPerPage = 5;

  // Auto close success modal
  useEffect(() => {
    if (modalFlow === "success-approve" || modalFlow === "success-reject") {
      const timer = setTimeout(() => setModalFlow("idle"), 1500);
      return () => clearTimeout(timer);
    }
  }, [modalFlow]);

  const handleAction = (id: string, actionType: "Approve" | "Reject") => {
    setActiveReqId(id);
    setModalFlow(actionType === "Approve" ? "confirm-approve" : "confirm-reject");
    setRejectReason("");
  };

  const processApproval = () => {
    setRequests(prev => prev.map(req => req.id === activeReqId ? { ...req, status: "Approved" } : req));
    setModalFlow("success-approve");
  };

  const proceedToRejectReason = () => {
    setModalFlow("reason-reject");
  };

  const processRejection = () => {
    setRequests(prev => prev.map(req => req.id === activeReqId ? { ...req, status: "Rejected" } : req));
    setModalFlow("success-reject");
  };

  // Filter Data
  const filteredData = requests.filter((item) => {
    if (item.status !== activeTab) return false;
    if (searchQuery && !item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) && !item.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (reqTypeFilter && item.type.toLowerCase() !== reqTypeFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIdx, startIdx + itemsPerPage);

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setExpandedRows(new Set());
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[calc(100vh-100px)]">
      {/* Dynamic Modal Flow */}
      <Modal
        isOpen={modalFlow !== "idle"}
        onClose={() => setModalFlow("idle")}
        title={
          modalFlow.includes("approve") ? "Accept Regularization?" :
          modalFlow === "reason-reject" ? "Rejection Reason" :
          "Reject Regularization?"
        }
        size="md"
        footer={
          (modalFlow === "confirm-approve" || modalFlow === "confirm-reject" || modalFlow === "reason-reject") ? (
            <div className="flex justify-end gap-3 w-full">
              <button
                className="border border-[#1D6BA3] text-[#1D6BA3] px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                onClick={() => setModalFlow("idle")}
              >
                No
              </button>
              <button
                className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-colors"
                onClick={
                  modalFlow === "confirm-approve" ? processApproval :
                  modalFlow === "confirm-reject" ? proceedToRejectReason :
                  processRejection
                }
              >
                Yes
              </button>
            </div>
          ) : undefined
        }
      >
        <div className={modalFlow === "reason-reject" ? "px-6 py-6" : "py-10 px-6 text-center flex flex-col items-center justify-center min-h-[180px] gap-6"}>
          {modalFlow === "confirm-approve" && (
            <>
              <div className="w-16 h-16 rounded-full bg-[#FFB000] flex items-center justify-center shadow-lg shadow-[#FFB000]/30 animate-in zoom-in duration-500">
                <AlertCircle size={32} className="text-white fill-[#FFB000]" strokeWidth={2.5} />
              </div>
              <p className="text-[15px] font-semibold text-gray-800 leading-relaxed max-w-[400px]">
                By Accepting This Regularization Request, The<br/>Specified Changes Will Made In Punch Data.
              </p>
            </>
          )}
          {modalFlow === "success-approve" && (
            <>
              <div className="w-16 h-16 rounded-full bg-[#1D6BA3] flex items-center justify-center shadow-lg shadow-[#1D6BA3]/30 animate-in zoom-in duration-500">
                <Check size={32} className="text-white stroke-[3]" />
              </div>
              <p className="text-[17px] font-bold text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-700">
                Regularization Accepted Successfully
              </p>
            </>
          )}
          {modalFlow === "confirm-reject" && (
            <>
              <div className="w-16 h-16 rounded-full bg-[#FFB000] flex items-center justify-center shadow-lg shadow-[#FFB000]/30 animate-in zoom-in duration-500">
                <AlertCircle size={32} className="text-white fill-[#FFB000]" strokeWidth={2.5} />
              </div>
              <p className="text-[15px] font-semibold text-gray-800 leading-relaxed max-w-[400px]">
                By Reject This Regularization Request, The<br/>Specified Changes Will Made In Punch Data.
              </p>
            </>
          )}
          {modalFlow === "reason-reject" && (
            <div className="text-left w-full">
              <label className="block text-[14px] font-medium text-gray-600 mb-3">Reason for Rejection</label>
              <textarea 
                 value={rejectReason}
                 onChange={(e) => setRejectReason(e.target.value)}
                 placeholder="Enter"
                 rows={5}
                 className="w-full px-4 py-3 text-[14px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] resize-none"
              />
            </div>
          )}
          {modalFlow === "success-reject" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 animate-in zoom-in duration-500">
                <X size={32} className="text-white stroke-[3]" />
              </div>
              <p className="text-[17px] font-bold text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-700">
                Regularization Rejected Successfully
              </p>
            </>
          )}
        </div>
      </Modal>

      {/* Header & Tabs */}
      <div className="px-6 pt-5">
        <h1 className="text-[17px] font-bold text-gray-900 mb-6">Approval Request</h1>
        <div className="flex gap-8 border-b border-gray-200">
          {(["Pending", "Approved", "Rejected"] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-3 border-b-[3px] text-[14px] font-bold transition-colors ${
                activeTab === tab 
                  ? "border-[#1D6BA3] text-gray-900" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2"></div>
        <div className="flex items-center gap-3 w-full justify-end max-w-3xl">
          <div className="flex-1 max-w-[360px] relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Employee name" 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] transition-all"
            />
            {searchQuery && (
              <X 
                size={16} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600" 
                onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
              />
            )}
          </div>
          <button className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white text-[13px] font-semibold px-6 py-2.5 rounded-lg transition-colors">
            Search
          </button>
          <button 
            onClick={() => { setSearchQuery(""); setReqTypeFilter(""); setCurrentPage(1); }}
            className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white text-[13px] font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Clear
          </button>
          <div className="relative min-w-[150px]">
            <select 
              value={reqTypeFilter}
              onChange={(e) => { setReqTypeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-[13px] font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3] transition-all"
            >
              <option value="">Request Type</option>
              <option value="Attendance">Attendance</option>
              <option value="Leave">Leave</option>
              <option value="On Duty">On Duty</option>
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {/* Actions dropdown removed per user request */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 bg-gray-50/30">
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border border-gray-200 bg-white rounded-xl">
            <Search size={28} className="text-gray-400 mb-3" />
            <p className="text-[14px] font-medium text-gray-500">No Data Found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pending Tab Custom Header Wrapper */}
            {activeTab === "Pending" && (
              <div className="bg-[#F8FBFC] border border-[#E8F2F6] rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 flex items-center border-b border-[#E8F2F6]">
                  <div className="w-12 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1D6BA3] focus:ring-[#1D6BA3] cursor-pointer" />
                  </div>
                  <div className="flex-1 grid grid-cols-[1.5fr_1.5fr_1fr_1fr] items-center gap-6">
                    <span className="text-[13px] font-bold text-gray-800">Type</span>
                    <span className="text-[13px] font-bold text-gray-800">Requested By</span>
                    <span className="text-[13px] font-bold text-gray-800">Details</span>
                    <span className="text-[13px] font-bold text-gray-800">Action</span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {currentItems.map(req => {
                     const expanded = expandedRows.has(req.id);
                     return (
                      <div key={req.id} className="bg-white border border-gray-100 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="px-5 py-3.5 flex items-center">
                          <div className="w-12 text-center">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-[#1D6BA3] focus:ring-[#1D6BA3] cursor-pointer" />
                          </div>
                          <div className="flex-1 grid grid-cols-[1.5fr_1.5fr_1fr_1fr] items-center gap-6">
                            {/* Type */}
                            <div className="flex items-center gap-3">
                              <PurpleIcon />
                              <div>
                                <p className="text-[14px] font-bold text-gray-900">{req.type}</p>
                                <p className="text-[12px] text-gray-500 font-medium">{req.subType}</p>
                              </div>
                            </div>
                            
                            {/* Requested By */}
                            <div>
                               <p className="text-[14px] font-bold text-gray-900">{req.employeeId} - {req.employeeName}</p>
                               <div className="flex items-center gap-2 mt-0.5 text-[12px] text-gray-500 font-medium">
                                  <span>{req.designation}</span>
                                  <span className="w-px h-3 bg-gray-300"></span>
                                  <span>{req.department}</span>
                               </div>
                            </div>

                            {/* Details */}
                            <div>
                              <p className="text-[12px] text-gray-500 font-medium mb-1">Date</p>
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-md">
                                <span className="text-[12px] font-semibold text-gray-700">{req.date}</span>
                                <span className="text-[12px] font-medium text-gray-500">{req.day}</span>
                              </div>
                            </div>

                            {/* Action */}
                            <div className="flex items-center gap-2.5">
                              <button onClick={() => toggleExpand(req.id)} className="px-4 py-1.5 border border-[#1D6BA3]/30 text-[#1D6BA3] text-[13px] font-semibold rounded-lg hover:bg-[#1D6BA3]/5 transition-colors">
                                {expanded ? "View Less" : "View More"}
                              </button>
                              <button onClick={() => handleAction(req.id, "Approve")} className="w-[34px] h-[34px] flex items-center justify-center border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-green-600 transition-colors bg-white shadow-sm">
                                <Check size={18} strokeWidth={2.5} />
                              </button>
                              <button onClick={() => handleAction(req.id, "Reject")} className="w-[34px] h-[34px] flex items-center justify-center border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 text-red-500 transition-colors bg-white shadow-sm">
                                <X size={18} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                        {expanded && (
                          <div className="px-5 pb-5">
                             <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                                <div className="grid grid-cols-4 bg-[#FAFAFA] border-b border-gray-200 px-5 pt-3 pb-2.5">
                                   <div className="text-[13px] font-bold text-gray-900">Applied On</div>
                                   <div className="text-[13px] font-bold text-gray-900">Old Data</div>
                                   <div className="text-[13px] font-bold text-gray-900">New Data</div>
                                   <div className="text-[13px] font-bold text-gray-900">Employee Reason</div>
                                </div>
                                <div className="grid grid-cols-4 px-5 py-3">
                                   <div className="text-[13px] font-medium text-gray-600">{req.appliedOn}</div>
                                   <div className="text-[13px] font-medium text-gray-600">{req.oldData}</div>
                                   <div className="text-[13px] font-medium text-gray-600">{req.newData}</div>
                                   <div className="text-[13px] font-medium text-gray-600">{req.employeeReason}</div>
                                </div>
                             </div>
                          </div>
                        )}
                      </div>
                     )
                  })}
                </div>
              </div>
            )}

            {/* Approved / Rejected Cards */}
            {activeTab !== "Pending" && currentItems.map(req => {
               const expanded = expandedRows.has(req.id);
               return (
                <div key={req.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-3 hover:border-gray-300 hover:shadow-md transition-all">
                  <div className="px-6 py-4 flex items-center gap-10">
                    {/* Left Area: Icon + Details */}
                    <div className="flex items-center gap-4 min-w-[300px]">
                       <PurpleIcon />
                       <div>
                          <p className="text-[14px] font-bold text-gray-900">{req.employeeId} - {req.employeeName}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[12px] text-gray-500 font-medium">
                             <span>{req.designation}</span>
                             <span className="w-px h-3 bg-gray-300"></span>
                             <span>{req.department}</span>
                          </div>
                       </div>
                    </div>
                    {/* Middle Area: Date */}
                    <div className="flex-1 flex border-l border-gray-200 pl-10">
                       <div>
                         <p className="text-[12px] text-gray-500 font-medium mb-1">Date</p>
                         <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-md">
                           <span className="text-[12px] font-semibold text-gray-700">{req.date}</span>
                           <span className="text-[12px] font-medium text-gray-500">{req.day}</span>
                         </div>
                       </div>
                    </div>
                    {/* Right Area: View button */}
                    <div>
                       <button onClick={() => toggleExpand(req.id)} className="min-w-[120px] px-5 py-2 border border-[#1D6BA3]/30 text-[#1D6BA3] text-[13px] font-semibold rounded-lg hover:bg-[#1D6BA3]/5 transition-colors">
                         {expanded ? "Hide Reason" : "View Reason"}
                       </button>
                    </div>
                  </div>
                  {expanded && (
                    <div className="px-6 pb-6 pt-1">
                       <div className="bg-[#EBF5FB]/30 border border-[#E8F2F6] rounded-lg overflow-hidden flex flex-col">
                          <div className="grid grid-cols-4 bg-[#EBF5FB]/60 border-b border-[#E8F2F6] px-5 pt-3 pb-2.5">
                             <div className="text-[13px] font-bold text-gray-900">Type</div>
                             <div className="text-[13px] font-bold text-gray-900">Old Data</div>
                             <div className="text-[13px] font-bold text-gray-900">New Data</div>
                             <div className="text-[13px] font-bold text-gray-900">Employee Reason</div>
                          </div>
                          <div className="grid grid-cols-4 px-5 py-4">
                             <div className="text-[13px] font-semibold text-gray-700">{req.subType}</div>
                             <div className="text-[13px] font-medium text-gray-600">{req.oldData}</div>
                             <div className="text-[13px] font-medium text-gray-600">{req.newData}</div>
                             <div className="text-[13px] font-medium text-gray-600">{req.employeeReason}</div>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
               )
            })}
          </div>
        )}
      </div>

      {/* Pagination Container */}
      {totalItems > itemsPerPage && (
        <div className="w-full bg-white mt-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIdx={startIdx}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
