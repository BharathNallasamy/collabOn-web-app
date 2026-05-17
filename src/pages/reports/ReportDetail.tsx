import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, Printer, ChevronDown, X, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { exportToExcel, exportToCSV } from "../../utils/excel";

// ── Types ─────────────────────────────────────────────────────────────────────
type CellValue = string | number;

interface ColDef {
  key:     string;
  header:  string;
  render?: (val: CellValue) => ReactNode;
}

interface DropdownDef {
  key:     string;
  label:   string;
  options: string[];
}

interface FilterConfig {
  hasSearch?:        boolean;
  searchPlaceholder?: string;
  dropdowns:         DropdownDef[];
}

interface ReportConfig {
  title:        string;
  filterConfig: FilterConfig;
  columns:      ColDef[];
  rows:         CellValue[][];
}

// ── Reusable cell renderers ───────────────────────────────────────────────────
const StatusBadge = (val: CellValue) => {
  const v = String(val);
  const isActive = v === "Active";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
      isActive
        ? "bg-green-50 text-green-600 border-green-200"
        : "bg-red-50 text-red-500 border-red-200"
    }`}>
      {v}
    </span>
  );
};

// Colours attendance % — green ≥ 75%, red < 75%
const AttendancePct = (val: CellValue) => {
  const pct = parseInt(String(val));
  return (
    <span className={`font-semibold ${pct >= 75 ? "text-green-600" : "text-red-500"}`}>
      {val}
    </span>
  );
};

// "Below Threshold" pill badge
const ThresholdBadge = (val: CellValue) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-600 bg-white">
    {val}
  </span>
);

// Green currency amount
const AmountCell = (val: CellValue) => (
  <span className="font-semibold text-green-600">{val}</span>
);

// Paid → green badge, Unpaid → red badge
const FeeStatusBadge = (val: CellValue) => {
  const v = String(val);
  const isPaid = v === "Paid";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
      isPaid
        ? "bg-green-50 text-green-600 border-green-200"
        : "bg-red-50 text-red-500 border-red-200"
    }`}>
      {v}
    </span>
  );
};

// Pass → green badge, Fail → red badge
const ResultBadge = (val: CellValue) => {
  const v = String(val);
  const isPass = v === "Pass";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
      isPass
        ? "bg-green-50 text-green-600 border-green-200"
        : "bg-red-50 text-red-500 border-red-200"
    }`}>
      {v}
    </span>
  );
};

// Low → green, Medium → blue, High → red
const DifficultyRate = (val: CellValue) => {
  const v = String(val);
  const styles: Record<string, string> = {
    Low:    "text-green-600 font-semibold",
    Medium: "text-blue-600 font-semibold",
    High:   "text-red-500 font-semibold",
  };
  return <span className={styles[v] ?? "text-gray-700"}>{v}</span>;
};

// ── DEPT options (reused across reports) ──────────────────────────────────────
const DEPT_OPTIONS        = ["Tamil", "English", "Commerce", "Computer Science", "Information Technology"];
const DATE_OPTIONS        = ["This Month", "Last 3 Months", "This Year", "Last Year"];
const PROG_OPTIONS        = ["UG", "PG", "Diploma", "Certificate"];
const COURSE_NAME_OPTIONS = ["B.A Tamil", "B.A English", "B.Com General", "Computer Application", "B.Sc Computer Science"];
const STAFF_NAME_OPTIONS  = ["Dr. Devi", "Dr. Kumar", "Dr. Ravi", "Dr. Rao", "Dr. Priya"];

// ── Report configs ────────────────────────────────────────────────────────────
const REPORT_CONFIGS: Record<string, ReportConfig> = {

  // ── 1. Admission Funnel ───────────────────────────────────────────────────
  "admission-funnel": {
    title: "Admission Funnel Report",
    filterConfig: {
      hasSearch: false,
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "year",      header: "Academic Year"       },
      { key: "enquiry",   header: "Enquiry Count"       },
      { key: "received",  header: "Application Received"},
      { key: "confirmed", header: "Admission Confirmed" },
      { key: "conversion",header: "Conversion"          },
    ],
    rows: [
      ["2025-2026", 520, 410, 320, "61%"],
      ["2024-2025", 480, 360, 300, "61%"],
      ["2023-2024", 450, 340, 282, "61%"],
      ["2022-2023", 420, 310, 260, "61%"],
    ],
  },

  // ── 2. Student Directory ──────────────────────────────────────────────────
  "student-directory": {
    title: "Student Directory Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Roll number/Student name",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "rollNo",    header: "Roll Number"     },
      { key: "admNo",     header: "Admission Number"},
      { key: "name",      header: "Student Name"    },
      { key: "course",    header: "Course Name"     },
      { key: "dept",      header: "Department"      },
      { key: "scholar",   header: "Scholarship"     },
      { key: "status",    header: "Status", render: StatusBadge },
    ],
    rows: [
      ["CSE09876543", "ADM-2024-025", "Arjun", "B.A Tamil",             "Tamil",            "Yes", "Active"  ],
      ["CSE09876543", "ADM-2026-215", "Sneha", "B.A English",           "English",          "No",  "Active"  ],
      ["CSE09876543", "ADM-2025-125", "Priya", "B.Com General",         "Commerce",         "Yes", "Active"  ],
      ["CSE09876543", "ADM-2025-125", "Riya",  "Computer Application",  "Computer Science", "Yes", "Inactive"],
    ],
  },

  // ── 3. Enrollment Trends ──────────────────────────────────────────────────
  "enrollment-trends": {
    title: "Enrollment Trends",
    filterConfig: {
      hasSearch: false,
      dropdowns: [
        { key: "department", label: "Department", options: DEPT_OPTIONS },
        { key: "dateRange",  label: "Date Range", options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "year",   header: "Academic Year"         },
      { key: "dept",   header: "Department"            },
      { key: "total",  header: "Total New Enrollments" },
      { key: "growth", header: "Growth %"              },
    ],
    rows: [
      ["2025-2026", "Tamil",            320, "8%" ],
      ["2024-2025", "English",          280, "-2%"],
      ["2023-2024", "Commerce",         295, "5%" ],
      ["2022-2023", "Computer Science", 270, ""   ],
    ],
  },

  // ── 4. Dropout / Inactive Students ───────────────────────────────────────
  "dropout-inactive": {
    title: "Inactive Student Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Roll number/Student name",
      dropdowns: [
        { key: "department", label: "Department", options: DEPT_OPTIONS },
        { key: "dateRange",  label: "Date Range", options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "rollNo",   header: "Roll Number"    },
      { key: "name",     header: "Student Name"   },
      { key: "dept",     header: "Department"     },
      { key: "lastDate", header: "Last Active Date"},
      { key: "status",   header: "Status", render: StatusBadge },
    ],
    rows: [
      ["CSE09876543", "Arjun", "Tamil",            "Jan 2025", "Active"  ],
      ["CSE09876543", "Sneha", "English",          "Dec 2025", "Active"  ],
      ["CSE09876543", "Priya", "Commerce",         "Nov 2025", "Active"  ],
      ["CSE09876543", "Riya",  "Computer Science", "Feb 2025", "Inactive"],
    ],
  },

  // ── 5. Department Academic Coverage ──────────────────────────────────────
  "dept-academic-coverage": {
    title: "Department Academic Coverage Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Department/Course/Subject",
      dropdowns: [
        { key: "courseName",  label: "Course Name",  options: COURSE_NAME_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS        },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS        },
      ],
    },
    columns: [
      { key: "department",  header: "Department"   },
      { key: "courseName",  header: "Course Name"  },
      { key: "subjectName", header: "Subject Name" },
      { key: "totalUnits",  header: "Total Units"  },
      { key: "unitCovered", header: "Unit Covered" },
      { key: "coverage",    header: "Coverage"     },
    ],
    rows: [
      ["Tamil",            "B.A Tamil",             "Computer Science", 10, "09", "80%"],
      ["English",          "B.A English",           "Bio Technology",   25, 22,   "80%"],
      ["Commerce",         "B.Com General",         "Computer Science", 22, 20,   "80%"],
      ["Computer Science", "Computer Application",  "Chemistry",        15, 12,   "80%"],
    ],
  },

  // ── 6. Subject Allocation ─────────────────────────────────────────────────
  "student-allocation": {
    title: "Subject Allocation Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Faculty Name/Department/Subject",
      dropdowns: [
        { key: "department", label: "Department", options: DEPT_OPTIONS       },
        { key: "staffName",  label: "Staff Name", options: STAFF_NAME_OPTIONS },
      ],
    },
    columns: [
      { key: "subjectName",  header: "Subject Name"  },
      { key: "department",   header: "Department"    },
      { key: "employeeId",   header: "Employee ID"   },
      { key: "facultyName",  header: "Faculty Name"  },
      { key: "weeklyHours",  header: "Weekly Hours"  },
      {
        key: "subjectType", header: "Subject Type",
        render: (val: CellValue) => {
          const v = String(val);
          const styles: Record<string, string> = {
            Core:    "text-purple-600 font-semibold",
            Lab:     "text-green-600 font-semibold",
            Elective:"text-blue-600 font-semibold",
          };
          return <span className={styles[v] ?? "text-gray-700"}>{v}</span>;
        },
      },
    ],
    rows: [
      ["Computer Science", "Tamil",            "EMP001", "Dr. Devi",  "4hrs", "Core"],
      ["Bio Technology",   "English",          "EMP002", "Dr. Kumar", "4hrs", "Core"],
      ["Computer Science", "Commerce",         "EMP003", "Dr. Ravi",  "4hrs", "Lab" ],
      ["Chemistry",        "Computer Science", "EMP004", "Dr. Rao",   "4hrs", "Core"],
    ],
  },

  // ── 7. Timetable Coverage ─────────────────────────────────────────────────
  "timetable-coverage": {
    title: "Timetable Coverage Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Department",
      dropdowns: [
        { key: "department", label: "Department", options: DEPT_OPTIONS },
      ],
    },
    columns: [
      { key: "department",         header: "Department"            },
      { key: "semester",           header: "Semester"              },
      { key: "totalClassPlanned",  header: "Total Classes Planned" },
      { key: "classesConducted",   header: "Classes Conduxted"     },
      { key: "coverage",           header: "Coverage"              },
    ],
    rows: [
      ["Tamil",            "Sem 5", 40, 40, "80%"],
      ["English",          "Sem 5", 42, 42, "80%"],
      ["Commerce",         "Sem 5", 40, 40, "80%"],
      ["Computer Science", "Sem 5", 40, 40, "80%"],
    ],
  },

  // ── 8. Student Attendance Summary ────────────────────────────────────────
  "student-attendance-summary": {
    title: "Student Attendance Summery",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Students Name/Roll Number/Department",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "rollNo",       header: "Roll Number"   },
      { key: "studentName",  header: "Student Name"  },
      { key: "department",   header: "Department"    },
      { key: "totalDays",    header: "Total Days"    },
      { key: "presentDays",  header: "Present Days"  },
      { key: "attendance",   header: "Attendance %", render: AttendancePct },
    ],
    rows: [
      ["CSE09876543", "Arjun", "Tamil",            40, 40, "85%"],
      ["CSE09876543", "Priya", "English",          42, 42, "65%"],
      ["CSE09876543", "Rahul", "Commerce",         40, 40, "90%"],
      ["CSE09876543", "Priya", "Computer Science", 40, 40, "78%"],
    ],
  },

  // ── 9. Staff Attendance Report ────────────────────────────────────────────
  "staff-attendance-report": {
    title: "Staff Attendance Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "employeeId",    header: "Employee ID"    },
      { key: "employeeName",  header: "Employee Name"  },
      { key: "department",    header: "Department"     },
      { key: "workingDays",   header: "Working Days"   },
      { key: "presentDays",   header: "Present Days"   },
      { key: "attendance",    header: "Attendance %",  render: AttendancePct },
    ],
    rows: [
      ["EMP001", "Dr. Devi",  "Tamil",            40, 40, "85%"],
      ["EMP002", "Dr. Kumar", "English",          42, 42, "65%"],
      ["EMP003", "Dr. Ravi",  "Commerce",         40, 40, "90%"],
      ["EMP004", "Dr. Rao",   "Computer Science", 40, 40, "78%"],
    ],
  },

  // ── 10. Low Attendance Alert ──────────────────────────────────────────────
  "low-attendance-alert": {
    title: "Low Attendance Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "rollNo",      header: "Roll Number"  },
      { key: "studentName", header: "Student Name" },
      { key: "department",  header: "Department"   },
      { key: "attendance",  header: "Attendance %", render: AttendancePct  },
      { key: "status",      header: "Status",       render: ThresholdBadge },
    ],
    rows: [
      ["CSE09876543", "Arjun", "Tamil",            "85%", "Below Threshold"],
      ["CSE09876543", "Sneha", "English",          "65%", "Below Threshold"],
      ["CSE09876543", "Priya", "Commerce",         "90%", "Below Threshold"],
      ["CSE09876543", "Riya",  "Computer Science", "78%", "Below Threshold"],
    ],
  },

  // ── 11. Fee Collection Summary ───────────────────────────────────────────
  "fee-collection-summary": {
    title: "Fee Collection Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "academicYear",       header: "Academic Year"         },
      { key: "feeType",            header: "Fee Type"              },
      { key: "totalFeesGenerated", header: "Total Fees Generated",  render: AmountCell },
      { key: "totalFeesCollected", header: "Total Fees Collected",  render: AmountCell },
      { key: "outstandingAmount",  header: "Outstanding Amount",    render: AmountCell },
    ],
    rows: [
      ["2025-2026", "Admission", "600.00",  "600.00",  "600.00" ],
      ["2024-2025", "Transport", "1500.50", "1500.50", "1500.50"],
      ["2023-2024", "Hostel",    "3500.00", "3500.00", "3500.00"],
      ["2022-2023", "Hostel",    "3500.00", "3500.00", "3500.00"],
    ],
  },

  // ── 12. Student Fee Status ────────────────────────────────────────────────
  "student-fee-status": {
    title: "Student Fee Status Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "rollNo",        header: "Roll Number"    },
      { key: "studentName",   header: "Student Name"   },
      { key: "feeType",       header: "Fee Type"       },
      { key: "totalAmount",   header: "Total Amount",   render: AmountCell    },
      { key: "amountPaid",    header: "Amount Paid",    render: AmountCell    },
      { key: "pendingAmount", header: "Pending Amount", render: AmountCell    },
      { key: "status",        header: "Status",         render: FeeStatusBadge},
    ],
    rows: [
      ["CSE09876543", "Arjun", "Admission", "600.00",  "600.00",  "600.00",  "Paid"  ],
      ["CSE09876543", "Sneha", "Transport", "1500.50", "1500.50", "1500.50", "Paid"  ],
      ["CSE09876543", "Priya", "Hostel",    "3500.00", "3500.00", "3500.00", "Paid"  ],
      ["CSE09876543", "Riya",  "Hostel",    "3500.00", "3500.00", "3500.00", "Unpaid"],
    ],
  },

  // ── 13. Defaulters Report ─────────────────────────────────────────────────
  "defaulters-report": {
    title: "Defaulters Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "rollNo",        header: "Roll Number"    },
      { key: "studentName",   header: "Student Name"   },
      { key: "pendingAmount", header: "Pending Amount", render: AmountCell },
      { key: "dueDate",       header: "Due Date"        },
      { key: "daysOverdue",   header: "Days Overdue"    },
    ],
    rows: [
      ["CSE09876543", "Arjun", "600.00",  "Jan 10", "40 Days"],
      ["CSE09876543", "Sneha", "1500.50", "Jan 5",  "42 Days"],
      ["CSE09876543", "Priya", "3500.00", "Jan 10", "40 Days"],
      ["CSE09876543", "Riya",  "3500.00", "Jan 20", "30 Days"],
    ],
  },

  // ── 14. Payment Mode Analysis ─────────────────────────────────────────────
  "payment-mode-analysis": {
    title: "Payment Mode Analysis",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "paymentMode",    header: "Payment Mode"              },
      { key: "totalTxn",       header: "Total Number of Transaction", render: AmountCell },
      { key: "amountCollected",header: "Amount Collecteed",           render: AmountCell },
    ],
    rows: [
      ["UPI",               "600.00",  "600.00" ],
      ["Credit/Debit Card", "1500.50", "1500.50"],
      ["Bank Transfer",     "3500.00", "3500.00"],
      ["Cash",              "3500.00", "3500.00"],
    ],
  },

  // ── 15. Asset Inventory ───────────────────────────────────────────────────
  "asset-inventory": {
    title: "Asset Inventory Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "assetName",          header: "Asset Name"          },
      { key: "category",           header: "Category"            },
      { key: "department",         header: "Department"          },
      { key: "totalQuantity",      header: "Total Quantity",      render: AmountCell },
      { key: "availableQuantity",  header: "Available Quantity",  render: AmountCell },
    ],
    rows: [
      ["Dell Optiplex",    "Electronics",   "ECE",        12,  10 ],
      ["Epson Projector",  "AV Equipment",  "CSE",        25,  25 ],
      ["Office Chair",     "Furniture",     "Admin",      200, 158],
      ["Oscilloscope",     "Lab Equipment", "Mechanical", 38,  35 ],
    ],
  },

  // ── 16. Asset Condition ───────────────────────────────────────────────────
  "asset-condition": {
    title: "Asset Condition Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "assetName",          header: "Asset Name"               },
      { key: "department",         header: "Department"               },
      { key: "goodConditionUnits", header: "Good Conditions Units"    },
      { key: "replacementRequired",header: "Replacement Required Unit"},
      { key: "scrappedUnit",       header: "Scrapped Unit"            },
    ],
    rows: [
      ["Desktop Computer", "Computer Science", 5, 5, 5],
      ["Lab Microscope",   "Bio Technology",   5, 5, 5],
      ["Projector",        "Computer Science", 5, 5, 5],
      ["Chemicals",        "Chemistry",        3, 3, 5],
    ],
  },

  // ── 17. Asset Valuation ───────────────────────────────────────────────────
  "asset-valuation": {
    title: "Asset Value Reports",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "assetName",           header: "Asset Name"            },
      { key: "department",          header: "Department"            },
      { key: "avgPurchaseCost",     header: "Average Purchase Cost", render: AmountCell },
      { key: "totalValue",          header: "Total Value",           render: AmountCell },
      { key: "goodConditionsValue", header: "Good Conditions Value", render: AmountCell },
      { key: "replacementValue",    header: "Replacement Value",     render: AmountCell },
      { key: "scrappedUnit",        header: "Scrapped Unit",         render: AmountCell },
    ],
    rows: [
      ["Desktop Computer", "Computer Science", "600.00",  "600.00",  "600.00",  "600.00",  "600.00" ],
      ["Lab Microscope",   "Bio Technology",   "1500.50", "1500.50", "1500.50", "1500.50", "1500.50"],
      ["Projector",        "Computer Science", "3500.00", "3500.00", "3500.00", "3500.00", "3500.00"],
      ["Chemicals",        "Chemistry",        "3500.00", "3500.00", "3500.00", "3500.00", "3500.00"],
    ],
  },

  // ── 18. Vendor-Wise Purchase ──────────────────────────────────────────────
  "vendor-purchase": {
    title: "Vendor-Wise Purchase Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "vendorName",        header: "Vendor Name"          },
      { key: "totalPurchaseCount",header: "Total Purchase Count"  },
      { key: "totalAmountSpent",  header: "Total Amount Spent",   render: AmountCell },
      { key: "outstandingAmount", header: "Outstanding Amount",   render: AmountCell },
    ],
    rows: [
      ["EduTech Solutions", 5, "600.00",  "600.00" ],
      ["Gloabl Lab",        5, "1500.50", "1500.50"],
      ["Campusfun",         5, "3500.00", "3500.00"],
      ["Campusfun",         3, "3500.00", "3500.00"],
    ],
  },

  // ── 19. Staff Directory ───────────────────────────────────────────────────
  "staff-directory": {
    title: "Staff Directory Reports",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "employeeId",   header: "Employee ID"   },
      { key: "employeeName", header: "Employee Name" },
      { key: "roleName",     header: "Role Name"     },
      { key: "department",   header: "Department"    },
      { key: "joiningDate",  header: "Joining Date"  },
      { key: "status",       header: "Status", render: StatusBadge },
    ],
    rows: [
      ["EMP001", "Dr. Devi",  "Principal",          "Tamil",            "Jan 2025", "Active"  ],
      ["EMP002", "Dr. Kumar", "Vice-Principal",     "English",          "Dec 2025", "Active"  ],
      ["EMP003", "Dr. Ravi",  "Head Of Department", "Commerce",         "Nov 2025", "Active"  ],
      ["EMP004", "Dr. Rao",   "Head of Department", "Computer Science", "Feb 2025", "Inactive"],
    ],
  },

  // ── 20. Staff Workload ────────────────────────────────────────────────────
  "staff-workload": {
    title: "Staff Workload Reports",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "employeeId",      header: "Employee ID"      },
      { key: "facultyName",     header: "Faculty Name"     },
      { key: "department",      header: "Department"       },
      { key: "assignedHours",   header: "Assigned Hours"   },
      { key: "maximumCapacity", header: "Maximum Capacity" },
      { key: "utilization",     header: "Utilization %", render: AttendancePct },
    ],
    rows: [
      ["EMP001", "Dr. Devi",  "Tamil",            40, 40, "85%"],
      ["EMP002", "Dr. Kumar", "English",          42, 42, "65%"],
      ["EMP003", "Dr. Ravi",  "Commerce",         40, 40, "90%"],
      ["EMP004", "Dr. Rao",   "Computer Science", 40, 40, "78%"],
    ],
  },

  // ── 21. Leave & Attendance ────────────────────────────────────────────────
  "leave-attendance": {
    title: "Leave & Attendance Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "employeeId",   header: "Employee ID"   },
      { key: "employeeName", header: "Employee Name" },
      { key: "department",   header: "Department"    },
      { key: "leaveType",    header: "Leave Type"    },
      { key: "leaveTaken",   header: "Leave Taken"   },
      { key: "leaveBalance", header: "Leave Balance" },
      { key: "attendance",   header: "Attendance %", render: AttendancePct },
    ],
    rows: [
      ["EMP001", "Dr. Devi",  "Tamil",            "Casual Leave", 11, 11, "85%"],
      ["EMP002", "Dr. Kumar", "English",          "Maternity",     2,  2, "65%"],
      ["EMP003", "Dr. Ravi",  "Commerce",         "Earned Leave", 10, 10, "90%"],
      ["EMP004", "Dr. Rao",   "Computer Science", "Sick Leave",   12, 12, "78%"],
    ],
  },

  // ── 19. Student Results ───────────────────────────────────────────────────
  "student-results": {
    title: "Students Results Reports",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "rollNo",      header: "Roll Number"  },
      { key: "studentName", header: "Student Name" },
      { key: "subjectName", header: "Subject Name" },
      { key: "marks",       header: "Marks",        render: AmountCell  },
      { key: "grade",       header: "Grade"         },
      { key: "results",     header: "Results",      render: ResultBadge },
    ],
    rows: [
      ["CSE09876543", "Arjun", "Computer Science", 62, "A", "Pass"],
      ["CSE09876543", "Sneha", "Bio Technology",   67, "B", "Pass"],
      ["CSE09876543", "Priya", "Computer Science", 80, "B", "Pass"],
      ["CSE09876543", "Riya",  "Chemistry",        87, "A", "Fail"],
    ],
  },

  // ── 20. Department Performance ────────────────────────────────────────────
  "dept-performance": {
    title: "Department Performance Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "department",           header: "Department"              },
      { key: "courseName",           header: "Course Name"             },
      { key: "totalStudentsAppeared",header: "Total Students Appeared", render: AmountCell    },
      { key: "totalStudentsPass",    header: "Total Students Pass",     render: AmountCell    },
      { key: "passPercent",          header: "Pass %",                  render: AttendancePct },
    ],
    rows: [
      ["Tamil",            "B.E Computer Science", 62, 62, "85%"],
      ["English",          "B.E Computer Science", 67, 67, "65%"],
      ["Commerce",         "All",                  80, 80, "90%"],
      ["Computer Science", "Computer Science",     87, 87, "78%"],
    ],
  },

  // ── 21. Subject Difficulty ────────────────────────────────────────────────
  "subject-difficulty": {
    title: "Subject Difficulty Reports",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "subjectName",    header: "Subject Name"   },
      { key: "department",     header: "Department"     },
      { key: "semester",       header: "Semester"       },
      { key: "averageMarks",   header: "Average Marks",  render: AmountCell    },
      { key: "passPercent",    header: "Pass %",          render: AttendancePct },
      { key: "difficultyRate", header: "Difficulty Rate", render: DifficultyRate},
    ],
    rows: [
      ["Computer Science", "Tamil",            "Sem 5", 62, "85%", "Medium"],
      ["Bio Technology",   "English",          "Sem 3", 67, "65%", "High"  ],
      ["Computer Science", "Commerce",         "Sem 5", 80, "90%", "Medium"],
      ["Chemistry",        "Computer Science", "Sem 1", 87, "78%", "Low"   ],
    ],
  },

  // ── 22. Feed Engagement ───────────────────────────────────────────────────
  "feed-engagement": {
    title: "Feed Engagement Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "feedTitle",       header: "Feed Title"       },
      { key: "department",      header: "Department"       },
      { key: "createdBy",       header: "Created By"       },
      { key: "totalViews",      header: "Total Views"      },
      { key: "engagementCount", header: "Engagement Count" },
    ],
    rows: [
      ["Tech Symposium 2026 Annoncement",  "Tamil",            "Dr. Devi",  5, 5],
      ["Guest Lecture On AI",              "English",          "Dr. Kumar", 5, 5],
      ["Robotics Workshop Registration",   "Commerce",         "Dr. Ravi",  5, 5],
      ["Annual Sports Meet Schedule",      "Computer Science", "Dr. Rao",   3, 3],
    ],
  },

  // ── 23. Event Participation ───────────────────────────────────────────────
  "event-participation": {
    title: "Event Participation Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "eventName",        header: "Event Name"        },
      { key: "department",       header: "Department"        },
      { key: "studentCount",     header: "Student Count"     },
      { key: "facultyCount",     header: "Faculty Count"     },
      { key: "totalParticipants",header: "Total Participants"},
      { key: "results",          header: "Results", render: ResultBadge },
    ],
    rows: [
      ["AI Workshop",    "CSE",        100, 10, 110, "Pass"],
      ["Seminar",        "ECE",         80, 15,  95, "Pass"],
      ["Cultural Fest",  "All",        130,  5, 135, "Pass"],
      ["Gest Lecture",   "Statistics",  60,  8,  68, "Fail"],
    ],
  },

  // ── 24. Notification Delivery ─────────────────────────────────────────────
  "notification-delivery": {
    title: "Notification Delivery Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "notificationTitle", header: "Notification Title" },
      { key: "department",        header: "Department"         },
      { key: "sentTo",            header: "Sent To"            },
      { key: "deliveredCount",    header: "Delivered Count"    },
      { key: "readRate",          header: "Read Rate", render: AttendancePct },
    ],
    rows: [
      ["Exam Schedule Update",    "Tamil",            "All Students",   120, "85%"],
      ["Fee Due Reminder",        "English",          "Fee Defaulters",  45, "65%"],
      ["Event Announcement",      "Commerce",         "All Students",   200, "90%"],
      ["Result Published",        "Computer Science", "All Students",   180, "78%"],
    ],
  },

  // ── 25. Attendance Vs Results ─────────────────────────────────────────────
  "attendance-vs-results": {
    title: "Attendance Vs Results Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "rollNo",       header: "Roll Number"   },
      { key: "studentName",  header: "Student Name"  },
      { key: "attendance",   header: "Attendance %",  render: AttendancePct },
      { key: "resultStatus", header: "Results Status", render: ResultBadge  },
    ],
    rows: [
      ["CSE09876543", "Arjun", "85%", "Pass"],
      ["CSE09876543", "Sneha", "65%", "Pass"],
      ["CSE09876543", "Priya", "90%", "Pass"],
      ["CSE09876543", "Riya",  "78%", "Fail"],
    ],
  },

  // ── 26. Fees Vs Attendance ────────────────────────────────────────────────
  "fees-vs-attendance": {
    title: "Fees Vs Attendance Report",
    filterConfig: {
      hasSearch: true,
      searchPlaceholder: "Search by Enquiries",
      dropdowns: [
        { key: "programType", label: "Program Type", options: PROG_OPTIONS },
        { key: "department",  label: "Department",   options: DEPT_OPTIONS },
        { key: "dateRange",   label: "Date Range",   options: DATE_OPTIONS },
      ],
    },
    columns: [
      { key: "rollNo",      header: "Roll Number"  },
      { key: "studentName", header: "Student Name" },
      { key: "attendance",  header: "Attendance %",  render: AttendancePct  },
      { key: "feesStatus",  header: "Fees Status",   render: FeeStatusBadge },
    ],
    rows: [
      ["CSE09876543", "Arjun", "85%", "Paid"  ],
      ["CSE09876543", "Sneha", "65%", "Paid"  ],
      ["CSE09876543", "Priya", "90%", "Paid"  ],
      ["CSE09876543", "Riya",  "78%", "Unpaid"],
    ],
  },

  // ── Generic fallback for non-Student-Mgmt reports ─────────────────────────
};

const FALLBACK_CONFIG = (id: string): ReportConfig => ({
  title: id.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" "),
  filterConfig: {
    hasSearch: false,
    dropdowns: [
      { key: "department", label: "Department", options: DEPT_OPTIONS },
      { key: "dateRange",  label: "Date Range", options: DATE_OPTIONS },
    ],
  },
  columns: [
    { key: "c1", header: "Column 1" },
    { key: "c2", header: "Column 2" },
    { key: "c3", header: "Column 3" },
    { key: "c4", header: "Column 4" },
    { key: "c5", header: "Column 5" },
  ],
  rows: Array.from({ length: 4 }, (_, i) => [
    `Row ${i + 1}`, `Item ${i + 1}`, `Dept ${i + 1}`, `Value ${i + 1}`, "—",
  ]),
});

// ── FilterDropdown ────────────────────────────────────────────────────────────
const FilterDropdown = ({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-[7px] text-sm border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors text-gray-600 min-w-[120px] justify-between"
      >
        <span className={value ? "font-medium text-gray-800" : ""}>{value || label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
          <ul className="py-1">
            {["", ...options].map((opt, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={["w-full text-left px-4 py-2.5 text-[13px] transition-colors",
                    opt === value
                      ? "text-[#1D6BA3] font-semibold bg-[#EFF6FF]"
                      : "text-gray-700 hover:bg-gray-50"].join(" ")}
                >
                  {opt || `All ${label}s`}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ── ExportDropdown ────────────────────────────────────────────────────────────
const ExportDropdown = ({ onCSV, onExcel, onPDF }: {
  onCSV:   () => void;
  onExcel: () => void;
  onPDF:   () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const options: { label: string; handler: () => void }[] = [
    { label: "Export as CSV",   handler: onCSV   },
    { label: "Export as Excel", handler: onExcel },
    { label: "Export as PDF",   handler: onPDF   },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors text-gray-700 font-medium"
      >
        Export
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 min-w-[150px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
          <ul className="py-1">
            {options.map(({ label, handler }) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => { handler(); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const ReportDetail = () => {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const config   = REPORT_CONFIGS[id ?? ""] ?? FALLBACK_CONFIG(id ?? "report");

  const { filterConfig, columns, rows, title } = config;

  // Dynamic filter state: one entry per dropdown key + optional search
  const [searchText,     setSearchText]     = useState("");
  const [appliedSearch,  setAppliedSearch]  = useState("");
  const [dropdownValues, setDropdownValues] = useState<Record<string, string>>(
    () => Object.fromEntries(filterConfig.dropdowns.map(d => [d.key, ""]))
  );

  const setDropdown = (key: string, val: string) =>
    setDropdownValues(prev => ({ ...prev, [key]: val }));

  const handleSearch = () => setAppliedSearch(searchText);

  const handleClear = () => {
    setSearchText("");
    setAppliedSearch("");
    setDropdownValues(Object.fromEntries(filterConfig.dropdowns.map(d => [d.key, ""])));
  };

  const hasActiveFilter = appliedSearch || Object.values(dropdownValues).some(Boolean);

  // Filter rows client-side
  const filteredRows = rows.filter(row => {
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase();
      if (!row.some(cell => String(cell).toLowerCase().includes(q))) return false;
    }
    return true;
  });

  // Convert rows → records using column headers (for export utilities)
  const toRecords = (r: CellValue[][]) =>
    r.map(row => Object.fromEntries(columns.map((col, i) => [col.header, row[i] ?? ""])));

  const handleExportExcel = () =>
    exportToExcel(toRecords(filteredRows), title.slice(0, 31), `${title}.xlsx`);

  const handleExportCSV = () =>
    exportToCSV(toRecords(filteredRows), `${title}.csv`);

  const handleExportPDF = () => window.print();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-visible">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/layout/reports")}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-base font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportDropdown onCSV={handleExportCSV} onExcel={handleExportExcel} onPDF={handleExportPDF} />
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white font-semibold rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="px-6 py-3.5 flex flex-wrap items-center justify-center gap-2.5 border-b border-gray-100">

          {/* Search input — only for reports that have it */}
          {filterConfig.hasSearch && (
            <>
              <div className="relative">
                <input
                  type="text"
                  placeholder={filterConfig.searchPlaceholder ?? "Search..."}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  className="pl-3 pr-8 py-[7px] text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/20 focus:border-[#1D6BA3]/50 w-64"
                />
                {searchText && (
                  <button
                    onClick={() => { setSearchText(""); setAppliedSearch(""); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                className="flex items-center gap-1.5 px-4 py-[7px] text-sm bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white font-medium rounded-lg transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </button>
            </>
          )}

          {/* Clear button */}
          <button
            onClick={handleClear}
            className={`px-4 py-[7px] text-sm font-medium rounded-lg transition-colors ${
              hasActiveFilter
                ? "bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white"
                : "bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 text-white"
            }`}
          >
            Clear
          </button>

          {/* Dynamic dropdowns */}
          {filterConfig.dropdowns.map(d => (
            <FilterDropdown
              key={d.key}
              label={d.label}
              options={d.options}
              value={dropdownValues[d.key] ?? ""}
              onChange={v => setDropdown(d.key, v)}
            />
          ))}
        </div>

        {/* ── Data Table ── */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#EFF6FF] border-b border-gray-100">
                {columns.map(col => (
                  <th
                    key={col.key}
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-gray-50/50 transition-colors">
                    {columns.map((col, ci) => (
                      <td key={col.key} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {col.render ? col.render(row[ci]) : String(row[ci] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ReportDetail;
