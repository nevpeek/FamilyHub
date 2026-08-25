import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);

  const mondayIndex = (firstDay.getDay() + 6) % 7;

  const gridStart = new Date(year, month, 1 - mondayIndex);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatEventTime(time) {
  if (!time) {
    return "";
  }

  const [hourText, minuteText] = time.split(":");

  const date = new Date();
  date.setHours(Number(hourText), Number(minuteText), 0, 0);

  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

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
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

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

  useEffect(() => {
    async function loadEvents() {
      setEventsLoading(true);
      setEventsError("");

      try {
        const params = new URLSearchParams({
          start: gridStartDate,
          end: gridEndDate,
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
    gridStartDate,
    gridEndDate,
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

  function goToPreviousMonth() {
    setVisibleDate(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setVisibleDate(new Date(year, month + 1, 1));
  }

  function goToToday() {
    setVisibleDate(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
  }

  return (
    <div className="calendar-page">
      <section className="calendar-page-heading">
        <div>
          <p className="section-kicker">Calendar</p>
          <h2>{monthLabel}</h2>
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

      <section className="calendar-family-filters">
        <button
          type="button"
          className={`calendar-person-filter ${
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
            className={`calendar-person-filter ${
              selectedMemberId === member.id ? "selected" : ""
            }`}
            onClick={() => setSelectedMemberId(member.id)}
          >
            <span
              className="calendar-person-dot"
              style={{ backgroundColor: member.colour }}
            />
            {member.name}
          </button>
        ))}
      </section>

      {eventsError && (
        <p className="status-message status-message-error">
          {eventsError}
        </p>
      )}

      <section className="calendar-panel">
        <div className="calendar-toolbar">
          <div className="calendar-toolbar-left">
            <button
              type="button"
              className="calendar-nav-button"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
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
              onClick={goToNextMonth}
              aria-label="Next month"
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

            <strong className="calendar-month-label">
              {monthLabel}
            </strong>
          </div>
        </div>

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
            const dayEvents = eventsByDate.get(dateKey) || [];

            return (
              <button
                type="button"
                key={dateKey}
                onClick={() => onAddEvent?.(date)}
                className={[
                  "calendar-day",
                  !isCurrentMonth ? "outside-month" : "",
                  isToday ? "today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="calendar-day-number">
                  {date.getDate()}
                </span>

                <div className="calendar-day-events">
                  {dayEvents.length === 0 && !eventsLoading && (
                    <span className="calendar-empty-day">
                      No events
                    </span>
                  )}

                  {dayEvents.map((event) => {
                    const primaryMember = event.members?.[0];

                    return (
                      <div
  key={event.id}
  className="calendar-event"
  role="button"
  tabIndex={0}
  onClick={(clickEvent) => {
    clickEvent.stopPropagation();
    onEditEvent?.(event);
  }}
  onKeyDown={(keyEvent) => {
    if (keyEvent.key === "Enter" || keyEvent.key === " ") {
      keyEvent.preventDefault();
      keyEvent.stopPropagation();
      onEditEvent?.(event);
    }
  }}
                        style={{
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
      </section>
    </div>
  );
}

export default CalendarPage;