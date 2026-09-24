import { API_BASE_URL } from "../config/api";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

function formatDateKey(value) {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function AddEventModal({
  isOpen,
  onClose,
  members,
  initialDate,
  initialTime,
  initialAllDay = false,
  eventToEdit,
  occurrenceEditMode = false,
  futureEditMode = false,
  onEventSaved,
  onEventDeleted,
}) {
  const reduceMotion = useReducedMotion();
  const defaultDate = useMemo(() => {
    return initialDate
      ? formatDateKey(initialDate)
      : formatDateKey(new Date());
  }, [initialDate]);

const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [notes, setNotes] = useState("");
const [startDate, setStartDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(defaultDate);
  const [endTime, setEndTime] = useState("10:00");
const [allDay, setAllDay] = useState(false);
const [location, setLocation] = useState("");
const [address, setAddress] = useState("");
const [weatherLat, setWeatherLat] = useState(null);
const [weatherLon, setWeatherLon] = useState(null);
const [eventUrl, setEventUrl] = useState("");
const [category, setCategory] = useState("other");

const [reminderEnabled, setReminderEnabled] =
  useState(false);

const [reminderMinutes, setReminderMinutes] =
  useState("15");

const [showAsCountdown, setShowAsCountdown] =
  useState(false);
  const [linkedCountdownId, setLinkedCountdownId] =
  useState(null);

  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [recurrenceEndType, setRecurrenceEndType] =
    useState("never");
  const [recurrenceEndDate, setRecurrenceEndDate] =
    useState("");
  const [recurrenceCount, setRecurrenceCount] =
    useState("");

  const [selectedMemberIds, setSelectedMemberIds] =
    useState([]);

const [saving, setSaving] = useState(false);
const [deleting, setDeleting] = useState(false);
const [deleteConfirmOpen, setDeleteConfirmOpen] =
  useState(false);
const [error, setError] = useState("");
const [nearbyEvents, setNearbyEvents] = useState([]);

  useEffect(() => {
    if (!isOpen || !startDate || !endDate) return;

    const controller = new AbortController();
    const params = new URLSearchParams({
      start: startDate,
      end: endDate || startDate,
    });

    fetch(`${API_BASE_URL}/api/events?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => response.ok ? response.json() : { events: [] })
      .then((data) => setNearbyEvents(data.events || []))
      .catch((err) => {
        if (err.name !== "AbortError") setNearbyEvents([]);
      });

    return () => controller.abort();
  }, [isOpen, startDate, endDate]);

  const conflictingEvents = useMemo(() => {
    if (
      allDay ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      selectedMemberIds.length === 0
    ) {
      return [];
    }

    const proposedStart = new Date(`${startDate}T${startTime}:00`);
    const proposedEnd = new Date(`${endDate}T${endTime}:00`);
    if (proposedEnd <= proposedStart) return [];

    return nearbyEvents.filter((existing) => {
      if (existing.all_day) return false;

      const existingId = existing.series_event_id || existing.id;
      const editedId = eventToEdit?.series_event_id || eventToEdit?.id;
      if (editedId && String(existingId) === String(editedId)) return false;

      const existingMemberIds = (existing.members || []).map((member) => String(member.id));
      const sharesMember = existingMemberIds.length === 0 || selectedMemberIds.some(
        (memberId) => existingMemberIds.includes(String(memberId))
      );
      if (!sharesMember || !existing.start_time) return false;

      const existingStart = new Date(`${existing.start_date}T${existing.start_time}:00`);
      const existingEnd = new Date(
        `${existing.end_date || existing.start_date}T${existing.end_time || existing.start_time}:00`
      );

      return proposedStart < existingEnd && proposedEnd > existingStart;
    });
  }, [
    allDay,
    startDate,
    endDate,
    startTime,
    endTime,
    selectedMemberIds,
    nearbyEvents,
    eventToEdit,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (eventToEdit) {
setTitle(eventToEdit.title || "");
setDescription(eventToEdit.description || "");
setNotes(eventToEdit.notes || eventToEdit.description || "");

setStartDate(
        eventToEdit.start_date || defaultDate
      );

      setStartTime(
        eventToEdit.start_time || "09:00"
      );

      setEndDate(
        eventToEdit.end_date ||
          eventToEdit.start_date ||
          defaultDate
      );

      setEndTime(
        eventToEdit.end_time || "10:00"
      );

setAllDay(Boolean(eventToEdit.all_day));
setLocation(eventToEdit.location || "");
setAddress(eventToEdit.address || "");

setWeatherLat(
  eventToEdit.weather_lat ?? null
);

setWeatherLon(
  eventToEdit.weather_lon ?? null
);

setEventUrl(eventToEdit.url || "");
setCategory(eventToEdit.category || "other");

setReminderEnabled(
  Boolean(eventToEdit.reminder_enabled)
);

setReminderMinutes(
  eventToEdit.reminder_minutes !== null &&
  eventToEdit.reminder_minutes !== undefined
    ? String(eventToEdit.reminder_minutes)
    : "15"
);

setShowAsCountdown(
  Boolean(eventToEdit.show_as_countdown)
);

      setRecurrenceRule(
        eventToEdit.recurrence_rule || ""
      );

      if (eventToEdit.recurrence_count) {
        setRecurrenceEndType("count");
        setRecurrenceCount(
          String(eventToEdit.recurrence_count)
        );
        setRecurrenceEndDate("");
      } else if (eventToEdit.recurrence_end_date) {
        setRecurrenceEndType("date");
        setRecurrenceEndDate(
          eventToEdit.recurrence_end_date
        );
        setRecurrenceCount("");
      } else {
        setRecurrenceEndType("never");
        setRecurrenceEndDate("");
        setRecurrenceCount("");
      }

      setSelectedMemberIds(
        (eventToEdit.members || []).map(
          (member) => member.id
        )
      );
} else {
setTitle("");
setDescription("");
setNotes("");
setStartDate(defaultDate);

  const newStartTime =
    initialTime || "09:00";

  const [hours, minutes] =
    newStartTime.split(":").map(Number);

  const endTimeDate = new Date();

  endTimeDate.setHours(
    hours,
    minutes + 60,
    0,
    0
  );

  const newEndTime = `${String(
    endTimeDate.getHours()
  ).padStart(2, "0")}:${String(
    endTimeDate.getMinutes()
  ).padStart(2, "0")}`;

  setStartTime(newStartTime);
  setEndDate(defaultDate);
  setEndTime(newEndTime);
setAllDay(initialAllDay);
setLocation("");
setAddress("");
setWeatherLat(null);
setWeatherLon(null);
setEventUrl("");
setCategory("other");
setReminderEnabled(false);
setReminderMinutes("15");
setShowAsCountdown(false);

      setRecurrenceRule("");
      setRecurrenceEndType("never");
      setRecurrenceEndDate("");
      setRecurrenceCount("");

      setSelectedMemberIds([]);
    }

    setError("");
  }, [
    isOpen,
    eventToEdit,
    defaultDate,
    occurrenceEditMode,
    initialAllDay,
    initialTime,
  ]);

useEffect(() => {
  if (!isOpen) {
    return;
  }

  if (
    !eventToEdit ||
    occurrenceEditMode ||
    futureEditMode
  ) {
    setLinkedCountdownId(null);

    if (!eventToEdit) {
      setShowAsCountdown(false);
    }

    return;
  }

  let cancelled = false;

  async function loadLinkedCountdown() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/countdowns`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load countdowns"
        );
      }

      if (cancelled) {
        return;
      }

      const linkedCountdown = (
        data.countdowns || []
      ).find(
        (countdown) =>
          Number(countdown.event_id) ===
          Number(eventToEdit.id)
      );

      if (linkedCountdown) {
        setLinkedCountdownId(
          linkedCountdown.id
        );
        setShowAsCountdown(true);
      } else {
        setLinkedCountdownId(null);
        setShowAsCountdown(false);
      }
    } catch (err) {
      console.error(
        "Unable to check event countdown:",
        err
      );

      if (!cancelled) {
        setLinkedCountdownId(null);
      }
    }
  }

  loadLinkedCountdown();

  return () => {
    cancelled = true;
  };
}, [
  isOpen,
  eventToEdit,
  occurrenceEditMode,
  futureEditMode,
]);  

  if (!isOpen) {
    return null;
  }

  function toggleMember(memberId) {
    setSelectedMemberIds((current) => {
      if (current.includes(memberId)) {
        return current.filter(
          (id) => id !== memberId
        );
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
      setError(
        "Please select at least one family member."
      );
      return;
    }

    if (
      !allDay &&
      startDate === endDate &&
      startTime &&
      endTime &&
      endTime <= startTime
    ) {
      setError(
        "End time must be later than start time."
      );
      return;
    }

    if (
      recurrenceRule &&
      recurrenceEndType === "date" &&
      !recurrenceEndDate
    ) {
      setError(
        "Please select when the recurring event ends."
      );
      return;
    }

    if (
      recurrenceRule &&
      recurrenceEndType === "count" &&
      (!recurrenceCount ||
        Number(recurrenceCount) < 1)
    ) {
      setError(
        "Please enter the number of occurrences."
      );
      return;
    }

    setSaving(true);

    let resolvedWeatherLat = weatherLat;
let resolvedWeatherLon = weatherLon;

const weatherLocationQuery =
  address.trim() || location.trim();

if (weatherLocationQuery) {
  try {
    const geocodeResponse = await fetch(
      `${API_BASE_URL}/api/weather/geocode?query=${encodeURIComponent(
        weatherLocationQuery
      )}`
    );

    if (geocodeResponse.ok) {
      const geocodeData =
        await geocodeResponse.json();

      const firstResult =
        geocodeData.results?.[0];

      if (firstResult) {
        resolvedWeatherLat =
          firstResult.latitude;

        resolvedWeatherLon =
          firstResult.longitude;

        setWeatherLat(
          firstResult.latitude
        );

        setWeatherLon(
          firstResult.longitude
        );
      }
    }
  } catch (err) {
    console.error(
      "Unable to geocode event location:",
      err
    );
  }
}

    try {
      let url = `${API_BASE_URL}/api/events`;
      let method = "POST";

if ((occurrenceEditMode || futureEditMode) && eventToEdit) {
  const seriesEventId =
    eventToEdit.series_event_id ||
    eventToEdit.series_id ||
    eventToEdit.id;

  const occurrenceDate =
    eventToEdit.occurrence_date ||
    eventToEdit.recurrence_parent_date ||
    eventToEdit.start_date;

  url =
    `${API_BASE_URL}/api/events/` +
    `${seriesEventId}/occurrences/` +
    `${occurrenceDate}` +
    `${futureEditMode ? "/future" : ""}`;

  method = "PUT";
} else if (eventToEdit) {
  url = `${API_BASE_URL}/api/events/${eventToEdit.id}`;
  method = "PUT";
}

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
title: title.trim(),

description:
  description.trim() || null,

notes:
  notes.trim() || null,

startDate,
          startTime:
            allDay ? null : startTime,

          endDate:
            endDate || startDate,

          endTime:
            allDay ? null : endTime,

          allDay,

location:
  location.trim() || null,

address:
  address.trim() || null,

weatherLat:
  resolvedWeatherLat,

weatherLon:
  resolvedWeatherLon,

url:
  eventUrl.trim() || null,

category,

reminderEnabled:
  !allDay && reminderEnabled,

reminderMinutes:
  !allDay && reminderEnabled
    ? Number(reminderMinutes)
    : null,

recurrenceRule:
  occurrenceEditMode || futureEditMode
    ? null
    : recurrenceRule || null,

recurrenceEndDate:
  occurrenceEditMode || futureEditMode
    ? null
    : recurrenceRule &&
        recurrenceEndType === "date"
      ? recurrenceEndDate || null
      : null,

recurrenceCount:
  occurrenceEditMode || futureEditMode
    ? null
    : recurrenceRule &&
        recurrenceEndType === "count"
      ? Number(recurrenceCount) || null
      : null,

          memberIds: selectedMemberIds,
        }),
      });

      const data = await response.json();

if (!response.ok) {
  throw new Error(
    data.error || "Failed to save event"
  );
}

const savedEvent = data.event;

if (
  showAsCountdown &&
  savedEvent?.id &&
  !occurrenceEditMode &&
  !futureEditMode
) {
  const countdownResponse = await fetch(
linkedCountdownId
  ? `${API_BASE_URL}/api/countdowns/${linkedCountdownId}`
  : `${API_BASE_URL}/api/countdowns`,
    {
      method: linkedCountdownId
        ? "PUT"
        : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        targetDate: startDate,
        targetTime: allDay
          ? null
          : startTime,
        description:
          notes.trim() ||
          description.trim() ||
          null,
        category,
        colour: null,
        eventId: savedEvent.id,
        familyMemberId: null,
        isAutomatic: false,
        isActive: true,
      }),
    }
  );

  const countdownData =
    await countdownResponse.json();

  if (!countdownResponse.ok) {
    throw new Error(
      countdownData.error ||
        "Event saved, but countdown could not be saved"
    );
  }
}

onEventSaved?.(savedEvent);
onClose();

if (
  !showAsCountdown &&
  linkedCountdownId &&
  !occurrenceEditMode &&
  !futureEditMode
) {
  const countdownResponse = await fetch(
    `${API_BASE_URL}/api/countdowns/${linkedCountdownId}`,
    {
      method: "DELETE",
    }
  );

  const countdownData =
    await countdownResponse.json();

  if (!countdownResponse.ok) {
    throw new Error(
      countdownData.error ||
        "Event saved, but countdown could not be removed"
    );
  }

  setLinkedCountdownId(null);
}

    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to save event"
      );
    } finally {
      setSaving(false);
    }
  }

async function handleDelete() {
  if (!eventToEdit || occurrenceEditMode || futureEditMode) {
    return;
  }

  setDeleteConfirmOpen(true);
}

async function confirmDelete() {
  if (!eventToEdit || occurrenceEditMode || futureEditMode) {
    return;
  }

  setDeleting(true);
  setError("");

  try {
    if (linkedCountdownId) {
      const countdownResponse = await fetch(
        `${API_BASE_URL}/api/countdowns/${linkedCountdownId}`,
        {
          method: "DELETE",
        }
      );

      if (!countdownResponse.ok) {
        const countdownData =
          await countdownResponse
            .json()
            .catch(() => ({}));

        throw new Error(
          countdownData.error ||
            "Unable to delete linked countdown"
        );
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/api/events/${eventToEdit.id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to delete event"
      );
    }

    setDeleteConfirmOpen(false);

    onEventDeleted?.(eventToEdit.id);

    onClose();
  } catch (err) {
    console.error(err);

    setError(
      err.message || "Unable to delete event"
    );

    setDeleteConfirmOpen(false);
  } finally {
    setDeleting(false);
  }
}

  return (
    <motion.div
      className="event-modal-backdrop"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
    >
      <motion.div
        className="event-modal fh-dialog"
        role="dialog"
        aria-modal="true"
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
              Calendar
            </p>

            <h2>
              {occurrenceEditMode
  ? "Edit This Occurrence"
  : futureEditMode
    ? "Edit This and Future Events"
    : eventToEdit
      ? "Edit Event"
      : "Add Event"}
            </h2>
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

        <form
          className="event-form"
          onSubmit={handleSubmit}
        >
          <label className="event-form-field">
            <span>Event title</span>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Dentist appointment"
              autoFocus
            />
          </label>

          <div className="event-form-field">
            <span>Family members</span>

            <div className="event-member-options">
              {members.map((member) => {
                const selected =
                  selectedMemberIds.includes(
                    member.id
                  );

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

          <label className="event-all-day">
<input
  type="checkbox"
  checked={allDay}
  onChange={(event) => {
    const checked = event.target.checked;

    setAllDay(checked);

    if (checked) {
      setReminderEnabled(false);
    }
  }}
/>

            <span>All-day event</span>
          </label>

          <label className="event-all-day">
  <input
    type="checkbox"
    checked={showAsCountdown}
    onChange={(event) =>
      setShowAsCountdown(
        event.target.checked
      )
    }
  />

  <span>Show as countdown</span>
</label>

<label className="event-all-day">
  <input
    type="checkbox"
    checked={reminderEnabled}
    onChange={(event) =>
      setReminderEnabled(
        event.target.checked
      )
    }
    disabled={allDay}
  />

  <span>
    {allDay
      ? "Reminder unavailable for all-day events"
      : "Remind me"}
  </span>
</label>

{reminderEnabled && !allDay && (
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
      <option value="0">At event time</option>
      <option value="5">5 minutes before</option>
      <option value="10">10 minutes before</option>
      <option value="15">15 minutes before</option>
      <option value="30">30 minutes before</option>
      <option value="60">1 hour before</option>
      <option value="120">2 hours before</option>
      <option value="1440">1 day before</option>
    </select>
  </label>
)}

          <div className="event-form-grid">
            <label className="event-form-field">
              <span>Start date</span>

              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  const newDate =
                    event.target.value;

                  setStartDate(newDate);

                  if (endDate < newDate) {
                    setEndDate(newDate);
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
                  onChange={(event) =>
                    setStartTime(
                      event.target.value
                    )
                  }
                />
              </label>
            )}

            <label className="event-form-field">
              <span>End date</span>

              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
              />
            </label>

            {!allDay && (
              <label className="event-form-field">
                <span>End time</span>

                <input
                  type="time"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(
                      event.target.value
                    )
                  }
                />
              </label>
            )}
          </div>

          {conflictingEvents.length > 0 && (
            <div className="event-conflict-warning" role="status">
              <AlertTriangle size={20} />
              <div>
                <strong>
                  {conflictingEvents.length === 1
                    ? "This overlaps another event"
                    : `This overlaps ${conflictingEvents.length} other events`}
                </strong>
                <span>
                  {conflictingEvents.slice(0, 2).map((conflict) => {
                    const names = (conflict.members || [])
                      .map((member) => member.name)
                      .filter(Boolean)
                      .join(", ");
                    return `${conflict.title}${names ? ` · ${names}` : ""}`;
                  }).join(" • ")}
                </span>
                <small>You can still save if this timing is intentional.</small>
              </div>
            </div>
          )}

          {!occurrenceEditMode && !futureEditMode && (
            <>
              <div className="event-form-grid">
                <label className="event-form-field">
                  <span>Repeat</span>

                  <select
                    value={recurrenceRule}
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      setRecurrenceRule(value);

                      if (!value) {
                        setRecurrenceEndType(
                          "never"
                        );
                        setRecurrenceEndDate("");
                        setRecurrenceCount("");
                      }
                    }}
                  >
                    <option value="">
                      Does not repeat
                    </option>
                    <option value="daily">
                      Daily
                    </option>
                    <option value="weekly">
                      Weekly
                    </option>
                    <option value="fortnightly">
                      Fortnightly
                    </option>
                    <option value="monthly">
                      Monthly
                    </option>
                    <option value="yearly">
                      Yearly
                    </option>
                  </select>
                </label>

                {recurrenceRule && (
                  <label className="event-form-field">
                    <span>Ends</span>

                    <select
                      value={recurrenceEndType}
                      onChange={(event) => {
                        setRecurrenceEndType(
                          event.target.value
                        );
                        setRecurrenceEndDate("");
                        setRecurrenceCount("");
                      }}
                    >
                      <option value="never">
                        Never
                      </option>
                      <option value="date">
                        On a date
                      </option>
                      <option value="count">
                        After occurrences
                      </option>
                    </select>
                  </label>
                )}
              </div>

              {recurrenceRule &&
                recurrenceEndType === "date" && (
                  <label className="event-form-field">
                    <span>Repeat until</span>

                    <input
                      type="date"
                      value={recurrenceEndDate}
                      min={startDate}
                      onChange={(event) =>
                        setRecurrenceEndDate(
                          event.target.value
                        )
                      }
                    />
                  </label>
                )}

              {recurrenceRule &&
                recurrenceEndType === "count" && (
                  <label className="event-form-field">
                    <span>
                      Number of occurrences
                    </span>

                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={recurrenceCount}
                      onChange={(event) =>
                        setRecurrenceCount(
                          event.target.value
                        )
                      }
                      placeholder="e.g. 10"
                    />
                  </label>
                )}
            </>
          )}

          <div className="event-form-grid">
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
                <option value="other">
                  Other
                </option>
                <option value="school">
                  School
                </option>
                <option value="sport">
                  Sport
                </option>
                <option value="work">
                  Work
                </option>
                <option value="medical">
                  Medical
                </option>
                <option value="birthday">
                  Birthday
                </option>
                <option value="appointment">
                  Appointment
                </option>
                <option value="family">
                  Family
                </option>
                <option value="holiday">
                  Holiday
                </option>
              </select>
            </label>

            <label className="event-form-field">
              <span>Location</span>

              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                placeholder="Optional"
              />
            </label>
          </div>

<label className="event-form-field">
  <span>Address</span>

  <input
    type="text"
    value={address}
    onChange={(event) =>
      setAddress(event.target.value)
    }
    placeholder="Optional street address"
  />
</label>

<label className="event-form-field">
  <span>Event link</span>

  <input
    type="url"
    value={eventUrl}
    onChange={(event) =>
      setEventUrl(event.target.value)
    }
    placeholder="https://example.com"
  />
</label>

<label className="event-form-field">
  <span>Notes</span>

  <textarea
    rows="4"
    value={notes}
    onChange={(event) =>
      setNotes(event.target.value)
    }
    placeholder="Optional notes"
  />
</label>

          {error && (
            <p className="event-form-error">
              {error}
            </p>
          )}

<div className="event-modal-actions event-form-full">
  <div>
    {eventToEdit && !occurrenceEditMode && !futureEditMode && (
      <button
        type="button"
        className="event-delete-button"
        onClick={handleDelete}
        disabled={saving || deleting}
      >
        <Trash2 size={18} />

        {deleting
          ? "Deleting..."
          : "Delete"}
      </button>
    )}
  </div>

  <div className="event-modal-action-right">
    <button
      type="button"
      className="event-cancel-button"
      onClick={onClose}
      disabled={saving || deleting}
    >
      Cancel
    </button>

    <button
      type="submit"
      className="event-save-button"
      disabled={saving || deleting}
    >
      {saving
  ? "Saving..."
  : occurrenceEditMode
    ? "Save This Occurrence"
    : futureEditMode
      ? "Save This and Future"
      : eventToEdit
        ? "Save Changes"
        : "Add Event"}
    </button>
  </div>
</div>
        </form>
      </motion.div>

      {deleteConfirmOpen && (
        <div className="modal-backdrop reward-delete-backdrop">
          <div className="reward-delete-confirm">
            <div className="reward-delete-confirm-copy">
              <h2>Delete event?</h2>

              <p>
                Are you sure you want to delete
                <strong> "{eventToEdit?.title}"</strong>?
              </p>

              <small>
                This cannot be undone.
              </small>
            </div>

            <div className="reward-delete-confirm-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setDeleteConfirmOpen(false)
                }
                disabled={deleting}
              >
                Cancel
              </button>

<button
  type="button"
  className="reward-delete-confirm-button"
  onClick={confirmDelete}
  disabled={deleting}
>
  {deleting
    ? "Deleting..."
    : "Delete Event"}
</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default AddEventModal;
