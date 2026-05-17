import "./App.css";
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { GroupsProvider } from "./contexts/GroupsContext";
import { RolesProvider } from "./contexts/RolesContext";
import { StaffProvider } from "./contexts/StaffContext";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";

// Auth pages
const Login = lazy(() => import("./components/auth/Login/Login"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword/ForgotPassword"));
const Otp = lazy(() => import("./components/auth/Otp/Otp"));
const ResetPassword = lazy(() => import("./components/auth/ResetPassword/ResetPassword"));

// Shell
const Layouts = lazy(() => import("./components/Layouts/Layouts"));

// Super Admin Shell
const SuperAdminLayouts = lazy(() => import("./components/SuperAdminLayouts/SuperAdminLayouts"));

// Super Admin Pages
const SuperAdminDashboard   = lazy(() => import("./pages/super-admin/dashboard/SuperAdminDashboard"));
const SuperAdminCRM         = lazy(() => import("./pages/super-admin/crm/CRM"));
const SuperAdminReg         = lazy(() => import("./pages/super-admin/registrations/Registrations"));
const SuperAdminUserMgmt    = lazy(() => import("./pages/super-admin/user-management/UserManagement"));
const SuperAdminServiceInvoice = lazy(() => import("./pages/super-admin/finance/ServiceInvoice"));
const SuperAdminPaymentReport  = lazy(() => import("./pages/super-admin/finance/PaymentReport"));
const SuperAdminInvoiceHistory = lazy(() =>
  import("./pages/super-admin/finance/PaymentReport").then((module) => ({
    default: module.SuperAdminInvoiceHistory,
  }))
);
const SuperAdminPendingPayment = lazy(() =>
  import("./pages/super-admin/finance/PaymentReport").then((module) => ({
    default: module.SuperAdminPendingPayment,
  }))
);
const SuperAdminExpenses       = lazy(() => import("./pages/super-admin/finance/Expenses"));
const SuperAdminSupport     = lazy(() => import("./pages/super-admin/support/Support"));
const SuperAdminReports     = lazy(() => import("./pages/super-admin/reports/Reports"));
const SuperAdminSettings    = lazy(() => import("./pages/super-admin/settings/Settings"));

// Dashboard
const Overview = lazy(() => import("./components/Dashboard/Overview"));

// User Management
const GroupAccessManagement = lazy(
  () => import("./pages/management/user-management/GroupAccessManagement")
);
const AddAdminGroup = lazy(
  () => import("./pages/management/user-management/AddAdminGroup")
);
const RoleManagement = lazy(() => import("./pages/management/user-management/RoleManagement"));
const UserAccessManagement = lazy(
  () => import("./pages/management/user-management/UserAccessManagement")
);

// Academic Management
const ProgramCatalog = lazy(() => import("./pages/management/academic-management/ProgramCatalog"));
const Departments = lazy(() => import("./pages/management/academic-management/Departments"));
const Curriculum = lazy(() => import("./pages/management/academic-management/Curriculum"));
const Classes = lazy(() => import("./pages/management/academic-management/Classes"));
const Batch = lazy(() => import("./pages/management/academic-management/Batch"));
const Subjects = lazy(() => import("./pages/management/academic-management/Subjects"));
const Semester = lazy(() => import("./pages/management/academic-management/Semester"));
const RoomsLab = lazy(() => import("./pages/management/academic-management/RoomsLab"));
const ExamScheduling = lazy(() => import("./pages/management/academic-management/ExamScheduling"));
const AcademicCalendar = lazy(() => import("./pages/management/academic-management/AcademicCalendar"));

// Student Management
const StudentManagement = lazy(() => import("./pages/student-management/StudentManagement"));
const StudentDirectory = lazy(() => import("./pages/student-management/StudentDirectory"));
const StudentDetail = lazy(() => import("./pages/student-management/StudentDetail"));
const CertificateRegistry = lazy(() => import("./pages/student-management/CertificateRegistry"));
const CertificateTemplate = lazy(() => import("./pages/student-management/CertificateTemplate"));

// HR Management
const HRManagement = lazy(() => import("./pages/hr-management/HRManagement"));

// Staff Management
const StaffDashboard = lazy(() => import("./pages/staff-management/dashboard/StaffDashboard"));
const StaffDepartment = lazy(() => import("./pages/staff-management/department/Department"));
const Designations = lazy(() => import("./pages/staff-management/designations/Designations"));
const EmployeesDirectory = lazy(
  () => import("./pages/staff-management/employees-directory/EmployeesDirectory")
);
const AttendancePermission = lazy(
  () => import("./pages/staff-management/attendance-permission/AttendancePermission")
);
const LeaveCreation = lazy(() => import("./pages/staff-management/leave-creation/LeaveCreation"));
const LeaveAllocation = lazy(
  () => import("./pages/staff-management/leave-allocation/LeaveAllocation")
);
const Shift = lazy(() => import("./pages/staff-management/shift/Shift"));
const Approval = lazy(() => import("./pages/staff-management/approval/Approval"));
const AssignShift = lazy(() => import("./pages/staff-management/assign-shift/AssignShift"));
const EmployeeAddition = lazy(
  () => import("./pages/staff-management/employee-addition/employee-addition")
);
const ManageInstitutions = lazy(
  () => import("./pages/staff-management/manage-institutions/ManageInstitutions")
);

// New nav pages

const StaffWorkload       = lazy(() => import("./pages/staff-workload/StaffWorkload"));
const FeesCollection      = lazy(() => import("./pages/finance/Finance"));  // Fees Collection tab
const FeesConfiguration   = lazy(() => import("./pages/finance/FeesConfiguration"));
const FeesStructure       = lazy(() => import("./pages/finance/FeesStructure"));
const FeesGeneration      = lazy(() => import("./pages/finance/FeesGeneration"));
const AssetManagement     = lazy(() => import("./pages/asset-management/AssetManagement"));

// Asset Management sub-pages
const SupplierManagement = lazy(() => import("./pages/asset-management/SupplierManagement"));
const AssetLibrary       = lazy(() => import("./pages/asset-management/AssetLibrary"));
const AssetPurchase      = lazy(() => import("./pages/asset-management/AssetPurchase"));
const AvailableAsset     = lazy(() => import("./pages/asset-management/AvailableAsset"));

// Other pages
const Admissions = lazy(() => import("./pages/admissions/Admissions"));
const AdmissionsOverview = lazy(() => import("./pages/admissions/AdmissionsOverview"));
const ManualAdmissionEntry = lazy(() => import("./pages/admissions/ManualAdmissionEntry"));
const ApplicationReview = lazy(() => import("./pages/admissions/ApplicationReview"));
const ApplicationDetail = lazy(() => import("./pages/admissions/ApplicationDetail"));
const Calendar = lazy(() => import("./pages/calendar/Calendar"));
const Fees = lazy(() => import("./pages/fees/Fees"));
const Results = lazy(() => import("./pages/results/Results"));
const IndividualResultEntry = lazy(() => import("./pages/results/IndividualResultEntry"));
const Reports = lazy(() => import("./pages/reports/Reports"));
const ReportDetail = lazy(() => import("./pages/reports/ReportDetail"));
const CampusComms = lazy(() => import("./pages/campus-comms/CampusComms"));
const Support = lazy(() => import("./pages/support/Support"));
const Settings = lazy(() => import("./pages/settings/Settings"));
const InstitutionDetails = lazy(() => import("./pages/settings/InstitutionDetails"));
const ContactDetails = lazy(() => import("./pages/settings/ContactDetails"));
const AcademicSchedule = lazy(() => import("./pages/settings/AcademicSchedule"));
const ExamConfiguration = lazy(() => import("./pages/settings/ExamConfiguration"));
const StaffAttendanceSettings = lazy(() => import("./pages/settings/StaffAttendanceSettings"));
const StudentAttendanceSettings = lazy(() => import("./pages/settings/StudentAttendanceSettings"));
const AdmissionRollNumberSequence = lazy(() => import("./pages/settings/AdmissionRollNumberSequence"));
const PaymentConfiguration = lazy(() => import("./pages/settings/PaymentConfiguration"));
const FeeCalculation = lazy(() => import("./pages/settings/FeeCalculation"));
const EventRegistration = lazy(() => import("./pages/campus-comms/EventRegistration"));
const EventRegistrationDetails = lazy(() => import("./pages/campus-comms/EventRegistrationDetails"));
const Circulars = lazy(() => import("./pages/campus-comms/Circulars"));
const CreateCircular = lazy(() => import("./pages/campus-comms/CreateCircular"));
const EventManagement = lazy(() => import("./pages/campus-comms/EventManagement"));
const EventDetails = lazy(() => import("./pages/campus-comms/EventDetails"));
const CreateEvent = lazy(() => import("./pages/campus-comms/CreateEvent"));
const FeedManagement = lazy(() => import("./pages/campus-comms/FeedManagement"));
const FeedDetails = lazy(() => import("./pages/campus-comms/FeedDetails"));
const CreateFeed = lazy(() => import("./pages/campus-comms/CreateFeed"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <GroupsProvider>
          <RolesProvider>
            <StaffProvider>
              <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Auth routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/otp" element={<Otp />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected app routes — Sidebar + Navbar always visible via Layouts */}
                <Route path="/layout" element={<Layouts />}>
                  <Route index element={<Overview />} />

                  {/* Academic Management */}
                  <Route path="academic/program-catalog" element={<ProgramCatalog />} />
                  <Route path="academic/departments" element={<Departments />} />
                  <Route path="academic/classes" element={<Classes />} />
                  <Route path="academic/batch" element={<Batch />} />
                  <Route path="academic/curriculum" element={<Curriculum />} />
                  <Route path="academic/subjects" element={<Subjects />} />
                  <Route path="academic/semester" element={<Semester />} />
                  <Route path="academic/rooms-lab" element={<RoomsLab />} />
                  <Route path="academic/exam-scheduling" element={<ExamScheduling />} />
                  <Route path="academic/academic-calendar" element={<AcademicCalendar />} />

                  {/* Student Management */}
                  <Route path="student-management" element={<StudentManagement />} />
                  <Route path="student-management/directory" element={<StudentDirectory />} />
                  <Route path="student-management/directory/:id" element={<StudentDetail />} />
                  <Route path="student-management/certificate-registry" element={<CertificateRegistry />} />
                  <Route path="student-management/certificate-registry/issue" element={<CertificateTemplate />} />

                  {/* HR Management */}
                  <Route path="hr-management" element={<HRManagement />} />

                  {/* Staff Management */}
                  <Route path="staff-management/dashboard" element={<StaffDashboard />} />
                  <Route path="staff-management/department" element={<StaffDepartment />} />
                  <Route path="staff-management/designations" element={<Designations />} />
                  <Route path="staff-management/employees" element={<EmployeesDirectory />} />
                  <Route path="staff-management/employee-addition" element={<EmployeeAddition />} />
                  <Route
                    path="staff-management/attendance-permission"
                    element={<AttendancePermission />}
                  />
                  <Route path="staff-management/leave-creation" element={<LeaveCreation />} />
                  <Route path="staff-management/leave-allocation" element={<LeaveAllocation />} />
                  <Route path="staff-management/shift" element={<Shift />} />
                  <Route path="staff-management/approval" element={<Approval />} />
                  <Route path="staff-management/assign-shift" element={<AssignShift />} />


                  {/* User Management */}
                  <Route path="user-management/group-access" element={<GroupAccessManagement />} />
                  <Route path="user-management/group-access/add" element={<AddAdminGroup />} />
                  <Route path="user-management/roles" element={<RoleManagement />} />
                  <Route path="user-management/user-access" element={<UserAccessManagement />} />

                  {/* New nav pages */}
                  <Route path="manage-institution" element={<ManageInstitutions />} />
                  <Route path="staff-workload"     element={<StaffWorkload />} />

                  {/* Finance sub-pages */}
                  <Route path="finance/fees-configuration" element={<FeesConfiguration />} />
                  <Route path="finance/fees-structure"     element={<FeesStructure />} />
                  <Route path="finance/fees-generation"    element={<FeesGeneration />} />
                  <Route path="finance/fees-collection"    element={<FeesCollection />} />

                  <Route path="asset-management"   element={<AssetManagement />} />
                  <Route path="asset-management/suppliers"       element={<SupplierManagement />} />
                  <Route path="asset-management/asset-library"   element={<AssetLibrary />} />
                  <Route path="asset-management/asset-purchase"  element={<AssetPurchase />} />
                  <Route path="asset-management/available-asset" element={<AvailableAsset />} />

                  {/* Other pages */}
                  <Route path="admissions"                    element={<Admissions />} />
                  <Route path="admissions/overview"           element={<AdmissionsOverview />} />
                  <Route path="admissions/new-entry"          element={<ManualAdmissionEntry />} />
                  <Route path="admissions/application-review" element={<ApplicationReview />} />
                  <Route path="admissions/application-review/:id" element={<ApplicationDetail />} />
                  <Route path="calendar"     element={<Calendar />} />
                  <Route path="fees"         element={<Fees />} />
                  <Route path="results"      element={<Results />} />
                  <Route path="results/add-individual" element={<IndividualResultEntry />} />
                  <Route path="reports"           element={<Reports />} />
                  <Route path="reports/view/:id" element={<ReportDetail />} />
                  <Route path="campus-comms" element={<CampusComms />} />
                  <Route path="support"      element={<Support />} />
                  <Route path="settings"     element={<Settings />} />
                  <Route path="settings/institution-details" element={<InstitutionDetails />} />
                  <Route path="settings/contact-details" element={<ContactDetails />} />
                  <Route path="settings/academic-schedule" element={<AcademicSchedule />} />
                  <Route path="settings/exam-configuration" element={<ExamConfiguration />} />
                  <Route path="settings/staff-attendance" element={<StaffAttendanceSettings />} />
                  <Route path="settings/student-attendance" element={<StudentAttendanceSettings />} />
                  <Route path="settings/numbering-sequence" element={<AdmissionRollNumberSequence />} />
                  <Route path="settings/payment-configuration" element={<PaymentConfiguration />} />
                  <Route path="settings/fee-calculation" element={<FeeCalculation />} />

                  {/* Campus Comms */}
                  <Route path="campus-comms/event-registration" element={<EventRegistration />} />
                  <Route path="campus-comms/event-registration/view/:id" element={<EventRegistrationDetails />} />
                  <Route path="campus-comms/circulars" element={<Circulars />} />
                  <Route path="campus-comms/circulars/create" element={<CreateCircular />} />
                  <Route path="campus-comms/circulars/edit/:id" element={<CreateCircular />} />
                  <Route path="campus-comms/event-management" element={<EventManagement />} />
                  <Route path="campus-comms/event-management/view/:id" element={<EventDetails />} />
                  <Route path="campus-comms/event-management/create" element={<CreateEvent />} />
                  <Route path="campus-comms/event-management/edit/:id" element={<CreateEvent />} />
                  <Route path="campus-comms/feed-management" element={<FeedManagement />} />
                  <Route path="campus-comms/feed-management/view/:id" element={<FeedDetails />} />
                  <Route path="campus-comms/feed-management/create" element={<CreateFeed />} />
                  <Route path="campus-comms/feed-management/edit/:id" element={<CreateFeed />} />
                </Route>

                {/* ── Super Admin routes ───────────────────────────────── */}
                <Route path="/super-admin" element={<SuperAdminLayouts />}>
                  <Route index element={<SuperAdminDashboard />} />
                  <Route path="crm"             element={<SuperAdminCRM />} />
                  <Route path="registrations"   element={<SuperAdminReg />} />
                  <Route path="user-management" element={<SuperAdminUserMgmt />} />
                  <Route path="finance">
                    <Route index element={<Navigate to="service-invoice" replace />} />
                    <Route path="service-invoice" element={<SuperAdminServiceInvoice />} />
                    <Route path="payment-report" element={<SuperAdminPaymentReport />} />
                    <Route path="payment-report/:institutionId/pending" element={<SuperAdminPendingPayment />} />
                    <Route path="payment-report/:institutionId" element={<SuperAdminInvoiceHistory />} />
                    <Route path="expenses" element={<SuperAdminExpenses />} />
                  </Route>
                  <Route path="support"         element={<SuperAdminSupport />} />
                  <Route path="reports"         element={<SuperAdminReports />} />
                  <Route path="settings"        element={<SuperAdminSettings />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </StaffProvider>
        </RolesProvider>
      </GroupsProvider>
    </UserProvider>
  </AuthProvider>
  );
}

export default App;
