import CalendarWeatherIcon from "./CalendarWeatherIcon";
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
  isSameDate,
  formatDateKey,
  getWeatherForDate,
  formatEventTime,
  formatEventTimeRange,
} from "../utils/calendarUtils";

function CalendarDayView({
  visibleDate,
  eventsByDate,
  today,
  weather,
  currentTime,
  weekScrollRef,
  draggedEvent,
  dragPreview,
  setDraggedEvent,
  setDragPreview,
  saveDraggedEvent,
  onAddEvent,
  onSelectEvent,
}) {
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
                  code={
                    dayWeather.weatherCode
                  }
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
                    onSelectEvent?.(event)
                  }
                  onDoubleClick={(
                    clickEvent
                  ) => {
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
                  onDoubleClick={(
                    clickEvent
                  ) => {
                    const bounds =
                      clickEvent.currentTarget.getBoundingClientRect();

                    const pointerY =
                      clickEvent.clientY -
                      bounds.top;

                    const minutePosition =
                      (pointerY /
                        bounds.height) *
                      60;

                    const snappedMinutes =
                      Math.min(
                        45,
                        Math.round(
                          minutePosition /
                            15
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
                        draggedEvent?.id ===
                        event.id
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
                        onSelectEvent?.(
                          event
                        )
                      }
                      onDoubleClick={(
                        clickEvent
                      ) => {
                        clickEvent.stopPropagation();
                      }}
                    >
                      <div className="calendar-time-event-heading">
                        <strong>
                          {event.title}
                        </strong>

                        {event.members
                          ?.length > 0 && (
                          <div className="calendar-day-event-members">
                            <div className="calendar-time-event-avatars">
                              {event.members
                                .slice(0, 3)
                                .map(
                                  (
                                    member
                                  ) => (
                                    <span
                                      key={
                                        member.id
                                      }
                                      className="calendar-time-event-avatar"
                                      style={{
                                        backgroundColor:
                                          member.colour,
                                      }}
                                      title={
                                        member.name
                                      }
                                    >
                                      {member.photo_url ? (
                                        <img
                                          src={`${API_BASE_URL}${member.photo_url}`}
                                          alt={
                                            member.name
                                          }
                                        />
                                      ) : (
                                        member.initials ||
                                        member.name
                                          .charAt(
                                            0
                                          )
                                          .toUpperCase()
                                      )}
                                    </span>
                                  )
                                )}
                            </div>

                            <span className="calendar-day-event-member-names">
                              {event.members
                                .map(
                                  (
                                    member
                                  ) =>
                                    member.name
                                )
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
                            📍{" "}
                            {event.location}
                          </span>
                        )}
                      </div>

                      {event.description &&
                        getEventDurationMinutes(
                          event
                        ) >= 90 && (
                          <p className="calendar-day-event-description">
                            {
                              event.description
                            }
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
}

export default CalendarDayView;