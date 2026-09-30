import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getAllEmployees } from "@/services/employee.service";
import { createPayroll } from "@/services/payroll.service";

function CreatePayroll() {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);

    const [formData, setFormData] = useState({
        employee: "",
        month: "",
        year: new Date().getFullYear().toString(),
        basicSalary: "",
        allowances: "",
        deductions: "",
        remarks: "",
    });

    const [loadingEmployees, setLoadingEmployees] =
        useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoadingEmployees(true);

                const data = await getAllEmployees();

                const activeEmployees = (
                    data.employees || []
                ).filter(
                    (employee) =>
                        employee.employmentStatus === "active"
                );

                setEmployees(activeEmployees);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load employees."
                );
            } finally {
                setLoadingEmployees(false);
            }
        };

        fetchEmployees();
    }, []);

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
                employee: formData.employee,
                month: Number(formData.month),
                year: Number(formData.year),
                basicSalary: Number(formData.basicSalary),
                allowances: Number(formData.allowances || 0),
                deductions: Number(formData.deductions || 0),
            };

            if (formData.remarks.trim()) {
                data.remarks = formData.remarks.trim();
            }

            await createPayroll(data);

            navigate("/payroll");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create payroll."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
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
                        Create Payroll
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Create a payroll record for an active employee.
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Payroll Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Employee */}
                        <div className="space-y-2">
                            <Label htmlFor="employee">
                                Employee
                            </Label>

                            <select
                                id="employee"
                                name="employee"
                                value={formData.employee}
                                onChange={handleChange}
                                required
                                disabled={loadingEmployees}
                                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">
                                    {loadingEmployees
                                        ? "Loading employees..."
                                        : "Select employee"}
                                </option>

                                {employees.map((employee) => (
                                    <option
                                        key={employee._id}
                                        value={employee._id}
                                    >
                                        {employee.employeeId} -{" "}
                                        {employee.user?.name ||
                                            employee.name ||
                                            "Employee"}
                                    </option>
                                ))}
                            </select>

                            {!loadingEmployees &&
                                employees.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No active employees available.
                                    </p>
                                )}
                        </div>

                        {/* Month + Year */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="month">
                                    Month
                                </Label>

                                <select
                                    id="month"
                                    name="month"
                                    value={formData.month}
                                    onChange={handleChange}
                                    required
                                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">
                                        Select month
                                    </option>

                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">
                                    Year
                                </Label>

                                <Input
                                    id="year"
                                    name="year"
                                    type="number"
                                    min="2000"
                                    value={formData.year}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Basic Salary */}
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
                                placeholder="Enter basic salary"
                                value={formData.basicSalary}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Allowances + Deductions */}
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
                                    placeholder="0"
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
                                    placeholder="0"
                                    value={formData.deductions}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="space-y-2">
                            <Label htmlFor="remarks">
                                Remarks
                            </Label>

                            <textarea
                                id="remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Optional remarks..."
                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/payroll")}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    submitting ||
                                    loadingEmployees ||
                                    employees.length === 0
                                }
                            >
                                {submitting
                                    ? "Creating..."
                                    : "Create Payroll"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default CreatePayroll;