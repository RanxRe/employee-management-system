import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    getPayrollById,
    updatePayroll,
} from "@/services/payroll.service";

function EditPayroll() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [payroll, setPayroll] = useState(null);

    const [formData, setFormData] = useState({
        basicSalary: "",
        allowances: "",
        deductions: "",
        remarks: "",
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getPayrollById(id);

            setPayroll(data.payroll);

            setFormData({
                basicSalary: data.payroll.basicSalary ?? "",
                allowances: data.payroll.allowances ?? "",
                deductions: data.payroll.deductions ?? "",
                remarks: data.payroll.remarks ?? "",
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load payroll."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError("");

            const data = {
                basicSalary: Number(formData.basicSalary),
                allowances: Number(formData.allowances || 0),
                deductions: Number(formData.deductions || 0),
                remarks: formData.remarks.trim(),
            };

            await updatePayroll(id, data);

            navigate(`/payroll/${id}`);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update payroll."
            );
        } finally {
            setSubmitting(false);
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

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading payroll...
            </div>
        );
    }

    if (error && !payroll) {
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
        return null;
    }

    // Only draft payrolls can be edited.
    if (payroll.status !== "draft") {
        return (
            <div className="space-y-4">
                <Button
                    variant="outline"
                    onClick={() =>
                        navigate(`/payroll/${id}`)
                    }
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Button>

                <Card>
                    <CardContent className="py-10 text-center">
                        <p className="font-medium">
                            This payroll cannot be edited.
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Only draft payroll records can be edited.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                        navigate(`/payroll/${id}`)
                    }
                    aria-label="Back to payroll details"
                >
                    <ArrowLeft className="size-4" />
                </Button>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Payroll
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Update the draft payroll record.
                    </p>
                </div>
            </div>

            {/* Payroll Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Payroll Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Employee
                            </p>

                            <p className="font-medium">
                                {payroll.employee?.user?.name ||
                                    "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Employee ID
                            </p>

                            <p className="font-medium">
                                {payroll.employee?.employeeId ||
                                    "—"}
                            </p>
                        </div>

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
                    </div>
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Edit Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Salary Details</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="basicSalary">
                                Basic Salary
                            </Label>

                            <Input
                                id="basicSalary"
                                name="basicSalary"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.basicSalary}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="allowances">
                                    Allowances
                                </Label>

                                <Input
                                    id="allowances"
                                    name="allowances"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.allowances}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deductions">
                                    Deductions
                                </Label>

                                <Input
                                    id="deductions"
                                    name="deductions"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.deductions}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks">
                                Remarks
                            </Label>

                            <textarea
                                id="remarks"
                                name="remarks"
                                rows={4}
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="Optional remarks..."
                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    navigate(`/payroll/${id}`)
                                }
                                disabled={submitting}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Saving..."
                                    : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default EditPayroll;