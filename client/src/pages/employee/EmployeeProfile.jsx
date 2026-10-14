
import { useCallback, useEffect, useState } from "react";
import { setUser } from "@/store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import {
    BriefcaseBusiness,
    CalendarDays,
    Mail,
    RefreshCw,
    KeyRound,
    Save,
    UserRound,
} from "lucide-react";

import {
    getMyEmployeeProfile,
    updateMyEmployeeProfile,
    changeMyPassword
} from "@/services/employee.service";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
};

const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
        case "active":
        case "approved":
            return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300";
        case "pending":
            return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
        case "rejected":
        case "terminated":
        case "resigned":
        case "inactive":
            return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300";
        default:
            return "border-border bg-muted text-muted-foreground";
    }
};

function DetailItem({ label, value }) {
    return (
        <div className="min-w-0 space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="break-words font-medium">{value || "—"}</p>
        </div>
    );
}

function StatusBadge({ status }) {
    if (!status) return <span>—</span>;

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(status)}`}
        >
            {String(status).replaceAll("_", " ")}
        </span>
    );
}

export default function EmployeeProfile() {

    const dispatch = useDispatch();
    const authUser = useSelector((state) => state.auth.user);
    const [employee, setEmployee] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getMyEmployeeProfile();
            const profile = response.employee;

            if (!profile) {
                throw new Error("Employee profile was not returned by the server.");
            }

            setEmployee(profile);
            setFormData({
                name: profile.user?.name ?? "",
                email: profile.user?.email ?? "",
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load your profile."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleCancel = () => {
        setFormData({
            name: employee?.user?.name ?? "",
            email: employee?.user?.email ?? "",
        });

        setEditing(false);
        setError("");
        setSuccess("");
    };

    const handleSave = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();

        if (!name) {
            setError("Name cannot be empty.");
            return;
        }

        if (!email) {
            setError("Email cannot be empty.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        const profileData = {};

        if (name !== (employee.user?.name ?? "")) {
            profileData.name = name;
        }

        if (email !== (employee.user?.email ?? "").toLowerCase()) {
            profileData.email = email;
        }

        if (Object.keys(profileData).length === 0) {
            setSuccess("No changes to save.");
            setEditing(false);
            return;
        }

        setSaving(true);

        try {
            const response = await updateMyEmployeeProfile(profileData);

            if (response.employee) {
                const updatedEmployee = response.employee;
                const updatedUser = updatedEmployee.user;

                setEmployee(updatedEmployee);

                setFormData({
                    name: updatedUser?.name ?? name,
                    email: updatedUser?.email ?? email,
                });

                if (updatedUser && authUser) {
                    dispatch(
                        setUser({
                            ...authUser,
                            ...updatedUser,
                        })
                    );
                }
            } else {
                // Refresh in case the backend response does not include the profile.
                await loadProfile();
            }

            setEditing(false);
            setSuccess(response.message || "Profile updated successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update your profile. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };


    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handlePasswordCancel = () => {
        setShowPasswordForm(false);
        setPasswordError("");
        setPasswordSuccess("");
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError("Your new password must differ from your current password.");
            return;
        }

        setPasswordSaving(true);

        try {
            const response = await changeMyPassword({
                currentPassword,
                newPassword,
            });

            setPasswordSuccess(
                response.message || "Password updated successfully."
            );

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err) {
            setPasswordError(
                err.response?.data?.message ||
                "Unable to update your password. Please try again."
            );
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
                <Card>
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                        Loading your profile…
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <h1 className="text-2xl font-bold">Employee Profile</h1>

                <div
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                >
                    {error || "Your employee profile could not be found."}
                </div>

                <Button onClick={loadProfile} variant="outline">
                    <RefreshCw className="mr-2 size-4" />
                    Try Again
                </Button>
            </div>
        );
    }

    const user = employee.user ?? {};
    const department = employee.department;
    const designation = employee.designation;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
            {/* Page heading */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        My Profile
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View your employment details and manage your personal information.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={loadProfile}
                    disabled={saving}
                    className="w-full sm:w-auto"
                >
                    <RefreshCw className="mr-2 size-4" />
                    Refresh
                </Button>
            </div>



            {/* Employee overview */}
            <Card>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound className="size-8" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2 className="break-words text-xl font-bold">
                            {user.name || "Employee"}
                        </h2>
                        <p className="mt-1 break-all text-sm text-muted-foreground">
                            {user.email || "No email available"}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Employee ID:{" "}
                            <span className="font-semibold text-foreground">
                                {employee.employeeId || "—"}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Emp Status
                            </p>
                            <StatusBadge status={employee.employmentStatus} />
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                A/c Status
                            </p>
                            <StatusBadge status={user.status} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Editable personal information */}
            <Card>
                {/* Feedback */}
                <div className="px-5">
                    {error && (
                        <div
                            role="alert"
                            className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            role="status"
                            className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                        >
                            {success}
                        </div>
                    )}
                </div>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle className="text-lg">Personal Information</CardTitle>

                    {!editing && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setError("");
                                setSuccess("");
                                setEditing(true);
                            }}
                        >
                            Edit Profile
                        </Button>
                    )}
                </CardHeader>

                <CardContent>
                    {editing ? (
                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="profile-name">Full Name</Label>
                                    <Input
                                        id="profile-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                        maxLength={100}
                                        required
                                        disabled={saving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="profile-email">Email Address</Label>
                                    <Input
                                        id="profile-email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email address"
                                        autoComplete="email"
                                        maxLength={254}
                                        required
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Only your name and email can be edited here.
                            </p>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>

                                <Button type="submit" disabled={saving}>
                                    <Save className="mr-2 size-4" />
                                    {saving ? "Saving…" : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <DetailItem label="Full Name" value={user.name} />
                            <div className="flex items-start gap-2">
                                <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                    <p className="text-sm text-muted-foreground">Email Address</p>
                                    <p className="break-all font-medium">{user.email || "—"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Employment information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BriefcaseBusiness className="size-5" />
                        Employment Information
                    </CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem label="Employee ID" value={employee.employeeId} />
                    <DetailItem
                        label="Department"
                        value={department?.name}
                    />
                    <DetailItem
                        label="Designation"
                        value={designation?.name}
                    />
                    <DetailItem
                        label="Joining Date"
                        value={formatDate(employee.joiningDate)}
                    />
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Employment Status</p>
                        <StatusBadge status={employee.employmentStatus} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Account Status</p>
                        <StatusBadge status={user.status} />
                    </div>
                    <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Profile Created</p>
                            <p className="font-medium">{formatDate(employee.createdAt)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Update Password */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <KeyRound className="size-5" />
                        Password & Security
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {!showPasswordForm ? (
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <p className="text-sm text-muted-foreground">
                                Keep your account secure by changing your password regularly.
                            </p>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setError("");
                                    setSuccess("");
                                    setPasswordError("");
                                    setPasswordSuccess("");
                                    setShowPasswordForm(true);
                                }}
                            >
                                <KeyRound className="mr-2 size-4" />
                                Update Password
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="space-y-5">
                            {passwordError && (
                                <div
                                    role="alert"
                                    className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                                >
                                    {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div
                                    role="status"
                                    className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                                >
                                    {passwordSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="currentPassword">
                                        Current Password
                                    </Label>
                                    <Input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        autoComplete="current-password"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        disabled={passwordSaving}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">
                                        New Password
                                    </Label>
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        minLength={8}
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        disabled={passwordSaving}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        minLength={8}
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        disabled={passwordSaving}
                                        required
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Your new password must contain at least 8 characters.
                            </p>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePasswordCancel}
                                    disabled={passwordSaving}
                                >
                                    Cancel
                                </Button>

                                <Button type="submit" disabled={passwordSaving}>
                                    <KeyRound className="mr-2 size-4" />
                                    {passwordSaving
                                        ? "Updating Password…"
                                        : "Save New Password"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
                For changes to your employee ID, department, designation, or employment
                status, please contact your administrator.
            </p>
        </div>
    );
}