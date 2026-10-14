
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
    getMyLeaves,
    updateMyLeave,
} from "@/services/leave.service";

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

function toDateInputValue(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    const year = date.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
    });

    const month = date.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
        month: "2-digit",
    });

    const day = date.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
    });

    return `${year}-${month}-${day}`;
}

function EditLeave() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        leaveType: "casual",
        startDate: "",
        endDate: "",
        reason: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        async function fetchLeave() {
            setLoading(true);
            setError("");

            try {
                const response = await getMyLeaves();

                const leave = (response.leaves || []).find(
                    (item) => item._id === id
                );

                if (!leave) {
                    throw new Error(
                        "Leave application not found."
                    );
                }

                if (leave.status !== "pending") {
                    throw new Error(
                        "Only pending leave applications can be edited."
                    );
                }

                if (!ignore) {
                    setFormData({
                        leaveType: leave.leaveType,
                        startDate: toDateInputValue(
                            leave.startDate
                        ),
                        endDate: toDateInputValue(
                            leave.endDate
                        ),
                        reason: leave.reason || "",
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setError(
                        error.response?.data?.message ||
                        error.message ||
                        "Unable to load the leave application."
                    );
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchLeave();

        return () => {
            ignore = true;
        };
    }, [id]);

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

        const {
            leaveType,
            startDate,
            endDate,
            reason,
        } = formData;

        if (!startDate || !endDate || !reason.trim()) {
            setError("Please fill in all the fields.");
            return;
        }

        if (startDate > endDate) {
            setError("Start date cannot be after end date.");
            return;
        }

        setSaving(true);

        try {
            await updateMyLeave(id, {
                leaveType,
                startDate,
                endDate,
                reason: reason.trim(),
            });

            navigate("/employee/leave");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to update your leave application."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading leave application...
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Edit Leave
                </h1>

                <p className="text-sm text-muted-foreground">
                    Update your pending leave application.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Application</CardTitle>
                    <CardDescription>
                        Only pending applications can be modified.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div
                            role="alert"
                            className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                        >
                            {error}
                        </div>
                    )}

                    {!error || formData.startDate ? (
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
                                        min={
                                            formData.startDate ||
                                            undefined
                                        }
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
                                    rows={4}
                                    maxLength={1000}
                                    required
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />

                                <p className="text-xs text-muted-foreground">
                                    {formData.reason.length}/1000
                                    characters
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        navigate("/employee/leave")
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() =>
                                navigate("/employee/leave")
                            }
                        >
                            Back to Leave History
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default EditLeave;