const getTotalBreakMs = (attendance, now = new Date()) => {
  const completedBreakMs = (attendance.breaks || []).reduce(
    (total, breakRecord) => total + (breakRecord.durationMs || 0),
    0,
  );

  // Include the ongoing break, if there is one.
  const ongoingBreakMs = attendance.breakStartedAt
    ? Math.max(0, now.getTime() - new Date(attendance.breakStartedAt).getTime())
    : 0;

  return completedBreakMs + ongoingBreakMs;
};

const getWorkingTimeMs = (attendance, now = new Date()) => {
  if (!attendance.checkIn) return 0;

  // If checked out, use checkout time; otherwise, use the current time.
  const endTime = attendance.checkOut ? new Date(attendance.checkOut).getTime() : now.getTime();

  const elapsedMs = Math.max(0, endTime - new Date(attendance.checkIn).getTime());

  const totalBreakMs = getTotalBreakMs(attendance, now);

  const adjustmentMs = (attendance.workingTimeAdjustments || []).reduce(
    (total, adjustment) => total + (adjustment.adjustmentMs || 0),
    0,
  );

  return Math.max(0, elapsedMs - totalBreakMs + adjustmentMs);
};

export { getTotalBreakMs, getWorkingTimeMs };
