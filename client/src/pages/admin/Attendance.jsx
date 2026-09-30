import { useEffect, useState } from "react";
import { Search, X, Plus } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getAllAttendance } from "@/services/attendance.service";
import { getAllEmployees } from "@/services/employee.service";

function Attendance() {
    const navigate = useNavigate();

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);

    const [filters, setFilters] = useState({
        employee: "",
        date: "",
        from: "",
        to: "",
    });



    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoadingEmployees(true);

                const data = await getAllEmployees();

                setEmployees(data.employees || []);
            } catch (err) {
                console.error(
                    "Failed to load employees:",
                    err
                );
            } finally {
                setLoadingEmployees(false);
            }
        };

        fetchEmployees();
    }, []);

    const fetchAttendance = async (params = {}) => {
        try {
            setLoading(true);
            setError("");

            const data = await getAllAttendance(params);

            setAttendance(data.attendance || []);
        } catch (err) {
            setAttendance([]);

            setError(
                err.response?.data?.message ||
                "Failed to load attendance records."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSearch = (event) => {
        event.preventDefault();

        const params = {};

        if (filters.employee.trim()) {
            params.employee = filters.employee.trim();
        }

        if (filters.date) {
            params.date = filters.date;
        } else {
            if (filters.from) {
                params.from = filters.from;
            }

            if (filters.to) {
                params.to = filters.to;
            }
        }

        fetchAttendance(params);
    };

    const handleClearFilters = () => {
        const emptyFilters = {
            employee: "",
            date: "",
            from: "",
            to: "",
        };

        setFilters(emptyFilters);

        fetchAttendance();
    };

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Attendance
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage employee attendance records.
                    </p>
                </div>

                <Button
                    onClick={() => navigate("/attendances/create")}
                >
                    <Plus className="size-4" />
                    Create Attendance
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter Attendance</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSearch}
                        className="space-y-5"
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Employee */}
                            <div className="space-y-2">
                                <Label htmlFor="employee">
                                    Employee
                                </Label>

                                <select
                                    id="employee"
                                    name="employee"
                                    value={filters.employee}
                                    onChange={handleFilterChange}
                                    disabled={loadingEmployees}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">
                                        {loadingEmployees
                                            ? "Loading employees..."
                                            : "All employees"}
                                    </option>

                                    {employees.map((employee) => (
                                        <option
                                            key={employee._id}
                                            value={employee._id}
                                        >
                                            {employee.employeeId} —{" "}
                                            {employee.user?.name || "Unknown"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Specific Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date">
                                    Specific Date
                                </Label>

                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={filters.date}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            {/* From */}
                            <div className="space-y-2">
                                <Label htmlFor="from">
                                    From Date
                                </Label>

                                <Input
                                    id="from"
                                    name="from"
                                    type="date"
                                    value={filters.from}
                                    onChange={handleFilterChange}
                                    disabled={Boolean(filters.date)}
                                />
                            </div>

                            {/* To */}
                            <div className="space-y-2">
                                <Label htmlFor="to">
                                    To Date
                                </Label>

                                <Input
                                    id="to"
                                    name="to"
                                    type="date"
                                    value={filters.to}
                                    onChange={handleFilterChange}
                                    disabled={Boolean(filters.date)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button type="submit">
                                <Search className="size-4" />
                                Search
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClearFilters}
                            >
                                <X className="size-4" />
                                Clear Filters
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Attendance Table */}
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
                                                                `/attendances/${record._id}`
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