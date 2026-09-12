import CalendarWeatherIcon from "./CalendarWeatherIcon";
import {
  formatDateKey,
  formatEventTime,
  getWeatherForDate,
  isSameDate,
} from "../utils/calendarUtils";

function CalendarMonthView({
  days,
  eventsByDate,
  today,
  weather,
  onAddEvent,
  onSelectEvent,
}) {
  return (
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
            const isToday =
              isSameDate(date, today);

            const dateKey =
              formatDateKey(date);

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
                onClick={() =>
                  onAddEvent?.(date)
                }
                className={[
                  "calendar-day",
                  !isCurrentMonth
                    ? "outside-month"
                    : "",
                  isToday ? "today" : "",
                  date.getDay() === 0 ||
                  date.getDay() === 6
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
                      code={
                        dayWeather.weatherCode
                      }
                    />

                    <span>
                      {Math.round(
                        dayWeather.temperatureMax
                      )}
                      °
                    </span>

                    {dayWeather.warnings?.length >
                      0 && (
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
                    const primaryMember =
                      event.members?.[0];

                    return (
                      <div
                        key={
                          event.occurrence_key ||
                          event.id
                        }
                        className="calendar-event"
                        role="button"
                        tabIndex={0}
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          onSelectEvent?.(event);
                        }}
                        onKeyDown={(keyEvent) => {
                          if (
                            keyEvent.key === "Enter" ||
                            keyEvent.key === " "
                          ) {
                            keyEvent.preventDefault();
                            keyEvent.stopPropagation();

                            onSelectEvent?.(event);
                          }
                        }}
                        style={{
                          "--event-colour":
                            primaryMember?.colour ||
                            "#64748B",

                          borderLeftColor:
                            primaryMember?.colour ||
                            "#64748B",
                        }}
                      >
                        <div className="calendar-event-title">
                          {event.title}
                        </div>

                        <div className="calendar-event-meta">
                          {event.all_day
                            ? "All day"
                            : formatEventTime(
                                event.start_time
                              )}
                        </div>

                        {event.members?.length >
                          0 && (
                          <div className="calendar-event-members">
                            {event.members.map(
                              (member) => (
                                <span
                                  key={member.id}
                                  className="calendar-event-member-dot"
                                  style={{
                                    backgroundColor:
                                      member.colour,
                                  }}
                                  title={
                                    member.name
                                  }
                                />
                              )
                            )}
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
  );
}

export default CalendarMonthView;