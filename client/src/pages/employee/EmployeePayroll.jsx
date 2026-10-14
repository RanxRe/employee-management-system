
import { useCallback, useEffect, useState } from "react";
import {
    CalendarDays,
    CircleDollarSign,
    FileText,
    RefreshCw,
    Wallet,
} from "lucide-react";

import { getMyPayroll } from "@/services/payroll.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
};

const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
        case "paid":
            return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300";
        case "pending":
            return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
        case "processing":
            return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300";
        default:
            return "border-border bg-muted text-muted-foreground";
    }
};

function SalarySummaryCard({ title, amount, icon: Icon, description }) {
    return (
        <Card className="min-w-0">
            <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-5">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-2 break-words text-xl font-semibold sm:text-2xl">
                        {formatCurrency(amount)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>

                <div className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary">
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function EmployeePayroll() {
    const currentDate = new Date();

    const [payrolls, setPayrolls] = useState([]);
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [appliedFilters, setAppliedFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPayroll = useCallback(async (filters = {}) => {
        setLoading(true);
        setError("");

        try {
            const response = await getMyPayroll(filters);
            setPayrolls(response.payrolls ?? []);
        } catch (err) {
            const status = err.response?.status;
            const message =
                err.response?.data?.message || "Unable to load payroll records.";

            if (status === 404) {
                // The backend uses 404 when no matching records exist.
                setPayrolls([]);
            } else {
                setPayrolls([]);
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPayroll();
    }, [loadPayroll]);

    const handleApplyFilters = (event) => {
        event.preventDefault();

        const filters = {};

        if (month) filters.month = Number(month);
        if (year) filters.year = Number(year);

        setAppliedFilters(filters);
        loadPayroll(filters);
    };

    const handleClearFilters = () => {
        setMonth("");
        setYear("");
        setAppliedFilters({});
        loadPayroll();
    };

    // The backend sorts records by year and then month, newest first.
    // Summary cards represent the newest record, not a sum across history.
    const latestPayroll = payrolls[0];

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        My Payroll
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View your salary details and payment history.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadPayroll(appliedFilters)}
                    disabled={loading}
                    className="w-full sm:w-auto"
                >
                    <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {latestPayroll && (
                <section>
                    <h2 className="mb-3 text-lg font-semibold">Latest Salary Summary</h2>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <SalarySummaryCard
                            title="Basic Salary"
                            amount={latestPayroll.basicSalary}
                            icon={Wallet}
                            description="Base monthly salary"
                        />
                        <SalarySummaryCard
                            title="Allowances"
                            amount={latestPayroll.allowances}
                            icon={CircleDollarSign}
                            description="Additional earnings"
                        />
                        <SalarySummaryCard
                            title="Deductions"
                            amount={latestPayroll.deductions}
                            icon={FileText}
                            description="Amount deducted"
                        />
                        <SalarySummaryCard
                            title="Net Salary"
                            amount={latestPayroll.netSalary}
                            icon={CircleDollarSign}
                            description="Final payable amount"
                        />
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                        Summary for {MONTHS[latestPayroll.month - 1]} {latestPayroll.year}.
                    </p>
                </section>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filter Payroll</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleApplyFilters}
                        className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="payroll-month">Month</Label>
                            <select
                                id="payroll-month"
                                value={month}
                                onChange={(event) => setMonth(event.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">All months</option>
                                {MONTHS.map((monthName, index) => (
                                    <option key={monthName} value={index + 1}>
                                        {monthName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payroll-year">Year</Label>
                            <Input
                                id="payroll-year"
                                type="number"
                                min="2000"
                                max={currentDate.getFullYear() + 10}
                                placeholder="e.g. 2026"
                                value={year}
                                onChange={(event) => setYear(event.target.value)}
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            <CalendarDays className="mr-2 size-4" />
                            Apply Filters
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClearFilters}
                            disabled={loading || (!month && !year)}
                            className="w-full sm:w-auto"
                        >
                            Clear
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                >
                    <p>{error}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => loadPayroll(appliedFilters)}
                    >
                        Try Again
                    </Button>
                </div>
            )}

            <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold">Payroll History</h2>
                    {!loading && !error && (
                        <span className="text-sm text-muted-foreground">
                            {payrolls.length} record{payrolls.length === 1 ? "" : "s"}
                        </span>
                    )}
                </div>

                {loading ? (
                    <Card>
                        <CardContent className="p-8 text-center text-sm text-muted-foreground">
                            Loading payroll records…
                        </CardContent>
                    </Card>
                ) : !error && payrolls.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center p-8 text-center">
                            <FileText className="mb-3 size-10 text-muted-foreground" />
                            <h3 className="font-semibold">No payroll records found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Try another month or year, or check back when payroll is available.
                            </p>
                            {(month || year) && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={handleClearFilters}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : !error ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {payrolls.map((payroll) => (
                            <Card key={payroll._id} className="min-w-0">
                                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                                    <div className="min-w-0">
                                        <CardTitle className="text-base">
                                            {MONTHS[payroll.month - 1]} {payroll.year}
                                        </CardTitle>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Payroll ID: {payroll._id}
                                        </p>
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(payroll.status)}`}
                                    >
                                        {payroll.status}
                                    </span>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Basic Salary</p>
                                            <p className="mt-1 break-words font-medium">
                                                {formatCurrency(payroll.basicSalary)}
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Allowances</p>
                                            <p className="mt-1 break-words font-medium">
                                                {formatCurrency(payroll.allowances)}
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Deductions</p>
                                            <p className="mt-1 break-words font-medium">
                                                {formatCurrency(payroll.deductions)}
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                                            <p className="text-xs text-muted-foreground">Net Salary</p>
                                            <p className="mt-1 break-words font-semibold text-primary">
                                                {formatCurrency(payroll.netSalary)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 border-t pt-3 text-sm">
                                        <div className="flex flex-wrap justify-between gap-2">
                                            <span className="text-muted-foreground">Payment date</span>
                                            <span className="font-medium">
                                                {formatDate(payroll.paymentDate)}
                                            </span>
                                        </div>

                                        {payroll.remarks && (
                                            <div>
                                                <p className="text-muted-foreground">Remarks</p>
                                                <p className="mt-1 break-words">{payroll.remarks}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : null}
            </section>
        </div>
    );
}