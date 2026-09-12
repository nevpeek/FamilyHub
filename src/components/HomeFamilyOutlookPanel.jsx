import {
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Soup,
} from "lucide-react";

function HomeFamilyOutlookPanel({
  upcomingDays,
  onNavigate,
}) {
  return (
    <article className="panel upcoming-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">
            Family Outlook
          </p>

          <h3>
            Next 7 days
          </h3>
        </div>
      </div>

      <div className="upcoming-placeholder">
        {upcomingDays.map(
          (
            {
              date,
              dateKey,
              events,
              meals,
              tasks,
            },
            index
          ) => {
            const dayLabel =
              index === 0
                ? "Tomorrow"
                : new Intl.DateTimeFormat(
                    "en-AU",
                    {
                      weekday: "long",
                    }
                  ).format(date);

            const eventCount =
              events.length;

            const mealCount =
              meals.length;

            const taskCount =
              tasks.length;

            const totalItems =
              eventCount +
              mealCount +
              taskCount;

            return (
              <button
                key={dateKey}
                type="button"
                className={`home-outlook-day ${
                  totalItems === 0
                    ? "empty"
                    : ""
                }`}
                onClick={() =>
                  onNavigate("calendar")
                }
              >
                <div className="home-outlook-date">
                  <span>
                    {dayLabel}
                  </span>

                  <strong>
                    {date.getDate()}
                  </strong>

                  <small>
                    {new Intl.DateTimeFormat(
                      "en-AU",
                      {
                        month: "short",
                      }
                    ).format(date)}
                  </small>
                </div>

                <div className="home-outlook-content">
                  {totalItems === 0 ? (
                    <span className="home-outlook-empty">
                      Nothing planned
                    </span>
                  ) : (
                    <>
                      <div className="home-outlook-counts">
                        {eventCount > 0 && (
                          <span>
                            <CalendarDays
                              size={14}
                            />
                            {eventCount}
                          </span>
                        )}

                        {taskCount > 0 && (
                          <span>
                            <CheckSquare
                              size={14}
                            />
                            {taskCount}
                          </span>
                        )}

                        {mealCount > 0 && (
                          <span>
                            <Soup
                              size={14}
                            />
                            {mealCount}
                          </span>
                        )}
                      </div>

                      <div className="home-outlook-preview">
                        {events[0] && (
                          <span>
                            <i
                              style={{
                                backgroundColor:
                                  events[0]
                                    .members?.[0]
                                    ?.colour ||
                                  "#64748b",
                              }}
                            />

                            {events[0].title}
                          </span>
                        )}

                        {meals[0] && (
                          <span>
                            <Soup size={13} />
                            {meals[0].title}
                          </span>
                        )}

                        {!events[0] &&
                          !meals[0] &&
                          taskCount > 0 && (
                            <span>
                              <CheckSquare
                                size={13}
                              />

                              {taskCount}{" "}
                              {taskCount === 1
                                ? "task"
                                : "tasks"}{" "}
                              due
                            </span>
                          )}
                      </div>
                    </>
                  )}
                </div>

                <ChevronRight
                  className="home-outlook-arrow"
                  size={16}
                />
              </button>
            );
          }
        )}
      </div>
    </article>
  );
}

export default HomeFamilyOutlookPanel;