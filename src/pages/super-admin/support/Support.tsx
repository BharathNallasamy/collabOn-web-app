import { useState } from "react";
import {
  Search,
  Eye,
  FileText,
  Mail,
  AlertCircle,
  CheckCircle2,
  User,
  ChevronDown,
  Paperclip,
  Send,
  MessageSquare,
  Lock,
} from "lucide-react";
import Card from "../../../components/common/Card";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button/Button";
import ManagementModal from "../../../components/Layouts/ManagementModal";
import DataTable from "../../../components/common/Table/DataTable";
import { type SupportTicket } from "../../../types/interfaces";
import { MOCK_TICKETS } from "../../../types/mockData";


// ── Components ───────────────────────────────────────────────────────────────

const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{label}</label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg text-[14px] text-gray-700 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span>{value || "Select"}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="py-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-5 py-2.5 text-left text-[14px] transition-colors hover:bg-gray-50 ${
                    value === opt ? "text-blue-600 font-semibold bg-blue-50/50" : "text-gray-600"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SuperAdminSupport = () => {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [replyTab, setReplyTab] = useState<"public" | "internal">("public");
  const [replyText, setReplyText] = useState("");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.institutionName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All Status" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-600 border-red-100";
      case "Medium":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Low":
        return "bg-gray-50 text-gray-600 border-gray-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "In Progress":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "Closed":
        return "bg-yellow-50 text-yellow-600 border-yellow-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h1 className="text-[15px] font-bold text-gray-800 tracking-tight">Support Tickets</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Needs Attention",
            value: "1",
            icon: Mail,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
          },
          {
            label: "High Priority",
            value: "2",
            icon: AlertCircle,
            color: "text-rose-500",
            bgColor: "bg-rose-50",
          },
          {
            label: "Unassigned",
            value: "1",
            icon: User,
            color: "text-purple-500",
            bgColor: "bg-purple-50",
          },
          {
            label: "Resolved",
            value: "0",
            icon: CheckCircle2,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}
            >
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <div className="text-[13px] font-medium text-gray-500">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar Card */}
      <Card noPadding className="border-gray-200 shadow-sm !overflow-visible">
        <div className="p-4 flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-gray-50/30 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="w-full lg:w-48">
            <CustomDropdown
              value={statusFilter}
              options={["All Status", "Open", "In Progress", "Closed"]}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </Card>

      {/* Table Section Card */}
      <Card noPadding className="border-gray-200 shadow-sm overflow-hidden relative">
        <DataTable
          data={filteredTickets}
          columns={[
            {
              key: "ticketNumber",
              header: "Ticket Number",
              render: (t) => <span className="font-bold text-gray-700">{t.ticketNumber}</span>,
            },
            {
              key: "title",
              header: "Ticket Subject",
              render: (t) => <span className="font-bold text-gray-700">{t.title}</span>,
            },
            {
              key: "institutionName",
              header: "Institution Name",
              render: (t) => <span className="font-medium text-gray-600">{t.institutionName}</span>,
            },
            {
              key: "raisedBy",
              header: "Raised By",
              render: (t) => <span className="font-bold text-gray-700">{t.raisedBy.name}</span>,
            },
            {
              key: "modules",
              header: "Modules",
              render: (t) => <span className="text-[12px] text-gray-500">{t.modules}</span>,
            },
            {
              key: "features",
              header: "Features",
              render: (t) => <span className="text-[12px] text-gray-500">{t.features}</span>,
            },
            {
              key: "priority",
              header: "Priority",
              render: (t) => (
                <div
                  className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold border ${getPriorityColor(t.priority)}`}
                >
                  {t.priority}
                </div>
              ),
            },
            {
              key: "lastUpdated",
              header: "Last Updated",
              render: (t) => (
                <div className="text-[12px] text-gray-500 leading-tight">
                  {t.lastUpdated.split(" ")[0]}
                  <br />
                  <span className="text-[11px] text-gray-400 font-medium">
                    {t.lastUpdated.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (t) => (
                <div
                  className={`inline-flex px-4 py-1.5 rounded-full text-[11px] font-bold border ${getStatusColor(t.status)}`}
                >
                  {t.status}
                </div>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              stickyRight: true,
              className: "text-center min-w-[120px]",
              render: (t) => (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenTicket(t);
                    }}
                    className="p-2 text-[#1D6BA3] hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              ),
            },
          ]}
          showPagination={false}
          containerClassName="min-h-[400px]"
        />
      </Card>

      {/* Ticket Detail Modal */}
      <ManagementModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-gray-400">
                {selectedTicket?.ticketNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(selectedTicket?.status || "")}`}
              >
                {selectedTicket?.status}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityColor(selectedTicket?.priority || "")}`}
              >
                {selectedTicket?.priority}
              </span>
            </div>
            <h2 className="text-[16px] font-bold text-gray-900">{selectedTicket?.title}</h2>
          </div>
        }
        maxWidth="max-w-6xl"
      >
        <div className="flex flex-col lg:flex-row h-[75vh]">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">
            {/* Original Request */}
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                Original Request
              </h3>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[14px]">
                      {selectedTicket?.raisedBy.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-gray-900">
                        {selectedTicket?.raisedBy.name}
                      </div>
                      <div className="text-[12px] text-gray-400">
                        {selectedTicket?.raisedBy.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-[12px] text-gray-400">{selectedTicket?.lastUpdated}</div>
                </div>
                <div className="text-[14px] text-gray-600 leading-relaxed">
                  {selectedTicket?.description}
                </div>
              </div>
            </div>

            {/* Activity Stream */}
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                Activity Stream
              </h3>
              <div className="space-y-4">
                {selectedTicket?.activity.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="mt-1">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-[14px] font-bold text-gray-900">{item.user}</div>
                        <div className="text-[12px] text-gray-400">{item.date}</div>
                      </div>
                      <div className="text-[14px] text-gray-600 leading-relaxed">
                        {item.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Area - Sticky Bottom */}
            <div className="sticky bottom-0 pt-4 mt-auto">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setReplyTab("public")}
                    className={`px-6 py-3 text-[13px] font-bold flex items-center gap-2 transition-colors ${
                      replyTab === "public"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Public Reply
                  </button>
                  <button
                    onClick={() => setReplyTab("internal")}
                    className={`px-6 py-3 text-[13px] font-bold flex items-center gap-2 transition-colors ${
                      replyTab === "internal"
                        ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50/30"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    Internal Note
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <textarea
                    placeholder={
                      replyTab === "public"
                        ? "Write a reply to the customer..."
                        : "Add an internal note..."
                    }
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full h-32 text-[14px] text-gray-700 resize-none focus:outline-none placeholder:text-gray-400"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <Button
                      variant="primary"
                      className="px-6 h-10 flex items-center gap-2 shadow-md shadow-blue-100"
                      onClick={() => {
                        // Handle send
                        setReplyText("");
                      }}
                    >
                      <span>Send Reply</span>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-72 border-l border-gray-100 overflow-y-auto p-6 space-y-8 bg-white">
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                Customer Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-gray-900">
                      {selectedTicket?.institutionName}
                    </div>
                    <div className="text-[12px] text-gray-500 mt-0.5">
                      {selectedTicket?.raisedBy.name}
                    </div>
                    <div className="text-[12px] text-blue-600 font-medium hover:underline cursor-pointer mt-1">
                      {selectedTicket?.raisedBy.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                Ticket Properties
              </h3>
              <div className="space-y-6">
                <CustomDropdown
                  label="Status"
                  value={selectedTicket?.status || ""}
                  options={["Open", "In Progress", "Closed"]}
                  onChange={(val) =>
                    selectedTicket &&
                    setTickets(
                      tickets.map((t) =>
                        t.id === selectedTicket.id
                          ? { ...t, status: val as "Open" | "In Progress" | "Closed" }
                          : t
                      )
                    )
                  }
                />
                <CustomDropdown
                  label="Priority"
                  value={selectedTicket?.priority || ""}
                  options={["Low", "Medium", "High"]}
                  onChange={(val) =>
                    selectedTicket &&
                    setTickets(
                      tickets.map((t) =>
                        t.id === selectedTicket.id
                          ? { ...t, priority: val as "Low" | "Medium" | "High" }
                          : t
                      )
                    )
                  }
                />
                <CustomDropdown
                  label="Assignee"
                  value={selectedTicket?.assignee || "Unassigned"}
                  options={["Unassigned", "Admin User", "Finance Admin", "Support Staff"]}
                  onChange={(val) =>
                    selectedTicket &&
                    setTickets(
                      tickets.map((t) => (t.id === selectedTicket.id ? { ...t, assignee: val } : t))
                    )
                  }
                />

                <div className="pt-2 space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-400 mb-1">
                      Module
                    </label>
                    <div className="text-[14px] font-bold text-gray-900">
                      {selectedTicket?.modules}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-400 mb-1">
                      Environment
                    </label>
                    <Badge
                      variant="neutral"
                      className="bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded uppercase text-[10px]"
                    >
                      {selectedTicket?.environment}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ManagementModal>
    </div>
  );
};

export default SuperAdminSupport;
