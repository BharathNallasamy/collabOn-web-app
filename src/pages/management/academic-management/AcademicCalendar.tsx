import { useState } from "react";
import { ChevronLeft, ChevronRight, Upload, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button/Button";
import ManagementModal from "../../../components/Layouts/ManagementModal";
import { type AcademicEvent, type EventType } from "../../../types/interfaces";

import { INITIAL_EVENTS } from "../../../types/mockData";

// ── Helper Functions ─────────────────────────────────────────────────────────
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const AcademicCalendar = () => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [events, setEvents] = useState<AcademicEvent[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    dayOrder: "",
    name: "",
    description: "",
    type: "Event" as EventType,
  });

  // Calendar Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = getEventsForDate(day);

    if (dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0]);
      setIsViewModalOpen(true);
    } else {
      setSelectedDate(dateStr);
      setFormData({ dayOrder: "", name: "", description: "", type: "Event" });
      setIsAddModalOpen(true);
    }
  };

  const handleSaveEvent = () => {
    if (selectedEvent) {
      // Edit existing
      setEvents(events.map((e) => (e.id === selectedEvent.id ? { ...e, ...formData } : e)));
    } else if (selectedDate) {
      // Add new
      const newEvent: AcademicEvent = {
        id: Math.random().toString(36).substr(2, 9),
        date: selectedDate,
        ...formData,
      };
      setEvents([...events, newEvent]);
    }
    setIsAddModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter((e) => e.id !== selectedEvent.id));
      setIsDeleteModalOpen(false);
      setIsViewModalOpen(false);
      setIsSuccessModalOpen(true);
    }
  };

  const getTypeStyles = (type: EventType) => {
    switch (type) {
      case "Holiday":
        return { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-600" };
      case "Exam":
        return { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-600" };
      case "Event":
        return { dot: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-600" };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Academic Calendar</h1>
        <Button variant="outline" className="flex items-center gap-2 border-gray-200 text-gray-700">
          <Upload size={18} />
          <span>Bulk Upload</span>
        </Button>
      </div>

      <Card className="border-gray-100 shadow-sm overflow-hidden p-0">
        {/* Calendar Header */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 min-w-[140px] text-center">
              {MONTHS[month]} - {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-[13px] font-medium text-gray-600">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-[13px] font-medium text-gray-600">Exam</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-[13px] font-medium text-gray-600">Event</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-collapse">
          {/* Day Names */}
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="py-4 text-center text-[13px] font-bold text-gray-500 border-b border-r border-gray-100 bg-[#f8fafc]"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for start of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[140px] border-b border-r border-gray-100 bg-gray-50/30"
            />
          ))}

          {/* Actual Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);
            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className="min-h-[140px] p-2 border-b border-r border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer group relative"
              >
                <span className="text-[14px] font-bold text-gray-400 group-hover:text-[#1D6BA3]">
                  {day}
                </span>

                <div className="mt-2 space-y-2">
                  {dayEvents.map((event) => {
                    const styles = getTypeStyles(event.type);
                    return (
                      <div key={event.id} className="relative">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-[10px] font-bold ${styles.bg} ${styles.text} line-clamp-1`}
                        >
                          {event.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Remaining empty cells */}
          {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
            <div
              key={`empty-end-${i}`}
              className="min-h-[140px] border-b border-r border-gray-100 bg-gray-50/30"
            />
          ))}
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <ManagementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Date : ${selectedEvent?.date || selectedDate}`}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">Day Order</label>
              <input
                type="text"
                placeholder="Enter"
                value={formData.dayOrder}
                onChange={(e) => setFormData({ ...formData, dayOrder: e.target.value })}
                className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">Event Name</label>
              <input
                type="text"
                placeholder="Enter"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Description</label>
            <textarea
              placeholder="Enter"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-32 p-4 bg-white border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
            />
          </div>

          {/* <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Event Type</label>
            <div className="flex gap-4">
              {(["Event", "Exam", "Holiday"] as EventType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, type })}
                  className={`px-4 py-2 rounded-lg text-[13px] font-bold border transition-all ${
                    formData.type === type 
                      ? getTypeStyles(type).bg + " " + getTypeStyles(type).text + " border-transparent"
                      : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div> */}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              className="px-8 h-11 text-blue-600 border-blue-200"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" className="px-8 h-11 bg-[#1D6BA3]" onClick={handleSaveEvent}>
              Save
            </Button>
          </div>
        </div>
      </ManagementModal>

      {/* View Event Modal */}
      <ManagementModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Date : ${selectedEvent?.date}`}
      >
        <div className="space-y-6">
          <div className="flex justify-end gap-4 border-b border-gray-50 pb-4">
            <button
              onClick={() => {
                if (selectedEvent) {
                  setFormData({
                    dayOrder: selectedEvent.dayOrder || "",
                    name: selectedEvent.name,
                    description: selectedEvent.description || "",
                    type: selectedEvent.type,
                  });
                  setIsAddModalOpen(true);
                  setIsViewModalOpen(false);
                }
              }}
              className="flex items-center gap-2 text-blue-600 font-bold text-[14px] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
              Edit
            </button>
            <div className="w-px h-6 bg-gray-100 my-auto" />
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 text-red-500 font-bold text-[14px] hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>

          <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-bold text-gray-600">Day Order</span>
              <span className="text-[14px] font-bold text-gray-900">
                {selectedEvent?.dayOrder || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-bold text-gray-600">Event Name</span>
              <span className="text-[14px] font-bold text-gray-900">{selectedEvent?.name}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[14px] font-bold text-gray-600">Description</span>
              <span className="text-[14px] font-bold text-gray-900 text-right max-w-[60%]">
                {selectedEvent?.description || "-"}
              </span>
            </div>
          </div>
        </div>
      </ManagementModal>

      {/* Delete Confirmation Modal */}
      <ManagementModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Event?"
        maxWidth="max-w-md"
      >
        <div className="py-10 text-center space-y-6">
          <p className="text-[16px] font-bold text-gray-700">
            Are You Sure Do You Want To Delete This Event?
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              className="px-10 h-11 text-blue-600 border-blue-600"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              No
            </Button>
            <Button
              variant="primary"
              className="px-10 h-11 bg-[#1D6BA3]"
              onClick={handleDeleteEvent}
            >
              Yes
            </Button>
          </div>
        </div>
      </ManagementModal>

      {/* Success Modal */}
      <ManagementModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Event Deleted?"
        maxWidth="max-w-md"
      >
        <div className="py-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <p className="text-[16px] font-bold text-gray-800">Event Deleted Successfully</p>
        </div>
      </ManagementModal>
    </div>
  );
};

export default AcademicCalendar;
