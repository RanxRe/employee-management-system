import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { getAdminById, updateAdminStatus, updateAdminPassword } from "@/services/admin.service";
import { Input } from "@/components/ui/input";

function AdminDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusError, setStatusError] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const fetchAdmin = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminById(id);

            setAdmin(data.admin);
            setSelectedStatus(data.admin.status);
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

    const getStatusClass = (status) => {
        if (status === "active") {
            return "bg-green-100 text-green-700";
        }

        if (status === "inactive") {
            return "bg-gray-100 text-gray-700";
        }

        if (status === "suspended") {
            return "bg-red-100 text-red-700";
        }

        return "bg-muted text-muted-foreground";
    };

    const handleStatusUpdate = async () => {
        try {
            setStatusLoading(true);
            setStatusError("");

            await updateAdminStatus(
                id,
                selectedStatus
            );

            const data = await getAdminById(id);

            setAdmin(data.admin);
            setSelectedStatus(data.admin.status);
        } catch (err) {
            setStatusError(
                err.response?.data?.message ||
                "Failed to update admin status."
            );
        } finally {
            setStatusLoading(false);
        }
    };

    const handlePasswordUpdate = async (event) => {
        event.preventDefault();

        try {
            setPasswordLoading(true);
            setPasswordError("");
            setPasswordSuccess("");

            await updateAdminPassword(
                id,
                newPassword
            );

            setNewPassword("");
            setPasswordSuccess(
                "Admin password updated successfully."
            );
        } catch (err) {
            setPasswordError(
                err.response?.data?.message ||
                "Failed to update admin password."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading...
            </div>
        );
    }

    if (error) {
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Admin Details
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        View administrator account information.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    {admin.role === "admin" && (
                        <Button
                            onClick={() =>
                                navigate(
                                    `/admin-management/${admin._id}/edit`
                                )
                            }
                        >
                            Edit
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        onClick={() =>
                            navigate("/admin-management")
                        }
                    >
                        Back
                    </Button>
                </div>
            </div>

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Basic Information
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Name
                            </p>

                            <p className="font-medium">
                                {admin.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Email
                            </p>

                            <p className="break-all font-medium">
                                {admin.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Role
                            </p>

                            <p className="font-medium capitalize">
                                {admin.role.replace("_", " ")}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Status
                            </p>

                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                                    admin.status
                                )}`}
                            >
                                {admin.status}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Account Status
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {statusError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {statusError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Current Status
                        </p>

                        <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                                admin.status
                            )}`}
                        >
                            {admin.status}
                        </span>
                    </div>

                    {admin.role === "admin" && (
                        <div className="space-y-2">
                            <label
                                htmlFor="status"
                                className="text-sm font-medium"
                            >
                                Change Status
                            </label>

                            <select
                                id="status"
                                value={selectedStatus}
                                onChange={(event) =>
                                    setSelectedStatus(event.target.value)
                                }
                                disabled={statusLoading}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>

                                <option value="suspended">
                                    Suspended
                                </option>
                            </select>

                            <Button
                                onClick={handleStatusUpdate}
                                disabled={
                                    statusLoading ||
                                    selectedStatus === admin.status
                                }
                            >
                                {statusLoading
                                    ? "Updating..."
                                    : "Update Status"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Password Manager */}
            {admin.role === "admin" && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Change Password
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handlePasswordUpdate}
                            className="space-y-4"
                        >
                            {passwordError && (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                    {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
                                    {passwordSuccess}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label
                                    htmlFor="newPassword"
                                    className="text-sm font-medium"
                                >
                                    New Password
                                </label>

                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(event.target.value)
                                    }
                                    placeholder="Enter new password"
                                    minLength={8}
                                    required
                                    disabled={passwordLoading}
                                />

                                <p className="text-xs text-muted-foreground">
                                    Password must be at least 8 characters.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={
                                    passwordLoading ||
                                    newPassword.length < 8
                                }
                            >
                                {passwordLoading
                                    ? "Updating..."
                                    : "Update Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Record Information */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Record Information
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Admin ID
                            </p>

                            <p className="break-all font-mono text-sm">
                                {admin._id}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Created At
                            </p>

                            <p className="font-medium">
                                {new Date(
                                    admin.createdAt
                                ).toLocaleString()}
                            </p>
                        </div>

                        {admin.updatedAt && (
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Updated At
                                </p>

                                <p className="font-medium">
                                    {new Date(
                                        admin.updatedAt
                                    ).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default AdminDetails;