import { useEffect, useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    getPayrollById,
    updatePayrollStatus
} from "@/services/payroll.service";

function PayrollDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [payroll, setPayroll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusLoading, setStatusLoading] = useState(false);

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getPayrollById(id);

            setPayroll(data.payroll);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load payroll details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            setStatusLoading(true);
            setError("");

            await updatePayrollStatus(id, newStatus);

            // The status update response is not fully populated,
            // so fetch the payroll again.
            const data = await getPayrollById(id);

            setPayroll(data.payroll);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update payroll status."
            );
        } finally {
            setStatusLoading(false);
        }
    };

    const getMonthName = (month) => {
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        return months[month - 1] || "—";
    };

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-700";

            case "processed":
                return "bg-blue-100 text-blue-700";

            case "draft":
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading payroll details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/payroll")}
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Button>

                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            </div>
        );
    }

    if (!payroll) {
        return (
            <div className="space-y-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/payroll")}
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Button>

                <p className="text-sm text-muted-foreground">
                    Payroll record not found.
                </p>
            </div>
        );
    }

    const employee = payroll.employee;
    const user = employee?.user;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/payroll")}
                        aria-label="Back to payroll"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Payroll Details
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            View employee payroll information.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {payroll.status === "draft" && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate(`/payroll/${id}/edit`)
                                }
                            >
                                <Pencil className="size-4" />
                                Edit Payroll
                            </Button>

                            <Button
                                onClick={() =>
                                    handleStatusUpdate("processed")
                                }
                                disabled={statusLoading}
                            >
                                {statusLoading
                                    ? "Processing..."
                                    : "Process Payroll"}
                            </Button>
                        </>
                    )}

                    {payroll.status === "processed" && (
                        <Button
                            onClick={() =>
                                handleStatusUpdate("paid")
                            }
                            disabled={statusLoading}
                        >
                            {statusLoading
                                ? "Processing..."
                                : "Mark as Paid"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Employee Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Employee Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                Email
                            </p>

                            <p className="font-medium break-all">
                                {user?.email || "—"}
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

            {/* Payroll Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Payroll Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Month
                            </p>

                            <p className="font-medium">
                                {getMonthName(payroll.month)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Year
                            </p>

                            <p className="font-medium">
                                {payroll.year || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Status
                            </p>

                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                                    payroll.status
                                )}`}
                            >
                                {payroll.status || "—"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Salary Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Salary Breakdown</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <span className="text-sm text-muted-foreground">
                                Basic Salary
                            </span>

                            <span className="font-medium">
                                ₹{formatAmount(payroll.basicSalary)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b pb-3">
                            <span className="text-sm text-muted-foreground">
                                Allowances
                            </span>

                            <span className="font-medium">
                                ₹{formatAmount(payroll.allowances)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b pb-3">
                            <span className="text-sm text-muted-foreground">
                                Deductions
                            </span>

                            <span className="font-medium">
                                ₹{formatAmount(payroll.deductions)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="font-semibold">
                                Net Salary
                            </span>

                            <span className="text-lg font-bold">
                                ₹{formatAmount(payroll.netSalary)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment / Record Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Record Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Payment Date
                            </p>

                            <p className="font-medium">
                                {formatDate(payroll.paymentDate)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Created At
                            </p>

                            <p className="font-medium">
                                {formatDate(payroll.createdAt)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Updated At
                            </p>

                            <p className="font-medium">
                                {formatDate(payroll.updatedAt)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm text-muted-foreground">
                            Remarks
                        </p>

                        <p className="mt-1 whitespace-pre-wrap font-medium">
                            {payroll.remarks || "No remarks."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default PayrollDetails;