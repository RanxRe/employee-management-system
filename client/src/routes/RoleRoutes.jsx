import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

function RoleRoute({ allowedRoles }) {
    const { user } = useSelector((state) => state.auth);

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export default RoleRoute;