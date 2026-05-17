import { Calendar, Download, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button/Button";
import DataTable, { type Column } from "../../components/common/Table/DataTable";

import { type ParticipantRow } from "../../types/interfaces";
import { SEED_PARTICIPANTS as PARTICIPANT_DATA } from "../../types/mockData";

const EventRegistrationDetails = () => {
  const navigate = useNavigate();

  const columns: Column<ParticipantRow>[] = [
    { key: "id", header: "ID", className: "px-6 py-4 text-sm text-gray-700 font-medium" },
    { key: "name", header: "Name", className: "px-6 py-4 text-sm text-gray-700" },
    { key: "type", header: "Type", className: "px-6 py-4 text-sm text-gray-700" },
    { key: "department", header: "Department", className: "px-6 py-4 text-sm text-gray-700" },
    {
      key: "status",
      header: "Status",
      className: "px-6 py-4 text-sm text-gray-700 text-center",
      render: (row) => (
        <div className="flex justify-center">
          <span className="inline-block px-4 py-1 rounded-full border border-green-200 bg-green-50 text-green-600 text-xs font-bold min-w-[90px] text-center">
            {row.status}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* ── Banner + Header Info Card ── */}
      <Card noPadding className="border-gray-200 overflow-hidden">
        {/* Tech gradient banner */}
        <div className="w-full h-44 bg-gradient-to-r from-[#0F2460] via-[#1D6BA3] to-[#1A3A8A] relative overflow-hidden">
          {/* Decorative SVG grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 176" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* Glowing circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-blue-300/30 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-blue-300/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-200/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          {/* Back button */}
          <button
            onClick={() => navigate("/layout/campus-comms/event-registration")}
            className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors border border-white/20"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Event info section */}
        <div className="px-6 py-6 flex flex-col lg:flex-row justify-between gap-6 border-b border-gray-100">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-5">
              <h1 className="text-xl font-black text-gray-900">Generative AI Workshop</h1>
              <span className="px-4 py-1 bg-[#1D6BA3] text-white text-xs font-semibold rounded-full">
                Workshop
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Department</p>
                <p className="text-sm font-bold text-gray-900">Computer Science</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Event Date</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-bold text-gray-900">22/04/2020</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Mode</p>
                <p className="text-sm font-bold text-gray-900">Offline</p>
              </div>
            </div>
          </div>

          {/* Total Registered summary */}
          <div className="lg:w-72 border border-gray-100 rounded-xl p-5 bg-gray-50/50">
            <p className="text-sm font-semibold text-[#1D6BA3] mb-2">Total Registered</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl leading-none font-black text-[#1D6BA3]">2</span>
              <div className="pb-1 flex gap-3">
                <span className="text-sm font-medium text-gray-500">• 2 Students</span>
                <span className="text-sm font-medium text-gray-500">• 0 Faculty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2">Description</p>
          <p className="text-sm font-bold text-gray-800">
            A Seminar On The Importance Of Cyber Security In The Modern World, All Students Requested To Attend.
          </p>
        </div>

        {/* Participant List */}
        <div>
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Participant List</h2>
            <Button
              variant="ghost"
              className="border border-[#1D6BA3] text-[#1D6BA3] hover:bg-[#1D6BA3]/5 h-9 px-4 text-sm font-medium"
              icon={<Download size={16} />}
            >
              Download
            </Button>
          </div>

          <DataTable
            data={PARTICIPANT_DATA}
            columns={columns}
            headerRowClassName="bg-[#EFF6FF] border-b border-gray-100"
            emptyMessage="No participants found"
          />
        </div>
      </Card>
    </div>
  );
};

export default EventRegistrationDetails;
