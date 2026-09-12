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

function CalendarWeekView({
  weekDays,
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
  onOpenDay,
}) {
  return (
    <div className="calendar-time-week">
      <div className="calendar-time-header">
        <div className="calendar-time-corner" />

        {weekDays.map((date) => {
          const isToday =
            isSameDate(date, today);

          const dayWeather =
            getWeatherForDate(
              weather,
              date
            );

          return (
            <button
              type="button"
              key={formatDateKey(date)}
              className={`calendar-time-day-header ${
                isToday ? "today" : ""
              }`}
              onClick={() =>
                onOpenDay?.(date)
              }
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

                  {dayWeather.warnings
                    ?.length > 0 && (
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
                eventsByDate.get(
                  dateKey
                ) || []
              ).filter(
                (event) =>
                  event.all_day
              );

            const isToday =
              isSameDate(
                date,
                today
              );

            return (
              <div
                key={dateKey}
                className={`calendar-all-day-day ${
                  isToday
                    ? "today"
                    : ""
                }`}
                onDoubleClick={() =>
                  onAddEvent?.({
                    date,
                    allDay: true,
                  })
                }
                title="Double-click to add an all-day event"
              >
                {allDayEvents.map(
                  (event) => {
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
                          onSelectEvent?.(
                            event
                          )
                        }
                      >
                        {event.title}
                      </button>
                    );
                  }
                )}
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
              isSameDate(
                date,
                currentTime
              )
            ) &&
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

            {weekDays.map((date) => {
              const dateKey =
                formatDateKey(date);

              const dayEvents =
                eventsByDate.get(
                  dateKey
                ) || [];

              const isToday =
                isSameDate(
                  date,
                  today
                );

              return (
                <div
                  key={dateKey}
                  className={`calendar-time-day ${
                    isToday
                      ? "today"
                      : ""
                  } ${
                    dragPreview?.dateKey ===
                    dateKey
                      ? "drag-target"
                      : ""
                  }`}
                  onDragOver={(
                    dragEvent
                  ) => {
                    if (
                      !draggedEvent
                    ) {
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
                        rawMinutes /
                          15
                      ) * 15;

                    const totalMinutes =
                      WEEK_START_HOUR *
                        60 +
                      snappedMinutes;

                    const clampedMinutes =
                      Math.max(
                        WEEK_START_HOUR *
                          60,
                        Math.min(
                          WEEK_END_HOUR *
                            60 +
                            45,
                          totalMinutes
                        )
                      );

                    const hours =
                      Math.floor(
                        clampedMinutes /
                          60
                      );

                    const minutes =
                      clampedMinutes %
                      60;

                    const time =
                      `${String(
                        hours
                      ).padStart(
                        2,
                        "0"
                      )}:${String(
                        minutes
                      ).padStart(
                        2,
                        "0"
                      )}`;

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
                  onDrop={(
                    dragEvent
                  ) => {
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

                    setDraggedEvent(
                      null
                    );

                    setDragPreview(
                      null
                    );
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
                          {
                            draggedEvent.title
                          }
                        </strong>

                        <small className="calendar-drag-preview-date">
                          {new Date(
                            `${dragPreview.dateKey}T12:00:00`
                          ).toLocaleDateString(
                            "en-AU",
                            {
                              weekday:
                                "short",
                              day: "numeric",
                              month:
                                "short",
                            }
                          )}
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
                              ] =
                                dragPreview.time
                                  .split(
                                    ":"
                                  )
                                  .map(
                                    Number
                                  );

                              const duration =
                                getEventDurationMinutes(
                                  draggedEvent
                                );

                              const endMinutes =
                                startHour *
                                  60 +
                                startMinute +
                                duration;

                              const endHour =
                                Math.floor(
                                  endMinutes /
                                    60
                                ) % 24;

                              const endMinute =
                                endMinutes %
                                60;

                              return `${String(
                                endHour
                              ).padStart(
                                2,
                                "0"
                              )}:${String(
                                endMinute
                              ).padStart(
                                2,
                                "0"
                              )}`;
                            })()
                          )}
                        </span>
                      </div>
                    )}

                  {weekHours.map(
                    (hour) => (
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
                            new Date(
                              date
                            );

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
                    )
                  )}

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
                        100 /
                        columnCount;

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

                            right:
                              "auto",

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
                            setDraggedEvent(
                              null
                            );

                            setDragPreview(
                              null
                            );
                          }}
                          onClick={() =>
                            onSelectEvent?.(
                              event
                            )
                          }
                        >
                          <div className="calendar-time-event-heading">
                            <strong>
                              {
                                event.title
                              }
                            </strong>

                            {event.members
                              ?.length >
                              0 && (
                              <div className="calendar-time-event-avatars">
                                {event.members
                                  .slice(
                                    0,
                                    3
                                  )
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
                    }
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarWeekView;