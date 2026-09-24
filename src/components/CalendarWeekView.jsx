import CalendarWeatherIcon from "./CalendarWeatherIcon";
import { API_BASE_URL } from "../config/api";
import {
  formatDateKey,
  formatEventTimeRange,
  getWeatherForDate,
  isSameDate,
} from "../utils/calendarUtils";

function eventSortValue(event) {
  return event.all_day ? "00:00" : event.start_time || "23:59";
}

function CalendarWeekView({
  weekDays,
  eventsByDate,
  today,
  weather,
  draggedEvent,
  dragPreview,
  setDraggedEvent,
  setDragPreview,
  saveDraggedEvent,
  onAddEvent,
  onSelectEvent,
  onOpenDay,
}) {
  return (
    <div className="skylight-week" aria-label="Family week calendar">
      {weekDays.map((date) => {
        const dateKey = formatDateKey(date);
        const isToday = isSameDate(date, today);
        const dayWeather = getWeatherForDate(weather, date);
        const dayEvents = [...(eventsByDate.get(dateKey) || [])].sort(
          (first, second) =>
            eventSortValue(first).localeCompare(eventSortValue(second))
        );

        return (
          <section
            key={dateKey}
            className={`skylight-week-day ${isToday ? "today" : ""} ${
              dragPreview?.dateKey === dateKey ? "drag-target" : ""
            }`}
            onDragOver={(dragEvent) => {
              if (!draggedEvent) return;
              dragEvent.preventDefault();
              setDragPreview({
                dateKey,
                time: draggedEvent.start_time || "09:00",
                top: 0,
              });
            }}
            onDrop={(dragEvent) => {
              dragEvent.preventDefault();
              if (!draggedEvent) return;
              saveDraggedEvent(
                draggedEvent,
                dateKey,
                draggedEvent.start_time || "09:00"
              );
              setDraggedEvent(null);
              setDragPreview(null);
            }}
          >
            <button
              type="button"
              className="skylight-week-day-heading"
              onClick={() => onOpenDay?.(date)}
            >
              <span className="skylight-week-weekday">
                {new Intl.DateTimeFormat("en-AU", {
                  weekday: "short",
                }).format(date)}
              </span>
              <strong>{date.getDate()}</strong>
              <span className="skylight-week-month">
                {new Intl.DateTimeFormat("en-AU", {
                  month: "long",
                }).format(date)}
              </span>
              {dayWeather && (
                <span className="skylight-week-weather">
                  <CalendarWeatherIcon code={dayWeather.weatherCode} />
                  {Math.round(dayWeather.temperatureMax)}°
                </span>
              )}
            </button>

            <div
              className="skylight-week-events"
              onDoubleClick={() => onAddEvent?.(date)}
              title="Double-click to add an event"
            >
              {dayEvents.length === 0 ? (
                <button
                  type="button"
                  className="skylight-week-empty"
                  onClick={() => onAddEvent?.(date)}
                >
                  <span>Nothing planned</span>
                  <strong>+ Add event</strong>
                </button>
              ) : (
                dayEvents.map((event) => {
                  const primaryMember = event.members?.[0];
                  const eventColour = primaryMember?.colour || "#64748b";

                  return (
                    <button
                      type="button"
                      draggable
                      key={event.occurrence_key || event.id}
                      className={`skylight-week-event ${
                        draggedEvent?.id === event.id ? "dragging" : ""
                      }`}
                      style={{ "--event-colour": eventColour }}
                      onDragStart={(dragEvent) => {
                        setDraggedEvent(event);
                        dragEvent.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDraggedEvent(null);
                        setDragPreview(null);
                      }}
                      onClick={() => onSelectEvent?.(event)}
                    >
                      <span className="skylight-week-event-time">
                        {event.all_day
                          ? "All day"
                          : formatEventTimeRange(
                              event.start_time,
                              event.end_time
                            )}
                      </span>
                      <span className="skylight-week-event-heading">
                        <strong>{event.title}</strong>
                        {event.members?.length > 0 && (
                          <span className="skylight-week-event-avatars">
                            {event.members.slice(0, 3).map((member) => (
                              <span
                                key={member.id}
                                className="skylight-week-event-avatar"
                                style={{ backgroundColor: member.colour }}
                                title={member.name}
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
                            ))}
                          </span>
                        )}
                      </span>
                      {(event.location || event.address) && (
                        <span className="skylight-week-event-place">
                          {event.location || event.address}
                        </span>
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

export default CalendarWeekView;
