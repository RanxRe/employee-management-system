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

import { getAttendanceById } from "@/services/attendance.service";

function AttendanceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getAttendanceById(id);

                setAttendance(data.attendance);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load attendance details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [id]);

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString();
    };

    const formatDateTime = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleString();
    };

    const renderValue = (value) => {
        return value !== undefined &&
            value !== null &&
            value !== ""
            ? value
            : "—";
    };

    if (loading) {
        return (
            <div className="py-10 text-center text-sm text-muted-foreground">
                Loading attendance details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/attendance")}
                >
                    <ArrowLeft className="size-4" />
                    Back to Attendance
                </Button>

                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            </div>
        );
    }

    if (!attendance) {
        return (
            <div className="py-10 text-center text-sm text-muted-foreground">
                Attendance record not found.
            </div>
        );
    }

    const employee = attendance.employee;
    const user = employee?.user;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                    variant="outline"
                    onClick={() => navigate("/attendance")}
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Button>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Attendance Details
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        View complete attendance information.
                    </p>
                </div>
            </div>

            {/* Employee Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Employee Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Name
                            </p>

                            <p className="font-medium">
                                {renderValue(user?.name)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Employee ID
                            </p>

                            <p className="font-medium">
                                {renderValue(employee?.employeeId)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Email
                            </p>

                            <p className="font-medium break-all">
                                {renderValue(user?.email)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Employment Status
                            </p>

                            <p className="font-medium capitalize">
                                {renderValue(
                                    employee?.employmentStatus
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Attendance Date
                            </p>

                            <p className="font-medium">
                                {formatDate(attendance.date)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Status
                            </p>

                            <p className="font-medium capitalize">
                                {renderValue(attendance.status)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Remarks
                            </p>

                            <p className="font-medium">
                                {renderValue(attendance.remarks)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Check In
                            </p>

                            <p className="font-medium">
                                {formatDateTime(attendance.checkIn)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Check Out
                            </p>

                            <p className="font-medium">
                                {formatDateTime(attendance.checkOut)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Check-in Location */}
            <Card>
                <CardHeader>
                    <CardTitle>Check-in Location</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Latitude
                            </p>

                            <p className="font-medium break-all">
                                {renderValue(
                                    attendance.location?.latitude
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Longitude
                            </p>

                            <p className="font-medium break-all">
                                {renderValue(
                                    attendance.location?.longitude
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Accuracy
                            </p>

                            <p className="font-medium">
                                {attendance.location?.accuracy !==
                                    undefined
                                    ? `${attendance.location.accuracy} m`
                                    : "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Distance From Office
                            </p>

                            <p className="font-medium">
                                {attendance.location
                                    ?.distanceFromOffice !== undefined
                                    ? `${attendance.location.distanceFromOffice} m`
                                    : "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Verified
                            </p>

                            <p className="font-medium capitalize">
                                {attendance.location?.verified
                                    ? "Yes"
                                    : "No"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Check-out Location */}
            {attendance.checkOutLocation && (
                <Card>
                    <CardHeader>
                        <CardTitle>Check-out Location</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Latitude
                                </p>

                                <p className="font-medium break-all">
                                    {renderValue(
                                        attendance.checkOutLocation
                                            ?.latitude
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Longitude
                                </p>

                                <p className="font-medium break-all">
                                    {renderValue(
                                        attendance.checkOutLocation
                                            ?.longitude
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Accuracy
                                </p>

                                <p className="font-medium">
                                    {attendance.checkOutLocation
                                        ?.accuracy !== undefined
                                        ? `${attendance.checkOutLocation.accuracy} m`
                                        : "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Distance From Office
                                </p>

                                <p className="font-medium">
                                    {attendance.checkOutLocation
                                        ?.distanceFromOffice !== undefined
                                        ? `${attendance.checkOutLocation.distanceFromOffice} m`
                                        : "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Verified
                                </p>

                                <p className="font-medium">
                                    {attendance.checkOutLocation?.verified
                                        ? "Yes"
                                        : "No"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Selfie */}
            {attendance.selfie?.url && (
                <Card>
                    <CardHeader>
                        <CardTitle>Check-in Selfie</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
                            <img
                                src={attendance.selfie.url}
                                alt={`Attendance selfie of ${user?.name || "employee"
                                    }`}
                                className="h-auto max-h-[500px] w-full rounded-lg border object-contain sm:w-auto"
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Captured At
                                    </p>

                                    <p className="font-medium">
                                        {formatDateTime(
                                            attendance.selfie.capturedAt
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Verification
                                    </p>

                                    <p className="font-medium">
                                        {attendance.selfie.verified
                                            ? "Verified"
                                            : "Not Verified"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Record Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Record Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Attendance ID
                            </p>

                            <p className="break-all font-medium">
                                {attendance._id}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Created At
                            </p>

                            <p className="font-medium">
                                {formatDateTime(attendance.createdAt)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Updated At
                            </p>

                            <p className="font-medium">
                                {formatDateTime(attendance.updatedAt)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default AttendanceDetails;