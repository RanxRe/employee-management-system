import { useEffect, useState } from "react";
import {
    Plus,
    RefreshCw,
    Search,
    X,
} from "lucide-react";
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

import { getAllEmployees } from "@/services/employee.service";
import { getAllLeaveBalances } from "@/services/leaveBalance.service";

function LeaveBalance() {
    const navigate = useNavigate();

    const [balances, setBalances] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingEmployees, setLoadingEmployees] =
        useState(true);

    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        year: "",
        employee: "",
        leaveType: "",
    });

    const [appliedFilters, setAppliedFilters] = useState({});

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

    const fetchBalances = async (params = {}) => {
        try {
            setLoading(true);
            setError("");

            const data = await getAllLeaveBalances(params);

            setBalances(data.leaveBalances || []);
        } catch (err) {
            if (err.response?.status === 404) {
                setBalances([]);
                setError("No leave balance records found.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to load leave balances."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances(appliedFilters);
    }, [appliedFilters]);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleApplyFilters = () => {
        const params = {};

        if (filters.year) {
            params.year = Number(filters.year);
        }

        if (filters.employee) {
            params.employee = filters.employee;
        }

        if (filters.leaveType) {
            params.leaveType = filters.leaveType;
        }

        setAppliedFilters(params);
    };

    const handleClearFilters = () => {
        setFilters({
            year: "",
            employee: "",
            leaveType: "",
        });

        setAppliedFilters({});
    };

    const handleRefresh = () => {
        fetchBalances(appliedFilters);
    };

    const formatLeaveType = (leaveType) => {
        if (!leaveType) return "—";

        return (
            leaveType.charAt(0).toUpperCase() +
            leaveType.slice(1)
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Leave Balance
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage employee leave allocations and
                        remaining balances.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <RefreshCw className="size-4" />
                        Refresh
                    </Button>

                    <Button
                        onClick={() =>
                            navigate("/leave-balances/create")
                        }
                    >
                        <Plus className="size-4" />
                        Add Balance
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Year */}
                        <div className="space-y-2">
                            <Label htmlFor="year">
                                Year
                            </Label>

                            <Input
                                id="year"
                                name="year"
                                type="number"
                                min="2000"
                                max="2100"
                                placeholder="e.g. 2026"
                                value={filters.year}
                                onChange={handleFilterChange}
                            />
                        </div>

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
                                        ? "Loading..."
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

                        {/* Leave Type */}
                        <div className="space-y-2">
                            <Label htmlFor="leaveType">
                                Leave Type
                            </Label>

                            <select
                                id="leaveType"
                                name="leaveType"
                                value={filters.leaveType}
                                onChange={handleFilterChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">
                                    All leave types
                                </option>

                                <option value="casual">
                                    Casual
                                </option>

                                <option value="sick">
                                    Sick
                                </option>

                                <option value="earned">
                                    Earned
                                </option>

                                <option value="unpaid">
                                    Unpaid
                                </option>

                                <option value="other">
                                    Other
                                </option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex items-end gap-2">
                            <Button
                                onClick={handleApplyFilters}
                                disabled={loading}
                                className="flex-1"
                            >
                                <Search className="size-4" />
                                Apply
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                disabled={loading}
                                size="icon"
                                aria-label="Clear filters"
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="text-sm text-muted-foreground">
                    Loading leave balances...
                </div>
            )}

            {/* Empty */}
            {!loading &&
                !error &&
                balances.length === 0 && (
                    <Card>
                        <CardContent className="py-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                No leave balance records found.
                            </p>
                        </CardContent>
                    </Card>
                )}

            {/* Table */}
            {!loading && balances.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Leave Balance Records
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-3 py-3 font-medium">
                                            Employee
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Employee ID
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Year
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Leave Type
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Allocated
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Used
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Remaining
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {balances.map((balance) => (
                                        <tr
                                            key={balance._id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-3 py-3 font-medium">
                                                {balance.employee?.user?.name ||
                                                    "—"}
                                            </td>

                                            <td className="px-3 py-3">
                                                {balance.employee?.employeeId ||
                                                    "—"}
                                            </td>

                                            <td className="px-3 py-3">
                                                {balance.year || "—"}
                                            </td>

                                            <td className="px-3 py-3">
                                                {formatLeaveType(
                                                    balance.leaveType
                                                )}
                                            </td>

                                            <td className="px-3 py-3">
                                                {balance.allocated}
                                            </td>

                                            <td className="px-3 py-3">
                                                {balance.used}
                                            </td>

                                            <td className="px-3 py-3 font-medium">
                                                {balance.remaining}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default LeaveBalance;