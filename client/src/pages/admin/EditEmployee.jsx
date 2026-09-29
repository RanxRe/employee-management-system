import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import {
    getEmployeeById,
    updateEmployee,
} from "@/services/employee.service";

import { getAllDepartments } from "@/services/department.service";
import { getAllDesignations } from "@/services/designation.service";

function EditEmployee() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);

    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);

    const [formData, setFormData] = useState({
        department: "",
        designation: "",
        joiningDate: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const [employeeResponse, departmentsResponse, designationsResponse] = await Promise.all([getEmployeeById(id), getAllDepartments(), getAllDesignations()]);

                const employeeData = employeeResponse.employee;

                setEmployee(employeeData);

                setDepartments(departmentsResponse.departments || []);

                setDesignations(designationsResponse.designations || []);

                setFormData({
                    department: employeeData.department?._id || "",
                    designation: employeeData.designation?._id || "",
                    joiningDate: employeeData.joiningDate
                        ? employeeData.joiningDate.split("T")[0]
                        : "",
                });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load employee."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const data = {
                department: formData.department,
                joiningDate: formData.joiningDate,
            };

            if (formData.designation) {
                data.designation = formData.designation;
            }

            await updateEmployee(id, data);

            setSuccess("Employee updated successfully.");

            setTimeout(() => {
                navigate(`/employees/${id}`);
            }, 700);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update employee."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Loading employee...
                </p>
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
                    Back
                </Button>

                <p className="text-sm text-destructive">
                    {error || "Employee not found."}
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Button
                        variant="ghost"
                        className="mb-2 -ml-2"
                        onClick={() => navigate(`/employees/${id}`)}
                    >
                        <ArrowLeft className="size-4" />
                        Back
                    </Button>

                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Employee
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Update employment information for{" "}
                        {employee.user?.name || "employee"}.
                    </p>
                </div>
            </div>

            {/* Employee information */}
            <Card>
                <CardHeader>
                    <CardTitle>Employee Information</CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Employee ID */}
                    <div className="space-y-2">
                        <Label>Employee ID</Label>

                        <div className="bg-muted flex h-10 items-center rounded-md border px-3 text-sm">
                            {employee.employeeId}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label>Employee Name</Label>

                        <div className="bg-muted flex h-10 items-center rounded-md border px-3 text-sm">
                            {employee.user?.name || "—"}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label>Email</Label>

                        <div className="bg-muted flex h-10 items-center rounded-md border px-3 text-sm break-all">
                            {employee.user?.email || "—"}
                        </div>
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label htmlFor="department">
                            Department
                        </Label>

                        <select
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        >
                            <option value="">
                                Select department
                            </option>

                            {departments.filter((department) => department.status === "active" || department._id === formData.department).map((department) => (
                                <option
                                    key={department._id}
                                    value={department._id}
                                >
                                    {department.name}
                                    {department.status === "inactive" ? " (Inactive)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Designation */}
                    <div className="space-y-2">
                        <Label htmlFor="designation">
                            Designation
                        </Label>

                        <select
                            id="designation"
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        >
                            <option value="">
                                Select designation (optional)
                            </option>

                            {designations.filter((designation) => designation.status === "active" || designation._id === formData.designation).map((designation) => (
                                <option
                                    key={designation._id}
                                    value={designation._id}
                                >
                                    {designation.name}
                                    {designation.status === "inactive" ? " (Inactive)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Joining Date */}
                    <div className="space-y-2">
                        <Label htmlFor="joiningDate">
                            Joining Date
                        </Label>

                        <input
                            id="joiningDate"
                            name="joiningDate"
                            type="date"
                            value={formData.joiningDate}
                            onChange={handleChange}
                            required
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        />
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                navigate(`/employees/${id}`)
                            }
                            disabled={saving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default EditEmployee;