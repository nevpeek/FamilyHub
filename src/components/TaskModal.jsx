import { useEffect, useState } from "react";
import {
  Trash2,
  X,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

function TaskModal({
  open,
  task,
  editMode,
  members,
  onClose,
  onSaved,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] =
    useState("normal");
  const [category, setCategory] =
    useState("chore");
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

const confirmed = window.confirm(
  editMode === "occurrence"
    ? `Delete only this occurrence of "${task.title}"?`
    : editMode === "future"
      ? `Delete this occurrence and all future occurrences of "${task.title}"?`
      : `Delete the entire "${task.title}" series?`
);

    if (!confirmed) {
      return;
    }

    setSaving(true);
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
    <div
      className="event-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="event-modal"
        role="dialog"
        aria-modal="true"
        aria-label={
          isEditing
            ? "Edit Task"
            : "Add Task"
        }
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
                setTitle(
                  event.target.value
                )
              }
              placeholder="e.g. Take bins out"
              autoFocus
            />
          </label>

          <div className="event-form-field event-form-full">
  <span>Family members</span>

  <div className="event-member-picker">
    {members.map((member) => {
      const selected =
        memberIds.includes(
          member.id
        );

      return (
        <button
          type="button"
          key={member.id}
          className={`event-member-option ${
            selected
              ? "selected"
              : ""
          }`}
          onClick={() =>
            toggleMember(
              member.id
            )
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

<label className="event-form-field">
  <span>Due date</span>

  <input
    type="date"
    value={dueDate}
    disabled={
  editMode === "occurrence" ||
  editMode === "future"
}
    onChange={(event) =>
      setDueDate(
        event.target.value
      )
    }
  />
</label>

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

        <span>
          Repeat this task
        </span>
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

          <label className="event-form-field">
            <span>Due time</span>

            <input
              type="time"
              value={dueTime}
              onChange={(event) =>
                setDueTime(
                  event.target.value
                )
              }
            />
          </label>

          <label className="event-form-field">
            <span>Priority</span>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value
                )
              }
            >
              <option value="low">
                Low
              </option>

              <option value="normal">
                Normal
              </option>

              <option value="high">
                High
              </option>

              <option value="urgent">
                Urgent
              </option>
            </select>
          </label>

          <label className="event-form-field">
            <span>Category</span>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
            >
              <option value="chore">
                Chore
              </option>

              <option value="school">
                School
              </option>

              <option value="work">
                Work
              </option>

              <option value="shopping">
                Shopping
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </label>

          <label className="event-form-field event-form-full">
            <span>Notes</span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
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
      </div>
    </div>
  );
}

export default TaskModal;