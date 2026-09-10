/**
 * Utility function to return standardized formatted current date and day
 */
export function getCurrentDateAndDay() {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = now.toLocaleDateString('en-US', { month: 'long' });
  const monthShort = now.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = now.getDate();
  const year = now.getFullYear();

  return {
    dayName,
    monthName,
    monthShort,
    dayNum,
    year,
    fullFormatted: `${dayName}, ${monthName} ${dayNum}, ${year}`,
    shortFormatted: `${dayName}, ${monthShort} ${dayNum}, ${year}`,
    headerFormatted: `${dayName}, ${dayNum} ${monthName} ${year}`,
  };
}

/**
 * Utility function to format any YYYY-MM-DD or ISO date into day and date string
 */
export function formatDateWithDay(dateStr: string) {
  if (!dateStr) return { dayName: '', fullDateStr: '', shortDateStr: '' };
  const parts = dateStr.split('T')[0].split('-');
  let dateObj: Date;
  if (parts.length === 3) {
    dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  } else {
    dateObj = new Date(dateStr);
  }

  if (isNaN(dateObj.getTime())) return { dayName: dateStr, fullDateStr: dateStr, shortDateStr: dateStr };

  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = dateObj.getDate();
  const year = dateObj.getFullYear();

  return {
    dayName,
    fullDateStr: `${dayName}, ${monthName} ${dayNum}, ${year}`,
    shortDateStr: `${dayName.slice(0, 3)}, ${monthShort} ${dayNum}`,
  };
}

/**
 * Utility function to check if an assignment due date has passed by more than 24 hours.
 * Returns true if more than 24 hours have elapsed since the due date passed.
 */
export function isPast24HoursAfterDueDate(dueDateStr: string): boolean {
  if (!dueDateStr) return false;
  try {
    const formatted = dueDateStr.includes('T') ? dueDateStr : dueDateStr.replace(' ', 'T');
    const dueDateObj = new Date(formatted);
    if (isNaN(dueDateObj.getTime())) return false;
    const now = new Date();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    return now.getTime() - dueDateObj.getTime() > twentyFourHoursMs;
  } catch (err) {
    return false;
  }
}

/**
 * Checks if two date ranges [startA, endA] and [startB, endB] overlap.
 * Assumes ISO format strings 'YYYY-MM-DD' or comparable date strings.
 */
export function doDateRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  if (!startA || !endA || !startB || !endB) return false;
  const sA = startA <= endA ? startA : endA;
  const eA = startA <= endA ? endA : startA;
  const sB = startB <= endB ? startB : endB;
  const eB = startB <= endB ? endB : startB;
  return sA <= eB && eA >= sB;
}

/**
 * Given a date string YYYY-MM-DD, returns the next calendar day string in YYYY-MM-DD format.
 */
export function getNextDayDateStr(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/**
 * Formats a date range into a concise human-readable string (e.g. "08 Aug 2026 - 12 Aug 2026")
 */
export function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr && !endDateStr) return '';
  if (!endDateStr || startDateStr === endDateStr) {
    const { fullDateStr } = formatDateWithDay(startDateStr);
    return fullDateStr || startDateStr;
  }
  const s = formatDateWithDay(startDateStr);
  const e = formatDateWithDay(endDateStr);
  return `${s.shortDateStr} – ${e.shortDateStr}, ${e.fullDateStr.split(', ').pop() || ''}`;
}

