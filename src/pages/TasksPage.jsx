import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

function formatTaskTime(time) {
  if (!time) {
    return "";
  }

  const [hours, minutes] = time.split(":");

  const date = new Date();
  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatTaskDate(dateKey) {
  if (!dateKey) {
    return "No due date";
  }

  const [year, month, day] =
    dateKey.split("-").map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function TasksPage({
  members,
  selectedMemberId,
  setSelectedMemberId,
  taskRefreshKey,
  onAddTask,
  onEditTask,
  onTaskChanged,
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCompleted, setShowCompleted] =
    useState(false);

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (selectedMemberId !== "all") {
          params.set(
            "memberId",
            String(selectedMemberId)
          );
        }

        if (!showCompleted) {
          params.set("completed", "false");
        }

        const query = params.toString();

        const response = await fetch(
          `${API_BASE_URL}/api/tasks${
            query ? `?${query}` : ""
          }`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load tasks"
          );
        }

        const data = await response.json();

        setTasks(data.tasks || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load tasks");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [
    selectedMemberId,
    showCompleted,
    taskRefreshKey,
  ]);

  const activeTasks = useMemo(
    () =>
      tasks.filter(
        (task) => !task.is_completed
      ),
    [tasks]
  );

  const completedTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.is_completed
      ),
    [tasks]
  );

  async function toggleTaskCompletion(task) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${task.id}/completion`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            completed:
              !task.is_completed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update task"
        );
      }

      setTasks((current) =>
        current
          .map((item) =>
            item.id === task.id
              ? data.task
              : item
          )
          .filter((item) =>
            showCompleted
              ? true
              : !item.is_completed
          )
      );
      onTaskChanged?.();

    } catch (err) {
      console.error(err);
      window.alert(
        err.message ||
          "Unable to update task"
      );
    }
  }

  function renderTask(task) {
    const primaryMember =
      task.members?.[0];

    return (
      <article
        key={task.id}
        className={`task-card ${
          task.is_completed
            ? "completed"
            : ""
        }`}
      >
        <button
          type="button"
          className="task-complete-button"
          onClick={() =>
            toggleTaskCompletion(task)
          }
          aria-label={
            task.is_completed
              ? "Mark task incomplete"
              : "Mark task complete"
          }
        >
          {task.is_completed ? (
            <CheckCircle2 size={28} />
          ) : (
            <Circle size={28} />
          )}
        </button>

        <button
          type="button"
          className="task-card-content"
          onClick={() =>
            onEditTask?.(task)
          }
        >
          <div className="task-card-top">
            <div>
              <h3>{task.title}</h3>

              {task.description && (
                <p>
                  {task.description}
                </p>
              )}
            </div>

            <span
              className={`task-priority task-priority-${task.priority}`}
            >
              {task.priority}
            </span>
          </div>

          <div className="task-card-meta">
            <span>
              {formatTaskDate(
                task.due_date
              )}

              {task.due_time
                ? ` · ${formatTaskTime(
                    task.due_time
                  )}`
                : ""}
            </span>

            <div className="task-card-members">
              {(task.members || []).map(
                (member) => (
                  <span
                    key={member.id}
                    className="task-member"
                  >
                    <span
                      className="task-member-dot"
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
          </div>

          <div
            className="task-card-colour"
            style={{
              backgroundColor:
                primaryMember?.colour ||
                "#64748b",
            }}
          />
        </button>
      </article>
    );
  }

  return (
    <div className="tasks-page">
      <section className="calendar-page-heading">
        <div>
          <p className="section-kicker">
            Tasks
          </p>

          <h2>Family Tasks</h2>

          <p>
            Keep track of chores and jobs
            across the family.
          </p>
        </div>

        <button
          type="button"
          className="add-event-button"
          onClick={onAddTask}
        >
          <Plus size={22} />
          <span>Add Task</span>
        </button>
      </section>

      <section className="calendar-family-filters">
        <button
          type="button"
          className={`calendar-person-filter ${
            selectedMemberId === "all"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setSelectedMemberId("all")
          }
        >
          Everyone
        </button>

        {members.map((member) => (
          <button
            type="button"
            key={member.id}
            className={`calendar-person-filter ${
              selectedMemberId === member.id
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setSelectedMemberId(member.id)
            }
          >
            <span
              className="calendar-person-dot"
              style={{
                backgroundColor:
                  member.colour,
              }}
            />

            {member.name}
          </button>
        ))}
      </section>

      <section className="tasks-toolbar">
        <div>
          <strong>
            {activeTasks.length} open
          </strong>

          {showCompleted && (
            <span>
              {completedTasks.length} completed
            </span>
          )}
        </div>

        <label className="tasks-show-completed">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(event) =>
              setShowCompleted(
                event.target.checked
              )
            }
          />

          <span>
            Show completed
          </span>
        </label>
      </section>

      {loading ? (
        <div className="panel task-status-panel">
          Loading tasks...
        </div>
      ) : error ? (
        <div className="panel task-status-panel task-status-error">
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="panel task-empty-state">
          <CheckCircle2 size={34} />

          <div>
            <h3>No tasks here</h3>
            <p>
              Add a task or change the family
              filter.
            </p>
          </div>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map(renderTask)}
        </div>
      )}
    </div>
  );
}

export default TasksPage;