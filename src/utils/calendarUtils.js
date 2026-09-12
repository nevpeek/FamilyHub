export const WEEK_START_HOUR = 6;
export const WEEK_END_HOUR = 23;
export const WEEK_HOUR_HEIGHT = 64;

export const weekHours = Array.from(
  {
    length:
      WEEK_END_HOUR - WEEK_START_HOUR + 1,
  },
  (_, index) => WEEK_START_HOUR + index
);

export function formatHourLabel(hour) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);

  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
  }).format(date);
}

export function getCurrentTimeTop(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const minutesFromStart =
    (hours - WEEK_START_HOUR) * 60 + minutes;

  return (
    (minutesFromStart / 60) *
    WEEK_HOUR_HEIGHT
  );
}

export function getEventTop(time) {
  if (!time) {
    return 0;
  }

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const minutesFromStart =
    (hours - WEEK_START_HOUR) * 60 + minutes;

  return Math.max(
    0,
    (minutesFromStart / 60) * WEEK_HOUR_HEIGHT
  );
}

export function getEventDurationMinutes(event) {
  if (
    !event.start_date ||
    !event.start_time
  ) {
    return 60;
  }

  const start = new Date(
    `${event.start_date}T${event.start_time}:00`
  );

  const end = new Date(
    `${event.end_date || event.start_date}T${
      event.end_time || event.start_time
    }:00`
  );

  const durationMinutes =
    (end.getTime() - start.getTime()) /
    60000;

  if (
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0
  ) {
    return 60;
  }

  return durationMinutes;
}

export function getEventHeight(event) {
  return Math.max(
    32,
    (getEventDurationMinutes(event) / 60) *
      WEEK_HOUR_HEIGHT
  );
}

export function getEventStartMinutes(event) {
  if (!event.start_time) {
    return 0;
  }

  const [hours, minutes] =
    event.start_time
      .split(":")
      .map(Number);

  return hours * 60 + minutes;
}

export function getEventEndMinutes(event) {
  return (
    getEventStartMinutes(event) +
    getEventDurationMinutes(event)
  );
}

export function layoutOverlappingEvents(events) {
  const timedEvents = events
    .filter(
      (event) =>
        !event.all_day &&
        event.start_time
    )
    .sort(
      (a, b) =>
        getEventStartMinutes(a) -
        getEventStartMinutes(b)
    );

  const groups = [];
  let currentGroup = [];
  let currentGroupEnd = -1;

  for (const event of timedEvents) {
    const start =
      getEventStartMinutes(event);

    const end =
      getEventEndMinutes(event);

    if (
      currentGroup.length > 0 &&
      start >= currentGroupEnd
    ) {
      groups.push(currentGroup);
      currentGroup = [];
      currentGroupEnd = -1;
    }

    currentGroup.push(event);

    currentGroupEnd = Math.max(
      currentGroupEnd,
      end
    );
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups.flatMap((group) => {
    const laneEndTimes = [];
    const laidOutEvents = [];

    for (const event of group) {
      const start =
        getEventStartMinutes(event);

      const end =
        getEventEndMinutes(event);

      let columnIndex =
        laneEndTimes.findIndex(
          (laneEnd) => laneEnd <= start
        );

      if (columnIndex === -1) {
        columnIndex =
          laneEndTimes.length;

        laneEndTimes.push(end);
      } else {
        laneEndTimes[columnIndex] =
          end;
      }

      laidOutEvents.push({
        event,
        columnIndex,
      });
    }

    const columnCount =
      laneEndTimes.length;

    return laidOutEvents.map(
      ({ event, columnIndex }) => ({
        event,
        columnIndex,
        columnCount,
      })
    );
  });
}

export function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);

  const mondayIndex =
    (firstDay.getDay() + 6) % 7;

  const gridStart =
    new Date(year, month, 1 - mondayIndex);

  return Array.from(
    { length: 42 },
    (_, index) => {
      const date = new Date(gridStart);

      date.setDate(
        gridStart.getDate() + index
      );

      return {
        date,
        isCurrentMonth:
          date.getMonth() === month,
      };
    }
  );
}

export function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDateKey(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getWeatherForDate(weather, date) {
  if (!weather?.daily || !date) {
    return null;
  }

  const dateKey = formatDateKey(date);

  return (
    weather.daily.find(
      (day) => day.date === dateKey
    ) || null
  );
}

export function formatEventTime(time) {
  if (!time) {
    return "";
  }

  const [hourText, minuteText] =
    time.split(":");

  const date = new Date();

  date.setHours(
    Number(hourText),
    Number(minuteText),
    0,
    0
  );

  return new Intl.DateTimeFormat(
    "en-AU",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

export function formatEventTimeRange(
  startTime,
  endTime
) {
  if (!startTime) {
    return "";
  }

  if (!endTime) {
    return formatEventTime(startTime);
  }

  const start =
    formatEventTime(startTime);

  const end =
    formatEventTime(endTime);

  const startMatch = start.match(
    /^(.+?)\s*(am|pm)$/i
  );

  const endMatch = end.match(
    /^(.+?)\s*(am|pm)$/i
  );

  if (!startMatch || !endMatch) {
    return `${start} – ${end}`;
  }

  const [, startClock, startPeriod] =
    startMatch;

  const [, endClock, endPeriod] =
    endMatch;

  if (
    startPeriod.toLowerCase() ===
    endPeriod.toLowerCase()
  ) {
    return `${startClock}–${endClock} ${endPeriod}`;
  }

  return `${startClock} ${startPeriod}–${endClock} ${endPeriod}`;
}