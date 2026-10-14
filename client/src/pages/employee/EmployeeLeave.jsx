import { useEffect, useState } from "react";
import {
    getMyLeaves,
    getMyLeaveSummary,
    updateMyLeave
} from "@/services/leave.service";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

function formatDate(dateString) {
    if (!dateString) return "—";

    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });

}

function getStatusClass(status) {
    const classes = {
        pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-700",
        approved: "border-green-500/40 bg-green-500/10 text-green-700",
        rejected: "border-destructive/30 bg-destructive/10 text-destructive",
        cancelled: "border-muted bg-muted text-muted-foreground",
    };

    return classes[status] || "border-muted bg-muted text-muted-foreground";

}

function EmployeeLeave() {
    const [leaves, setLeaves] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [actionError, setActionError] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const navigate = useNavigate()

    useEffect(() => {
        const fetchLeaves = async () => {
            setLoading(true);
            setError("");

            try {
                const [leavesResponse, summaryResponse] =
                    await Promise.all([
                        getMyLeaves(),
                        getMyLeaveSummary(),
                    ]);

                setLeaves(leavesResponse.leaves || []);
                setSummary(summaryResponse.summary || null);
            } catch (error) {
                console.error("Failed to fetch leaves:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load your leave applications."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchLeaves();
    }, []);

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading leave applications...
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

    const summaryCards = [
        {
            label: "Total Applications",
            value: summary?.total ?? 0,
            color: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/40",
        },
        {
            label: "Pending",
            value: summary?.pending ?? 0,
            color: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30",
        },
        {
            label: "Approved",
            value: summary?.approved ?? 0,
            color: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30",
        },
        {
            label: "Rejected",
            value: summary?.rejected ?? 0,
            color: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30",
        },
        {
            label: "Cancelled",
            value: summary?.cancelled ?? 0,
            color: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/40",
        },
    ];

    async function handleCancelLeave(leaveId) {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this leave application? This action cannot be undone."
        );

        if (!confirmed) return;

        setCancellingId(leaveId);
        setActionError("");
        setActionMessage("");

        try {
            await updateMyLeave(leaveId, {
                status: "cancelled",
            });

            // Refresh history and summary after cancellation.
            const [leavesResponse, summaryResponse] =
                await Promise.all([
                    getMyLeaves(),
                    getMyLeaveSummary(),
                ]);

            setLeaves(leavesResponse.leaves || []);
            setSummary(summaryResponse.summary || null);

            setActionMessage("Leave application cancelled successfully.");
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                "Unable to cancel the leave application."
            );
        } finally {
            setCancellingId(null);
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        My Leave
                    </h1>

                    <p className=" mt-2 text-sm text-muted-foreground sm:text-base">
                        View your leave applications and their approval status.
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/employee/leave/create")}
                >
                    Apply Leave
                </Button>
            </div>

            {/* Cancellation success/error messages */}
            {actionError && (
                <div
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                    {actionError}
                </div>
            )}

            {actionMessage && (
                <div
                    role="status"
                    className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400"
                >
                    {actionMessage}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {summaryCards.map((item) => (
                    <Card
                        key={item.label}
                        className={item.color}
                    >
                        <CardHeader className="pb-2">
                            <CardDescription className={item.color}>
                                {item.label}
                            </CardDescription>

                            <CardTitle className="text-2xl">
                                {item.value}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Leave History</CardTitle>

                    <CardDescription>
                        Your most recent applications appear first.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {leaves.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            You haven't applied for leave yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {leaves.map((leave) => (
                                <div
                                    key={leave._id}
                                    className="space-y-3 rounded-lg border p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <h3 className="font-medium capitalize">
                                                {leave.leaveType} Leave
                                            </h3>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Applied: {formatDate(leave.createdAt)}
                                            </p>
                                        </div>

                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(leave.status)}`}
                                        >
                                            {leave.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                        <div>
                                            <p className="text-muted-foreground">
                                                Start date
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(leave.startDate)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-muted-foreground">
                                                End date
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(leave.endDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Reason
                                        </p>
                                        <p className="text-sm">
                                            {leave.reason}
                                        </p>
                                    </div>

                                    {leave.reviewComment && (
                                        <div className="rounded-md bg-muted/60 p-3">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Reviewer comment
                                            </p>
                                            <p className="mt-1 text-sm">
                                                {leave.reviewComment}
                                            </p>
                                        </div>
                                    )}

                                    {leave.status === "pending" && (
                                        <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    navigate(`/employee/leave/${leave._id}/edit`)
                                                }
                                            >
                                                Edit Application
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                disabled={cancellingId === leave._id}
                                                onClick={() => handleCancelLeave(leave._id)}
                                            >
                                                {cancellingId === leave._id
                                                    ? "Cancelling..."
                                                    : "Cancel Application"}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

}

export default EmployeeLeave;
