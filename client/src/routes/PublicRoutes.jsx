import { Navigate, Outlet } from "react-router";

import { useSelector } from "react-redux";

function PublicRoute() {
    const { user, isAuthenticated } = useSelector(
        (state) => state.auth
    );

    if (isAuthenticated) {
        const destination =
            user?.role === "employee"
                ? "/employee/dashboard"
                : "/dashboard";

        return (
            <Navigate
                to={destination}
                replace
            />
        );
    }

    return <Outlet />;
}

export default PublicRoute;

