import CalendarWeatherIcon from "./CalendarWeatherIcon";
import { API_BASE_URL } from "../config/api";
import {
  formatDateKey,
  formatEventTimeRange,
  getWeatherForDate,
  isSameDate,
} from "../utils/calendarUtils";

function CalendarScheduleView({
  scheduleDays,
  eventsByDate,
  today,
  weather,
  onAddEvent,
  onSelectEvent,
}) {
  return (
    <div className="calendar-schedule">
      {scheduleDays.map((date) => {
        const dateKey = formatDateKey(date);

        const dayEvents =
          eventsByDate.get(dateKey) || [];

        const isToday =
          isSameDate(date, today);

        const dayWeather =
          getWeatherForDate(weather, date);

        return (
          <section
            key={dateKey}
            className={[
              "calendar-schedule-day",
              isToday ? "today" : "",
              date.getDay() === 0 ||
              date.getDay() === 6
                ? "weekend"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <button
              type="button"
              className="calendar-schedule-date"
              onClick={() =>
                onAddEvent?.({
                  date,
                  allDay: false,
                })
              }
            >
              <span className="calendar-schedule-weekday">
                {new Intl.DateTimeFormat(
                  "en-AU",
                  {
                    weekday: "short",
                  }
                ).format(date)}
              </span>

              <strong className="calendar-schedule-day-number">
                {date.getDate()}
              </strong>

              <span className="calendar-schedule-month">
                {new Intl.DateTimeFormat(
                  "en-AU",
                  {
                    month: "short",
                  }
                ).format(date)}
              </span>

              {dayWeather && (
                <span className="calendar-schedule-weather">
                  <CalendarWeatherIcon
                    code={dayWeather.weatherCode}
                  />

                  <span>
                    {Math.round(
                      dayWeather.temperatureMax
                    )}
                    °
                    {" / "}
                    {Math.round(
                      dayWeather.temperatureMin
                    )}
                    °
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

              {dayEvents.length > 0 && (
                <span className="calendar-schedule-count">
                  {dayEvents.length}{" "}
                  {dayEvents.length === 1
                    ? "event"
                    : "events"}
                </span>
              )}

              {isToday && (
                <span className="calendar-schedule-today">
                  Today
                </span>
              )}
            </button>

            <div className="calendar-schedule-events">
              {dayEvents.length === 0 ? (
                <button
                  type="button"
                  className="calendar-schedule-empty"
                  onClick={() =>
                    onAddEvent?.({
                      date,
                      allDay: false,
                    })
                  }
                >
                  + Add event
                </button>
              ) : (
                dayEvents.map((event) => {
                  const primaryMember =
                    event.members?.[0];

                  return (
                    <button
                      type="button"
                      key={
                        event.occurrence_key ||
                        event.id
                      }
                      className="calendar-schedule-event"
                      style={{
                        "--event-colour":
                          primaryMember?.colour ||
                          "#64748b",

                        borderLeftColor:
                          primaryMember?.colour ||
                          "#64748b",
                      }}
                      onClick={() =>
                        onSelectEvent?.(event)
                      }
                    >
                      <div className="calendar-schedule-event-main">
                        <strong>
                          {event.title}
                        </strong>

                        <span>
                          {event.all_day
                            ? "All day"
                            : formatEventTimeRange(
                                event.start_time,
                                event.end_time
                              )}
                        </span>
                      </div>

                      {event.location && (
                        <span className="calendar-schedule-event-location">
                          📍 {event.location}
                        </span>
                      )}

                      {event.members?.length > 0 && (
                        <div className="calendar-schedule-event-members">
                          {event.members.map(
                            (member) => (
                              <span
                                key={member.id}
                                className="calendar-schedule-event-member"
                              >
                                <span
                                  className="calendar-schedule-event-member-avatar"
                                  style={{
                                    backgroundColor:
                                      member.colour,
                                  }}
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

                                {member.name}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default CalendarScheduleView;