import { BrowserRouter, Routes, Route } from "react-router";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/common/Dashboard";

import ProtectedRoute from "@/routes/ProtectedRoutes";
import PublicRoute from "@/routes/PublicRoutes";
import RoleRoute from "@/routes/RoleRoutes";
import AdminLayout from "@/layouts/AdminLayouts";
import Employees from "@/pages/admin/Employees";
import EmployeeDetails from "@/pages/admin/EmployeeDetails";
import CreateEmployee from "@/pages/admin/CreateEmployee";
import EditEmployee from "@/pages/admin/EditEmployee";
import Departments from "@/pages/admin/Departments";
import CreateDepartment from "@/pages/admin/CreateDepartment";
import EditDepartment from "@/pages/admin/EditDepartment";
import Designations from "@/pages/admin/Designations";
import CreateDesignation from "@/pages/admin/CreateDesignation";
import EditDesignation from "@/pages/admin/EditDesignation";
import Attendance from "@/pages/admin/Attendance";
import AttendanceDetails from "@/pages/admin/AttendanceDetails";
import CreateAttendance from "@/pages/admin/CreateAttendance";
import CheckIn from "@/pages/employee/CheckIn";
import Leave from "@/pages/admin/Leave";
import LeaveDetails from "@/pages/admin/LeaveDetails";
import LeaveBalance from "@/pages/admin/LeaveBalance";
import CreateLeaveBalance from "@/pages/admin/CreateLeaveBalances";
import Payroll from "@/pages/admin/Payroll";
import PayrollDetails from "@/pages/admin/PayrollDetails";
import CreatePayroll from "@/pages/admin/CreatePayroll";
import EditPayroll from "@/pages/admin/EditPayroll";
import AdminManagement from "@/pages/admin/AdminManagement";
import NotFound from "@/pages/common/NotFound";
import CreateAdmin from "@/pages/admin/CreateAdmin";
import AdminDetails from "@/pages/admin/AdminDetails";
import EditAdmin from "@/pages/admin/EditAdmin";
import MyProfile from "@/pages/common/MyProfile";
import MyPassword from "@/pages/common/MyPassword";
import EmployeeLayout from "@/layouts/EmployeeLayouts";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import EmployeeCheckIn from "@/pages/employee/EmployeeCheckIn";
import EmployeeAttendance from "@/pages/employee/EmployeeAttendance";
import EmployeeLeave from "@/pages/employee/EmployeeLeave";
import CreateLeave from "@/pages/employee/CreateLeave";
import EditLeave from "@/pages/employee/EditLeave";
import EmployeeLeaveBalance from "@/pages/employee/EmployeeLeaveBalance";
import EmployeePayroll from "@/pages/employee/EmployeePayroll";
import EmployeeNotifications from "@/pages/employee/EmployeeNotification";
import EmployeeProfile from "@/pages/employee/EmployeeProfile";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public routes */}
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                </Route>

                {/* Protected routes */}
                {/* Admin/Super_Admin Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<RoleRoute allowedRoles={["admin", "super_admin"]} />}>
                        <Route element={<AdminLayout />}>

                            {/* Dashboard */}
                            <Route path="/dashboard" element={<Dashboard />} />

                            {/* Employees */}
                            <Route path="/employees" element={<Employees />} />
                            <Route path="/employees/create" element={<CreateEmployee />} />
                            <Route path="/employees/:id/edit" element={<EditEmployee />} />
                            <Route path="/employees/:id" element={<EmployeeDetails />} />

                            {/* Departments */}
                            <Route path="/departments" element={<Departments />} />
                            <Route path="/departments/create" element={<CreateDepartment />} />
                            <Route path="/departments/:id/edit" element={<EditDepartment />} />

                            {/* Designations */}
                            <Route path="/designations" element={<Designations />} />
                            <Route path="/designations/create" element={<CreateDesignation />} />
                            <Route path="/designations/:id/edit" element={<EditDesignation />} />

                            {/* Attendance */}
                            <Route path="/attendances" element={<Attendance />} />
                            <Route path="attendances/create" element={<CreateAttendance />} />
                            <Route path="/attendances/check-in" element={<CheckIn />} />
                            <Route path="/attendances/:id" element={<AttendanceDetails />} />

                            {/* Leave */}
                            <Route path="/leave" element={<Leave />} />
                            <Route path="/leave/:id" element={<LeaveDetails />} />

                            {/* Leave Balances */}
                            <Route path="/leave-balances" element={<LeaveBalance />} />
                            <Route path="/leave-balances/create" element={<CreateLeaveBalance />} />

                            {/* Payroll */}
                            <Route path="/payroll" element={<Payroll />} />
                            <Route path="/payroll/create" element={<CreatePayroll />} />
                            <Route path="/payroll/:id/edit" element={<EditPayroll />} />
                            <Route path="/payroll/:id" element={<PayrollDetails />} />
                            {/* Notification */}
                            {/* Admin Management */}
                            <Route path="/admin-management" element={<AdminManagement />} />
                            <Route path="/my-profile" element={<MyProfile />} />
                            <Route path="/my-password" element={<MyPassword />} />
                        </Route>
                    </Route>

                    {/* Super Admin Routes */}
                    <Route element={<RoleRoute allowedRoles={["super_admin"]} />}>
                        <Route element={<AdminLayout />}>

                            <Route path="/admin-management" element={<AdminManagement />} />
                            <Route path="/admin-management/create" element={<CreateAdmin />} />
                            <Route path="/admin-management/:id/edit" element={<EditAdmin />} />
                            <Route path="/admin-management/:id" element={<AdminDetails />} />
                        </Route>
                    </Route>


                    {/* Employee routes */}
                    <Route
                        element={
                            <RoleRoute allowedRoles={["employee"]} />
                        }
                    >
                        <Route element={<EmployeeLayout />}>
                            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                            <Route path="/employee/attendance" element={<EmployeeCheckIn />} />
                            <Route path="/employee/attendances/my" element={<EmployeeAttendance />} />
                            <Route path="/employee/leave" element={<EmployeeLeave />} />
                            <Route path="/employee/leave/create" element={<CreateLeave />} />
                            <Route path="/employee/leave-balance" element={<EmployeeLeaveBalance />} />
                            <Route path="/employee/payroll" element={<EmployeePayroll />} />
                            <Route path="/employee/notifications" element={<EmployeeNotifications />} />
                            <Route path="/employee/profile" element={<EmployeeProfile />} />
                            <Route path="/employee/leave/:id/edit" element={<EditLeave />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter >
    );
}

export default AppRoutes;