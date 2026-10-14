
import { useState } from "react";
import { useNavigate } from "react-router";
import { createLeave } from "@/services/leave.service";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

function CreateLeave() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        leaveType: "casual",
        startDate: "",
        endDate: "",
        reason: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const { leaveType, startDate, endDate, reason } = formData;

        if (!startDate || !endDate || !reason.trim()) {
            setError("Please fill in all the fields.");
            return;
        }

        if (startDate > endDate) {
            setError("Start date cannot be after end date.");
            return;
        }

        setLoading(true);

        try {
            await createLeave({
                leaveType,
                startDate,
                endDate,
                reason: reason.trim(),
            });

            navigate("/employee/leave");
        } catch (error) {
            console.error("Failed to apply for leave:", error);

            setError(
                error.response?.data?.message ||
                "Unable to submit your leave request."
            );
        } finally {
            setLoading(false);
        }
    }

    return (

        <div className="mx-auto w-full max-w-3xl space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        Apply for Leave
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Submit a leave request for your manager to review.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => navigate("/employee/leave")}
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Leave Application</CardTitle>
                    <CardDescription>
                        Enter your leave details below.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="leaveType">
                                Leave type
                            </Label>

                            <select
                                id="leaveType"
                                name="leaveType"
                                value={formData.leaveType}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            >
                                <option value="casual">
                                    Casual Leave
                                </option>
                                <option value="sick">
                                    Sick Leave
                                </option>
                                <option value="earned">
                                    Earned Leave
                                </option>
                                <option value="unpaid">
                                    Unpaid Leave
                                </option>
                                <option value="other">
                                    Other
                                </option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">
                                    Start date
                                </Label>

                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">
                                    End date
                                </Label>

                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    min={formData.startDate || undefined}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">
                                Reason for leave
                            </Label>

                            <textarea
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Explain why you need leave..."
                                rows={4}
                                maxLength={1000}
                                required
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />

                            <p className="text-xs text-muted-foreground">
                                {formData.reason.length}/1000 characters
                            </p>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                            >
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    navigate("/employee/leave")
                                }
                                disabled={loading}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Submitting..."
                                    : "Submit Application"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default CreateLeave;