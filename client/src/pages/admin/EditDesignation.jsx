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
    getDesignationById,
    updateDesignation,
    updateDesignationStatus,
} from "@/services/designation.service";

function EditDesignation() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [designation, setDesignation] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
    });

    const [status, setStatus] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusSaving, setStatusSaving] = useState(false);

    const [error, setError] = useState("");
    const [statusError, setStatusError] = useState("");

    const [success, setSuccess] = useState("");
    const [statusSuccess, setStatusSuccess] = useState("");

    useEffect(() => {
        const fetchDesignation = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getDesignationById(id);

                const designationData = data.designation;

                setDesignation(designationData);

                setFormData({ name: designationData.name || "" });

                setStatus(designationData.status || "");
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load designation."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDesignation();
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
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await updateDesignation(id, {
                name: formData.name,
            });

            setDesignation((prev) => ({
                ...prev,
                ...response.designation,
            }));

            setSuccess("Designation updated successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update designation."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            setStatusSaving(true);
            setStatusError("");
            setStatusSuccess("");

            await updateDesignationStatus(id, status);

            setDesignation((prev) => ({
                ...prev,
                status,
            }));

            setStatusSuccess(
                "Designation status updated successfully."
            );
        } catch (err) {
            setStatusError(
                err.response?.data?.message ||
                "Failed to update designation status."
            );
        } finally {
            setStatusSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Loading designations...
                </p>
            </div>
        );
    }

    if (!designation) {
        return (
            <div className="space-y-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/designations")}
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Button>

                <p className="text-sm text-destructive">
                    {error || "Designation not found."}
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            {/* Header */}
            <div>
                <Button
                    variant="ghost"
                    className="-ml-2 mb-2"
                    onClick={() => navigate("/designations")}
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Button>

                <h1 className="text-2xl font-bold tracking-tight">
                    Edit Designation
                </h1>

                <p className="text-sm text-muted-foreground">
                    Update designation information and status.
                </p>
            </div>

            {/* Designation information */}
            <Card>
                <CardHeader>
                    <CardTitle>Designation Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Designation Name
                            </Label>

                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
                                {success}
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/designations")}
                                disabled={saving}
                            >
                                Back
                            </Button>

                            <Button
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Designation Status</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">
                            Status
                        </Label>

                        <select
                            id="status"
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            disabled={statusSaving}
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>
                    </div>

                    {statusError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {statusError}
                        </div>
                    )}

                    {statusSuccess && (
                        <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
                            {statusSuccess}
                        </div>
                    )}

                    <Button
                        onClick={handleStatusUpdate}
                        disabled={statusSaving}
                    >
                        {statusSaving
                            ? "Updating..."
                            : "Update Status"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default EditDesignation;