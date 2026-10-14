import { useCallback, useEffect, useState } from "react";
import {
    Bell,
    BellRing,
    Check,
    CheckCheck,
    RefreshCw,
} from "lucide-react";

import {
    getMyNotifications,
    getMyNotificationSummary,
    markNotificationAsRead,
} from "@/services/notification.service";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
    });
};

function SummaryCard({ title, value, icon: Icon, description }) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-5">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl font-bold">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>

                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function EmployeeNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [summary, setSummary] = useState({
        total: 0,
        unread: 0,
        read: 0,
    });

    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [markingId, setMarkingId] = useState(null);
    const [error, setError] = useState("");
    const [actionMessage, setActionMessage] = useState("");

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        setError("");
        setActionMessage("");

        try {
            const [notificationResult, summaryResult] = await Promise.allSettled([
                getMyNotifications(),
                getMyNotificationSummary(),
            ]);

            if (notificationResult.status === "fulfilled") {
                setNotifications(notificationResult.value.notifications ?? []);
            } else if (notificationResult.reason.response?.status === 404) {
                // The backend returns 404 when the employee has no notifications.
                setNotifications([]);
            } else {
                throw notificationResult.reason;
            }

            if (summaryResult.status === "fulfilled") {
                setSummary(
                    summaryResult.value.summary ?? {
                        total: 0,
                        unread: 0,
                        read: 0,
                    }
                );
            } else {
                throw summaryResult.reason;
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load notifications. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const handleMarkAsRead = async (notificationId) => {
        setMarkingId(notificationId);
        setError("");
        setActionMessage("");

        try {
            await markNotificationAsRead(notificationId);

            // Update the item immediately for a responsive interface.
            setNotifications((previous) =>
                previous.map((notification) =>
                    notification._id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );

            // Refresh authoritative counts from the backend.
            const summaryResult = await getMyNotificationSummary();

            setSummary(
                summaryResult.summary ?? {
                    total: 0,
                    unread: 0,
                    read: 0,
                }
            );

            setActionMessage("Notification marked as read.");
        } catch (err) {
            if (err.response?.status === 409) {
                // It may already have been read elsewhere.
                await loadNotifications();
                setActionMessage("This notification was already marked as read.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to mark notification as read."
                );
            }
        } finally {
            setMarkingId(null);
        }
    };

    const filteredNotifications = notifications.filter((notification) => {
        if (filter === "unread") return !notification.isRead;
        if (filter === "read") return notification.isRead;
        return true;
    });

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
            {/* Page heading */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        My Notifications
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Stay updated with your employee account and activities.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={loadNotifications}
                    disabled={loading || markingId !== null}
                    className="w-full sm:w-auto"
                >
                    <RefreshCw
                        className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>
            </div>

            {/* Summary cards */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SummaryCard
                    title="Total Notifications"
                    value={summary.total}
                    icon={Bell}
                    description="All notifications"
                />
                <SummaryCard
                    title="Unread"
                    value={summary.unread}
                    icon={BellRing}
                    description="Need your attention"
                />
                <SummaryCard
                    title="Read"
                    value={summary.read}
                    icon={CheckCheck}
                    description="Already viewed"
                />
            </section>

            {/* Error and success messages */}
            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                >
                    <p>{error}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={loadNotifications}
                    >
                        Try Again
                    </Button>
                </div>
            )}

            {actionMessage && (
                <p
                    role="status"
                    className="rounded-lg border bg-muted/50 p-3 text-sm"
                >
                    {actionMessage}
                </p>
            )}

            {/* Notification filters */}
            <div className="flex flex-wrap gap-2" aria-label="Notification filters">
                {[
                    { value: "all", label: "All" },
                    { value: "unread", label: "Unread" },
                    { value: "read", label: "Read" },
                ].map((item) => (
                    <Button
                        key={item.value}
                        type="button"
                        size="sm"
                        variant={filter === item.value ? "default" : "outline"}
                        onClick={() => setFilter(item.value)}
                        aria-pressed={filter === item.value}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            {/* Notification list */}
            <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold">Notification History</h2>
                    {!loading && (
                        <span className="text-sm text-muted-foreground">
                            {filteredNotifications.length} shown
                        </span>
                    )}
                </div>

                {loading ? (
                    <Card>
                        <CardContent className="p-8 text-center text-sm text-muted-foreground">
                            Loading notifications…
                        </CardContent>
                    </Card>
                ) : !error && filteredNotifications.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center p-8 text-center">
                            <Bell className="mb-3 size-10 text-muted-foreground" />
                            <h3 className="font-semibold">
                                {filter === "unread"
                                    ? "You're all caught up!"
                                    : filter === "read"
                                        ? "No read notifications"
                                        : "No notifications yet"}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {filter === "unread"
                                    ? "You have no unread notifications."
                                    : "Notifications will appear here when available."}
                            </p>
                        </CardContent>
                    </Card>
                ) : !error ? (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <Card
                                key={notification._id}
                                className={
                                    notification.isRead
                                        ? ""
                                        : "border-primary/30 bg-primary/[0.03]"
                                }
                            >
                                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                                    <div className="flex min-w-0 gap-3">
                                        <div
                                            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${notification.isRead
                                                ? "bg-muted text-muted-foreground"
                                                : "bg-primary/10 text-primary"
                                                }`}
                                        >
                                            {notification.isRead ? (
                                                <CheckCheck className="size-5" />
                                            ) : (
                                                <BellRing className="size-5" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold">
                                                    {notification.title || "Notification"}
                                                </h3>

                                                {!notification.isRead && (
                                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                        Unread
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                                                {notification.message ||
                                                    notification.description ||
                                                    "No additional details."}
                                            </p>

                                            {notification.type && (
                                                <p className="mt-2 text-xs capitalize text-muted-foreground">
                                                    Type: {String(notification.type).replaceAll("_", " ")}
                                                </p>
                                            )}

                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Received: {formatDate(notification.createdAt)}
                                            </p>

                                            {notification.readAt && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Read: {formatDate(notification.readAt)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {!notification.isRead && (
                                        <Button
                                            type="button"
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            disabled={markingId !== null}
                                            className="w-full shrink-0 sm:w-auto"
                                        >
                                            <Check className="mr-2 size-4" />
                                            {markingId === notification._id
                                                ? "Marking…"
                                                : "Mark as Read"}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : null}
            </section>
        </div>
    );
}