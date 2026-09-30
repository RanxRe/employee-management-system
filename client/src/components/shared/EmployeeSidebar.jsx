import {
    LayoutDashboard,
    CalendarCheck,
    CalendarDays,
    WalletCards,
    Wallet,
    Bell,
    UserCircle,
    X,
} from "lucide-react";

import { NavLink } from "react-router";

import { Button } from "@/components/ui/button";

const navigationItems = [
    {
        label: "Dashboard",
        path: "/employee/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "My Attendance",
        path: "/employee/attendance",
        icon: CalendarCheck,
    },
    {
        label: "My Leave",
        path: "/employee/leave",
        icon: CalendarDays,
    },
    {
        label: "Leave Balance",
        path: "/employee/leave-balances",
        icon: WalletCards,
    },
    {
        label: "My Payroll",
        path: "/employee/payroll",
        icon: Wallet,
    },
    {
        label: "Notifications",
        path: "/employee/notifications",
        icon: Bell,
    },
    {
        label: "My Profile",
        path: "/employee/profile",
        icon: UserCircle,
    },
];

function EmployeeSidebar({ isOpen, onClose }) {
    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={[
                    "fixed inset-y-0 left-0 z-50 w-64 border-r bg-background",
                    "transform transition-transform duration-200 ease-in-out",
                    "md:static md:z-auto md:block md:translate-x-0",
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full",
                ].join(" ")}
            >
                <div className="flex h-full flex-col md:h-[calc(100vh-4rem)]">
                    {/* Sidebar heading */}
                    <div className="flex items-center justify-between border-b px-6 py-5">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Employee Panel
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage your account
                            </p>
                        </div>

                        {/* Mobile close button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={onClose}
                            aria-label="Close menu"
                        >
                            <X className="size-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        [
                                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                            "hover:bg-muted",
                                            isActive
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground",
                                        ].join(" ")
                                    }
                                >
                                    <Icon className="size-5 shrink-0" />

                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
}

export default EmployeeSidebar;