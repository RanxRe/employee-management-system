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
import { createLeaveBalance } from "@/services/leaveBalance.service";

function CreateLeaveBalance() {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);

    const [formData, setFormData] = useState({
        employee: "",
        year: new Date().getFullYear(),
        leaveType: "casual",
        allocated: "",
    });

    const [loadingEmployees, setLoadingEmployees] =
        useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoadingEmployees(true);
                setError("");

                const data = await getAllEmployees();

                setEmployees(data.employees || []);
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
                year: Number(formData.year),
                leaveType: formData.leaveType,
                allocated: Number(formData.allocated),
            };

            await createLeaveBalance(data);

            navigate("/leave-balances");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create leave balance."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/leave-balances")}
                    aria-label="Back to leave balances"
                >
                    <ArrowLeft className="size-4" />
                </Button>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Add Leave Balance
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Allocate leave days to an employee.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Leave Balance Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
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
                                disabled={loadingEmployees || submitting}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">
                                    {loadingEmployees
                                        ? "Loading employees..."
                                        : "Select employee"}
                                </option>

                                {employees
                                    .filter(
                                        (employee) =>
                                            employee.employmentStatus ===
                                            "active"
                                    )
                                    .map((employee) => (
                                        <option
                                            key={employee._id}
                                            value={employee._id}
                                        >
                                            {employee.employeeId} —{" "}
                                            {employee.user?.name || "Unknown"}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Year */}
                        <div className="space-y-2">
                            <Label htmlFor="year">
                                Year
                            </Label>

                            <Input
                                id="year"
                                name="year"
                                type="number"
                                min="2000"
                                max="2100"
                                value={formData.year}
                                onChange={handleChange}
                                disabled={submitting}
                                required
                            />
                        </div>

                        {/* Leave Type */}
                        <div className="space-y-2">
                            <Label htmlFor="leaveType">
                                Leave Type
                            </Label>

                            <select
                                id="leaveType"
                                name="leaveType"
                                value={formData.leaveType}
                                onChange={handleChange}
                                disabled={submitting}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="casual">
                                    Casual
                                </option>

                                <option value="sick">
                                    Sick
                                </option>

                                <option value="earned">
                                    Earned
                                </option>

                                <option value="unpaid">
                                    Unpaid
                                </option>

                                <option value="other">
                                    Other
                                </option>
                            </select>
                        </div>

                        {/* Allocated */}
                        <div className="space-y-2">
                            <Label htmlFor="allocated">
                                Allocated Leave
                            </Label>

                            <Input
                                id="allocated"
                                name="allocated"
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="e.g. 12"
                                value={formData.allocated}
                                onChange={handleChange}
                                disabled={submitting}
                                required
                            />

                            <p className="text-xs text-muted-foreground">
                                Enter the number of leave days allocated
                                to this employee.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    navigate("/leave-balances")
                                }
                                disabled={submitting}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    submitting || loadingEmployees
                                }
                            >
                                {submitting
                                    ? "Creating..."
                                    : "Create Balance"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default CreateLeaveBalance;