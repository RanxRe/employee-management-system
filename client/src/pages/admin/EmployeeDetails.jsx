import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { getEmployeeById, updateEmploymentStatus, updateAccountStatus } from "@/services/employee.service";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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

function EmployeeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [employmentStatus, setEmploymentStatus] = useState("");
    const [statusLoading, setStatusLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusSuccess, setStatusSuccess] = useState("");
    const [statusError, setStatusError] = useState("");
    const [accountStatus, setAccountStatus] = useState("");
    const [accountStatusLoading, setAccountStatusLoading] = useState(false);
    const [accountStatusError, setAccountStatusError] = useState("");
    const [accountStatusSuccess, setAccountStatusSuccess] = useState("");

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getEmployeeById(id);

                setEmployee(data.employee);
                setEmploymentStatus(data.employee.employmentStatus);
                setAccountStatus(data.employee.user?.status || "");
            } catch (error) {
                console.error("Employee details error:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load employee details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id]);

    if (loading) {
        return (
            <div className="py-10 text-center text-muted-foreground">
                Loading employee details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/employees")}
                >
                    <ArrowLeft className="size-4" />
                    Back to Employees
                </Button>

                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="space-y-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/employees")}
                >
                    <ArrowLeft className="size-4" />
                    Back to Employees
                </Button>

                <p className="text-muted-foreground">
                    Employee not found.
                </p>
            </div>
        );
    }

    const handleStatusUpdate = async () => {
        try {
            setStatusLoading(true);
            setStatusError("");
            setStatusSuccess("");

            await updateEmploymentStatus(
                id,
                employmentStatus
            );

            setEmployee((prev) => ({
                ...prev,
                employmentStatus,
            }));

            setStatusSuccess(
                "Employment status updated successfully."
            );
        } catch (err) {
            setStatusError(
                err.response?.data?.message ||
                "Failed to update employment status."
            );
        } finally {
            setStatusLoading(false);
        }
    };

    const handleAccountStatusUpdate = async () => {
        try {
            setAccountStatusLoading(true);
            setAccountStatusError("");
            setAccountStatusSuccess("");

            await updateAccountStatus(
                id,
                accountStatus
            );

            setEmployee((prev) => ({
                ...prev,
                user: {
                    ...prev.user,
                    status: accountStatus,
                },
            }));

            setAccountStatusSuccess(
                "Account status updated successfully."
            );
        } catch (err) {
            setAccountStatusError(
                err.response?.data?.message ||
                "Failed to update account status."
            );
        } finally {
            setAccountStatusLoading(false);
        }
    };

    const user = employee.user;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        Employee Details
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        View employee information.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        onClick={() => navigate(`/employees/${id}/edit`)}
                    >
                        Edit Employee
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate("/employees")}
                    >
                        <ArrowLeft className="size-4" />
                        Back
                    </Button>
                </div>
            </div>

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem
                            label="Employee ID"
                            value={employee.employeeId}
                        />

                        <InfoItem
                            label="Name"
                            value={user?.name}
                        />

                        <InfoItem
                            label="Email"
                            value={user?.email}
                        />

                        <InfoItem
                            label="Department"
                            value={employee.department?.name}
                        />

                        <InfoItem
                            label="Designation"
                            value={employee.designation?.name}
                        />

                        <InfoItem
                            label="Joining Date"
                            value={
                                employee.joiningDate
                                    ? new Date(
                                        employee.joiningDate
                                    ).toLocaleDateString()
                                    : "—"
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Status</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Employment Status
                            </p>

                            <span
                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${getStatusClasses(
                                    employee.employmentStatus
                                )}`}
                            >
                                {employee.employmentStatus}
                            </span>
                        </div>

                        <InfoItem
                            label="Account Status"
                            value={user?.status}
                            capitalize
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Employment Status</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="employmentStatus">
                            Employment Status
                        </Label>

                        <select
                            id="employmentStatus"
                            value={employmentStatus}
                            onChange={(event) =>
                                setEmploymentStatus(event.target.value)
                            }
                            disabled={statusLoading}
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        >
                            <option value="pending">
                                Pending
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="rejected">
                                Rejected
                            </option>

                            <option value="terminated">
                                Terminated
                            </option>

                            <option value="resigned">
                                Resigned
                            </option>
                        </select>
                    </div>

                    {statusError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {statusError}
                        </div>
                    )}

                    {statusSuccess && (
                        <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
                            {statusSuccess}
                        </div>
                    )}

                    <Button
                        onClick={handleStatusUpdate}
                        disabled={statusLoading}
                    >
                        {statusLoading ? "Updating..." : "Update Status"}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="accountStatus">
                            Account Status
                        </Label>

                        <select
                            id="accountStatus"
                            value={accountStatus}
                            onChange={(event) =>
                                setAccountStatus(event.target.value)
                            }
                            disabled={accountStatusLoading}
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        >
                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>

                            <option value="suspended">
                                Suspended
                            </option>
                        </select>
                    </div>

                    {accountStatusError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {accountStatusError}
                        </div>
                    )}

                    {accountStatusSuccess && (
                        <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
                            {accountStatusSuccess}
                        </div>
                    )}

                    <Button
                        onClick={handleAccountStatusUpdate}
                        disabled={accountStatusLoading}
                    >
                        {accountStatusLoading
                            ? "Updating..."
                            : "Update Account Status"}
                    </Button>
                </CardContent>
            </Card>

            {/* Record Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Record Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <InfoItem
                            label="Created At"
                            value={
                                employee.createdAt
                                    ? new Date(
                                        employee.createdAt
                                    ).toLocaleString()
                                    : "—"
                            }
                        />

                        <InfoItem
                            label="Last Updated"
                            value={
                                employee.updatedAt
                                    ? new Date(
                                        employee.updatedAt
                                    ).toLocaleString()
                                    : "—"
                            }
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function InfoItem({
    label,
    value,
    capitalize = false,
}) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">
                {label}
            </p>

            <p
                className={[
                    "mt-1 font-medium",
                    capitalize ? "capitalize" : "",
                ].join(" ")}
            >
                {value || "—"}
            </p>
        </div>
    );
}

export default EmployeeDetails;