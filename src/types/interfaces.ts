import { type PermMap } from "./groups";

/**
 * This file centralizes all common TypeScript interfaces and types used across the application.
 * Aligning interfaces here helps avoid duplication and ensures type consistency.
 */

// ── Finance Interfaces ───────────────────────────────────────────────────────

export interface ExpenseListing {
  id: string;
  title: string;
  totalExpense: string;
}

export interface ExpenseMaster {
  id: string;
  title: string;
  status: boolean;
  createdDate: string;
  selected?: boolean;
}

export interface InstitutionPaymentReport {
  id: number;
  institutionName: string;
  totalAmount: number;
  totalPaymentDone: number;
  totalPaymentPending: number;
}

export interface InvoiceHistory {
  id: number;
  invoiceDate: string;
  invoiceNo: string;
  totalAmount: number;
  amountPaid: number;
  amountPending: number;
}

export interface PendingInvoice {
  id: number;
  invoiceDate: string;
  invoiceNo: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface Invoice {
  id: string;
  invoiceDate: string;
  invoiceNumber: string;
  institutionName: string;
  institutionType: string;
  engagementModel: string;
  planType: string;
  serviceType: string;
  total: string;
  amountPaid: string;
  remainingAmount: string;
  paymentStatus: PaymentStatus;
  createdBy: string;
  status: RecordStatus;
}

export interface ServiceItem {
  id: string;
  planType: string;
  planAmount: number;
  discount: number;
  totalUsers: number;
  amount: number;
  tax: number;
}

// ── Support Interfaces ───────────────────────────────────────────────────────

export interface TicketActivity {
  id: number;
  user: string;
  email?: string;
  date: string;
  message: string;
  type: "public" | "internal";
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  institutionName: string;
  raisedBy: {
    name: string;
    email: string;
  };
  modules: string;
  features: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Closed";
  lastUpdated: string;
  description: string;
  assignee?: string;
  environment: string;
  activity: TicketActivity[];
}

// ── CRM Interfaces ────────────────────────────────────────────────────────────

export type InstitutionStructure = "Single" | "Group";

export type PlanType = "Starter" | "Growth" | "Enterprise";

export type CRMStatus =
  | "New"
  | "Follow Up"
  | "Hold"
  | "Lost"
  | "Converted - Trail Version"
  | "Converted - Paid Version";

export interface Lead {
  id: number;
  institutionName: string;
  email: string;
  institutionPhone: string;
  contactPersonName: string;
  designation: string;
  phone: string;
  institutionStructure: InstitutionStructure;
  leadSource: string;
  engagementModel: string;
  planType: PlanType;
  leadGeneratedBy: string;
  status: CRMStatus;
  nextAction: string;
  actionType: string;
  notes: string;
}

// ── User Management Interfaces ────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  rights: string[];
  status: string;
  extraRightsCount: number;
}


export interface GroupFormBodyProps {
  name: string;
  setName: (v: string) => void;
  nameError: boolean;
  setNameError: (v: boolean) => void;
  activeTab: "rights" | "report";
  setActiveTab: (tab: "rights" | "report") => void;
  rightsPerms: PermMap;
  setRightsPerms: (p: PermMap) => void;
  reportPerms: PermMap;
  setReportPerms: (p: PermMap) => void;
}

export interface ManagementUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  institution: string;
  roleType: string;
  groupId: number | null;
  manualRightsPerms: Record<string, { col1: boolean; col2: boolean }>;
  manualReportPerms: Record<string, { col1: boolean; col2: boolean }>;
  status: "Active" | "Inactive";
  createdDate: string;
}

// ── Dashboard Interfaces ─────────────────────────────────────────────────────

export interface KpiCard {
  icon: React.ReactElement;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  change: string;
  changeUp: boolean;
}

export interface ExpiryRow {
  id: number;
  institution: string;
  type: string;
  location: string;
  plan: string;
  expiry: string;
  days: number;
}

export interface PipelineRow {
  id: number;
  prospect: string;
  source: string;
  engagementModel: string;
  revenue: string;
  status: "Negotiation" | "Trial Active" | "Hold" | "New";
}

export type EventType = "Holiday" | "Exam" | "Event";

export interface AcademicEvent {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: EventType;
  dayOrder?: string;
  description?: string;
}

export interface BranchItem {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  poc?: string;
  address?: string;
  radius?: number | string;
  assignedEmployees?: number;
  createdOn?: string;
  status?: string;
  isActive?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  code?: string;
  pincode?: string;
  city?: string;
  stateId?: string;
}

// ── Student Management Interfaces ─────────────────────────────────────────────

export interface Student {
  id: number;
  rollNo: string;
  admissionNo: string;
  name: string;
  gender: "Male" | "Female";
  phone: string;
  email: string;
  community: string;
  programType: string;
  scholarship: string;
  course: string;
  department: string;
  batch: string;
  admissionDate: string;
  status: "Active" | "Inactive";
}

// ── Staff Management Interfaces ───────────────────────────────────────────────

export interface DesignationItem {
  id: number;
  name: string;
  employeeCount: number;
}

export interface DepartmentItem {
  id: number;
  name: string;
  employeeCount: number;
}

export interface ShiftData extends Record<string, unknown> {
  id: string;
  name: string;
  isDefault?: boolean;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
}

// ── Attendance Interfaces ───────────────────────────────────────────────────

export interface AttendancePermissionItem extends Record<string, unknown> {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  biometrics: string;
  attendanceMethod: string;
}

// ── Staff Workload Interfaces ───────────────────────────────────────────────

export interface WorkloadBreakdown {
  subjectName: string;
  subjectType: string;
  weeklyHours: string;
  owningDept: string;
  trackingDept: string;
}

export interface AllocationData {
  subjectCode: string;
  subjectName: string;
  subjectType: "Core" | "Lab";
  weeklyHours: string;
  suggestedFaculty: string;
  assignedFaculty: string;
}

export interface FacultyCapacity {
  name: string;
  designation: string;
  assigned: number;
  max: number;
  isOverCapacity: boolean;
}

export interface TimetableSlot {
  subject: string;
  faculty: string;
  room: string;
  hasConflict?: boolean;
}

// ── Leave Management Interfaces ──────────────────────────────────────────────

export interface LeaveTemplateItem extends Record<string, unknown> {
  id: string;
  leaveName: string;
  alias: string;
  autoAllocation: string;
  carryForward: string;
  carryForwardDate: string;
}

// ── Academic Catalog Interfaces ─────────────────────────────────────────────

export interface SubUnit {
  id: number;
  subUnit: string;
  subUnitNumber: string;
  subUnitName: string;
}

export interface SubUnitDraft {
  draftId: number;
  subUnit: string;
  subUnitNumber: string;
  subUnitName: string;
}

export interface Unit {
  id: number;
  unitNumber: string;
  unitName: string;
  subUnits: SubUnit[];
}

export interface Subject {
  id: number;
  subjectCode: string;
  subjectName: string;
  curriculum: string[];
  department: string[];
  subjectType: string[];
  programType: string[];
  professors: string;
  year: string[];
  semester: string[];
  credits: string;
  units: Unit[];
  status?: string;
}

export interface StudentFull {
  id: number;
  rollNo: string;
  admissionNo: string;
  name: string;
  course: string;
  department: string;
  batch: string;
  status: "Active" | "Inactive";
  email: string;
  phone: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  nationality: string;
  religion: string;
  caste: string;
  community: string;
  motherTongue: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  programType: string;
  scholarship: string;
  fatherName: string;
  fatherOccupation: string;
  fatherPhone: string;
  fatherEmail: string;
  motherName: string;
  motherOccupation: string;
  motherPhone: string;
  motherEmail: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  accountHolder: string;
  accountNo: string;
  bankName: string;
  branchName: string;
  ifsc: string;
  accountType: string;
  tenthSchool: string;
  tenthYear: string;
  tenthPercent: string;
  tenthBoard: string;
  twelfthSchool: string;
  twelfthYear: string;
  twelfthPercent: string;
  twelfthBoard: string;
  ugCollege: string;
  ugYear: string;
  ugCgpa: string;
  ugDegree: string;
  docs: { label: string; status: "Uploaded" | "Pending" }[];
}

export interface Batch {
  id: number;
  batchName: string;
  linkedClass: string;
  startYear: string;
  endYear: string;
  status: "Active" | "Inactive";
}

export interface Curriculum {
  id: number;
  curriculumName: string;
  batchName: string;
  departmentName: string;
  institutionType: string;
  programType: string;
  description: string;
  status: "Active" | "Inactive";
}

export interface Class {
  id: number;
  departmentName: string;
  course: string;
  className: string;
  programType: string;
  sections: string;
}

export interface Department {
  id: number;
  department: string;
  course: string;
  institution: string;
  programLevels: number;
  sanctionedStrength: number;
  studentStrength: number;
}

export interface Room {
  id: number;
  roomName: string;
  roomType: string;
  capacity: number;
  department: string;
}

export interface StagingEntry {
  id: number;
  institution: string;
  stream: string;
  department: string;
  course: string;
}

export interface MapRow {
  id: number;
  department: string;
  course: string;
  stream: string;
  degreeName: string;
  sections: number;
  ug: boolean;
  pg: boolean;
  research: boolean;
  phd: boolean;
  ugStrength?: string;
  pgStrength?: string;
  researchStrength?: string;
  phdStrength?: string;
}

export interface EmployeeReference {
  id: number;
  name: string;
  contactNumber: string;
  designation: string;
}

export interface StaffScheduleException {
  id: string;
  fromDate: string;
  toDate: string;
  type: string;
  applicableTo: string;
}

export interface Degree {
  id: number;
  degreeName: string;
  programType: string;
  duration: number;
  stream: string;
  semesters: number;
  institution: string;
  status: "Active" | "Inactive";
}

export interface Semester {
  id: number;
  semesterName: string;
  department: string;
  programType: string;
  curriculum: string;
  year: string;
  semester: string;
  subjects: string[];
  totalCredits: number;
}

export interface Scholarship {
  id: string;
  name: string;
  type: string;
  value: string;
  percentageFixed: string;
}

export interface FeeCategory {
  id: string;
  categoryName: string;
  description: string;
  feeType: string;
  frequency: string;
}

export interface FeeStructure {
  id: string;
  category: string;
  paymentType: string;
  department: string;
  courseName: string;
  semester: string;
  amount: string;
}

export interface FeeGeneration {
  id: string;
  department: string;
  courseName: string;
  frequency: string;
  tuitionFee: string;
  labFee: string;
  examFee: string;
  transportFee: string;
}

export interface ApplicationFee {
  id: string;
  name: string;
  appNo: string;
  course: string;
  type: string;
  amount: string;
  dueDate: string;
}

export interface AdmissionFee {
  id: string;
  appNo: string;
  name: string;
  paidDate: string;
  totalAmount: string;
  paidAmount: string;
  balance: string;
  isBalanceRed?: boolean;
}

export interface RegularFee {
  id: string;
  rollNo: string;
  name: string;
  scholarship: string;
  attendance: string;
  attendanceColor: string;
  fineApplicable: string;
  feeAmount: string;
  fineAmount: string;
}

export interface ParticipantRow {
  id: string;
  name: string;
  type: string;
  department: string;
  status: string;
}

export interface FeedRow {
  id: string;
  sNo: number;
  image: string;
  feedTitle: string;
  audience: string;
  department: string;
  createdBy: string;
  createdDate: string;
  visibility: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface RegistrationRow {
  sNo: number;
  id: string;
  name: string;
  type: string;
  department: string;
  eventName: string;
  eventId: string;
}

export interface Supplier {
  id: number;
  name: string;
  company: string;
  type: "Purchase" | "None";
  phone: string;
  email: string;
  gst: string;
  msme?: string;
  registerAddress?: string;
  addressLine1?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  status?: "Active" | "Inactive";
}

export interface PurchaseRecord {
  id: number;
  invoiceNo: string;
  typeOfPurchase: string;
  supplier: string;
  department: string;
  invoiceDate: string;
  total: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  createdBy: string;
  status: RecordStatus;
  tax: number;
}

export interface AssetLine {
  id: number;
  asset: string;
  unit: string;
  price: number;
  qty: number;
  amount: number;
  tax: number;
}

export interface Asset {
  id: number;
  name: string;
  category: string;
  department: string;
  purchaseUnit: string;
  purchasePrice: number;
  reconPrice: number;
  taxType: TaxType;
  tax: number;
  barcode: string;
  hsnCode: string;
  gtin: string;
  brandName: string;
  status: AssetStatus;
}

export type PaymentStatus = "Paid" | "Partially Paid" | "Unpaid";
export type RecordStatus = "Saved" | "Cancelled";
export type TaxType = "GST" | "VAT";
export type AssetStatus = "Active" | "Inactive";

export interface AppEntry {
  id: number;
  appNo: string;
  name: string;
  course1: string;
  course2: string;
  gender: string;
  age: number;
  admissionType: string;
  status: string;
}

export interface Concession {
  id: string;
  componentName: string;
  type: string;
  value: string;
  percentageFixed: string;
}

export interface FineRule {
  id: string;
  componentName: string;
  type: string;
  amountValue: string;
  frequency: string;
}

export interface ExamType {
  id: string;
  name: string;
  durationMin: string;
  minGapDays: string;
  maxMarks: string;
  passMarks: string;
}

export interface ExamSession {
  id: string;
  sessionName: string;
  startTime: string;
  endTime: string;
}

export interface AssessmentComponent {
  id: string;
  componentName: string;
  maxMarks: string;
}

export interface ExamScheduleOverride {
  id: string;
  examType: string;
  classYear: string;
  session: string;
  examTiming: string;
}

export interface AcademicScheduleOverride {
  id: string;
  fromDate: string;
  toDate: string;
  type: string;
  timeTableOrder: string;
  reason: string;
}

export interface Break {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface ClassOverride {
  id: string;
  classYear: string;
  closeTime: string;
  breakTime: string;
}

export interface CertRecord {
  id: number;
  certType: string;
  certNo: string;
  studentName: string;
  rollNo: string;
  admissionNo: string;
  department: string;
  issueDate: string;
  issuedBy: string;
  status: "Active" | "Inactive";
  batch: string;
  programType: string;
}

export interface LeaveAllocationItem extends Record<string, unknown> {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  earnedLeave: boolean;
  casualLeave: boolean;
  earnedBalance: number;
  casualBalance: number;
}

export interface EmployeeShiftData extends Record<string, unknown> {
  id: string;
  name: string;
  department: string;
  designation: string;
  branch: string;
  shiftName: string;
  isDefault?: boolean;
}

export interface ApprovalRequest {
  id: string;
  type: "Attendance" | "Leave" | "On Duty";
  subType: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  date: string;
  day: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedOn?: string;
  oldData?: string;
  newData?: string;
  employeeReason?: string;
}

export interface ReportItem {
  id: string;
  title: string;
  description: string;
  columns: number;
  iconBg: string;
  Icon: React.ElementType;
  defaultStarred: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  reports: ReportItem[];
}

export interface ResultRow {
  subjectId: string;
  studentName: string;
  department: string;
  subject: string;
  marks: number;
  grade: string;
  results: string;
  status: string;
}

// ── Additional Domain Interfaces ───────────────────────────────────────────

export interface StudentOption {
  id: number;
  rollNo: string;
  admissionNo: string;
  name: string;
  course: string;
  batch: string;
  dob: string;
  gender: string;
  nationality: string;
  parentName: string;
  admissionDate: string;
  department: string;
  email: string;
  leaveDate: string;
}

export interface ExplorerRow {
  name: string;
  subjectId: string;
  subject: string;
  marks: number;
  grade: string;
  results: string;
}

export type FeedStatus = "Pending" | "Approved" | "Rejected";

export interface FeedData {
  id: string;
  title: string;
  date: string;
  author: string;
  status: FeedStatus;
  description: string;
  audience: string;
  department: string;
  visibility: string;
  schedule: string;
}

export interface Institution {
  id: number;
  name: string;
  structure: "Single" | "Group";
  adminName: string;
  adminEmail: string;
  engagementModel: "Subscription (SaaS)" | "Custom";
  avatarText: string;
  avatarTone: string;
  planType?: string;
  onboardedOn?: string;
  planExpire?: string;
  serviceType?: string;
  status?: "Active" | "Inactive";
}

export type EventStatus = "Pending" | "Approved" | "Rejected";

export interface EventRow {
  id: string;
  sNo: number;
  image: string;
  eventTitle: string;
  type: string;
  department: string;
  mode: "Offline" | "Online";
  date: string;
  registration: "Open" | "Closed" | "Not required";
  status: EventStatus;
  visibility: number;
  activeStatus: "Active" | "Inactive";
}

export interface EmployeeItem {
  id: number;
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  masterBranch: string;
  status: "Active" | "Inactive";
}

export interface Role {
  id: number;
  name: string;
  created: string;
  modified: string;
}

export interface Group {
  id: number;
  name: string;
  members: number;
  created: string;
  status: "Active" | "Inactive";
}

// ── Admissions Interfaces ────────────────────────────────────────────────────

export interface AdmissionEntry {
  id: number;
  name: string;
  phone: string;
  email: string;
  interestedCourse: string;
  source: string;
  date: string;
  status: string;
  institution: string;
  comments: string;
}

export interface GeneralEntry {
  id: number;
  name: string;
  phone: string;
  email: string;
  visitPurpose: string;
  date: string;
  whomToMeet: string;
  others: string;
  institution: string;
  comments: string;
}

export interface AdmissionOverviewRow {
  id: number;
  course: string;
  adminType: string;
  submitted: number;
  draft: number;
}

export interface AdmissionAppEntry {
  id: number;
  appNo: string;
  name: string;
  course1: string;
  course2: string;
  gender: string;
  age: number;
  admissionType: string;
  status: string;
}

// ── Asset Management Interfaces ───────────────────────────────────────────────

export interface AssetRegisterRow {
  id: number;
  sNo: number;
  assetName: string;
  assetType: string;
  category: string;
  department: string;
  purchaseDate: string;
  status: "Working" | "Under Repair" | "Discarded";
}

export interface AssetAvailabilityRow {
  id: number;
  assetName: string;
  department: string;
  supplier: string;
  totalQty: number;
  good: number;
  replace: number;
  scrap: number;
  avgPrice: number;
  estValue: number;
  lastUpdate: string;
}

export interface AssetPurchaseRecord {
  id: number;
  sNo: number;
  assetName: string;
  vendorName: string;
  purchaseDate: string;
  amount: string;
  warranty: string;
  status: "Completed" | "Pending" | "Cancelled";
}

// ── Campus Comms Interfaces ──────────────────────────────────────────────────

export interface FeedRow_2 {
  id: string;
  sNo: number;
  title: string;
  date: string;
  author: string;
  status: FeedStatus;
  department: string;
}
