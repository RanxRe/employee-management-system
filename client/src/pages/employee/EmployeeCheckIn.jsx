import { useRef, useState, useEffect } from "react";
import { checkIn, checkOut } from "@/services/attendance.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function EmployeeCheckIn() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [location, setLocation] = useState(null);
    const [selfie, setSelfie] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [cameraLoading, setCameraLoading] = useState(false);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [selfiePreview, setSelfiePreview] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [error, setError] = useState("");

    const getLocation = () => {
        setError("");
        setMessage("");
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
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });

                setLocationLoading(false);
            },
            (error) => {
                console.error(
                    "Location error:",
                    error
                );

                setError(
                    "Unable to get your location. Please allow location access and try again."
                );

                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    };

    const startCamera = async () => {
        setError("");
        setMessage("");
        setCameraLoading(true);
        setCameraReady(false);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                },
                audio: false,
            });

            streamRef.current = stream;
            setCameraStream(stream);
            setCameraOpen(true);
        } catch (error) {
            console.error("Camera error:", error);

            if (streamRef.current) {
                streamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());

                streamRef.current = null;
            }

            setCameraStream(null);
            setCameraOpen(false);
            setCameraReady(false);

            setError(
                "Unable to access your camera. Please allow camera access and try again."
            );
        } finally {
            setCameraLoading(false);
        }
    };

    const refreshCamera = async () => {
        setCameraReady(false);

        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) => track.stop());

            streamRef.current = null;
        }

        setCameraStream(null);

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setSelfie(null);
        setSelfiePreview("");

        await startCamera();
    };

    const captureSelfie = () => {
        if (!videoRef.current) return;
        if (!cameraReady) {
            setError("Camera is not ready yet. Please wait a moment.");
            return;
        }
        const video = videoRef.current;
        if (!video.videoWidth || !video.videoHeight) {
            setError("Camera is not ready yet. Please wait a moment.");
            return;
        }
        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) => track.stop());

            streamRef.current = null;
        }

        setCameraStream(null);

        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    setError("Unable to capture selfie.");
                    return;
                }

                const file = new File(
                    [blob],
                    "attendance-selfie.jpg",
                    {
                        type: "image/jpeg",
                    }
                );

                setSelfie(file);
                setSelfiePreview(URL.createObjectURL(file));

                // Stop camera after capturing
                if (streamRef.current) {
                    streamRef.current
                        .getTracks()
                        .forEach((track) => track.stop());

                    streamRef.current = null;
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }

                setCameraStream(null);
                setCameraReady(false);
                setCameraOpen(false);
            },
            "image/jpeg",
            0.9
        );
    };

    const handleCheckIn = async () => {
        setError("");
        setMessage("");

        if (!location) {
            setError(
                "Please get your location first."
            );

            return;
        }

        if (!selfie) {
            setError(
                "Please capture your selfie first."
            );

            return;
        }

        setSubmitting(true);

        try {
            const response = await checkIn({
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                selfie,
            });

            setMessage(
                response.message ||
                "Check-in successful."
            );
        } catch (error) {
            console.error(
                "Check-in error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to check in."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCheckOut = async () => {
        setError("");
        setMessage("");

        if (!location) {
            setError(
                "Please get your location before checking out."
            );
            return;
        }

        setCheckingOut(true);

        try {
            const response = await checkOut({
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
            });

            setMessage(
                response.message ||
                "Check-out successful."
            );
        } catch (error) {
            console.error(
                "Check-out error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to check out."
            );
        } finally {
            setCheckingOut(false);
        }
    };

    useEffect(() => {
        if (!cameraOpen || !cameraStream) {
            return;
        }

        const video = videoRef.current;

        if (!video) {
            return;
        }

        video.srcObject = cameraStream;

        const handleLoadedMetadata = async () => {
            try {
                await video.play();
                setCameraReady(true);
            } catch (error) {
                console.error(
                    "Video playback error:",
                    error
                );

                setError(
                    "Unable to start the camera preview."
                );
            }
        };

        video.addEventListener(
            "loadedmetadata",
            handleLoadedMetadata
        );

        if (video.readyState >= 1) {
            handleLoadedMetadata();
        }

        return () => {
            video.removeEventListener(
                "loadedmetadata",
                handleLoadedMetadata
            );
        };
    }, [cameraOpen, cameraStream]);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());

                streamRef.current = null;
            }

            if (selfiePreview) {
                URL.revokeObjectURL(selfiePreview);
            }
        };
    }, [selfiePreview]);

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Check In
                </h1>

                <p className="text-sm text-muted-foreground">
                    Verify your location and capture a
                    selfie to mark today's attendance.
                </p>
            </div>

            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {message && (
                <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
                    {message}
                </div>
            )}

            {/* Location */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        1. Verify Location
                    </CardTitle>

                    <CardDescription>
                        Your location is used to verify
                        that you are within the allowed
                        office area.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Button
                        type="button"
                        onClick={getLocation}
                        disabled={locationLoading}
                    >
                        {locationLoading
                            ? "Getting location..."
                            : location
                                ? "Refresh Location"
                                : "Get My Location"}
                    </Button>

                    {location && (
                        <div className="rounded-md border p-4 text-sm">
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
                                    Accuracy:
                                </span>{" "}
                                {Math.round(
                                    location.accuracy
                                )}{" "}
                                meters
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Selfie */}
            <Card>
                <CardHeader>
                    <CardTitle>2. Capture Selfie</CardTitle>

                    <CardDescription>
                        A selfie is required for attendance verification.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {cameraOpen && (
                        <div className="relative overflow-hidden rounded-lg border bg-black">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                onCanPlay={() => {
                                    setCameraReady(true);
                                }}
                                className="aspect-video w-full object-cover"
                            />

                            {!cameraReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                    <p className="text-sm text-white">
                                        Preparing camera...
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {selfie && !cameraOpen && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                Captured Selfie
                            </p>

                            <div className="overflow-hidden rounded-lg border">
                                <img
                                    src={selfiePreview}
                                    alt="Captured attendance selfie"
                                    className="aspect-video w-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            onClick={startCamera}
                            disabled={cameraLoading || cameraOpen}
                        >
                            {cameraLoading
                                ? "Opening Camera..."
                                : "Open Camera"}
                        </Button>

                        {cameraOpen && (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={refreshCamera}
                                    disabled={cameraLoading}
                                >
                                    Refresh Camera
                                </Button>

                                <Button
                                    type="button"
                                    onClick={captureSelfie}
                                    disabled={!cameraReady}
                                >
                                    {cameraReady ? "Capture Selfie" : "Preparing Camera..."}
                                </Button>
                            </>
                        )}

                        {selfie && !cameraOpen && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={refreshCamera}
                            >
                                Retake Selfie
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Submit */}
            {/* Submit */}
            <Card>
                <CardContent className="space-y-3 pt-6">
                    <Button
                        type="button"
                        className="w-full"
                        onClick={handleCheckIn}
                        disabled={
                            submitting ||
                            checkingOut ||
                            error ||
                            !location ||
                            !selfie
                        }
                    >
                        {submitting
                            ? "Checking in..."
                            : "Check In"}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleCheckOut}
                        disabled={
                            submitting ||
                            checkingOut ||
                            error ||
                            !location
                        }
                    >
                        {checkingOut
                            ? "Checking out..."
                            : "Check Out"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default EmployeeCheckIn;
