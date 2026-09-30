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

import { createAttendance } from "@/services/attendance.service";
import { getAllEmployees } from "@/services/employee.service";

function CreateAttendance() {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);

    const [formData, setFormData] = useState({
        employee: "",
        date: "",
        checkIn: "",
        checkOut: "",
        status: "present",
        remarks: "",
    });

    const [loadingEmployees, setLoadingEmployees] =
        useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoadingEmployees(true);

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
            setLoading(true);
            setError("");
            setSuccess("");

            const data = {
                employee: formData.employee,
                date: formData.date,
                checkIn: formData.checkIn || undefined,
                checkOut: formData.checkOut || undefined,
                status: formData.status,
                remarks: formData.remarks.trim(),
            };

            await createAttendance(data);

            setSuccess("Attendance created successfully.");

            setTimeout(() => {
                navigate("/attendances");
            }, 800);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create attendance."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/attendances")}
                    aria-label="Back to attendance"
                >
                    <ArrowLeft className="size-4" />
                </Button>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Create Attendance
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manually create an attendance record.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Attendance Information</CardTitle>
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
                                disabled={loadingEmployees || loading}
                                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        {employee.user?.name || "Unknown"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="date">
                                Attendance Date
                            </Label>

                            <Input
                                id="date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Check In */}
                        <div className="space-y-2">
                            <Label htmlFor="checkIn">
                                Check In
                            </Label>

                            <Input
                                id="checkIn"
                                name="checkIn"
                                type="datetime-local"
                                value={formData.checkIn}
                                onChange={handleChange}
                                disabled={loading}
                            />

                            <p className="text-xs text-muted-foreground">
                                Optional. Leave empty if there is no
                                check-in time.
                            </p>
                        </div>

                        {/* Check Out */}
                        <div className="space-y-2">
                            <Label htmlFor="checkOut">
                                Check Out
                            </Label>

                            <Input
                                id="checkOut"
                                name="checkOut"
                                type="datetime-local"
                                value={formData.checkOut}
                                onChange={handleChange}
                                disabled={loading}
                            />

                            <p className="text-xs text-muted-foreground">
                                Optional. Leave empty if there is no
                                check-out time.
                            </p>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">
                                Status
                            </Label>

                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={loading}
                                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="present">
                                    Present
                                </option>

                                <option value="absent">
                                    Absent
                                </option>

                                <option value="half-day">
                                    Half Day
                                </option>
                            </select>
                        </div>

                        {/* Remarks */}
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
                                disabled={loading}
                                placeholder="Optional remarks..."
                                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        {/* Messages */}
                        {error && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
                                {success}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/attendances")}
                                disabled={loading}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    loading || loadingEmployees
                                }
                            >
                                {loading
                                    ? "Creating..."
                                    : "Create Attendance"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default CreateAttendance;