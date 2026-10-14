
import { useEffect, useState } from "react";
import { getMyLeaveBalances } from "@/services/leaveBalance.service";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function formatLeaveType(leaveType) {
    return leaveType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function EmployeeLeaveBalance() {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchBalances() {
            try {
                setLoading(true);
                setError("");

                const response = await getMyLeaveBalances();
                setBalances(response.leaveBalances || []);
            } catch (error) {
                console.error(
                    "Failed to fetch leave balances:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load your leave balances."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchBalances();
    }, []);

    const totalAllocated = balances.reduce(
        (total, item) => total + item.allocated,
        0
    );

    const totalUsed = balances.reduce(
        (total, item) => total + item.used,
        0
    );

    const totalRemaining = balances.reduce(
        (total, item) => total + item.remaining,
        0
    );

    const summaryCards = [
        {
            label: "Total Allocated",
            value: totalAllocated,
            color: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
        },
        {
            label: "Total Used",
            value: totalUsed,
            color: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
        },
        {
            label: "Total Remaining",
            value: totalRemaining,
            color: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300",
        },
    ];

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading leave balances...
            </div>
        );
    }

    if (error) {
        return (
            <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
                {error}
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    My Leave Balance
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    View your allocated, used, and remaining leave days.
                </p>
            </div>

            {balances.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="font-medium">
                            No leave balances found
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Your leave balances haven't been configured yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {summaryCards.map((item) => (
                            <Card
                                key={item.label}
                                className={item.color}
                            >
                                <CardHeader className="pb-2">
                                    <CardDescription className={item.color}>
                                        {item.label}
                                    </CardDescription>

                                    <CardTitle className="text-3xl">
                                        {item.value}
                                        <span className="ml-2 text-sm font-normal">
                                            days
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>

                    <div>
                        <h2 className="mb-3 text-lg font-semibold">
                            Leave Breakdown
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {balances.map((balance) => {
                                const percentage =
                                    balance.allocated > 0
                                        ? Math.min(
                                            100,
                                            Math.max(
                                                0,
                                                (balance.used /
                                                    balance.allocated) *
                                                100
                                            )
                                        )
                                        : 0;

                                return (
                                    <Card key={balance._id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <CardTitle>
                                                        {formatLeaveType(
                                                            balance.leaveType
                                                        )}
                                                    </CardTitle>

                                                    <CardDescription className="mt-1">
                                                        Leave year: {balance.year}
                                                    </CardDescription>
                                                </div>

                                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                    {balance.remaining} days left
                                                </span>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="rounded-md bg-muted/60 p-3">
                                                    <p className="text-xs text-muted-foreground">
                                                        Allocated
                                                    </p>
                                                    <p className="mt-1 text-xl font-semibold">
                                                        {balance.allocated}
                                                    </p>
                                                </div>

                                                <div className="rounded-md bg-muted/60 p-3">
                                                    <p className="text-xs text-muted-foreground">
                                                        Used
                                                    </p>
                                                    <p className="mt-1 text-xl font-semibold">
                                                        {balance.used}
                                                    </p>
                                                </div>

                                                <div className="rounded-md bg-muted/60 p-3">
                                                    <p className="text-xs text-muted-foreground">
                                                        Remaining
                                                    </p>
                                                    <p className="mt-1 text-xl font-semibold">
                                                        {balance.remaining}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Leave used</span>
                                                    <span>
                                                        {Math.round(percentage)}%
                                                    </span>
                                                </div>

                                                <div
                                                    className="h-2 overflow-hidden rounded-full bg-muted"
                                                    role="progressbar"
                                                    aria-label={`${formatLeaveType(balance.leaveType)} used`}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-valuenow={Math.round(
                                                        percentage
                                                    )}
                                                >
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default EmployeeLeaveBalance;