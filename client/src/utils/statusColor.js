export const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "approved":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300";
    case "pending":
      return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
    case "rejected":
    case "terminated":
    case "resigned":
    case "inactive":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
};

export const getEmploymentStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

    case "inactive":
    case "terminated":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

    case "pending":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";

    case "rejected":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";

    case "resigned":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  }
};

export function getLeaveStatusClass(status) {
  const classes = {
    pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-700",
    approved: "border-green-500/40 bg-green-500/10 text-green-700",
    rejected: "border-destructive/30 bg-destructive/10 text-destructive",
    cancelled: "border-muted bg-muted text-muted-foreground",
  };

  return classes[status] || "border-muted bg-muted text-muted-foreground";
}

export const getAttendanceStatusClass = (status) => {
  const classes = {
    half_day: "border-yellow-500/40 bg-yellow-500/10 text-yellow-700",
    present: "border-green-500/40 bg-green-500/10 text-green-700",
    absent: "border-destructive/30 bg-destructive/10 text-destructive",
    leave: "border-muted bg-muted text-muted-foreground",
  };
  return classes[status] || "border-muted bg-muted text-muted-foreground";
};

export const currentAvailabilityStatusClass = (breakStatus) => {
  const classes = {
    Available: "border-green-500/40 bg-green-500/10 text-green-700",
    "On Break": "border-yellow-500/40 bg-yellow-500/10 text-yellow-700",
    "Checked Out": "border-destructive/30 bg-destructive/10 text-destructive",
    "Not Checked In": "border-muted bg-muted text-muted-foreground",
  };
  return classes[breakStatus] || "border-muted bg-muted text-muted-foreground";
};
