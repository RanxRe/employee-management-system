import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { getAllAttendance } from "@/services/attendance.service";

function Attendance() {
    const navigate = useNavigate();

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getAllAttendance();
                console.log(data);
                setAttendance(data.attendance || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load attendance records."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString();
    };

    const formatTime = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Attendance
                </h1>

                <p className="text-sm text-muted-foreground">
                    Manage employee attendance records.
                </p>
            </div>

            {/* Attendance Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Records</CardTitle>
                </CardHeader>

                <CardContent>
                    {loading && (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            Loading attendance records...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        attendance.length === 0 && (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                No attendance records found.
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        attendance.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="px-4 py-3 font-medium">
                                                Employee
                                            </th>

                                            <th className="px-4 py-3 font-medium">
                                                Employee ID
                                            </th>

                                            <th className="px-4 py-3 font-medium">
                                                Date
                                            </th>

                                            <th className="px-4 py-3 font-medium">
                                                Check In
                                            </th>

                                            <th className="px-4 py-3 font-medium">
                                                Check Out
                                            </th>

                                            <th className="px-4 py-3 font-medium">
                                                Status
                                            </th>

                                            <th className="px-4 py-3 text-right font-medium">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {attendance.map((record) => (
                                            <tr
                                                key={record._id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {record.employee?.user?.name ||
                                                        "—"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {record.employee?.employeeId ||
                                                        "—"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {formatDate(record.date)}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {formatTime(record.checkIn)}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {formatTime(record.checkOut)}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span
                                                        className={
                                                            record.status === "present"
                                                                ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                                                                : record.status ===
                                                                    "half-day"
                                                                    ? "rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700"
                                                                    : record.status ===
                                                                        "absent"
                                                                        ? "rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
                                                                        : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                                                        }
                                                    >
                                                        {record.status || "—"}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            navigate(
                                                                `/attendance/${record._id}`
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

export default Attendance;