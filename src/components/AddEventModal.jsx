import { useMemo, useState } from "react";
import { X } from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

function AddEventModal({
  isOpen,
  onClose,
  members,
  initialDate,
  onEventCreated,
}) {
  const todayKey = useMemo(() => {
    const date = initialDate || new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, [initialDate]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(todayKey);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(todayKey);
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("other");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      onEventCreated?.(data.event);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to create event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="event-modal-backdrop">
      <div className="event-modal" role="dialog" aria-modal="true">
        <div className="event-modal-header">
          <div>
            <p className="section-kicker">Calendar</p>
            <h2>Add Event</h2>
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

          {error && (
            <p className="event-form-error">
              {error}
            </p>
          )}

          <div className="event-form-actions">
            <button
              type="button"
              className="event-secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-event-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEventModal;