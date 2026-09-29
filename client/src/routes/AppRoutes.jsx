import { BrowserRouter, Routes, Route } from "react-router";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/common/Dashboard";
import RoleTest from "@/pages/common/RoleTest";

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

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public routes */}
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                </Route>

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>

                    <Route element={<AdminLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />

                        <Route path="/departments" element={<Departments />} />

                        <Route path="/departments/create" element={<CreateDepartment />} />

                        <Route path="/employees" element={<Employees />} />

                        <Route path="/employees/create" element={<CreateEmployee />} />

                        <Route path="/employees/:id/edit" element={<EditEmployee />} />

                        <Route path="/employees/:id" element={<EmployeeDetails />} />
                    </Route>

                    {/* Admin routes */}
                    <Route
                        element={
                            <RoleRoute
                                allowedRoles={["admin", "super_admin"]}
                            />
                        }
                    >
                        <Route
                            path="/admin-test"
                            element={<RoleTest />}
                        />
                    </Route>

                    {/* Employee routes */}
                    <Route
                        element={
                            <RoleRoute
                                allowedRoles={["employee"]}
                            />
                        }
                    >
                        <Route
                            path="/employee-test"
                            element={<RoleTest />}
                        />
                    </Route>

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;