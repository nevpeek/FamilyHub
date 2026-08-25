import { useEffect, useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function AddEventModal({
  isOpen,
  onClose,
  members,
  initialDate,
  eventToEdit,
  onEventSaved,
  onEventDeleted,
}) {
  const defaultDate = useMemo(() => {
    return initialDate ? formatDateKey(initialDate) : formatDateKey(new Date());
  }, [initialDate]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(defaultDate);
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("other");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setDescription(eventToEdit.description || "");
      setStartDate(eventToEdit.start_date || defaultDate);
      setStartTime(eventToEdit.start_time || "09:00");
      setEndDate(eventToEdit.end_date || eventToEdit.start_date || defaultDate);
      setEndTime(eventToEdit.end_time || "10:00");
      setAllDay(Boolean(eventToEdit.all_day));
      setLocation(eventToEdit.location || "");
      setCategory(eventToEdit.category || "other");
      setSelectedMemberIds(
        (eventToEdit.members || []).map((member) => member.id)
      );
    } else {
      setTitle("");
      setDescription("");
      setStartDate(defaultDate);
      setStartTime("09:00");
      setEndDate(defaultDate);
      setEndTime("10:00");
      setAllDay(false);
      setLocation("");
      setCategory("other");
      setSelectedMemberIds([]);
    }

    setError("");
  }, [isOpen, eventToEdit, defaultDate]);

  if (!isOpen) {
    return null;
  }

  function toggleMember(memberId) {
    setSelectedMemberIds((current) => {
      if (current.includes(memberId)) {
        return current.filter((id) => id !== memberId);
      }

      return [...current, memberId];
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter an event title.");
      return;
    }

    if (selectedMemberIds.length === 0) {
      setError("Please select at least one family member.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        eventToEdit
          ? `${API_BASE_URL}/api/events/${eventToEdit.id}`
          : `${API_BASE_URL}/api/events`,
        {
          method: eventToEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            startDate,
            startTime: allDay ? null : startTime,
            endDate: endDate || startDate,
            endTime: allDay ? null : endTime,
            allDay,
            location: location.trim() || null,
            category,
            memberIds: selectedMemberIds,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save event");
      }

      onEventSaved?.(data.event);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save event");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!eventToEdit) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${eventToEdit.title}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/events/${eventToEdit.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete event");
      }

      onEventDeleted?.(eventToEdit.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete event");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="event-modal-backdrop">
      <div className="event-modal" role="dialog" aria-modal="true">
        <div className="event-modal-header">
          <div>
            <p className="section-kicker">Calendar</p>
            <h2>{eventToEdit ? "Edit Event" : "Add Event"}</h2>
          </div>

          <button
            type="button"
            className="event-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <form className="event-form" onSubmit={handleSubmit}>
          <label className="event-form-field">
            <span>Event title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Dentist appointment"
              autoFocus
            />
          </label>

          <div className="event-form-field">
            <span>Family members</span>

            <div className="event-member-options">
              {members.map((member) => {
                const selected = selectedMemberIds.includes(member.id);

                return (
                  <button
                    type="button"
                    key={member.id}
                    className={`event-member-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => toggleMember(member.id)}
                  >
                    <span
                      className="event-member-option-dot"
                      style={{ backgroundColor: member.colour }}
                    />
                    {member.name}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="event-all-day">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(event) => setAllDay(event.target.checked)}
            />
            <span>All-day event</span>
          </label>

          <div className="event-form-grid">
            <label className="event-form-field">
              <span>Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);

                  if (endDate < event.target.value) {
                    setEndDate(event.target.value);
                  }
                }}
              />
            </label>

            {!allDay && (
              <label className="event-form-field">
                <span>Start time</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                />
              </label>
            )}

            <label className="event-form-field">
              <span>End date</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>

            {!allDay && (
              <label className="event-form-field">
                <span>End time</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                />
              </label>
            )}
          </div>

          <div className="event-form-grid">
            <label className="event-form-field">
              <span>Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="other">Other</option>
                <option value="school">School</option>
                <option value="sport">Sport</option>
                <option value="work">Work</option>
                <option value="medical">Medical</option>
                <option value="birthday">Birthday</option>
                <option value="appointment">Appointment</option>
                <option value="family">Family</option>
                <option value="holiday">Holiday</option>
              </select>
            </label>

            <label className="event-form-field">
              <span>Location</span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Optional"
              />
            </label>
          </div>

          <label className="event-form-field">
            <span>Notes</span>
            <textarea
              rows="4"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional notes"
            />
          </label>

          {error && <p className="event-form-error">{error}</p>}

          <div className="event-form-actions">
            {eventToEdit && (
              <button
                type="button"
                className="event-delete-button"
                onClick={handleDelete}
                disabled={saving || deleting}
              >
                <Trash2 size={18} />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}

            <div className="event-form-actions-right">
              <button
                type="button"
                className="event-secondary-button"
                onClick={onClose}
                disabled={saving || deleting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="add-event-button"
                disabled={saving || deleting}
              >
                {saving
                  ? "Saving..."
                  : eventToEdit
                    ? "Save Changes"
                    : "Save Event"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEventModal;