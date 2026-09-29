import { Menu, X, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { logout } from "@/store/slices/authSlice";

function Header({ isSidebarOpen, onMenuClick }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());

        navigate("/login", {
            replace: true,
        });
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onMenuClick}
                aria-label={
                    isSidebarOpen ? "Close menu" : "Open menu"
                }
            >
                {isSidebarOpen ? (
                    <X className="size-5" />
                ) : (
                    <Menu className="size-5" />
                )}
            </Button>

            {/* Application name */}
            <div className="flex-1 md:flex-none">
                <h1 className="text-base font-semibold sm:text-lg">
                    Employee Management System
                </h1>
            </div>

            {/* User information + logout */}
            <div className="flex items-center gap-3">
                {/* User information */}
                <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium">
                        {user?.name || "User"}
                    </p>

                    <p className="text-xs capitalize text-muted-foreground">
                        {user?.role?.replace("_", " ") || "User"}
                    </p>
                </div>

                {/* Logout */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                >
                    <LogOut className="size-4" />

                    <span className="hidden sm:inline">
                        Logout
                    </span>
                </Button>
            </div>
        </header>
    );
}

export default Header;