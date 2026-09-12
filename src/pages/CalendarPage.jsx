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
import CalendarScheduleView from "../components/CalendarScheduleView";
import CalendarMonthView from "../components/CalendarMonthView";
import CalendarDayView from "../components/CalendarDayView";
import CalendarWeekView from "../components/CalendarWeekView";
import { API_BASE_URL } from "../config/api";
import {
  WEEK_START_HOUR,
  WEEK_HOUR_HEIGHT,
  getEventDurationMinutes,
  getMonthGrid,
  formatDateKey,
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

 {calendarView === "day" && (
  <CalendarDayView
    visibleDate={visibleDate}
    eventsByDate={eventsByDate}
    today={today}
    weather={weather}
    currentTime={currentTime}
    weekScrollRef={weekScrollRef}
    draggedEvent={draggedEvent}
    dragPreview={dragPreview}
    setDraggedEvent={setDraggedEvent}
    setDragPreview={setDragPreview}
    saveDraggedEvent={saveDraggedEvent}
    onAddEvent={onAddEvent}
    onSelectEvent={setSelectedEvent}
  />
)}

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
  <CalendarWeekView
    weekDays={weekDays}
    eventsByDate={eventsByDate}
    today={today}
    weather={weather}
    currentTime={currentTime}
    weekScrollRef={weekScrollRef}
    draggedEvent={draggedEvent}
    dragPreview={dragPreview}
    setDraggedEvent={setDraggedEvent}
    setDragPreview={setDragPreview}
    saveDraggedEvent={saveDraggedEvent}
    onAddEvent={onAddEvent}
    onSelectEvent={setSelectedEvent}
    onOpenDay={(date) => {
      setVisibleDate(new Date(date));
      setCalendarView("day");
    }}
  />
)}

{calendarView === "month" && (
  <CalendarMonthView
    days={days}
    eventsByDate={eventsByDate}
    today={today}
    weather={weather}
    onAddEvent={onAddEvent}
    onSelectEvent={setSelectedEvent}
  />
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
