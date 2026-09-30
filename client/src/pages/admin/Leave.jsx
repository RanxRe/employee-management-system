import { useEffect, useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { getAllLeaves } from "@/services/leave.service";

function Leave() {
    const navigate = useNavigate();

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAllLeaves();

            setLeaves(data.leaves || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load leave requests."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString();
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-700";

            case "rejected":
                return "bg-red-100 text-red-700";

            case "cancelled":
                return "bg-gray-100 text-gray-700";

            case "pending":
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Leave Management
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage employee leave requests.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={fetchLeaves}
                    disabled={loading}
                >
                    <RefreshCw
                        className={`size-4 ${loading ? "animate-spin" : ""
                            }`}
                    />

                    Refresh
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Leave Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Leave Requests
                        {!loading && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                ({leaves.length})
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 text-sm text-muted-foreground">
                            Loading leave requests...
                        </div>
                    ) : leaves.length === 0 ? (
                        <div className="p-6 text-sm text-muted-foreground">
                            No leave requests found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-[950px] w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="px-4 py-3 text-left font-medium">
                                            Employee
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Employee ID
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Leave Type
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Start Date
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            End Date
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 text-right font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {leaves.map((leave) => (
                                        <tr
                                            key={leave._id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium">
                                                        {leave.employee?.user?.name ||
                                                            "Unknown"}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {leave.employee?.user?.email ||
                                                            "—"}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                {leave.employee?.employeeId || "—"}
                                            </td>

                                            <td className="px-4 py-3 capitalize">
                                                {leave.leaveType || "—"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {formatDate(leave.startDate)}
                                            </td>

                                            <td className="px-4 py-3">
                                                {formatDate(leave.endDate)}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                                                        leave.status
                                                    )}`}
                                                >
                                                    {leave.status || "—"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        navigate(
                                                            `/leave/${leave._id}`
                                                        )
                                                    }
                                                >
                                                    <Eye className="size-4" />
                                                    <span className="hidden sm:inline">
                                                        View
                                                    </span>
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

export default Leave;