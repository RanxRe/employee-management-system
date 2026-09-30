import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { getAllAdmins } from "@/services/admin.service";

function AdminManagement() {
    const navigate = useNavigate();

    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAllAdmins();

            setAdmins(data.admins);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load admins."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Admin Management
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Manage administrator accounts.
                    </p>
                </div>

                <Button
                    onClick={() =>
                        navigate("/admin-management/create")
                    }
                >
                    Create Admin
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Admin List */}
            <Card>
                <CardHeader>
                    <CardTitle>Administrators</CardTitle>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : admins.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            No administrators found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-[750px] w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Name
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Email
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Role
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Created
                                        </th>

                                        <th className="px-4 py-3 text-right font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {admins.map((admin) => (
                                        <tr
                                            key={admin._id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {admin.name}
                                            </td>

                                            <td className="px-4 py-3">
                                                {admin.email}
                                            </td>

                                            <td className="px-4 py-3 capitalize">
                                                {admin.role.replace("_", " ")}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                                                        admin.status
                                                    )}`}
                                                >
                                                    {admin.status}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                {new Date(
                                                    admin.createdAt
                                                ).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin-management/${admin._id}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default AdminManagement;