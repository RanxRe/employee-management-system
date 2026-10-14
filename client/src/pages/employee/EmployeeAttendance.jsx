import { useEffect, useState } from "react";

import {
    getMyAttendance,
    getMyAttendanceSummary,
} from "@/services/attendance.service";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function formatDate(dateString) {
    if (!dateString) return "—";


    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

}

function formatTime(dateString) {
    if (!dateString) return "—";


    return new Date(dateString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });


}

function EmployeeAttendance() {
    const [attendance, setAttendance] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            setError("");

            try {
                const [attendanceResponse, summaryResponse] =
                    await Promise.all([
                        getMyAttendance(),
                        getMyAttendanceSummary(),
                    ]);

                setAttendance(
                    attendanceResponse.attendance || []
                );

                setSummary(summaryResponse.summary || null);
            } catch (error) {
                console.error(
                    "Failed to fetch attendance:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load attendance records."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading attendance...
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

    const summaryCards = [
        {
            label: "Total Records",
            value: summary?.totalRecords ?? 0,
        },
        {
            label: "Present",
            value: summary?.present ?? 0,
        },
        {
            label: "Absent",
            value: summary?.absent ?? 0,
        },
        {
            label: "Half Days",
            value: summary?.halfDay ?? 0,
        },
    ];

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    My Attendance
                </h1>

                <p className="text-sm text-muted-foreground">
                    View your attendance summary and daily records.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {summaryCards.map((item) => (
                    <Card key={item.label}>
                        <CardHeader className="pb-2">
                            <CardDescription>
                                {item.label}
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {item.value}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                    <CardDescription>
                        Your latest attendance records appear first.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {attendance.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No attendance records found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="px-3 py-3 font-medium">
                                            Date
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Check In
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Check Out
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Location
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {attendance.map((record) => (
                                        <tr
                                            key={record._id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="whitespace-nowrap px-3 py-3">
                                                {formatDate(record.date)}
                                            </td>

                                            <td className="whitespace-nowrap px-3 py-3">
                                                {formatTime(record.checkIn)}
                                            </td>

                                            <td className="whitespace-nowrap px-3 py-3">
                                                {formatTime(record.checkOut)}
                                            </td>

                                            <td className="px-3 py-3">
                                                <span className="inline-flex rounded-full border px-2 py-1 text-xs capitalize">
                                                    {record.status}
                                                </span>
                                            </td>

                                            <td className="px-3 py-3">
                                                {record.location?.verified
                                                    ? "Verified"
                                                    : "Not verified"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <p className="mt-4 text-xs text-muted-foreground">
                        Total hours worked:{" "}
                        {Number(
                            summary?.totalHoursWorked ?? 0
                        ).toFixed(2)}{" "}
                        hours
                    </p>
                </CardContent>
            </Card>
        </div>
    );

}

export default EmployeeAttendance;
