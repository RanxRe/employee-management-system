import { useEffect, useState, useCallback } from "react";
import { getMyEmployeeDashboard } from "@/services/employee.service";
import { getMyTodayAttendance, startBreak, endBreak } from "@/services/attendance.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentAvailabilityStatusClass, getEmploymentStatusClass } from "@/utils/statusColor";
import { Button } from "@/components/ui/button";

function EmployeeDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [todayAttendance, setTodayAttendance] = useState(null);
    const [attendanceFetchedAt, setAttendanceFetchedAt] = useState(Date.now());
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [breakActionLoading, setBreakActionLoading] = useState(false);
    const [attendanceError, setAttendanceError] = useState("");

    const fetchTodayAttendance = useCallback(async () => {
        try {
            setAttendanceError("");

            const response = await getMyTodayAttendance();

            setTodayAttendance(response);
            setAttendanceFetchedAt(Date.now());
        } catch (error) {
            console.error("Today's attendance error:", error);
            setAttendanceError(
                error.response?.data?.message ||
                "Unable to load today's attendance."
            );
        }
    }, []);

    useEffect(() => {
        fetchTodayAttendance();
    }, [fetchTodayAttendance]);

    // Update the displayed timer every second.
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const breakStatus = todayAttendance?.breakStatus ?? "Not Checked In";

    const extraElapsedMs = Math.max(0, currentTime - attendanceFetchedAt);

    const workingMs =
        (todayAttendance?.workingMs ?? 0) +
        (breakStatus === "Available" ? extraElapsedMs : 0);

    const totalBreakMs =
        (todayAttendance?.totalBreakMs ?? 0) +
        (breakStatus === "On Break" ? extraElapsedMs : 0);

    const formatDuration = (milliseconds = 0) => {
        const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [hours, minutes, seconds]
            .map((value) => String(value).padStart(2, "0"))
            .join(":");
    };

    const handleBreakAction = async () => {
        try {
            setBreakActionLoading(true);
            setAttendanceError("");

            if (breakStatus === "On Break") {
                await endBreak();
            } else {
                await startBreak();
            }

            await fetchTodayAttendance();
        } catch (error) {
            console.error("Break action error:", error);
            setAttendanceError(
                error.response?.data?.message ||
                "Unable to update your break status."
            );
        } finally {
            setBreakActionLoading(false);
        }
    };

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

    const summaryCards = [
        {
            label: "Today's Attendance",
            value: dashboard.attendance.today
                ? dashboard.attendance.today.status
                : "Not marked",
            color: "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/40",
            valueColor: "text-blue-700 dark:text-blue-300",
        },
        {
            label: "Pending Leaves",
            value: dashboard.leaves.pending,
            color: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
            valueColor: "text-amber-700 dark:text-amber-300",
        },
        {
            label: "Approved",
            value: dashboard.leaveBalances.balances.reduce(
                (total, balance) => total + balance.remaining,
                0
            ),
            mutedText: "Total remaining leaves",
            color: "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30",
            valueColor: "text-green-700 dark:text-green-300",
        },
        {
            label: "Notification",
            value: dashboard.notifications.unreadCount,
            mutedText: "Unread notifications",
            color: "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30",
            valueColor: "text-purple-700 dark:text-purple-300",
        },
    ];

    const profile = dashboard.profile;

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

            {/* Dashboard Summary */}

            {/* Dashboard Summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((item) => (
                    <Card
                        key={item.label}
                        className={item.color}
                    >
                        <CardHeader>
                            <CardTitle className="text-base">
                                {item.label}
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className={`text-2xl font-bold ${item.valueColor}`}>
                                {item.value}
                            </p>

                            {item.mutedText && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {item.mutedText}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Today's Working Hours and Break */}
            <Card>
                <CardHeader>
                    <CardTitle>Today's Work Session</CardTitle>
                    <CardDescription>
                        Track your working hours and breaks for today.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">
                                Working Time
                            </p>
                            <p className="mt-2 text-2xl font-semibold tabular-nums">
                                {formatDuration(workingMs)}
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">
                                Total Break Time
                            </p>
                            <p className="mt-2 text-2xl font-semibold tabular-nums">
                                {formatDuration(totalBreakMs)}
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">
                                Current Status
                            </p>
                            <p className={`mt-1 text-nowrap inline-flex items-center rounded-full px-2.5 py-1 font-medium mt-2 text-lg font-semibold${currentAvailabilityStatusClass(breakStatus)}`}>

                                {breakStatus}
                            </p>
                        </div>
                    </div>

                    {attendanceError && (
                        <p className="text-sm text-destructive" role="alert">
                            {attendanceError}
                        </p>
                    )}

                    {todayAttendance?.attendance?.checkIn &&
                        !todayAttendance.attendance.checkOut && (
                            <Button
                                onClick={handleBreakAction}
                                disabled={breakActionLoading}
                            >
                                {breakActionLoading
                                    ? "Updating..."
                                    : breakStatus === "On Break"
                                        ? "End Break"
                                        : "Start Break"}
                            </Button>
                        )}

                    {!todayAttendance?.attendance && (
                        <p className="text-sm text-muted-foreground">
                            Check in to start tracking your working hours and breaks.
                        </p>
                    )}
                </CardContent>
            </Card>

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
