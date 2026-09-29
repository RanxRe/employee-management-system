import { useEffect, useState } from "react";

import {
    Users,
    UserCheck,
    Clock,
    UserX,
    CalendarCheck,
    CalendarX,
    Clock3,
    CalendarDays,
    FileClock,
    CircleCheck,
    CircleX,
    Wallet,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { getDashboardStats } from "@/services/dashboard.service";

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getDashboardStats();

                setStats(data);
            } catch (error) {
                console.error("Dashboard stats error:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard statistics."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (loading) {
        return (
            <div className="py-10 text-center text-muted-foreground">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
            </div>
        );
    }

    const employees = stats?.employees;
    const attendance = stats?.attendance;
    const leaves = stats?.leaves;
    const payroll = stats?.payroll;

    return (
        <div className="space-y-8">
            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                    Dashboard
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Overview of your organization
                </p>
            </div>

            {/* Employees */}
            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Employees
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard
                        title="Total Employees"
                        value={employees?.total}
                        icon={Users}
                    />

                    <StatCard
                        title="Active"
                        value={employees?.active}
                        icon={UserCheck}
                    />

                    <StatCard
                        title="Pending"
                        value={employees?.pending}
                        icon={Clock}
                    />

                    <StatCard
                        title="Terminated"
                        value={employees?.terminated}
                        icon={UserX}
                    />

                    <StatCard
                        title="Resigned"
                        value={employees?.resigned}
                        icon={UserX}
                    />
                </div>
            </section>

            {/* Attendance */}
            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Today's Attendance
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Present"
                        value={attendance?.presentToday}
                        icon={CalendarCheck}
                    />

                    <StatCard
                        title="Absent"
                        value={attendance?.absentToday}
                        icon={CalendarX}
                    />

                    <StatCard
                        title="Half Day"
                        value={attendance?.halfDayToday}
                        icon={Clock3}
                    />

                    <StatCard
                        title="On Leave"
                        value={attendance?.leaveToday}
                        icon={CalendarDays}
                    />
                </div>
            </section>

            {/* Leaves */}
            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Leave Requests
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Pending"
                        value={leaves?.pending}
                        icon={FileClock}
                    />

                    <StatCard
                        title="Approved"
                        value={leaves?.approved}
                        icon={CircleCheck}
                    />

                    <StatCard
                        title="Rejected"
                        value={leaves?.rejected}
                        icon={CircleX}
                    />
                </div>
            </section>

            {/* Payroll */}
            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Payroll
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Draft"
                        value={payroll?.draft}
                        icon={FileClock}
                    />

                    <StatCard
                        title="Processed"
                        value={payroll?.processed}
                        icon={Clock3}
                    />

                    <StatCard
                        title="Paid"
                        value={payroll?.paid}
                        icon={CircleCheck}
                    />
                </div>

                {/* Payroll summary */}
                <Card className="mt-4">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-muted p-3">
                                <Wallet className="size-5" />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Payroll Summary
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Current payroll totals
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <PayrollAmount
                                label="Basic Salary"
                                value={payroll?.totalBasicSalary}
                            />

                            <PayrollAmount
                                label="Allowances"
                                value={payroll?.totalAllowances}
                            />

                            <PayrollAmount
                                label="Deductions"
                                value={payroll?.totalDeductions}
                            />

                            <PayrollAmount
                                label="Net Salary"
                                value={payroll?.totalNetSalary}
                            />
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function StatCard({ title, value, icon: Icon }) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-5">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                        {title}
                    </p>

                    <p className="mt-2 truncate text-2xl font-bold">
                        {value ?? 0}
                    </p>
                </div>

                <div className="ml-4 shrink-0 rounded-lg bg-muted p-3">
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

function PayrollAmount({ label, value }) {
    return (
        <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
                {label}
            </p>

            <p className="mt-2 text-xl font-bold">
                ₹{(value ?? 0).toLocaleString("en-IN")}
            </p>
        </div>
    );
}

export default Dashboard;