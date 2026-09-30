import { useEffect, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { getLeaveById, updateLeaveStatus } from "@/services/leave.service";

function LeaveDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [leave, setLeave] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [reviewComment, setReviewComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState("");

    useEffect(() => {
        const fetchLeave = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getLeaveById(id);

                setLeave(data.leave);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load leave details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchLeave();
    }, [id]);

    const handleReview = async (status) => {
        try {
            setReviewLoading(true);
            setReviewError("");

            await updateLeaveStatus(
                id,
                status,
                reviewComment
            );

            const data = await getLeaveById(id);

            setLeave(data.leave);
            setReviewComment("");
        } catch (err) {
            setReviewError(
                err.response?.data?.message ||
                "Failed to update leave status."
            );
        } finally {
            setReviewLoading(false);
        }
    };
    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString();
    };

    const formatDateTime = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleString();
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-700";

            case "rejected":
                return "bg-red-100 text-red-700";

            case "cancelled":
                return "bg-gray-100 text-gray-700";

            case "pending":
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading leave details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/leave")}
                >
                    <ArrowLeft className="size-4" />
                    Back to Leave
                </Button>

                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            </div>
        );
    }

    if (!leave) {
        return (
            <div className="space-y-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/leave")}
                >
                    <ArrowLeft className="size-4" />
                    Back to Leave
                </Button>

                <p className="text-sm text-muted-foreground">
                    Leave request not found.
                </p>
            </div>
        );
    }

    const employee = leave.employee;
    const user = employee?.user;

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/leave")}
                    aria-label="Back to leave"
                >
                    <ArrowLeft className="size-4" />
                </Button>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Leave Details
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        View the complete leave request.
                    </p>
                </div>
            </div>

            {/* Employee Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Employee Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Name
                            </p>

                            <p className="font-medium">
                                {user?.name || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Employee ID
                            </p>

                            <p className="font-medium">
                                {employee?.employeeId || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Email
                            </p>

                            <p className="break-all font-medium">
                                {user?.email || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Employment Status
                            </p>

                            <p className="font-medium capitalize">
                                {employee?.employmentStatus || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Department
                            </p>

                            <p className="font-medium">
                                {employee?.department?.name || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Designation
                            </p>

                            <p className="font-medium">
                                {employee?.designation?.name || "—"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Leave Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Leave Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Leave Type
                            </p>

                            <p className="font-medium capitalize">
                                {leave.leaveType || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Status
                            </p>

                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                                    leave.status
                                )}`}
                            >
                                {leave.status || "—"}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Start Date
                            </p>

                            <p className="font-medium">
                                {formatDate(leave.startDate)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                End Date
                            </p>

                            <p className="font-medium">
                                {formatDate(leave.endDate)}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-sm text-muted-foreground">
                                Reason
                            </p>

                            <p className="whitespace-pre-wrap font-medium">
                                {leave.reason || "—"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Review Action */}
            {leave.status === "pending" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Review Leave Request</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div>
                            <label
                                htmlFor="reviewComment"
                                className="text-sm font-medium"
                            >
                                Review Comment
                            </label>

                            <textarea
                                id="reviewComment"
                                value={reviewComment}
                                onChange={(event) =>
                                    setReviewComment(event.target.value)
                                }
                                placeholder="Enter a comment for the employee..."
                                rows={4}
                                className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        {reviewError && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                {reviewError}
                            </div>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                onClick={() => handleReview("approved")}
                                disabled={reviewLoading}
                                className="sm:w-auto"
                            >
                                <Check className="size-4" />

                                {reviewLoading
                                    ? "Processing..."
                                    : "Approve Leave"}
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={() => handleReview("rejected")}
                                disabled={reviewLoading}
                                className="sm:w-auto"
                            >
                                <X className="size-4" />

                                {reviewLoading
                                    ? "Processing..."
                                    : "Reject Leave"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Review Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Review Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Reviewed By
                            </p>

                            <p className="font-medium">
                                {leave.reviewedBy?.name || "Not reviewed"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Reviewed At
                            </p>

                            <p className="font-medium">
                                {formatDateTime(leave.reviewedAt)}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-sm text-muted-foreground">
                                Review Comment
                            </p>

                            <p className="whitespace-pre-wrap font-medium">
                                {leave.reviewComment || "—"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Record Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Record Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Leave ID
                            </p>

                            <p className="break-all font-mono text-sm">
                                {leave._id}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Created At
                            </p>

                            <p className="font-medium">
                                {formatDateTime(leave.createdAt)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Updated At
                            </p>

                            <p className="font-medium">
                                {formatDateTime(leave.updatedAt)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default LeaveDetails;