import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import EventDetailsModal from "../components/EventDetailsModal";
import CalendarWeatherIcon from "../components/CalendarWeatherIcon";
import CalendarScheduleView from "../components/CalendarScheduleView";
import { API_BASE_URL } from "../config/api";
import {
  WEEK_START_HOUR,
  WEEK_END_HOUR,
  WEEK_HOUR_HEIGHT,
  weekHours,
  formatHourLabel,
  getCurrentTimeTop,
  getEventTop,
  getEventDurationMinutes,
  getEventHeight,
  layoutOverlappingEvents,
  getMonthGrid,
  isSameDate,
  formatDateKey,
  getWeatherForDate,
  formatEventTime,
  formatEventTimeRange,
} from "../utils/calendarUtils";


function CalendarPage({
  members,
  selectedMemberId,
  setSelectedMemberId,
  onAddEvent,
  onEditEvent,
  eventRefreshKey,
}) {
  const today = useMemo(() => new Date(), []);

const [visibleDate, setVisibleDate] = useState(
  () => new Date(today)
);

const [events, setEvents] = useState([]);
const [eventsLoading, setEventsLoading] = useState(true);
const [eventsError, setEventsError] = useState("");
const [selectedEvent, setSelectedEvent] = useState(null);
const [calendarView, setCalendarView] = useState(() =>
  window.matchMedia("(max-width: 700px)").matches ? "schedule" : "week"
);
const [draggedEvent, setDraggedEvent] = useState(null);
const [dragPreview, setDragPreview] = useState(null);

const [weather, setWeather] = useState(null);
const [weatherLoading, setWeatherLoading] =
  useState(true);
const [weatherError, setWeatherError] =
  useState("");

const [currentTime, setCurrentTime] = useState(
  () => new Date()
);

const weekScrollRef = useRef(null);

useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 60000);

  return () => clearInterval(timer);
}, []);

useEffect(() => {
  let cancelled = false;

  async function loadWeather() {
    setWeatherLoading(true);
    setWeatherError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/weather`
      );

      if (!response.ok) {
        throw new Error("Failed to load weather");
      }

      const data = await response.json();

      if (!cancelled) {
        setWeather(data);
      }
    } catch (err) {
      console.error(err);

      if (!cancelled) {
        setWeatherError(
          "Unable to load calendar weather"
        );
      }
    } finally {
      if (!cancelled) {
        setWeatherLoading(false);
      }
    }
  }

  loadWeather();

  return () => {
    cancelled = true;
  };
}, []);

useEffect(() => {
  if (
    (calendarView !== "week" &&
      calendarView !== "day") ||
    !weekScrollRef.current
  ) {
    return;
  }

  const now = new Date();

  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();

  const startMinutes =
    WEEK_START_HOUR * 60;

  const minutesFromStart =
    currentMinutes - startMinutes;

  const currentPosition =
    (minutesFromStart / 60) *
    WEEK_HOUR_HEIGHT;

  const scrollContainer =
    weekScrollRef.current;

  const targetScroll =
    currentPosition -
    scrollContainer.clientHeight / 2;

  scrollContainer.scrollTop = Math.max(
    0,
    targetScroll
  );
}, [calendarView, visibleDate]);

  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();

  const days = useMemo(() => {
    return getMonthGrid(year, month);
  }, [year, month]);

  const monthLabel = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(visibleDate);



  const gridStartDate = formatDateKey(days[0].date);
  const gridEndDate = formatDateKey(days[days.length - 1].date);

  const weekDays = useMemo(() => {
  const start = new Date(visibleDate);

  const dayIndex = (start.getDay() + 6) % 7;

  start.setDate(start.getDate() - dayIndex);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return date;
  });
}, [visibleDate]);

const weekStartDate = formatDateKey(weekDays[0]);
const weekEndDate = formatDateKey(weekDays[6]);

const weekLabel = `${new Intl.DateTimeFormat(
  "en-AU",
  {
    day: "numeric",
    month: "short",
  }
).format(weekDays[0])} – ${new Intl.DateTimeFormat(
  "en-AU",
  {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
).format(weekDays[6])}`;

const dayLabel = new Intl.DateTimeFormat(
  "en-AU",
  {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }
).format(visibleDate);

const scheduleDays = useMemo(() => {
  return Array.from(
    { length: 14 },
    (_, index) => {
      const date = new Date(
        visibleDate
      );

      date.setHours(
        0,
        0,
        0,
        0
      );

      date.setDate(
        date.getDate() + index
      );

      return date;
    }
  );
}, [visibleDate]);

const scheduleStartDate =
  formatDateKey(
    scheduleDays[0]
  );

const scheduleEndDate =
  formatDateKey(
    scheduleDays[
      scheduleDays.length - 1
    ]
  );

const scheduleLabel =
  `${new Intl.DateTimeFormat(
    "en-AU",
    {
      day: "numeric",
      month: "short",
    }
  ).format(
    scheduleDays[0]
  )} – ${new Intl.DateTimeFormat(
    "en-AU",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(
    scheduleDays[
      scheduleDays.length - 1
    ]
  )}`;

const dayDate = formatDateKey(visibleDate);

const visibleStartDate =
  calendarView === "schedule"
    ? scheduleStartDate
    : calendarView === "day"
      ? formatDateKey(visibleDate)
      : calendarView === "week"
        ? weekStartDate
        : gridStartDate;

const visibleEndDate =
  calendarView === "schedule"
    ? scheduleEndDate
    : calendarView === "day"
      ? formatDateKey(visibleDate)
      : calendarView === "week"
        ? weekEndDate
        : gridEndDate;

  useEffect(() => {
    async function loadEvents() {
      setEventsLoading(true);
      setEventsError("");

      try {
const params = new URLSearchParams({
  start: visibleStartDate,
  end: visibleEndDate,
});

        if (selectedMemberId !== "all") {
          params.set("memberId", String(selectedMemberId));
        }

        const response = await fetch(
          `${API_BASE_URL}/api/events?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to load events");
        }

        const data = await response.json();

        setEvents(data.events || []);
      } catch (err) {
        console.error(err);
        setEventsError("Unable to load calendar events");
      } finally {
        setEventsLoading(false);
      }
    }

    loadEvents();
}, [
  visibleStartDate,
  visibleEndDate,
  selectedMemberId,
  eventRefreshKey,
]);
  const eventsByDate = useMemo(() => {
    const map = new Map();

    for (const event of events) {
      const existing = map.get(event.start_date) || [];
      existing.push(event);
      map.set(event.start_date, existing);
    }

    return map;
  }, [events]);

  async function saveDraggedEvent(
  event,
  newDate,
  newTime
) {
  const memberIds =
    event.members?.map((member) => member.id) ||
    [];

const oldStart = new Date(
  `${event.start_date}T${event.start_time}:00`
);

const oldEnd = new Date(
  `${event.end_date || event.start_date}T${
    event.end_time || event.start_time
  }:00`
);

const durationMinutes =
  getEventDurationMinutes(event);

let durationMs =
  durationMinutes * 60 * 1000;

if (
  !Number.isFinite(durationMs) ||
  durationMs <= 0
) {
  durationMs = 60 * 60 * 1000;
}

const newStart = new Date(
  `${newDate}T${newTime}:00`
);

const newEnd = new Date(
  newStart.getTime() + durationMs
);

const newEndDate =
  formatDateKey(newEnd);

const newEndTime = `${String(
  newEnd.getHours()
).padStart(2, "0")}:${String(
  newEnd.getMinutes()
).padStart(2, "0")}`;

  const payload = {
    title: event.title,
    description: event.description || null,

    startDate: newDate,
    startTime: newTime,

  endDate: newEndDate,
endTime: newEndTime,

    allDay: false,

    location: event.location || null,
    category: event.category || "other",
    reminderEnabled: Boolean(event.reminder_enabled),
    reminderMinutes:
      event.reminder_minutes !== null &&
      event.reminder_minutes !== undefined
        ? Number(event.reminder_minutes)
        : null,
    memberIds,
    recurrenceRule: event.recurrence_rule || null,

    recurrenceEndDate:
      event.recurrence_end_date || null,

    recurrenceCount:
      event.recurrence_count || null,
  };

if (event.is_recurring && event.is_occurrence) {
  try {
    const seriesEventId =
      event.series_event_id || event.id;

    const occurrenceDate =
      event.occurrence_date ||
      event.start_date;

    const response = await fetch(
      `${API_BASE_URL}/api/events/${seriesEventId}/occurrences/${occurrenceDate}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to move recurring event"
      );
    }

    setEvents((currentEvents) =>
      currentEvents.map((currentEvent) => {
        if (
          currentEvent.occurrence_key !==
          event.occurrence_key
        ) {
          return currentEvent;
        }

return {
  ...currentEvent,
  start_date: newDate,
  start_time: newTime,
  end_date: newEndDate,
  end_time: newEndTime,
};
      })
    );

    return;
  } catch (err) {
    console.error(err);

    setEventsError(
      err.message ||
        "Unable to move recurring event"
    );

    return;
  }
}

try {
  const response = await fetch(
    `${API_BASE_URL}/api/events/${event.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Unable to move event"
    );
  }

  setEvents((currentEvents) =>
    currentEvents.map((currentEvent) => {
      if (currentEvent.id !== event.id) {
        return currentEvent;
      }

return {
  ...currentEvent,
  start_date: newDate,
  start_time: newTime,
  end_date: newEndDate,
  end_time: newEndTime,
};
    })
  );
} catch (err) {
  console.error(err);

  setEventsError(
    err.message ||
      "Unable to move event"
  );
}
}

function goToPreviousPeriod() {
  if (calendarView === "schedule") {
    const previousSchedule =
      new Date(visibleDate);

    previousSchedule.setDate(
      previousSchedule.getDate() - 14
    );

    setVisibleDate(
      previousSchedule
    );

    return;
  }

  if (calendarView === "day") {
    const previousDay =
      new Date(visibleDate);

    previousDay.setDate(
      previousDay.getDate() - 1
    );

    setVisibleDate(previousDay);

    return;
  }

  if (calendarView === "week") {
    const previousWeek =
      new Date(visibleDate);

    previousWeek.setDate(
      previousWeek.getDate() - 7
    );

    setVisibleDate(previousWeek);

    return;
  }

  setVisibleDate(
    new Date(
      year,
      month - 1,
      1
    )
  );
}

function goToNextPeriod() {
  if (calendarView === "schedule") {
    const nextSchedule =
      new Date(visibleDate);

    nextSchedule.setDate(
      nextSchedule.getDate() + 14
    );

    setVisibleDate(
      nextSchedule
    );

    return;
  }

  if (calendarView === "day") {
    const nextDay =
      new Date(visibleDate);

    nextDay.setDate(
      nextDay.getDate() + 1
    );

    setVisibleDate(nextDay);

    return;
  }

  if (calendarView === "week") {
    const nextWeek =
      new Date(visibleDate);

    nextWeek.setDate(
      nextWeek.getDate() + 7
    );

    setVisibleDate(nextWeek);

    return;
  }

  setVisibleDate(
    new Date(
      year,
      month + 1,
      1
    )
  );
}

function goToToday() {
  if (
    calendarView === "schedule" ||
    calendarView === "day" ||
    calendarView === "week"
  ) {
    setVisibleDate(
      new Date(today)
    );

    return;
  }

  setVisibleDate(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )
  );
}

  return (
    <div className="calendar-page">
      <section className="calendar-page-heading">
        <div>
          <p className="section-kicker">Calendar</p>
<h2>
  {calendarView === "day"
    ? dayLabel
    : calendarView === "week"
      ? weekLabel
      : calendarView === "schedule"
        ? scheduleLabel
        : monthLabel}
</h2>
          <p>
            See everything happening across the family.
          </p>
        </div>

        <button
  type="button"
  className="add-event-button"
  onClick={onAddEvent}
>
  <Plus size={22} />
  <span>Add Event</span>
</button>
      </section>

<section className="family-selector family-selector-section">
  <button
    type="button"
    className={`family-selector-button family-selector-everyone ${
      selectedMemberId === "all" ? "selected" : ""
    }`}
    onClick={() => setSelectedMemberId("all")}
  >
    Everyone
  </button>

  {members.map((member) => (
    <button
      type="button"
      key={member.id}
      className={`family-selector-button ${
        selectedMemberId === member.id ? "selected" : ""
      }`}
      onClick={() => setSelectedMemberId(member.id)}
    >
      <span
        className="family-selector-avatar"
        style={{ backgroundColor: member.colour }}
      >
        {member.photo_url ? (
          <img
           src={`${API_BASE_URL}${member.photo_url}`}
            alt={member.name}
          />
        ) : (
          member.initials ||
          member.name.charAt(0).toUpperCase()
        )}
      </span>

      {member.name}
    </button>
  ))}
</section>

      {eventsError && (
        <p className="status-message status-message-error">
          {eventsError}
        </p>
      )}

<section
  className={`calendar-panel ${
    calendarView === "day"
      ? "calendar-panel-day-view"
      : ""
  }`}
>
        <div className="calendar-toolbar">
          <div className="calendar-toolbar-left">
            <button
              type="button"
              className="calendar-nav-button"
              onClick={goToPreviousPeriod}
aria-label={`Previous ${calendarView}`}
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              className="calendar-today-button"
              onClick={goToToday}
            >
              Today
            </button>

            <button
              type="button"
              className="calendar-nav-button"
              onClick={goToNextPeriod}
aria-label={`Next ${calendarView}`}
            >
              <ChevronRight size={22} />
            </button>
          </div>

<div className="calendar-toolbar-status">
  {eventsLoading && (
    <span className="calendar-loading">
      Loading events...
    </span>
  )}

{calendarView !== "day" &&
  calendarView !== "schedule" && (
    <strong className="calendar-month-label">
      {calendarView === "week"
        ? weekLabel
        : monthLabel}
    </strong>
  )}

<div className="calendar-view-switch">



<button
  type="button"
  className={
    calendarView === "day"
      ? "calendar-view-button active"
      : "calendar-view-button"
  }
  onClick={() => {
    setCalendarView("day");
  }}
>
  Day
</button>

<button
  type="button"
  className={
    calendarView === "week"
      ? "calendar-view-button active"
      : "calendar-view-button"
  }
  onClick={() => {
    setCalendarView("week");
  }}
>
  Week
</button>

<button
  type="button"
  className={
    calendarView === "month"
      ? "calendar-view-button active"
      : "calendar-view-button"
  }
  onClick={() => {
    setCalendarView("month");
  }}
>
  Month
</button>

<button
  type="button"
  className={
    calendarView === "schedule"
      ? "calendar-view-button active"
      : "calendar-view-button"
  }
onClick={() => {
  setVisibleDate(new Date(today));
  setCalendarView("schedule");
}}
>
  Schedule
</button>

</div>
</div>
        </div>

        {calendarView === "day" && (() => {
  const date = visibleDate;
  const dateKey = formatDateKey(date);

const dayEvents = [
  ...(eventsByDate.get(dateKey) || []),
].sort((a, b) => {
  if (a.all_day && !b.all_day) {
    return -1;
  }

  if (!a.all_day && b.all_day) {
    return 1;
  }

  return String(
    a.start_time || ""
  ).localeCompare(
    String(b.start_time || "")
  );
});

  const allDayEvents =
    dayEvents.filter(
      (event) => event.all_day
    );

  const isToday =
    isSameDate(date, today);

  const dayWeather =
  getWeatherForDate(weather, date);  

  return (
    <div className="calendar-time-week calendar-time-day-view">
      <div className="calendar-time-header">
        <div className="calendar-time-corner" />

<button
  type="button"
  className={`calendar-time-day-header calendar-day-view-header ${
    isToday ? "today" : ""
  }`}
  onClick={() =>
    onAddEvent?.(date)
  }
>
  <div className="calendar-day-view-header-main">
    <span>
      {new Intl.DateTimeFormat(
        "en-AU",
        {
          weekday: "long",
        }
      ).format(date)}
    </span>

    <strong>
      {date.getDate()}
    </strong>

    <span className="calendar-day-view-month">
      {new Intl.DateTimeFormat(
        "en-AU",
        {
          month: "long",
          year: "numeric",
        }
      ).format(date)}
    </span>

{dayWeather && (
  <span className="calendar-day-weather">
<CalendarWeatherIcon
  code={dayWeather.weatherCode}
/>

    <span>
      {Math.round(
        dayWeather.temperatureMax
      )}°
      {" / "}
      {Math.round(
        dayWeather.temperatureMin
      )}°
    </span>

    {dayWeather.warnings?.length > 0 && (
      <span
        className="calendar-weather-warning"
        title={dayWeather.warnings
          .map(
            (warning) =>
              `${warning.title}: ${warning.message}`
          )
          .join("\n")}
      >
        ⚠
      </span>
    )}
  </span>
)}

  </div>

  {isToday && (
    <span className="calendar-day-view-today-badge">
      Today
    </span>
  )}
</button>
      </div>

<div
  className={`calendar-all-day-row ${
    allDayEvents.length === 0
      ? "calendar-all-day-row-empty"
      : ""
  }`}
>
        <div className="calendar-all-day-label">
          All day
        </div>

        <div className="calendar-all-day-days">
          <div
            className={`calendar-all-day-day ${
              isToday ? "today" : ""
            }`}
            onDoubleClick={() =>
              onAddEvent?.({
                date,
                allDay: true,
              })
            }
            title="Double-click to add an all-day event"
          >
            {allDayEvents.map((event) => {
              const primaryMember =
                event.members?.[0];

              return (
                <button
                  type="button"
                  key={
                    event.occurrence_key ||
                    event.id
                  }
                  className="calendar-all-day-event"
                  style={{
                    "--event-colour":
                      primaryMember?.colour ||
                      "#64748b",
                  }}
onClick={() =>
  setSelectedEvent(event)
}
onDoubleClick={(clickEvent) => {
  clickEvent.stopPropagation();
}}
>
                  {event.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="calendar-time-scroll"
        ref={weekScrollRef}
      >
        <div
          className="calendar-time-body"
          style={{
            height:
              weekHours.length *
              WEEK_HOUR_HEIGHT,
          }}
        >
          <div className="calendar-time-labels">
            {weekHours.map((hour) => (
              <div
                key={hour}
                className="calendar-time-label"
                style={{
                  height:
                    WEEK_HOUR_HEIGHT,
                }}
              >
                <span>
                  {formatHourLabel(hour)}
                </span>
              </div>
            ))}
          </div>

          <div className="calendar-time-days">
            {isToday &&
              currentTime.getHours() >=
                WEEK_START_HOUR &&
              currentTime.getHours() <=
                WEEK_END_HOUR && (
                <div
                  className="calendar-current-time-full"
                  style={{
                    top: `${getCurrentTimeTop(
                      currentTime
                    )}px`,
                  }}
                >
                  <span className="calendar-current-time-full-line" />

                  <span className="calendar-current-time-label">
                    {formatEventTime(
                      `${String(
                        currentTime.getHours()
                      ).padStart(
                        2,
                        "0"
                      )}:${String(
                        currentTime.getMinutes()
                      ).padStart(
                        2,
                        "0"
                      )}`
                    )}
                  </span>
                </div>
              )}

            <div
              className={`calendar-time-day ${
                isToday ? "today" : ""
              } ${
                dragPreview?.dateKey ===
                dateKey
                  ? "drag-target"
                  : ""
              }`}
              onDragOver={(dragEvent) => {
                if (!draggedEvent) {
                  return;
                }

                dragEvent.preventDefault();

                const bounds =
                  dragEvent.currentTarget.getBoundingClientRect();

                const pointerY =
                  dragEvent.clientY -
                  bounds.top;

                const rawMinutes =
                  (pointerY /
                    WEEK_HOUR_HEIGHT) *
                  60;

                const snappedMinutes =
                  Math.round(
                    rawMinutes / 15
                  ) * 15;

                const totalMinutes =
                  WEEK_START_HOUR * 60 +
                  snappedMinutes;

                const clampedMinutes =
                  Math.max(
                    WEEK_START_HOUR * 60,
                    Math.min(
                      WEEK_END_HOUR * 60 +
                        45,
                      totalMinutes
                    )
                  );

                const hours = Math.floor(
                  clampedMinutes / 60
                );

                const minutes =
                  clampedMinutes % 60;

                const time = `${String(
                  hours
                ).padStart(2, "0")}:${String(
                  minutes
                ).padStart(2, "0")}`;

                setDragPreview({
                  dateKey,
                  time,
                  top:
                    ((clampedMinutes -
                      WEEK_START_HOUR *
                        60) /
                      60) *
                    WEEK_HOUR_HEIGHT,
                });
              }}
              onDrop={(dragEvent) => {
                dragEvent.preventDefault();

                if (
                  !draggedEvent ||
                  !dragPreview
                ) {
                  return;
                }

                saveDraggedEvent(
                  draggedEvent,
                  dragPreview.dateKey,
                  dragPreview.time
                );

                setDraggedEvent(null);
                setDragPreview(null);
              }}
            >
              {draggedEvent &&
                dragPreview?.dateKey ===
                  dateKey && (
                  <div
                    className="calendar-drag-preview"
                    style={{
                      top: `${dragPreview.top}px`,
                      height: `${getEventHeight(
                        draggedEvent
                      )}px`,
                    }}
                  >
                    <strong>
                      {draggedEvent.title}
                    </strong>

                    <span>
                      {formatEventTime(
                        dragPreview.time
                      )}
                    </span>
                  </div>
                )}

              {weekHours.map((hour) => (
                <div
                  key={hour}
                  className="calendar-time-hour"
                  style={{
                    height:
                      WEEK_HOUR_HEIGHT,
                  }}
onDoubleClick={(clickEvent) => {
  const bounds =
    clickEvent.currentTarget.getBoundingClientRect();

  const pointerY =
    clickEvent.clientY - bounds.top;

  const minutePosition =
    (pointerY / bounds.height) * 60;

  const snappedMinutes =
    Math.min(
      45,
      Math.round(
        minutePosition / 15
      ) * 15
    );

  const eventDate =
    new Date(date);

  eventDate.setHours(
    hour,
    snappedMinutes,
    0,
    0
  );

  onAddEvent?.(
    eventDate
  );
}}
                />
              ))}

              {layoutOverlappingEvents(
                dayEvents
              ).map(
                ({
                  event,
                  columnIndex,
                  columnCount,
                }) => {
                  const primaryMember =
                    event.members?.[0];

                  const eventWidth =
                    100 / columnCount;

                  const eventLeft =
                    eventWidth *
                    columnIndex;

                  return (
                    <button
                      type="button"
                      key={
                        event.occurrence_key ||
                        event.id
                      }
className={`calendar-time-event ${
  draggedEvent?.id === event.id
    ? "dragging"
    : ""
}`}
                      draggable
                      style={{
                        top: `${getEventTop(
                          event.start_time
                        )}px`,

                        height: `${getEventHeight(
                          event
                        )}px`,

                        left: `calc(${eventLeft}% + 3px)`,

                        right: "auto",

                        width: `calc(${eventWidth}% - 6px)`,

                        "--event-colour":
                          primaryMember?.colour ||
                          "#64748b",

                        borderLeftColor:
                          primaryMember?.colour ||
                          "#64748b",
                      }}
                      onDragStart={(
                        dragEvent
                      ) => {
                        setDraggedEvent(
                          event
                        );

                        dragEvent.dataTransfer.effectAllowed =
                          "move";
                      }}
                      onDragEnd={() => {
                        setDraggedEvent(null);
                        setDragPreview(null);
                      }}
onClick={() =>
  setSelectedEvent(event)
}
onDoubleClick={(clickEvent) => {
  clickEvent.stopPropagation();
}}
>
                      <div className="calendar-time-event-heading">
                        <strong>
                          {event.title}
                        </strong>

{event.members?.length > 0 && (
  <div className="calendar-day-event-members">
    <div className="calendar-time-event-avatars">
      {event.members
        .slice(0, 3)
        .map((member) => (
          <span
            key={member.id}
            className="calendar-time-event-avatar"
            style={{
              backgroundColor:
                member.colour,
            }}
            title={member.name}
          >
            {member.photo_url ? (
              <img
                src={`${API_BASE_URL}${member.photo_url}`}
                alt={member.name}
              />
            ) : (
              member.initials ||
              member.name
                .charAt(0)
                .toUpperCase()
            )}
          </span>
        ))}
    </div>

    <span className="calendar-day-event-member-names">
      {event.members
        .map((member) => member.name)
        .join(", ")}
    </span>
  </div>
)}
                      </div>

<div className="calendar-day-event-details">
  <span className="calendar-day-event-time">
    {formatEventTimeRange(
      event.start_time,
      event.end_time
    )}
  </span>

  {event.location && (
    <span className="calendar-day-event-location">
      📍 {event.location}
    </span>
  )}
</div>

{event.description &&
  getEventDurationMinutes(event) >= 90 && (
    <p className="calendar-day-event-description">
      {event.description}
    </p>
  )}

                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})()}

{calendarView === "schedule" && (
  <CalendarScheduleView
    scheduleDays={scheduleDays}
    eventsByDate={eventsByDate}
    today={today}
    weather={weather}
    onAddEvent={onAddEvent}
    onSelectEvent={setSelectedEvent}
  />
)}

{calendarView === "week" && (
  <div className="calendar-time-week">
    <div className="calendar-time-header">
      <div className="calendar-time-corner" />

      {weekDays.map((date) => {
        const isToday = isSameDate(
          date,
          today
        );

        const dayWeather =
  getWeatherForDate(weather, date);

        return (
          <button
            type="button"
            key={formatDateKey(date)}
            className={`calendar-time-day-header ${
              isToday ? "today" : ""
            }`}
onClick={() => {
  setVisibleDate(new Date(date));
  setCalendarView("day");
}}
          >
            <span>
              {new Intl.DateTimeFormat(
                "en-AU",
                {
                  weekday: "short",
                }
              ).format(date)}
            </span>

            <strong>
              {date.getDate()}
            </strong>

{dayWeather && (
  <span className="calendar-day-weather">
<CalendarWeatherIcon
  code={dayWeather.weatherCode}
/>

    <span>
      {Math.round(
        dayWeather.temperatureMax
      )}°
      {" / "}
      {Math.round(
        dayWeather.temperatureMin
      )}°
    </span>

    {dayWeather.warnings?.length > 0 && (
      <span
        className="calendar-weather-warning"
        title={dayWeather.warnings
          .map(
            (warning) =>
              `${warning.title}: ${warning.message}`
          )
          .join("\n")}
      >
        ⚠
      </span>
    )}
  </span>
)}

          </button>
        );
      })}
    </div>

<div className="calendar-all-day-row">
  <div className="calendar-all-day-label">
    All day
  </div>

  <div className="calendar-all-day-days">
    {weekDays.map((date) => {
      const dateKey =
        formatDateKey(date);

      const allDayEvents =
        (
          eventsByDate.get(dateKey) ||
          []
        ).filter(
          (event) => event.all_day
        );

      const isToday =
        isSameDate(date, today);

      return (
<div
  key={dateKey}
  className={`calendar-all-day-day ${
    isToday ? "today" : ""
  }`}
  onDoubleClick={() =>
    onAddEvent?.({
      date,
      allDay: true,
    })
  }
  title="Double-click to add an all-day event"
>
          {allDayEvents.map((event) => {
            const primaryMember =
              event.members?.[0];

            return (
              <button
                type="button"
                key={
                  event.occurrence_key ||
                  event.id
                }
                className="calendar-all-day-event"
                style={{
                  "--event-colour":
                    primaryMember?.colour ||
                    "#64748b",
                }}
onClick={() =>
  setSelectedEvent(event)
}
              >
                {event.title}
              </button>
            );
          })}
        </div>
      );
    })}
  </div>
</div>

   <div
  className="calendar-time-scroll"
  ref={weekScrollRef}
>
      <div
        className="calendar-time-body"
        style={{
          height:
            weekHours.length *
            WEEK_HOUR_HEIGHT,
        }}
      >
        <div className="calendar-time-labels">
          {weekHours.map((hour) => (
            <div
              key={hour}
              className="calendar-time-label"
              style={{
                height:
                  WEEK_HOUR_HEIGHT,
              }}
            >
              <span>
                {formatHourLabel(hour)}
              </span>
            </div>
          ))}
        </div>

        <div className="calendar-time-days">
{weekDays.some((date) =>
  isSameDate(date, currentTime)
) &&
  currentTime.getHours() >= WEEK_START_HOUR &&
  currentTime.getHours() <= WEEK_END_HOUR && (
    <div
      className="calendar-current-time-full"
      style={{
        top: `${getCurrentTimeTop(
          currentTime
        )}px`,
      }}
    >
      <span className="calendar-current-time-full-line" />

      <span className="calendar-current-time-label">
        {formatEventTime(
          `${String(
            currentTime.getHours()
          ).padStart(2, "0")}:${String(
            currentTime.getMinutes()
          ).padStart(2, "0")}`
        )}
      </span>
    </div>
  )}
          {weekDays.map((date) => {
            const dateKey =
              formatDateKey(date);

            const dayEvents =
              eventsByDate.get(dateKey) ||
              [];

            const isToday =
              isSameDate(date, today);

            return (
<div
  key={dateKey}
  className={`calendar-time-day ${
    isToday ? "today" : ""
  } ${
    dragPreview?.dateKey === dateKey
      ? "drag-target"
      : ""
  }`}
  onDragOver={(dragEvent) => {
    if (!draggedEvent) {
      return;
    }

    dragEvent.preventDefault();

    const bounds =
      dragEvent.currentTarget.getBoundingClientRect();

    const pointerY =
      dragEvent.clientY - bounds.top;

    const rawMinutes =
      (pointerY / WEEK_HOUR_HEIGHT) * 60;

    const snappedMinutes =
      Math.round(rawMinutes / 15) * 15;

    const totalMinutes =
      WEEK_START_HOUR * 60 +
      snappedMinutes;

    const clampedMinutes = Math.max(
      WEEK_START_HOUR * 60,
      Math.min(
        WEEK_END_HOUR * 60 + 45,
        totalMinutes
      )
    );

    const hours = Math.floor(
      clampedMinutes / 60
    );

    const minutes =
      clampedMinutes % 60;

    const time = `${String(
      hours
    ).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;

    setDragPreview({
      dateKey,
      time,
      top:
        ((clampedMinutes -
          WEEK_START_HOUR * 60) /
          60) *
        WEEK_HOUR_HEIGHT,
    });
  }}
onDrop={(dragEvent) => {
  dragEvent.preventDefault();

  if (!draggedEvent || !dragPreview) {
    return;
  }

  saveDraggedEvent(
    draggedEvent,
    dragPreview.dateKey,
    dragPreview.time
  );

  setDraggedEvent(null);
  setDragPreview(null);
}}
>
{draggedEvent &&
  dragPreview?.dateKey === dateKey && (
<div
  className="calendar-drag-preview"
  style={{
    top: `${dragPreview.top}px`,
    height: `${getEventHeight(
      draggedEvent
    )}px`,
  }}
>
      <strong>
        {draggedEvent.title}
      </strong>

      <small className="calendar-drag-preview-date">
  {new Date(
    `${dragPreview.dateKey}T12:00:00`
  ).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })}
</small>

<span>
  {formatEventTime(
    dragPreview.time
  )}
  {" – "}
  {formatEventTime(
    (() => {
      const [
        startHour,
        startMinute,
      ] = dragPreview.time
        .split(":")
        .map(Number);

      const duration =
        getEventDurationMinutes(
          draggedEvent
        );

      const endMinutes =
        startHour * 60 +
        startMinute +
        duration;

      const endHour =
        Math.floor(
          endMinutes / 60
        ) % 24;

      const endMinute =
        endMinutes % 60;

      return `${String(
        endHour
      ).padStart(2, "0")}:${String(
        endMinute
      ).padStart(2, "0")}`;
    })()
  )}
</span>
    </div>
  )}



                {weekHours.map((hour) => (
                  <div
                    key={hour}
                    className="calendar-time-hour"
                    style={{
                      height:
                        WEEK_HOUR_HEIGHT,
                    }}
onDoubleClick={(clickEvent) => {
  const bounds =
    clickEvent.currentTarget.getBoundingClientRect();

  const pointerY =
    clickEvent.clientY - bounds.top;

  const minutePosition =
    (pointerY / bounds.height) * 60;

  const snappedMinutes =
    Math.min(
      45,
      Math.round(minutePosition / 15) * 15
    );

  const eventDate =
    new Date(date);

  eventDate.setHours(
    hour,
    snappedMinutes,
    0,
    0
  );

  onAddEvent?.(
    eventDate
  );
}}
                  />
                ))}

{layoutOverlappingEvents(dayEvents)
  .map(
    ({
      event,
      columnIndex,
      columnCount,
    }) => {
      const primaryMember =
        event.members?.[0];

      const eventWidth =
        100 / columnCount;

      const eventLeft =
        eventWidth * columnIndex;

                    return (
<button
  type="button"
  key={
    event.occurrence_key ||
    event.id
  }
  className={`calendar-time-event ${
    draggedEvent?.id === event.id
      ? "dragging"
      : ""
  }`}
  draggable
style={{
  top: `${getEventTop(
    event.start_time
  )}px`,

  height: `${getEventHeight(
    event
  )}px`,

left: `calc(${eventLeft}% + 3px)`,

right: "auto",

width: `calc(${eventWidth}% - 6px)`,

"--event-colour":
  primaryMember?.colour ||
  "#64748b",

borderLeftColor:
  primaryMember?.colour ||
  "#64748b",
}}
  onDragStart={(dragEvent) => {
    setDraggedEvent(event);

    dragEvent.dataTransfer.effectAllowed =
      "move";
  }}
  onDragEnd={() => {
    setDraggedEvent(null);
    setDragPreview(null);
  }}
onClick={() =>
  setSelectedEvent(event)
}
>
<div className="calendar-time-event-heading">
  <strong>
    {event.title}
  </strong>

  {event.members?.length > 0 && (
    <div className="calendar-time-event-avatars">
      {event.members.slice(0, 3).map(
        (member) => (
          <span
            key={member.id}
            className="calendar-time-event-avatar"
            style={{
              backgroundColor:
                member.colour,
            }}
            title={member.name}
          >
            {member.photo_url ? (
              <img
                src={`${API_BASE_URL}${member.photo_url}`}
                alt={member.name}
              />
            ) : (
              member.initials ||
              member.name
                .charAt(0)
                .toUpperCase()
            )}
          </span>
        )
      )}
    </div>
  )}
</div>

<span>
  {formatEventTimeRange(
    event.start_time,
    event.end_time
  )}
</span>
                      </button>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
)}

{calendarView === "month" && (
  <>
    <div className="calendar-month-scroll">
      <div className="calendar-weekdays">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>

      <div className="calendar-grid">
          {days.map(({ date, isCurrentMonth }) => {
            const isToday = isSameDate(date, today);
            const dateKey = formatDateKey(date);

            const dayWeather =
            getWeatherForDate(weather, date);

           const dayEvents = [
  ...(eventsByDate.get(dateKey) || []),
].sort((a, b) => {
  if (a.all_day && !b.all_day) {
    return -1;
  }

  if (!a.all_day && b.all_day) {
    return 1;
  }

  return String(
    a.start_time || ""
  ).localeCompare(
    String(b.start_time || "")
  );
});

            return (
              <button
                type="button"
                key={dateKey}
                onClick={() => onAddEvent?.(date)}
className={[
  "calendar-day",
  !isCurrentMonth ? "outside-month" : "",
  isToday ? "today" : "",
  date.getDay() === 0 || date.getDay() === 6
    ? "weekend"
    : "",
]
  .filter(Boolean)
  .join(" ")}
              >
                <span className="calendar-day-number">
                  {date.getDate()}
                </span>

{dayWeather && (
  <span className="calendar-month-weather">
<CalendarWeatherIcon
  code={dayWeather.weatherCode}
/>

    <span>
      {Math.round(
        dayWeather.temperatureMax
      )}°
    </span>

    {dayWeather.warnings?.length > 0 && (
      <span
        className="calendar-weather-warning"
        title={dayWeather.warnings
          .map(
            (warning) =>
              `${warning.title}: ${warning.message}`
          )
          .join("\n")}
      >
        ⚠
      </span>
    )}
  </span>
)}

                <div className="calendar-day-events">
               {dayEvents.length === 0 && (
  <span className="calendar-month-add-event">
    + Add event
  </span>
)}
                  {dayEvents.map((event) => {
                    const primaryMember = event.members?.[0];

                    return (
                      <div
  key={event.occurrence_key || event.id}
  className="calendar-event"
  role="button"
  tabIndex={0}
onClick={(clickEvent) => {
  clickEvent.stopPropagation();
  setSelectedEvent(event);
}}
onKeyDown={(keyEvent) => {
  if (
    keyEvent.key === "Enter" ||
    keyEvent.key === " "
  ) {
    keyEvent.preventDefault();
    keyEvent.stopPropagation();
    setSelectedEvent(event);
  }
}}
style={{
  "--event-colour":
    primaryMember?.colour || "#64748B",

  borderLeftColor:
    primaryMember?.colour || "#64748B",
}}
                      >
                        <div className="calendar-event-title">
                          {event.title}
                        </div>

                        <div className="calendar-event-meta">
                          {event.all_day
                            ? "All day"
                            : formatEventTime(event.start_time)}
                        </div>

                        {event.members?.length > 0 && (
                          <div className="calendar-event-members">
                            {event.members.map((member) => (
                              <span
                                key={member.id}
                                className="calendar-event-member-dot"
                                style={{
                                  backgroundColor: member.colour,
                                }}
                                title={member.name}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
              </div>
        </div>
      </>
    )}
      </section>
    {selectedEvent && (
      <EventDetailsModal
        event={selectedEvent}
        onClose={() =>
          setSelectedEvent(null)
        }
        onEdit={(event) => {
          setSelectedEvent(null);
          onEditEvent?.(event);
        }}
      />
    )}

    </div>
  );
}

export default CalendarPage;
