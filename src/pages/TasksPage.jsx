import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  Repeat2,
} from "lucide-react";

import RewardModal from "../components/RewardModal";

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

const [taskView, setTaskView] =
  useState("chores");

const [rewardSummary, setRewardSummary] =
  useState([]);

const [rewards, setRewards] =
  useState([]);

const [rewardsLoading, setRewardsLoading] =
  useState(false);

const [rewardsError, setRewardsError] =
  useState("");

  const [rewardHistory, setRewardHistory] =
  useState([]);

const [rewardHistoryLoading, setRewardHistoryLoading] =
  useState(false);

  const [rewardGoals, setRewardGoals] =
  useState([]);

const [rewardGoalsLoading, setRewardGoalsLoading] =
  useState(false);

  const [showRewardModal, setShowRewardModal] =
  useState(false);

const [editingReward, setEditingReward] =
  useState(null);

  const [redeemingRewardId, setRedeemingRewardId] =
  useState(null);

  const [redeemTarget, setRedeemTarget] =
  useState(null);

async function redeemReward(
  reward,
  member
) {

  setRedeemingRewardId(reward.id);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tasks/rewards/${reward.id}/redeem`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          familyMemberId: member.id,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to redeem reward"
      );
    }

    setRewardSummary((current) =>
      current.map((item) =>
        item.id === member.id
          ? {
              ...item,
              stars:
                data.redemption
                  .remainingStars,
            }
          : item
      )
    );
  } catch (err) {
    console.error(err);

    window.alert(
      err.message ||
        "Unable to redeem reward"
    );
  } finally {
    setRedeemingRewardId(null);
  }
}

  useEffect(() => {
  async function loadRewardSummary() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/rewards/summary`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load rewards"
        );
      }

      const data =
        await response.json();

      setRewardSummary(
        data.members || []
      );
    } catch (err) {
      console.error(err);
    }
  }

  loadRewardSummary();
}, [taskRefreshKey]);

useEffect(() => {
  async function loadRewards() {
    if (taskView !== "rewards") {
      return;
    }

    setRewardsLoading(true);
    setRewardsError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/rewards`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load rewards"
        );
      }

      setRewards(
        data.rewards || []
      );
    } catch (err) {
      console.error(err);

      setRewardsError(
        err.message ||
          "Unable to load rewards"
      );
    } finally {
      setRewardsLoading(false);
    }
  }

  loadRewards();
}, [taskView, taskRefreshKey]);

useEffect(() => {
  async function loadRewardHistory() {
    if (taskView !== "rewards") {
      return;
    }

    setRewardHistoryLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/rewards/history`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load reward history"
        );
      }

      setRewardHistory(
        data.history || []
      );
    } catch (err) {
      console.error(err);

      setRewardHistory([]);
    } finally {
      setRewardHistoryLoading(false);
    }
  }

  loadRewardHistory();
}, [
  taskView,
  taskRefreshKey,
  redeemingRewardId,
]);

useEffect(() => {
  async function loadRewardGoals() {
    if (taskView !== "rewards") {
      return;
    }

    setRewardGoalsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/rewards/goals`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load reward goals"
        );
      }

      setRewardGoals(
        data.goals || []
      );
    } catch (err) {
      console.error(err);

      setRewardGoals([]);
    } finally {
      setRewardGoalsLoading(false);
    }
  }

  loadRewardGoals();
}, [
  taskView,
  taskRefreshKey,
  redeemingRewardId,
]);

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

if (!showCompleted && taskView !== "routines") {
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
  taskView,
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

  const visibleTasks = useMemo(() => {
  if (taskView === "chores") {
    return tasks.filter(
      (task) =>
        task.category === "chore" &&
        !task.is_recurring
    );
  }

if (taskView === "routines") {
  return tasks.filter(
    (task) =>
      task.category === "routine"
  );
}

  return tasks;
}, [tasks, taskView]);

const visibleActiveTasks = useMemo(
  () =>
    visibleTasks.filter(
      (task) => !task.is_completed
    ),
  [visibleTasks]
);

const visibleCompletedTasks = useMemo(
  () =>
    visibleTasks.filter(
      (task) => task.is_completed
    ),
  [visibleTasks]
);

const choresByDueDate = useMemo(() => {
  const groups = {
    overdue: [],
    today: [],
    upcoming: [],
    noDueDate: [],
  };

  const now = new Date();

  const todayKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(
      2,
      "0"
    ),
    String(now.getDate()).padStart(
      2,
      "0"
    ),
  ].join("-");

  visibleTasks.forEach((task) => {
    if (!task.due_date) {
      groups.noDueDate.push(task);
      return;
    }

    if (task.due_date < todayKey) {
      groups.overdue.push(task);
      return;
    }

    if (task.due_date === todayKey) {
      groups.today.push(task);
      return;
    }

    groups.upcoming.push(task);
  });

  return groups;
}, [visibleTasks]);

const routinesByTimeOfDay = useMemo(() => {
  const groups = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  visibleTasks.forEach((task) => {
    if (!task.due_time) {
      groups.morning.push(task);
      return;
    }

    const hour = Number(
      task.due_time.split(":")[0]
    );

    if (hour < 12) {
      groups.morning.push(task);
    } else if (hour < 17) {
      groups.afternoon.push(task);
    } else {
      groups.evening.push(task);
    }
  });

  return groups;
}, [visibleTasks]);

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

  occurrenceDate:
    task.is_occurrence
      ? task.occurrence_date
      : null,
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
    .map((item) => {
      const itemKey =
        item.occurrence_key ||
        String(item.id);

      const taskKey =
        task.occurrence_key ||
        String(task.id);

      return itemKey === taskKey
        ? data.task
        : item;
    })
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

  async function toggleRoutineMemberCompletion(
  task,
  member
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tasks/${task.id}/members/${member.id}/completion`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          completed:
            !member.is_completed,

          occurrenceDate:
            task.is_occurrence
              ? task.occurrence_date
              : null,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to update routine"
      );
    }

    setTasks((current) =>
      current.map((item) => {
        const itemKey =
          item.occurrence_key ||
          String(item.id);

        const taskKey =
          task.occurrence_key ||
          String(task.id);

        return itemKey === taskKey
          ? data.task
          : item;
      })
    );

    onTaskChanged?.();
  } catch (err) {
    console.error(err);

    window.alert(
      err.message ||
        "Unable to update routine"
    );
  }
}

  function renderRoutine(task) {
  const primaryMember =
    task.members?.[0];

  return (
    <article
      key={
        task.occurrence_key ||
        task.id
      }
      className={`routine-card ${
        task.is_completed
          ? "completed"
          : ""
      }`}
      style={{
        "--routine-colour":
          primaryMember?.colour ||
          "#64748b",
      }}
    >

<div
  className="routine-card-content"
  onClick={() =>
    onEditTask?.(task)
  }
>
        <div className="routine-card-main">
          <div className="routine-card-copy">
            <h3>{task.title}</h3>

<div className="routine-card-meta">
  <span>
    {!task.due_time
      ? "Morning"
      : Number(
            task.due_time.split(":")[0]
          ) < 12
        ? "Morning"
        : Number(
              task.due_time.split(":")[0]
            ) < 17
          ? "Afternoon"
          : "Evening"}
  </span>

  {task.is_recurring && (
                <span className="task-recurring-badge">
                  <Repeat2 size={13} />

                  {task.recurrence_rule === "daily"
                    ? "Daily"
                    : task.recurrence_rule === "weekly"
                      ? "Weekly"
                      : task.recurrence_rule === "monthly"
                        ? "Monthly"
                        : "Repeats"}
                </span>
              )}
            </div>
          </div>

<div className="routine-member-actions">
  {(task.members || []).map(
    (member) => (
      <button
        key={member.id}
        type="button"
        className={`routine-member-button ${
          member.is_completed
            ? "completed"
            : ""
        }`}
        title={
          member.is_completed
            ? `${member.name} completed`
            : `Mark ${member.name} complete`
        }
        onClick={(event) => {
          event.stopPropagation();

          toggleRoutineMemberCompletion(
            task,
            member
          );
        }}
        style={{
          "--member-colour":
            member.colour,
        }}
      >
        <span className="routine-member-avatar">
          {member.photo_url ? (
            <img
              src={`${API_BASE_URL}${member.photo_url}`}
              alt=""
            />
          ) : (
            member.initials ||
            member.name
              .charAt(0)
              .toUpperCase()
          )}
        </span>

        <span className="routine-member-check">
          {member.is_completed ? (
            <CheckCircle2 size={16} />
          ) : (
            <Circle size={16} />
          )}
        </span>
      </button>
    )
  )}
</div>
        </div>

        <span className="routine-card-colour" />
      </div>
    </article>
  );
}

  function renderTask(task) {
    const primaryMember =
      task.members?.[0];

    return (
      <article
  key={
    task.occurrence_key ||
    task.id
  }
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
           <div className="task-card-date-details">
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

  {task.is_recurring && (
    <span className="task-recurring-badge">
      <Repeat2 size={13} />

      {task.recurrence_rule === "daily"
        ? "Daily"
        : task.recurrence_rule === "weekly"
          ? "Weekly"
          : task.recurrence_rule === "monthly"
            ? "Monthly"
            : "Repeats"}
    </span>
  )}
</div>

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

<section className="family-selector family-selector-section">
  <button
    type="button"
    className={`family-selector-button family-selector-everyone ${
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
      className={`family-selector-button ${
        selectedMemberId === member.id
          ? "selected"
          : ""
      }`}
      onClick={() =>
        setSelectedMemberId(member.id)
      }
    >
      <span
        className="family-selector-avatar"
        style={{
          backgroundColor: member.colour,
        }}
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

      {member.name}
    </button>
  ))}
</section>

{taskView === "routines" &&
  rewardSummary.length > 0 && (
    <section className="routine-rewards-summary">
      <div className="routine-rewards-heading">
        <span>⭐</span>

        <div>
          <strong>Family Stars</strong>
          <small>
            Earned from completed routines
          </small>
        </div>
      </div>

      <div className="routine-rewards-members">
        {rewardSummary.map((member) => (
          <div
            key={member.id}
            className="routine-reward-member"
            style={{
              "--member-colour":
                member.colour,
            }}
          >
            <span className="routine-reward-avatar">
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

            <div>
              <span>{member.name}</span>

              <strong>
                {member.stars} ⭐
              </strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  )}

<section className="tasks-toolbar">
  <div className="tasks-view-switch">
    <button
      type="button"
      className={
        taskView === "chores"
          ? "tasks-view-button active"
          : "tasks-view-button"
      }
      onClick={() => setTaskView("chores")}
    >
      Chores
    </button>

    <button
      type="button"
      className={
        taskView === "routines"
          ? "tasks-view-button active"
          : "tasks-view-button"
      }
      onClick={() => setTaskView("routines")}
    >
      Routines
    </button>

    <button
      type="button"
      className={
        taskView === "rewards"
          ? "tasks-view-button active"
          : "tasks-view-button"
      }
      onClick={() =>
        setTaskView("rewards")
      }
    >
      Rewards
    </button>

    <button
      type="button"
      className={
        taskView === "all"
          ? "tasks-view-button active"
          : "tasks-view-button"
      }
      onClick={() => setTaskView("all")}
    >
      All Tasks
    </button>
  </div>

{taskView !== "rewards" && (
  <div className="tasks-toolbar-right">
    <div className="tasks-counts">
      <strong>
        {visibleActiveTasks.length} open
      </strong>

      {showCompleted && (
        <span>
          {visibleCompletedTasks.length} completed
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

      <span>Show completed</span>
    </label>
  </div>
)}
</section>

{taskView === "rewards" ? (
  <section className="rewards-page-view">
    <div className="rewards-page-heading">
      <div>
        <span className="rewards-page-kicker">
          ⭐ Family Rewards
        </span>

        <h3>Spend Your Stars</h3>

        <p>
          Complete chores and routines to earn
          stars, then trade them for rewards.
        </p>
      </div>

<button
  type="button"
  className="add-event-button"
  onClick={() => {
    setEditingReward(null);
    setShowRewardModal(true);
  }}
>
  <Plus size={20} />
  <span>Add Reward</span>
</button>
    </div>

    <section className="reward-goals-section">
      <div className="reward-goals-heading">
        <div>
          <span>🎯 Saving For</span>

          <h3>Family Reward Goals</h3>
        </div>

        <small>
          Pick what each person is working toward
        </small>
      </div>

      {rewardGoalsLoading ? (
        <div className="reward-history-empty">
          Loading goals...
        </div>
      ) : (
        <div className="reward-goals-grid">
          {rewardGoals.map((goal) => (
            <article
              key={goal.familyMemberId}
              className="reward-goal-card"
              style={{
                "--member-colour":
                  goal.memberColour ||
                  "#64748b",
              }}
            >
              <div className="reward-goal-member">
                <span className="reward-goal-avatar">
                  {goal.memberPhotoUrl ? (
                    <img
                      src={`${API_BASE_URL}${goal.memberPhotoUrl}`}
                      alt=""
                    />
                  ) : (
                    goal.memberInitials ||
                    goal.memberName
                      ?.charAt(0)
                      .toUpperCase()
                  )}
                </span>

                <div>
                  <strong>
                    {goal.memberName}
                  </strong>

                  <span>
                    {goal.stars} ⭐ available
                  </span>
                </div>
              </div>

              <select
                value={
                  goal.rewardId || ""
                }
                onChange={async (event) => {
                  const rewardId =
                    event.target.value
                      ? Number(
                          event.target.value
                        )
                      : null;

                  try {
                    const response =
                      await fetch(
                        `${API_BASE_URL}/api/tasks/rewards/goals/${goal.familyMemberId}`,
                        {
                          method: "PUT",

                          headers: {
                            "Content-Type":
                              "application/json",
                          },

                          body: JSON.stringify({
                            rewardId,
                          }),
                        }
                      );

                    const data =
                      await response.json();

                    if (!response.ok) {
                      throw new Error(
                        data.error ||
                          "Unable to update goal"
                      );
                    }

                    const goalsResponse =
                      await fetch(
                        `${API_BASE_URL}/api/tasks/rewards/goals`
                      );

                    const goalsData =
                      await goalsResponse.json();

                    if (goalsResponse.ok) {
                      setRewardGoals(
                        goalsData.goals || []
                      );
                    }
                  } catch (err) {
                    console.error(err);

                    window.alert(
                      err.message ||
                        "Unable to update goal"
                    );
                  }
                }}
              >
                <option value="">
                  No goal selected
                </option>

                {rewards.map((reward) => (
                  <option
                    key={reward.id}
                    value={reward.id}
                  >
                    {reward.title} ·{" "}
                    {reward.star_cost} ⭐
                  </option>
                ))}
              </select>

              {goal.rewardId ? (
                <>
                  <div className="reward-goal-progress-copy">
                    <strong>
                      {goal.rewardTitle}
                    </strong>

                    <span>
                      {goal.stars} /{" "}
                      {goal.rewardStarCost} ⭐
                    </span>
                  </div>

                  <div className="reward-goal-progress">
                    <span
                      style={{
                        width: `${goal.progress}%`,
                      }}
                    />
                  </div>

                  <small className="reward-goal-remaining">
                    {goal.starsRemaining > 0
                      ? `${goal.starsRemaining} ⭐ to go`
                      : "Ready to redeem 🎉"}
                  </small>
                </>
              ) : (
                <div className="reward-goal-empty">
                  Choose a reward to start a goal
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>

    {rewardsLoading ? (
      <div className="panel task-status-panel">
        Loading rewards...
      </div>
    ) : rewardsError ? (
      <div className="panel task-status-panel task-status-error">
        {rewardsError}
      </div>
    ) : rewards.length === 0 ? (
      <div className="panel rewards-empty-state">
        <span className="rewards-empty-icon">
          🎁
        </span>

        <div>
          <h3>No rewards yet</h3>

          <p>
            Add your first family reward and
            choose how many stars it costs.
          </p>
        </div>
      </div>
    ) : (
      <div className="rewards-grid">
        {rewards.map((reward) => (
          <article
            key={reward.id}
            className="reward-card"
          >
            <div className="reward-card-icon">
              🎁
            </div>

<div className="reward-card-copy">
  <div className="reward-card-title-row">
    <h3>{reward.title}</h3>

    <button
      type="button"
      className="reward-edit-button"
      onClick={() => {
        setEditingReward(reward);
        setShowRewardModal(true);
      }}
    >
      Edit
    </button>
  </div>

  {reward.description && (
    <p>
      {reward.description}
    </p>
  )}
</div>

<div className="reward-card-footer">
  <strong>
    {reward.star_cost} ⭐
  </strong>

  <span className="reward-card-spend-label">
    Who's spending?
  </span>
</div>

<div className="reward-member-buttons">
  {rewardSummary.map((member) => {
    const canAfford =
      Number(member.stars) >=
      Number(reward.star_cost);

    const isRedeeming =
      redeemingRewardId ===
      reward.id;

    return (
      <button
        key={member.id}
        type="button"
        className={`reward-member-button ${
          canAfford
            ? "can-afford"
            : "cannot-afford"
        }`}
        style={{
          "--member-colour":
            member.colour,
        }}
        disabled={
          !canAfford ||
          isRedeeming
        }
        title={
          canAfford
            ? `Redeem for ${member.name}`
            : `${member.name} needs ${
                Number(
                  reward.star_cost
                ) -
                Number(
                  member.stars
                )
              } more stars`
        }
onClick={() =>
  setRedeemTarget({
    reward,
    member,
  })
}
      >
        <span className="reward-member-avatar">
          {member.photo_url ? (
            <img
              src={`${API_BASE_URL}${member.photo_url}`}
              alt=""
            />
          ) : (
            member.initials ||
            member.name
              .charAt(0)
              .toUpperCase()
          )}
        </span>

        <span className="reward-member-details">
          <strong>
            {member.name}
          </strong>

          <small>
            {member.stars} ⭐
          </small>
        </span>
      </button>
    );
  })}
</div>
          </article>
        ))}
      </div>
    )}

    <section className="reward-history-section">
      <div className="reward-history-heading">
        <div>
          <span>⭐ Reward Activity</span>

          <h3>Recent Redemptions</h3>
        </div>

        <small>
          Latest rewards spent by the family
        </small>
      </div>

      {rewardHistoryLoading ? (
        <div className="reward-history-empty">
          Loading activity...
        </div>
      ) : rewardHistory.length === 0 ? (
        <div className="reward-history-empty">
          No rewards have been redeemed yet.
        </div>
      ) : (
        <div className="reward-history-list">
          {rewardHistory.map((item) => {
            const rewardName =
              item.description?.replace(
                /^Redeemed:\s*/i,
                ""
              ) ||
              "Reward";

            return (
              <article
                key={item.id}
                className="reward-history-row"
                style={{
                  "--member-colour":
                    item.memberColour ||
                    "#64748b",
                }}
              >
                <span className="reward-history-avatar">
                  {item.memberPhotoUrl ? (
                    <img
                      src={`${API_BASE_URL}${item.memberPhotoUrl}`}
                      alt=""
                    />
                  ) : (
                    item.memberInitials ||
                    item.memberName
                      ?.charAt(0)
                      .toUpperCase()
                  )}
                </span>

                <div className="reward-history-copy">
                  <strong>
                    {item.memberName}
                  </strong>

                  <span>
                    redeemed {rewardName}
                  </span>
                </div>

                <strong className="reward-history-stars">
                  -{item.starsSpent} ⭐
                </strong>

                <time>
                  {new Date(
                    item.createdAt
                  ).toLocaleDateString(
                    "en-AU",
                    {
                      day: "numeric",
                      month: "short",
                    }
                  )}
                </time>
              </article>
            );
          })}
        </div>
      )}
    </section>
  </section>
) : loading ? (
  <div className="panel task-status-panel">
    Loading tasks...
  </div>
) : error ? (
  <div className="panel task-status-panel task-status-error">
    {error}
  </div>
) : visibleTasks.length === 0 ? (
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
) : taskView === "routines" ? (
  <div className="routines-board">
    <section className="routine-period">
      <div className="routine-period-heading">
        <div>
          <span className="routine-period-icon">
            ☀️
          </span>

          <div>
            <span>Morning</span>

<strong>
  {
    routinesByTimeOfDay.morning.filter(
      (task) => task.is_completed
    ).length
  }{" "}
  of{" "}
  {routinesByTimeOfDay.morning.length} done
</strong>
          </div>
        </div>
      </div>

      <div className="routine-period-list">
        {routinesByTimeOfDay.morning.length > 0 ? (
routinesByTimeOfDay.morning.map(
  renderRoutine
)
        ) : (
          <p className="routine-empty">
            Nothing scheduled
          </p>
        )}
      </div>
    </section>

    <section className="routine-period">
      <div className="routine-period-heading">
        <div>
          <span className="routine-period-icon">
            🌤️
          </span>

          <div>
            <span>Afternoon</span>

<strong>
  {
    routinesByTimeOfDay.afternoon.filter(
      (task) => task.is_completed
    ).length
  }{" "}
  of{" "}
  {routinesByTimeOfDay.afternoon.length} done
</strong>
          </div>
        </div>
      </div>

      <div className="routine-period-list">
        {routinesByTimeOfDay.afternoon.length > 0 ? (
          routinesByTimeOfDay.afternoon.map(
            renderRoutine
          )
        ) : (
          <p className="routine-empty">
            Nothing scheduled
          </p>
        )}
      </div>
    </section>

    <section className="routine-period">
      <div className="routine-period-heading">
        <div>
          <span className="routine-period-icon">
            🌙
          </span>

          <div>
            <span>Evening</span>

<strong>
  {
    routinesByTimeOfDay.evening.filter(
      (task) => task.is_completed
    ).length
  }{" "}
  of{" "}
  {routinesByTimeOfDay.evening.length} done
</strong>
          </div>
        </div>
      </div>

      <div className="routine-period-list">
        {routinesByTimeOfDay.evening.length > 0 ? (
          routinesByTimeOfDay.evening.map(
            renderRoutine
          )
        ) : (
          <p className="routine-empty">
            Nothing scheduled
          </p>
        )}
      </div>
    </section>
  </div>
) : taskView === "chores" ||
    taskView === "all" ? (
  <div className="chores-board">
    {choresByDueDate.overdue.length > 0 && (
      <section className="chores-group">
        <div className="chores-group-heading">
          <h3>Overdue</h3>

          <span>
            {choresByDueDate.overdue.length}
          </span>
        </div>

        <div className="tasks-list">
          {choresByDueDate.overdue.map(
            renderTask
          )}
        </div>
      </section>
    )}

    {choresByDueDate.today.length > 0 && (
      <section className="chores-group">
        <div className="chores-group-heading">
          <h3>Today</h3>

          <span>
            {choresByDueDate.today.length}
          </span>
        </div>

        <div className="tasks-list">
          {choresByDueDate.today.map(
            renderTask
          )}
        </div>
      </section>
    )}

    {choresByDueDate.upcoming.length > 0 && (
      <section className="chores-group">
        <div className="chores-group-heading">
          <h3>Upcoming</h3>

          <span>
            {choresByDueDate.upcoming.length}
          </span>
        </div>

        <div className="tasks-list">
          {choresByDueDate.upcoming.map(
            renderTask
          )}
        </div>
      </section>
    )}

    {choresByDueDate.noDueDate.length > 0 && (
      <section className="chores-group">
        <div className="chores-group-heading">
          <h3>No Due Date</h3>

          <span>
            {choresByDueDate.noDueDate.length}
          </span>
        </div>

        <div className="tasks-list">
          {choresByDueDate.noDueDate.map(
            renderTask
          )}
        </div>
      </section>
    )}
  </div>
) : (
  <div className="tasks-list">
    {visibleTasks.map(renderTask)}
  </div>
)}

{redeemTarget && (
  <div
    className="modal-backdrop"
    onMouseDown={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        setRedeemTarget(null);
      }
    }}
  >
    <div className="redeem-reward-modal">
      <div className="redeem-reward-icon">
        🎁
      </div>

      <div className="redeem-reward-copy">
        <span>
          Redeem Reward
        </span>

        <h2>
          {redeemTarget.reward.title}
        </h2>

        <p>
          {redeemTarget.member.name} will
          spend{" "}
          <strong>
            {redeemTarget.reward.star_cost} ⭐
          </strong>{" "}
          on this reward.
        </p>

        <div className="redeem-reward-balance">
          <span>Current balance</span>

          <strong>
            {redeemTarget.member.stars} ⭐
          </strong>
        </div>

        <div className="redeem-reward-balance">
          <span>After redemption</span>

          <strong>
            {Number(
              redeemTarget.member.stars
            ) -
              Number(
                redeemTarget.reward.star_cost
              )}{" "}
            ⭐
          </strong>
        </div>
      </div>

      <div className="redeem-reward-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            setRedeemTarget(null)
          }
        >
          Cancel
        </button>

        <button
          type="button"
          className="reward-redeem-confirm"
          disabled={
            redeemingRewardId ===
            redeemTarget.reward.id
          }
          onClick={async () => {
            await redeemReward(
              redeemTarget.reward,
              redeemTarget.member
            );

            setRedeemTarget(null);
          }}
        >
          {redeemingRewardId ===
          redeemTarget.reward.id
            ? "Redeeming..."
            : `Redeem for ${redeemTarget.reward.star_cost} ⭐`}
        </button>
      </div>
    </div>
  </div>
)}

{showRewardModal && (
  <RewardModal
    reward={editingReward}
    onClose={() => {
      setShowRewardModal(false);
      setEditingReward(null);
    }}
onSaved={(savedReward) => {
  setRewards((current) => {
    if (savedReward.deleted) {
      return current.filter(
        (reward) =>
          reward.id !==
          savedReward.id
      );
    }

    const exists = current.some(
          (reward) =>
            reward.id ===
            savedReward.id
        );

        if (exists) {
          return current.map(
            (reward) =>
              reward.id ===
              savedReward.id
                ? savedReward
                : reward
          );
        }

        return [
          ...current,
          savedReward,
        ].sort(
          (a, b) =>
            a.star_cost -
              b.star_cost ||
            a.title.localeCompare(
              b.title
            )
        );
      });
    }}
  />
)}

    </div>
  );
}

export default TasksPage;