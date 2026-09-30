import { useEffect, useState } from "react";
import { Eye, Plus, RefreshCw } from "lucide-react";
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
import { getAllPayroll } from "@/services/payroll.service";

function Payroll() {
    const navigate = useNavigate();

    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [filters, setFilters] = useState({
        employee: "",
        month: "",
        year: "",
    });

    const [appliedFilters, setAppliedFilters] =
        useState({});

    const [loading, setLoading] = useState(true);
    const [loadingEmployees, setLoadingEmployees] =
        useState(true);
    const [error, setError] = useState("");

    const fetchPayrolls = async (params = appliedFilters) => {
        try {
            setLoading(true);
            setError("");

            const data = await getAllPayroll(params);

            setPayrolls(data.payrolls || []);
        } catch (err) {
            if (err.response?.status === 404) {
                setPayrolls([]);
                setError("No payroll records found.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to load payroll records."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoadingEmployees(true);

                const data = await getAllEmployees();

                setEmployees(data.employees || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load employees."
                );
            } finally {
                setLoadingEmployees(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        fetchPayrolls({});
    }, []);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleApplyFilters = () => {
        const params = {};

        if (filters.employee) {
            params.employee = filters.employee;
        }

        if (filters.month) {
            params.month = filters.month;
        }

        if (filters.year) {
            params.year = filters.year;
        }

        setAppliedFilters(params);
        fetchPayrolls(params);
    };

    const handleClearFilters = () => {
        setFilters({
            employee: "",
            month: "",
            year: "",
        });

        setAppliedFilters({});
        fetchPayrolls({});
    };

    const handleRefresh = () => {
        fetchPayrolls(appliedFilters);
    };

    const getMonthName = (month) => {
        if (!month) return "—";

        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        return months[month - 1] || "—";
    };

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-700";

            case "processed":
                return "bg-blue-100 text-blue-700";

            case "draft":
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
                        Payroll
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage employee payroll records and salary
                        payments.
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
                            navigate("/payroll/create")
                        }
                    >
                        <Plus className="size-4" />
                        Create Payroll
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
                                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        {employee.employeeId} -{" "}
                                        {employee.user?.name ||
                                            employee.name ||
                                            "Employee"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Month */}
                        <div className="space-y-2">
                            <Label htmlFor="month">
                                Month
                            </Label>

                            <select
                                id="month"
                                name="month"
                                value={filters.month}
                                onChange={handleFilterChange}
                                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                            >
                                <option value="">
                                    All months
                                </option>

                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                        </div>

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
                                placeholder="All years"
                                value={filters.year}
                                onChange={handleFilterChange}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex items-end gap-2">
                            <Button
                                onClick={handleApplyFilters}
                                className="flex-1"
                            >
                                Apply
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                className="flex-1"
                            >
                                Clear
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
                    Loading payroll records...
                </div>
            )}

            {/* Empty */}
            {!loading &&
                payrolls.length === 0 &&
                !error && (
                    <Card>
                        <CardContent className="py-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                No payroll records found.
                            </p>
                        </CardContent>
                    </Card>
                )}

            {/* Table */}
            {!loading && payrolls.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Payroll Records
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1200px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-3 py-3 font-medium">
                                            Employee
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Employee ID
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Month
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Year
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Basic Salary
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Allowances
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Deductions
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Net Salary
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Status
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {payrolls.map((payroll) => (
                                        <tr
                                            key={payroll._id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-3 py-3 font-medium">
                                                {payroll.employee?.user?.name ||
                                                    "—"}
                                            </td>

                                            <td className="px-3 py-3">
                                                {payroll.employee?.employeeId ||
                                                    "—"}
                                            </td>

                                            <td className="px-3 py-3">
                                                {getMonthName(payroll.month)}
                                            </td>

                                            <td className="px-3 py-3">
                                                {payroll.year || "—"}
                                            </td>

                                            <td className="px-3 py-3">
                                                ₹
                                                {formatAmount(
                                                    payroll.basicSalary
                                                )}
                                            </td>

                                            <td className="px-3 py-3">
                                                ₹
                                                {formatAmount(
                                                    payroll.allowances
                                                )}
                                            </td>

                                            <td className="px-3 py-3">
                                                ₹
                                                {formatAmount(
                                                    payroll.deductions
                                                )}
                                            </td>

                                            <td className="px-3 py-3 font-medium">
                                                ₹
                                                {formatAmount(
                                                    payroll.netSalary
                                                )}
                                            </td>

                                            <td className="px-3 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                                                        payroll.status
                                                    )}`}
                                                >
                                                    {payroll.status || "—"}
                                                </span>
                                            </td>

                                            <td className="px-3 py-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        navigate(
                                                            `/payroll/${payroll._id}`
                                                        )
                                                    }
                                                >
                                                    <Eye className="size-4" />
                                                    View
                                                </Button>
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

export default Payroll;