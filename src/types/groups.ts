export type PermMap = Record<string, { col1: boolean; col2: boolean }>;

export const SHOW_ONLY_MODULES = [
  "Dashboard",
  "Dashboard (Staff Management)",
  "Dashboard (Student Management)",
  "Event Registration",
];

export interface Group {
  id: number;
  name: string;
  rightsPerms: PermMap;
  reportPerms: PermMap;
}

export const RIGHTS_MODULES = [
  "Dashboard",
  "Dashboard (Staff Management)",
  "Dashboard (Student Management)",
  "Manage Institutions",
  "Academic Management",
  "Designation",
  "Leave Creation",
  "Staff Management (Except Dashboard)",
  "Staff Workload",
  "Student Directory",
  "Certificates (TC/CC/BC)",
  "Employee Directory",
  "Group Access Management",
  "Role Management",
  "User Access Management",
  "Fees Configuration",
  "Fees Structure",
  "Fees Generation",
  "Fees Collection",
  "Enquiries",
  "Admission Overview",
  "Application Review",
  "Feed Management",
  "Event Management",
  "Event Registration",
  "Circulars",
  "Results",
  "Supplier Management",
  "Asset Library",
  "Asset Purchase",
  "Available Asset",
  "Approvals",
  "Settings - Institution",
  "Settings - Academic",
  "Settings - Numbering",
  "Settings - Finance",
];

export const REPORT_MODULES = [
  "Department Academic Coverage Report",
  "Student Allocation Report",
  "Timetable Coverage",
  "Student Attendance Summary",
  "Staff Attendance Report",
  "Low Attendance Alert",
  "Fee Collection Summary",
  "Student Fee Status Report",
  "Defaulters Report",
  "Payment Mode Analysis",
  "Asset Inventory Report",
  "Asset Condition Report",
  "Asset Valuation Report",
  "Supplier Wise Purchase Report",
  "Staff Directory Report",
  "Staff Workload Report",
  "Leave & Attendance Report",
  "Student Results Report",
  "Department Performance Report",
  "Subject Difficulty Analysis",
  "Feed Engagement Report",
  "Event Participation Report",
  "Attendance vs Results Report",
  "Fees vs Attendance Report",
];

export function makeDefaultPerms(modules: string[]): PermMap {
  return Object.fromEntries(modules.map((m) => [m, { col1: false, col2: false }]));
}
