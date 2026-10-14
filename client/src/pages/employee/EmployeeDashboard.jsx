import { useEffect, useState } from "react";
import { getMyEmployeeDashboard } from "@/services/employee.service";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function EmployeeDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getMyEmployeeDashboard();

                setDashboard(response.dashboard);
            } catch (error) {
                console.error(
                    "Employee dashboard error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="text-sm text-muted-foreground">
                No dashboard data available.
            </div>
        );
    }

    const profile = dashboard.profile;


    const getEmploymentStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

            case "inactive":
            case "terminated":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

            case "pending":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";

            case "rejected":
                return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";

            case "resigned":
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

            default:
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Welcome, {profile.user.name}
                </h1>

                <p className="text-sm text-muted-foreground">
                    Here's an overview of your employee account.
                </p>
            </div>

            {/* Employee Information */}
            <Card>
                <CardHeader>
                    <CardTitle>My Information</CardTitle>

                    <CardDescription>
                        Your current employment details
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Employee ID
                            </p>

                            <p className="font-medium">
                                {profile.employeeId}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Department
                            </p>

                            <p className="font-medium">
                                {profile.department?.name || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Designation
                            </p>

                            <p className="font-medium">
                                {profile.designation?.name || "-"}
                            </p>
                        </div>


                        <div>
                            <p className="text-sm text-muted-foreground">
                                Employment Status
                            </p>

                            <span
                                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getEmploymentStatusClass(profile.employmentStatus)}`}
                            >
                                {profile.employmentStatus || "Unknown"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dashboard Summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Today's Attendance
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-2xl font-bold">
                            {dashboard.attendance.today
                                ? dashboard.attendance.today.status
                                : "Not marked"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Pending Leaves
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-2xl font-bold">
                            {dashboard.leaves.pending}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Leave Balance
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-2xl font-bold">
                            {dashboard.leaveBalances.balances.reduce(
                                (total, balance) =>
                                    total + balance.remaining,
                                0
                            )}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            Total remaining leaves
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Notifications
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-2xl font-bold">
                            {dashboard.notifications.unreadCount}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            Unread notifications
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Leave Balances */}
            <Card>
                <CardHeader>
                    <CardTitle>Leave Balances</CardTitle>

                    <CardDescription>
                        {dashboard.leaveBalances.year} leave balance
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-3">
                        {dashboard.leaveBalances.balances.map(
                            (balance) => (
                                <div
                                    key={balance._id}
                                    className="flex items-center justify-between rounded-md border p-3"
                                >
                                    <div>
                                        <p className="font-medium capitalize">
                                            {balance.leaveType}
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            Used: {balance.used} /{" "}
                                            {balance.allocated}
                                        </p>
                                    </div>

                                    <p className="font-semibold">
                                        {balance.remaining} remaining
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Latest Payroll */}
            <Card>
                <CardHeader>
                    <CardTitle>Latest Payroll</CardTitle>

                    <CardDescription>
                        Your most recent salary record
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {dashboard.payroll.latest ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Basic Salary
                                </p>

                                <p className="font-medium">
                                    ₹
                                    {
                                        dashboard.payroll
                                            .latest.basicSalary
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Allowances
                                </p>

                                <p className="font-medium">
                                    ₹
                                    {
                                        dashboard.payroll
                                            .latest.allowances
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Deductions
                                </p>

                                <p className="font-medium">
                                    ₹
                                    {
                                        dashboard.payroll
                                            .latest.deductions
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Net Salary
                                </p>

                                <p className="font-semibold">
                                    ₹
                                    {
                                        dashboard.payroll
                                            .latest.netSalary
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No payroll record available.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default EmployeeDashboard;
