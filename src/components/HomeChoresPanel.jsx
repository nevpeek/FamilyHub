import {
  CheckSquare,
  ChevronRight,
  Plus,
  Star,
} from "lucide-react";

import { API_BASE_URL } from "../config/api";
import {
  formatEventTime,
} from "../utils/calendarUtils";

function HomeChoresPanel({
  todayTaskAssignments,
  todayTaskCompletions,
  todayTaskProgress,

  familyStars,
  familyStarsLoading,

  homeTasks,
  homeTasksLoading,
  homeTasksError,

  onNavigate,
  onAddTask,
  onEditTask,
  onCompleteTask,
}) {
  return (
    <article className="panel quick-panel home-chores-panel">
      <div className="panel-heading">
        <div className="home-chore-heading-copy">
          <p className="section-kicker">
            Chores & routines
          </p>

          <h3>
            Today&apos;s family progress
          </h3>

          {todayTaskAssignments > 0 && (
            <div className="home-chore-progress">
              <div className="home-chore-progress-copy">
                <span>
                  {todayTaskCompletions} of{" "}
                  {todayTaskAssignments} done
                </span>

                <strong>
                  {todayTaskProgress}%
                </strong>
              </div>

              <div className="home-chore-progress-track">
                <span
                  className="home-chore-progress-fill"
                  style={{
                    width: `${todayTaskProgress}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() =>
            onNavigate("tasks")
          }
        >
          View tasks
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="home-family-stars">
        <div className="home-family-stars-heading">
          <span>
            Family Stars
          </span>

          <button
            type="button"
            onClick={() =>
              onNavigate("tasks")
            }
          >
            Rewards
            <ChevronRight size={14} />
          </button>
        </div>

        {familyStarsLoading ? (
          <div className="home-family-stars-loading">
            Loading stars...
          </div>
        ) : (
          <div className="home-family-stars-list">
            {familyStars.map(
              (member) => (
                <div
                  key={member.id}
                  className="home-family-star-member"
                  style={{
                    "--member-colour":
                      member.colour ||
                      "#64748b",
                  }}
                >
                  <span className="home-family-star-avatar">
                    {member.photo_url ? (
                      <img
                        src={
                          member.photo_url.startsWith(
                            "http"
                          )
                            ? member.photo_url
                            : `${API_BASE_URL}${member.photo_url}`
                        }
                        alt={member.name}
                      />
                    ) : (
                      member.initials ||
                      member.name
                        ?.slice(0, 1)
                        .toUpperCase()
                    )}
                  </span>

                  <span className="home-family-star-name">
                    {member.name}
                  </span>

                  <strong>
                    <Star size={14} />

                    {Number(
                      member.stars ??
                        member.total_stars ??
                        0
                    )}
                  </strong>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {homeTasksLoading ? (
        <div className="small-empty-state">
          <CheckSquare size={24} />

          <span>
            Loading tasks...
          </span>
        </div>
      ) : homeTasksError ? (
        <div className="small-empty-state">
          <CheckSquare size={24} />

          <span>
            {homeTasksError}
          </span>
        </div>
      ) : homeTasks.length === 0 ? (
        <div className="home-tasks-clear">
          <div className="home-tasks-clear-icon">
            <CheckSquare size={20} />
          </div>

          <div className="home-tasks-clear-copy">
            <strong>
              All clear today
            </strong>

            <span>
              No tasks are due.
            </span>
          </div>

          <button
            type="button"
            className="home-tasks-add"
            onClick={onAddTask}
          >
            <Plus size={15} />
            Add task
          </button>
        </div>
      ) : (
        <div className="home-task-list">
          {homeTasks.map((task) => (
            <div
              key={task.id}
              className="home-task-item"
            >
              <div className="home-task-member-checks">
                {(task.members?.length
                  ? task.members
                  : [
                      {
                        id: null,
                        name: "Complete",
                        is_completed:
                          Boolean(
                            task.is_completed
                          ),
                      },
                    ]
                ).map((member) => {
                  const completed =
                    Boolean(
                      member.is_completed
                    );

                  return (
                    <button
                      key={
                        member.id ??
                        `task-${task.id}`
                      }
                      type="button"
                      className={`home-task-member-check ${
                        completed
                          ? "completed"
                          : ""
                      }`}
                      style={{
                        "--member-colour":
                          member.colour ||
                          "#22c55e",
                      }}
                      onClick={async () => {
                        try {
                          const url =
                            member.id
                              ? `${API_BASE_URL}/api/tasks/${task.id}/members/${member.id}/completion`
                              : `${API_BASE_URL}/api/tasks/${task.id}/completion`;

                          const response =
                            await fetch(
                              url,
                              {
                                method:
                                  "PATCH",
                                headers: {
                                  "Content-Type":
                                    "application/json",
                                },
                                body:
                                  JSON.stringify(
                                    {
                                      completed:
                                        !completed,

                                      occurrenceDate:
                                        task.occurrence_date ||
                                        task.due_date ||
                                        "",
                                    }
                                  ),
                              }
                            );

                          const data =
                            await response.json();

                          if (!response.ok) {
                            throw new Error(
                              data.error ||
                                "Unable to update task"
                            );
                          }

                          onCompleteTask?.();
                        } catch (err) {
                          console.error(
                            err
                          );

                          window.alert(
                            err.message ||
                              "Unable to update task"
                          );
                        }
                      }}
                      title={
                        member.id
                          ? `${member.name} ${
                              completed
                                ? "done"
                                : "not done"
                            }`
                          : completed
                            ? "Completed"
                            : "Complete"
                      }
                    >
                      {member.photo_url ? (
                        <img
                          src={
                            member.photo_url.startsWith(
                              "http"
                            )
                              ? member.photo_url
                              : `${API_BASE_URL}${member.photo_url}`
                          }
                          alt={member.name}
                        />
                      ) : (
                        <span>
                          {member.initials ||
                            member.name
                              ?.slice(
                                0,
                                1
                              )
                              .toUpperCase()}
                        </span>
                      )}

                      {completed && (
                        <span className="home-task-member-checkmark">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="home-task-content"
                onClick={() =>
                  onEditTask?.(task)
                }
              >
                <div className="home-task-main">
                  <strong>
                    {task.title}
                  </strong>

                  <span>
                    {task.due_time
                      ? formatEventTime(
                          task.due_time
                        )
                      : "Today"}
                  </span>
                </div>

                <div className="home-task-members">
                  {(task.members || []).map(
                    (member) => (
                      <span
                        key={member.id}
                        className="home-task-member"
                      >
                        <span
                          className="home-task-dot"
                          style={{
                            backgroundColor:
                              member.colour,
                          }}
                        />

                        {member.name}
                      </span>
                    )
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default HomeChoresPanel;