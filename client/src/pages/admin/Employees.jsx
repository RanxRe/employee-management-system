import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getAllEmployees } from "@/services/employee.service";

function getStatusClasses(status) {
    switch (status) {
        case "active":
            return "bg-green-100 text-green-700";

        case "pending":
            return "bg-yellow-100 text-yellow-700";

        case "terminated":
            return "bg-red-100 text-red-700";

        case "resigned":
            return "bg-orange-100 text-orange-700";

        case "rejected":
            return "bg-gray-100 text-gray-700";

        default:
            return "bg-muted text-muted-foreground";
    }
}

function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getAllEmployees();

                setEmployees(data.employees || []);
            } catch (error) {
                console.error("Employees error:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load employees."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    if (loading) {
        return (
            <div className="py-10 text-center text-muted-foreground">
                Loading employees...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        Employees
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                        Manage your organization's employees.
                    </p>
                </div>

                <Button
                    onClick={() => navigate("/employees/create")}
                >
                    Create Employee
                </Button>
            </div>
            {/* Employee Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Employee List
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({employees.length})
                        </span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    {employees.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            No employees found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-sm">
                                <thead className="border-y bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            #
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Employee ID
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Name
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Email
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Department
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Designation
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Joining Date
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
                                    {employees.map((employee, index) => (
                                        <tr
                                            key={employee._id}
                                            className="border-b last:border-b-0"
                                        >
                                            {/* Serial No. */}
                                            <td className="px-4 py-4 font-medium">
                                                {index + 1}
                                            </td>

                                            {/* Employee ID */}
                                            <td className="px-4 py-4 font-medium">
                                                {employee.employeeId}
                                            </td>

                                            {/* Name */}
                                            <td className="px-4 py-4">
                                                {employee.user?.name || "—"}
                                            </td>

                                            {/* Email */}
                                            <td className="px-4 py-4 text-muted-foreground">
                                                {employee.user?.email || "—"}
                                            </td>

                                            {/* Department */}
                                            <td className="px-4 py-4">
                                                {employee.department?.name || "—"}
                                            </td>

                                            {/* Designation */}
                                            <td className="px-4 py-4">
                                                {employee.designation?.name || "—"}
                                            </td>

                                            {/* Joining Date */}
                                            <td className="px-4 py-4">
                                                {employee.joiningDate
                                                    ? new Date(
                                                        employee.joiningDate
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </td>

                                            {/* Employment Status */}
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                                                        employee.employmentStatus
                                                    )}`}
                                                >
                                                    {employee.employmentStatus}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td className="px-4 py-4 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        navigate(`/employees/${employee._id}`)
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

export default Employees;