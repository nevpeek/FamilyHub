import {
  CalendarDays,
  ChevronRight,
} from "lucide-react";

import { API_BASE_URL } from "../config/api";
import {
  formatEventTime,
} from "../utils/calendarUtils";

function HomeTodayPanel({
  currentTime,
  todayEvents,
  homeEventsLoading,
  homeEventsError,
  onNavigate,
}) {
  return (
    <article className="panel today-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">
            Today
          </p>

          <h3>Today&apos;s schedule</h3>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() =>
            onNavigate("calendar")
          }
        >
          View calendar
          <ChevronRight size={18} />
        </button>
      </div>

      {homeEventsLoading ? (
        <div className="empty-state">
          <div>
            <h4>Loading events...</h4>
          </div>
        </div>
      ) : homeEventsError ? (
        <div className="empty-state">
          <div>
            <h4>{homeEventsError}</h4>
          </div>
        </div>
      ) : todayEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <CalendarDays size={28} />
          </div>

          <div>
            <h4>No events today</h4>

            <p>
              Nothing scheduled for the
              selected family members.
            </p>
          </div>
        </div>
      ) : (
        <div className="home-event-list">
          {todayEvents.map((event) => {
            const primaryMember =
              event.members?.[0];

            let isPastEvent = false;

            if (
              !event.all_day &&
              event.start_time
            ) {
              const [hours, minutes] =
                event.start_time
                  .split(":")
                  .map(Number);

              const eventTime =
                new Date(currentTime);

              eventTime.setHours(
                hours,
                minutes,
                0,
                0
              );

              isPastEvent =
                eventTime < currentTime;
            }

            return (
              <div
                key={
                  event.occurrence_key ||
                  event.id
                }
                className={`home-event-card ${
                  isPastEvent
                    ? "is-past"
                    : ""
                }`}
                style={{
                  "--accent":
                    primaryMember?.colour ||
                    event.colour_override ||
                    event.colourOverride ||
                    "#64748b",
                }}
              >
                <div className="home-event-time">
                  {event.all_day
                    ? "All day"
                    : formatEventTime(
                        event.start_time
                      )}
                </div>

                <div className="home-event-main">
                  <strong>
                    {event.title}
                  </strong>
                </div>

                <div className="home-event-members">
                  {(event.members || []).map(
                    (member) => (
                      <span
                        key={member.id}
                        className="home-event-member"
                        title={member.name}
                      >
                        <span
                          className="home-event-avatar"
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

                        <span className="home-event-member-name">
                          {member.name}
                        </span>
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}

        </div>
      )}
    </article>
  );
}

export default HomeTodayPanel;
