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
import { getAttendanceStatusClass } from "@/utils/statusColor";

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


function formatDuration(milliseconds) {
    const totalMinutes = Math.floor(
        Math.max(0, milliseconds) / 60000
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
}

function getRecordDurations(record, currentTime) {
    if (!record.checkIn) {
        return { workingMs: 0, breakMs: 0 };
    }

    const checkInTime = new Date(record.checkIn).getTime();

    const recordDate = new Date(record.date);
    const today = new Date(currentTime);

    const isToday =
        recordDate.getFullYear() === today.getFullYear() &&
        recordDate.getMonth() === today.getMonth() &&
        recordDate.getDate() === today.getDate();

    const endTime = record.checkOut
        ? new Date(record.checkOut).getTime()
        : isToday
            ? currentTime
            : checkInTime;

    let breakMs = (record.breaks || []).reduce(
        (total, item) => total + (item.durationMs || 0),
        0
    );

    // Include an ongoing break for today's attendance.
    if (isToday && record.breakStartedAt && !record.checkOut) {
        const breakStart = new Date(
            record.breakStartedAt
        ).getTime();

        breakMs += Math.max(0, currentTime - breakStart);
    }

    const elapsedMs = Math.max(0, endTime - checkInTime);

    return {
        workingMs: Math.max(0, elapsedMs - breakMs),
        breakMs,
    };
}

function EmployeeAttendance() {
    const [attendance, setAttendance] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

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
            color: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/40",
        },
        {
            label: "Present",
            value: summary?.present ?? 0,
            color: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30",
        },
        {
            label: "Absent",
            value: summary?.absent ?? 0,
            color: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30",
        },
        {
            label: "Half Days",
            value: summary?.halfDay ?? 0,
            color: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30",
        }
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
                    <Card key={item.label} className={item.color}>
                        <CardHeader className="pb-2">
                            <CardDescription className={item.color} >
                                {item.label}
                            </CardDescription>
                            <CardTitle className={`text-2xl ${item.color}`}>
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
                                        <th className="whitespace-nowrap px-3 py-3 font-medium">
                                            Working Hours
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-3 font-medium">
                                            Break Time
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

                                    {attendance.map((record) => {
                                        const { workingMs, breakMs } = getRecordDurations(
                                            record,
                                            currentTime
                                        );

                                        return (
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

                                                <td className="whitespace-nowrap px-3 py-3 tabular-nums">
                                                    {formatDuration(workingMs)}
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-3 tabular-nums">
                                                    {formatDuration(breakMs)}
                                                </td>

                                                <td className="px-3 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2 py-1 text-xs capitalize ${getAttendanceStatusClass(record.status)}`}
                                                    >
                                                        {record.status}
                                                    </span>
                                                </td>

                                                <td className="px-3 py-3">
                                                    {record.location?.verified
                                                        ? "Verified"
                                                        : "Not verified"}
                                                </td>
                                            </tr>
                                        );
                                    })}
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
