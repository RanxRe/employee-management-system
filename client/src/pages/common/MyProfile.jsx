import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { getMyAdminProfile } from "@/services/admin.service";

function MyProfile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyAdminProfile();

                setProfile(data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading profile...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        My Profile
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        View your account information.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => navigate("/my-password")}
                >
                    Change Password
                </Button>
            </div>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Name
                            </p>

                            <p className="mt-1 font-medium">
                                {profile?.name || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Email
                            </p>

                            <p className="mt-1 font-medium break-all">
                                {profile?.email || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Role
                            </p>

                            <p className="mt-1 font-medium capitalize">
                                {profile?.role?.replace("_", " ") || "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Account Status
                            </p>

                            <p className="mt-1 font-medium capitalize">
                                {profile?.status || "-"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Record Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Record Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Account Created
                            </p>

                            <p className="mt-1 font-medium">
                                {profile?.createdAt
                                    ? new Date(
                                        profile.createdAt
                                    ).toLocaleDateString()
                                    : "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Last Updated
                            </p>

                            <p className="mt-1 font-medium">
                                {profile?.updatedAt
                                    ? new Date(
                                        profile.updatedAt
                                    ).toLocaleDateString()
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default MyProfile;