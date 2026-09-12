import { API_BASE_URL } from "../config/api";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Trash2,
  X,
} from "lucide-react";

function TaskModal({
  open,
  task,
  editMode,
  members,
  onClose,
  onSaved,
}) {
  const reduceMotion = useReducedMotion();
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] =
    useState("normal");
const [category, setCategory] =
  useState("chore");

const [starValue, setStarValue] =
  useState(1);

const [reminderEnabled, setReminderEnabled] =
  useState(false);

const [reminderMinutes, setReminderMinutes] =
  useState("15");

const [memberIds, setMemberIds] =
  useState([]);

const [isRecurring, setIsRecurring] =
  useState(false);

const [recurrenceRule, setRecurrenceRule] =
  useState("weekly");

const [
  recurrenceEndDate,
  setRecurrenceEndDate,
] = useState("");

const [saving, setSaving] =
  useState(false);

const [
  showDeleteConfirm,
  setShowDeleteConfirm,
] = useState(false);

const [error, setError] = useState("");

const isEditing = Boolean(task?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setDueDate(task?.due_date || "");
    setDueTime(task?.due_time || "");
    setPriority(task?.priority || "normal");
setCategory(task?.category || "chore");

setStarValue(
  task?.star_value !== undefined &&
  task?.star_value !== null
    ? Number(task.star_value)
    : 1
);

setReminderEnabled(
  editMode === "occurrence" &&
  task?.reminder_enabled === null
    ? null
    : Boolean(task?.reminder_enabled)
);

setReminderMinutes(
  task?.reminder_minutes !== null &&
  task?.reminder_minutes !== undefined
    ? String(task.reminder_minutes)
    : "15"
);

setIsRecurring(
  Boolean(task?.is_recurring)
);
setRecurrenceRule(
  task?.recurrence_rule || "weekly"
);

setRecurrenceEndDate(
  task?.recurrence_end_date || ""
);

setMemberIds(
      task?.members?.map(
        (member) => member.id
      ) || []
    );

    setError("");
    setSaving(false);
  }, [open, task]);

  if (!open) {
    return null;
  }

  function toggleMember(memberId) {
    setMemberIds((current) =>
      current.includes(memberId)
        ? current.filter(
            (id) => id !== memberId
          )
        : [...current, memberId]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Enter a task title.");
      return;
    }

   if (memberIds.length === 0) {
  setError(
    "Select at least one family member."
  );
  return;
}

if (isRecurring && !dueDate) {
  setError(
    "Choose a due date for the recurring task."
  );
  return;
}

if (
  isRecurring &&
  recurrenceEndDate &&
  recurrenceEndDate < dueDate
) {
  setError(
    "The recurrence end date cannot be before the due date."
  );
  return;
}

setSaving(true);
    setError("");

    try {
      const response = await fetch(
  editMode === "occurrence"
  ? `${API_BASE_URL}/api/tasks/${task.id}/occurrences/${task.occurrence_date}`
  : editMode === "future"
    ? `${API_BASE_URL}/api/tasks/${task.id}/future/${task.occurrence_date}`
    : isEditing
      ? `${API_BASE_URL}/api/tasks/${task.id}`
      : `${API_BASE_URL}/api/tasks`,
  {
    method:
  editMode === "occurrence" ||
  editMode === "future"
    ? "PUT"
    : isEditing
      ? "PUT"
      : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description:
              description.trim() || null,
            dueDate: dueDate || null,
            dueTime: dueTime || null,
priority,
category,
starValue,

reminderEnabled:
  editMode === "occurrence"
    ? dueTime
      ? reminderEnabled
      : false
    : Boolean(dueTime) &&
      Boolean(reminderEnabled),

reminderMinutes:
  editMode === "occurrence" &&
  reminderEnabled === null
    ? null
    : dueTime && reminderEnabled
      ? Number(reminderMinutes)
      : null,

memberIds,
isRecurring,
recurrenceRule:
  isRecurring
    ? recurrenceRule
    : null,
recurrenceEndDate:
  isRecurring &&
  recurrenceEndDate
    ? recurrenceEndDate
    : null,
recurrenceCount: null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save task"
        );
      }

      onSaved?.(data.task);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save task"
      );
    } finally {
      setSaving(false);
    }
  }

async function handleDelete() {
  if (!isEditing) {
    return;
  }

  setShowDeleteConfirm(true);
}

async function confirmDelete() {
  setSaving(true);
  setError("");
    setError("");

    try {
    const deleteUrl =
  editMode === "occurrence"
    ? `${API_BASE_URL}/api/tasks/${task.id}/occurrences/${task.occurrence_date}`
    : editMode === "future"
      ? `${API_BASE_URL}/api/tasks/${task.id}/future/${task.occurrence_date}`
      : `${API_BASE_URL}/api/tasks/${task.id}`;

const response = await fetch(
  deleteUrl,
  {
    method: "DELETE",
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete task"
        );
      }

      onSaved?.(null);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete task"
      );

      setSaving(false);
    }
  }

  return (
    <motion.div
      className="event-modal-backdrop"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="event-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? "Edit Task" : "Add Task"}
        initial={
          reduceMotion
            ? false
            : { opacity: 0, y: 14, scale: 0.98 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: reduceMotion ? 0 : 0.24,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="event-modal-header">
          <div>
            <p className="section-kicker">
              Tasks
            </p>

            <h2>
              {isEditing
                ? "Edit Task"
                : "Add Task"}
            </h2>
          </div>

          <button
            type="button"
            className="event-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

<form
  className="event-form"
  onSubmit={handleSubmit}
>
  <label className="event-form-field event-form-full">
    <span>Task title</span>

    <input
      type="text"
      value={title}
      onChange={(event) =>
        setTitle(event.target.value)
      }
      placeholder={
        category === "routine"
          ? "e.g. Get ready for school"
          : "e.g. Take bins out"
      }
      autoFocus
    />
  </label>

  <label className="event-form-field">
    <span>Type</span>

    <select
      value={category}
      onChange={(event) => {
        const nextCategory =
          event.target.value;

        setCategory(nextCategory);

        if (nextCategory === "routine") {
          setIsRecurring(true);
          setRecurrenceRule("daily");

          if (!dueTime) {
            setDueTime("07:30");
          }
        }
      }}
    >
      <option value="chore">Chore</option>
      <option value="routine">Routine</option>
      <option value="school">School</option>
      <option value="work">Work</option>
      <option value="shopping">Shopping</option>
      <option value="other">Other</option>
    </select>
  </label>

  <label className="event-form-field">
    <span>Due date</span>

    <input
      type="date"
      value={dueDate}
      onChange={(event) =>
        setDueDate(event.target.value)
      }
    />
  </label>

  <div className="event-form-field event-form-full">
    <span>Family members</span>

    <div className="event-member-picker">
      {members.map((member) => {
        const selected =
          memberIds.includes(member.id);

        return (
          <button
            type="button"
            key={member.id}
            className={`event-member-option ${
              selected ? "selected" : ""
            }`}
            onClick={() =>
              toggleMember(member.id)
            }
          >
            <span
              className="event-member-option-dot"
              style={{
                backgroundColor:
                  member.colour,
              }}
            />

            {member.name}
          </button>
        );
      })}
    </div>
  </div>

  {category === "routine" ? (
    <label className="event-form-field">
      <span>Routine period</span>

      <select
        value={
          !dueTime
            ? "morning"
            : Number(
                  dueTime.split(":")[0]
                ) < 12
              ? "morning"
              : Number(
                    dueTime.split(":")[0]
                  ) < 17
                ? "afternoon"
                : "evening"
        }
        onChange={(event) => {
          const period =
            event.target.value;

          if (period === "morning") {
            setDueTime("07:30");
          } else if (
            period === "afternoon"
          ) {
            setDueTime("15:30");
          } else {
            setDueTime("19:00");
          }
        }}
      >
        <option value="morning">
          Morning
        </option>

        <option value="afternoon">
          Afternoon
        </option>

        <option value="evening">
          Evening
        </option>
      </select>
    </label>
  ) : (
    <label className="event-form-field">
      <span>Due time</span>

<input
  type="time"
  value={dueTime}
  onChange={(event) => {
    const nextDueTime =
      event.target.value;

    setDueTime(nextDueTime);

    if (!nextDueTime) {
      setReminderEnabled(false);
    }
  }}
/>
    </label>
  )}

  <div className="event-form-field event-form-full">
    <span>Reminder</span>

    <label className="task-repeat-toggle">
      <input
        type="checkbox"
        checked={
          Boolean(dueTime) &&
          Boolean(reminderEnabled)
        }
        disabled={!dueTime}
        onChange={(event) =>
          setReminderEnabled(
            event.target.checked
          )
        }
      />

      <span>
        {dueTime
          ? "Remind me about this task"
          : "Choose a due time to enable a reminder"}
      </span>
    </label>
  </div>

  {dueTime && reminderEnabled && (
    <label className="event-form-field">
      <span>Reminder time</span>

      <select
        value={reminderMinutes}
        onChange={(event) =>
          setReminderMinutes(
            event.target.value
          )
        }
      >
        <option value="0">
          At task time
        </option>
        <option value="5">
          5 minutes before
        </option>
        <option value="10">
          10 minutes before
        </option>
        <option value="15">
          15 minutes before
        </option>
        <option value="30">
          30 minutes before
        </option>
        <option value="60">
          1 hour before
        </option>
        <option value="120">
          2 hours before
        </option>
        <option value="1440">
          1 day before
        </option>
      </select>
    </label>
  )}

  <label className="event-form-field">
    <span>Priority</span>

    <select
      value={priority}
      onChange={(event) =>
        setPriority(event.target.value)
      }
    >
      <option value="low">Low</option>
      <option value="normal">
        Normal
      </option>
      <option value="high">High</option>
      <option value="urgent">
        Urgent
      </option>
    </select>
  </label>

  <div className="event-field">
  <label>Stars</label>

  <div className="task-star-picker">
    {[0, 1, 2, 3, 5, 10].map(
      (value) => (
        <button
          key={value}
          type="button"
          className={`task-star-option ${
            starValue === value
              ? "active"
              : ""
          }`}
          onClick={() =>
            setStarValue(value)
          }
        >
          {value === 0
            ? "None"
            : `${value} ⭐`}
        </button>
      )
    )}
  </div>

  <small className="task-star-help">
    Each assigned family member earns
    this many stars when they complete it.
  </small>
</div>

  {editMode !== "occurrence" && (
    <>
      <div className="event-form-field event-form-full">
        <span>Repeat</span>

        <label className="task-repeat-toggle">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(event) =>
              setIsRecurring(
                event.target.checked
              )
            }
          />

          <span>Repeat this task</span>
        </label>
      </div>

      {isRecurring && (
        <>
          <label className="event-form-field">
            <span>Repeat</span>

            <select
              value={recurrenceRule}
              onChange={(event) =>
                setRecurrenceRule(
                  event.target.value
                )
              }
            >
              <option value="daily">
                Every day
              </option>

              <option value="weekly">
                Every week
              </option>

              <option value="monthly">
                Every month
              </option>
            </select>
          </label>

          <label className="event-form-field">
            <span>Repeat until</span>

            <input
              type="date"
              value={recurrenceEndDate}
              min={dueDate || undefined}
              onChange={(event) =>
                setRecurrenceEndDate(
                  event.target.value
                )
              }
            />

            <small className="task-repeat-hint">
              Leave blank to keep repeating.
            </small>
          </label>
        </>
      )}
    </>
  )}

  <label className="event-form-field event-form-full">
    <span>Notes</span>

    <textarea
      value={description}
      onChange={(event) =>
        setDescription(event.target.value)
      }
      placeholder="Optional notes"
      rows={4}
    />
  </label>

  {error && (
    <div className="event-form-error event-form-full">
      {error}
    </div>
  )}

  <div className="event-modal-actions event-form-full">
    <div>
      {isEditing && (
        <button
          type="button"
          className="event-delete-button"
          onClick={handleDelete}
          disabled={saving}
        >
          <Trash2 size={18} />
          Delete
        </button>
      )}
    </div>

    <div className="event-modal-action-right">
      <button
        type="button"
        className="event-cancel-button"
        onClick={onClose}
        disabled={saving}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="event-save-button"
        disabled={saving}
      >
        {saving
          ? "Saving..."
          : isEditing
            ? "Save Changes"
            : "Add Task"}
      </button>
    </div>
  </div>
</form>
      </motion.div>

      {showDeleteConfirm && (
        <div
          className="modal-backdrop reward-delete-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowDeleteConfirm(false);
            }
          }}
        >
          <div className="reward-delete-confirm-modal">
            <div className="reward-delete-confirm-icon">
              <Trash2 size={24} />
            </div>

            <div className="reward-delete-confirm-copy">
              <span>Delete Task</span>

              <h2>
                {task.title}
              </h2>

              <p>
                {editMode === "occurrence"
                  ? "Delete only this occurrence?"
                  : editMode === "future"
                    ? "Delete this occurrence and all future occurrences?"
                    : task.is_recurring
                      ? "Delete this entire recurring task series?"
                      : "Are you sure you want to delete this task?"}
              </p>
            </div>

            <div className="reward-delete-confirm-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowDeleteConfirm(false)
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="reward-delete-confirm-button"
                onClick={confirmDelete}
                disabled={saving}
              >
                {saving
                  ? "Deleting..."
                  : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default TaskModal;
