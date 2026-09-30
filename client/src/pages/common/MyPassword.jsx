import { useState } from "react";
import { useNavigate } from "react-router";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { changeMyPassword } from "@/services/admin.service";
import { ArrowLeft } from "lucide-react";

function MyPassword() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (formData.newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setError(
                "New password must be different from your current password."
            );
            return;
        }

        try {
            setLoading(true);

            await changeMyPassword(
                formData.currentPassword,
                formData.newPassword
            );

            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setSuccess("Your password has been changed successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to change password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            {/* Page Header */}
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/my-profile")}
                        aria-label="Back to profile"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Change Password
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Update your current password.
                        </p>
                    </div>
                </div>

            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Current Password */}
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">
                                Current Password
                            </Label>

                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">
                                New Password
                            </Label>

                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                minLength={8}
                                required
                                autoComplete="new-password"
                            />

                            <p className="text-xs text-muted-foreground">
                                Password must contain at least 8 characters.
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirm New Password
                            </Label>

                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                minLength={8}
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
                                {success}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <Button
                                type="submit"
                                disabled={
                                    loading ||
                                    !formData.currentPassword ||
                                    !formData.newPassword ||
                                    !formData.confirmPassword
                                }
                            >
                                {loading
                                    ? "Changing Password..."
                                    : "Change Password"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/my-profile")}
                                disabled={loading}
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

export default MyPassword;