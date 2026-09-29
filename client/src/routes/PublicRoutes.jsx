import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

function PublicRoute() {
    const { isAuthenticated } = useSelector(
        (state) => state.auth
    );

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export default PublicRoute;