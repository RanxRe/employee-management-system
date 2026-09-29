import { useState } from "react";
import { Outlet } from "react-router";

import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";

function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleToggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-muted/40">
            <Header
                isSidebarOpen={isSidebarOpen}
                onMenuClick={handleToggleSidebar}
            />

            <div className="flex">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={handleCloseSidebar}
                />

                <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;