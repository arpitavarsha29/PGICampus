import { useState, useEffect } from 'react';

export interface CampusClockData {
  /** Full formatted date in English, e.g. "Saturday, 24 October 2026" */
  formattedDate: string;
  /** Uppercase formatted date, e.g. "SATURDAY, 24 OCTOBER 2026" */
  formattedDateUpper: string;
  /** Weekday name in IST, e.g. "Saturday" */
  weekday: string;
  /** Date without weekday in IST, e.g. "24 October 2026" */
  dateOnly: string;
  /** 12-hour formatted time with seconds and AM/PM in IST, e.g. "01:25:30 PM" */
  formattedTime12: string;
  /** Combined date and time, e.g. "Saturday, 24 October 2026 · 01:25:30 PM IST" */
  fullDateTimeIST: string;
  /** Contextual greeting based on IST hour: Good morning / Good afternoon / Good evening */
  greeting: string;
  /** Raw Date object */
  now: Date;
}

/**
 * Calculates current time components explicitly in Indian Standard Time (Asia/Kolkata).
 */
export function getISTDateParts(d: Date = new Date()): CampusClockData {
  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };

  const hourOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false,
  };

  const weekdayOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
  };

  const dateOnlyOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  const formattedDate = new Intl.DateTimeFormat('en-IN', dateOptions).format(d);
  let formattedTime12 = new Intl.DateTimeFormat('en-IN', timeOptions).format(d);
  // Ensure AM/PM is uppercase for crisp display
  formattedTime12 = formattedTime12.replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());

  const weekday = new Intl.DateTimeFormat('en-IN', weekdayOptions).format(d);
  const dateOnly = new Intl.DateTimeFormat('en-IN', dateOnlyOptions).format(d);

  const istHour = parseInt(
    new Intl.DateTimeFormat('en-IN', hourOptions).format(d),
    10
  );

  let greeting = 'Good day';
  if (istHour >= 4 && istHour < 12) {
    greeting = 'Good morning';
  } else if (istHour >= 12 && istHour < 17) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }

  return {
    formattedDate,
    formattedDateUpper: formattedDate.toUpperCase(),
    weekday,
    dateOnly,
    formattedTime12,
    fullDateTimeIST: `${formattedDate} · ${formattedTime12} IST`,
    greeting,
    now: d,
  };
}

/**
 * React hook that maintains live, second-by-second updating IST time and date.
 * Automatically cleans up interval on unmount.
 */
export function useCampusClock(): CampusClockData {
  const [clock, setClock] = useState<CampusClockData>(() => getISTDateParts());

  useEffect(() => {
    // Initial sync
    setClock(getISTDateParts());

    // Update every second
    const timer = setInterval(() => {
      setClock(getISTDateParts());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return clock;
}
