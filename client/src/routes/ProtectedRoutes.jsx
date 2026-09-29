import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";

function ProtectedRoute() {
    const { isAuthenticated } = useSelector((state) => state.auth);

    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;