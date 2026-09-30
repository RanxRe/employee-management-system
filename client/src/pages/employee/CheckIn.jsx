import { useRef, useState } from "react";
import { ArrowLeft, Camera, MapPin } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { checkIn } from "@/services/attendance.service";

function CheckIn() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [location, setLocation] = useState(null);
    const [selfie, setSelfie] = useState(null);

    const [locationLoading, setLocationLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleGetLocation = () => {
        setError("");
        setLocationLoading(true);

        if (!navigator.geolocation) {
            setError(
                "Geolocation is not supported by your browser."
            );
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } =
                    position.coords;

                setLocation({
                    latitude,
                    longitude,
                    accuracy,
                });

                setLocationLoading(false);
            },
            (error) => {
                setLocationLoading(false);

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setError(
                            "Location permission was denied. Please enable location access."
                        );
                        break;

                    case error.POSITION_UNAVAILABLE:
                        setError(
                            "Your current location could not be determined."
                        );
                        break;

                    case error.TIMEOUT:
                        setError(
                            "Location request timed out. Please try again."
                        );
                        break;

                    default:
                        setError(
                            "Unable to get your current location."
                        );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    };

    const handleSelfieChange = (event) => {
        setError("");

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setSelfie(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!location) {
            setError(
                "Please allow location access and get your current location first."
            );
            return;
        }

        if (!selfie) {
            setError(
                "Please capture a selfie before checking in."
            );
            return;
        }

        try {
            setLoading(true);

            await checkIn({
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                selfie,
            });

            setSuccess("Check-in successful.");

            setTimeout(() => {
                navigate("/attendances");
            }, 1000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Check-in failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                >
                    <ArrowLeft className="size-4" />
                </Button>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Employee Check-in
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Verify your location and capture a selfie to
                        mark attendance.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Location Verification</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetLocation}
                        disabled={locationLoading || loading}
                        className="w-full"
                    >
                        <MapPin className="size-4" />

                        {locationLoading
                            ? "Getting location..."
                            : location
                                ? "Update Location"
                                : "Get My Location"}
                    </Button>

                    {location && (
                        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                            <div className="space-y-2">
                                <p>
                                    <span className="font-medium">
                                        Latitude:
                                    </span>{" "}
                                    {location.latitude}
                                </p>

                                <p>
                                    <span className="font-medium">
                                        Longitude:
                                    </span>{" "}
                                    {location.longitude}
                                </p>

                                <p>
                                    <span className="font-medium">
                                        GPS Accuracy:
                                    </span>{" "}
                                    {Math.round(location.accuracy)} meters
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                        Your location is checked against the registered
                        office location by the server.
                    </p>
                </CardContent>
            </Card>

            {/* Selfie */}
            <Card>
                <CardHeader>
                    <CardTitle>Selfie Verification</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handleSelfieChange}
                        className="hidden"
                    />

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="w-full"
                    >
                        <Camera className="size-4" />

                        {selfie
                            ? "Retake Selfie"
                            : "Capture Selfie"}
                    </Button>

                    {selfie && (
                        <div className="overflow-hidden rounded-lg border">
                            <img
                                src={URL.createObjectURL(selfie)}
                                alt="Selfie preview"
                                className="mx-auto aspect-square w-full max-w-sm object-cover"
                            />
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                        A selfie is required to check in.
                    </p>
                </CardContent>
            </Card>

            {/* Messages */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* Submit */}
            <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || locationLoading}
                className="w-full"
            >
                {loading ? "Checking in..." : "Check In"}
            </Button>
        </div>
    );
}

export default CheckIn;