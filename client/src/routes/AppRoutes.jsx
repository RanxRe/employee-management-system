import { BrowserRouter, Routes, Route } from "react-router";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/common/Dashboard";
import RoleTest from "@/pages/common/RoleTest";

import ProtectedRoute from "@/routes/ProtectedRoutes";
import PublicRoute from "@/routes/PublicRoutes";
import RoleRoute from "@/routes/RoleRoutes";

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

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

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