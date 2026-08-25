import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);

  // Convert JS Sunday=0 to Monday=0
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

function CalendarPage({
  members,
  selectedMemberId,
  setSelectedMemberId,
}) {
  const today = useMemo(() => new Date(), []);

  const [visibleDate, setVisibleDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();

  const days = useMemo(() => {
    return getMonthGrid(year, month);
  }, [year, month]);

  const monthLabel = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(visibleDate);

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

        <button type="button" className="add-event-button">
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

          <strong className="calendar-month-label">
            {monthLabel}
          </strong>
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

            return (
              <button
                type="button"
                key={date.toISOString()}
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
                  <span className="calendar-empty-day">
                    No events
                  </span>
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