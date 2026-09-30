import { useEffect, useState } from "react";
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
    getAdminById,
    updateAdmin,
} from "@/services/admin.service";

function EditAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });

    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchAdmin = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminById(id);

            setAdmin(data.admin);

            setFormData({
                name: data.admin.name || "",
                email: data.admin.email || "",
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load admin."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmin();
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

            await updateAdmin(id, {
                name: formData.name,
                email: formData.email,
            });

            navigate(`/admin-management/${id}`);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update admin."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading...
            </div>
        );
    }

    if (error && !admin) {
        return (
            <div className="space-y-4">
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>

                <Button
                    variant="outline"
                    onClick={() =>
                        navigate("/admin-management")
                    }
                >
                    Back to Admin Management
                </Button>
            </div>
        );
    }

    if (!admin) {
        return null;
    }

    // Only regular admins can be edited.
    if (admin.role !== "admin") {
        return (
            <div className="space-y-4">
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    This administrator cannot be edited.
                </div>

                <Button
                    variant="outline"
                    onClick={() =>
                        navigate(`/admin-management/${id}`)
                    }
                >
                    Back
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">
                    Edit Admin
                </h2>

                <p className="text-sm text-muted-foreground">
                    Update administrator account information.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Admin Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Name
                            </Label>

                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email
                            </Label>

                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <Button
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    navigate(
                                        `/admin-management/${id}`
                                    )
                                }
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default EditAdmin;