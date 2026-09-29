import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
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

import { createEmployee } from "@/services/employee.service";
import { getAllDepartments } from "@/services/department.service";
import { getAllDesignations } from "@/services/designation.service";

function CreateEmployee() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        employeeId: "",
        department: "",
        designation: "",
        joiningDate: "",
    });

    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [designationsLoading, setDesignationsLoading] = useState(true);


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setDepartmentsLoading(true);
                const data = await getAllDepartments();
                setDepartments(data.departments || []);

            } catch (error) {
                console.error("Departments error:", error)
                setError(error.response?.data?.message || "Unable to load departments.");
            } finally {
                setDepartmentsLoading(false);
            }
        }
        fetchDepartments();
    }, [])

    useEffect(() => {
        const fetchDesignations = async () => {
            try {
                setDesignationsLoading(true);

                const data = await getAllDesignations();

                setDesignations(data.designations || []);
            } catch (error) {
                console.error(
                    "Designations error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load designations."
                );
            } finally {
                setDesignationsLoading(false);
            }
        };

        fetchDesignations();
    }, []);
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
            setLoading(true);
            setError("");
            setSuccess("");

            const data = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                employeeId: formData.employeeId,
                department: formData.department,
                joiningDate: formData.joiningDate,
            };

            if (formData.designation) {
                data.designation = formData.designation;
            }

            await createEmployee(data);
            navigate("/employees")

            setSuccess("Employee created successfully.");

            setFormData({
                name: "",
                email: "",
                password: "",
                employeeId: "",
                department: "",
                designation: "",
                joiningDate: "",
            });
        } catch (error) {
            console.error("Create employee error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to create employee."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        Create Employee
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Create a new employee account and employee record.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => navigate("/employees")}
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Full Name
                            </Label>

                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter employee name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email
                            </Label>

                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="employee@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password
                            </Label>

                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Minimum 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                                minLength={8}
                                required
                            />
                        </div>

                        {/* Employee ID */}
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">
                                Employee ID
                            </Label>

                            <Input
                                id="employeeId"
                                name="employeeId"
                                type="text"
                                placeholder="EMP005"
                                value={formData.employeeId}
                                onChange={handleChange}
                                required
                            />

                            <p className="text-xs text-muted-foreground">
                                Example: EMP005
                            </p>
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
                                disabled={departmentsLoading}
                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">
                                    {departmentsLoading
                                        ? "Loading departments..."
                                        : "Select department"}
                                </option>

                                {departments.map((department) => (
                                    <option
                                        key={department._id}
                                        value={department._id}
                                    >
                                        {department.name}
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
                                disabled={designationsLoading}
                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">
                                    {designationsLoading
                                        ? "Loading designations..."
                                        : "Select designation (optional)"}
                                </option>

                                {designations.map((designation) => (
                                    <option
                                        key={designation._id}
                                        value={designation._id}
                                    >
                                        {designation.name}
                                    </option>
                                ))}
                            </select>

                            <p className="text-xs text-muted-foreground">
                                Optional.
                            </p>
                        </div>

                        {/* Joining Date */}
                        <div className="space-y-2">
                            <Label htmlFor="joiningDate">
                                Joining Date
                            </Label>

                            <Input
                                id="joiningDate"
                                name="joiningDate"
                                type="date"
                                value={formData.joiningDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                {success}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/employees")}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating..."
                                    : "Create Employee"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default CreateEmployee;