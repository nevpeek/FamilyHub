import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  CloudSun,
  Settings,
  Users,
} from "lucide-react";

import { API_BASE_URL } from "../config/api";

function SettingsPage({
  members,
  onEditMember,
  onAddMember,
  accentColour,
  setAccentColour,
  theme,
  setTheme,
}) {

  const [
  calendarSourceFormOpen,
  setCalendarSourceFormOpen,
] = useState(false);

const [
  editingCalendarSourceId,
  setEditingCalendarSourceId,
] = useState(null);

const [
  calendarSourceName,
  setCalendarSourceName,
] = useState("");

const [
  calendarSourceUrl,
  setCalendarSourceUrl,
] = useState("");

const [
  calendarSourceSyncInterval,
  setCalendarSourceSyncInterval,
] = useState(60);

const [
  calendarSourceSaving,
  setCalendarSourceSaving,
] = useState(false);

const [
  calendarSourceToDelete,
  setCalendarSourceToDelete,
] = useState(null);

const [
  calendarSourceDeleting,
  setCalendarSourceDeleting,
] = useState(false);

const [
  calendarSourceFormError,
  setCalendarSourceFormError,
] = useState("");

const [calendarSources, setCalendarSources] =
  useState([]);

const [calendarSourcesLoading, setCalendarSourcesLoading] =
  useState(true);

const [calendarSourcesError, setCalendarSourcesError] =
  useState("");

const [
  calendarSourceSyncingId,
  setCalendarSourceSyncingId,
] = useState(null);


const [
  googleCalendars,
  setGoogleCalendars,
] = useState([]);

const [
  googleCalendarsLoading,
  setGoogleCalendarsLoading,
] = useState(false);

const [
  googleCalendarPickerOpen,
  setGoogleCalendarPickerOpen,
] = useState(false);

const [
  googleCalendarError,
  setGoogleCalendarError,
] = useState("");

const [
  googleCalendarAddingId,
  setGoogleCalendarAddingId,
] = useState(null);

const [
  googleCalendarConnectionId,
  setGoogleCalendarConnectionId,
] = useState(null);

const [weatherSettings, setWeatherSettings] =
  useState(null);

  const [weatherSettingsLoading, setWeatherSettingsLoading] =
    useState(true);

  const [weatherSettingsError, setWeatherSettingsError] =
    useState("");

  const [weatherLocation, setWeatherLocation] =
    useState("");

  const [weatherSettingsSaving, setWeatherSettingsSaving] =
    useState(false);

  const [weatherSettingsSaved, setWeatherSettingsSaved] =
    useState(false);

    const [
  notificationPermission,
  setNotificationPermission,
] = useState(() => {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
});


    useEffect(() => {
  let cancelled = false;

  async function loadCalendarSources() {
    try {
      setCalendarSourcesLoading(true);
      setCalendarSourcesError("");

      const response = await fetch(
        `${API_BASE_URL}/api/calendar-sources`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load calendar sources"
        );
      }

      if (!cancelled) {
        setCalendarSources(
          Array.isArray(data) ? data : []
        );
      }
    } catch (error) {
      console.error(error);

      if (!cancelled) {
        setCalendarSourcesError(
          error.message ||
            "Unable to load calendar sources"
        );
      }
    } finally {
      if (!cancelled) {
        setCalendarSourcesLoading(false);
      }
    }
  }

  loadCalendarSources();

  return () => {
    cancelled = true;
  };
}, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWeatherSettings() {
      try {
        setWeatherSettingsLoading(true);
        setWeatherSettingsError("");

        const response = await fetch(
          `${API_BASE_URL}/api/weather/settings`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load weather settings"
          );
        }

        if (!cancelled) {
          setWeatherSettings(data);
          setWeatherLocation(
            data.locationName || ""
          );
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setWeatherSettingsError(
            error.message ||
              "Unable to load weather settings"
          );
        }
      } finally {
        if (!cancelled) {
          setWeatherSettingsLoading(false);
        }
      }
    }

    loadWeatherSettings();

    return () => {
      cancelled = true;
    };
  }, []);

    async function findWeatherLocation() {
    const query = weatherLocation.trim();

    if (!query) {
      setWeatherSettingsError(
        "Enter a suburb or city first"
      );
      return;
    }

    try {
      setWeatherSettingsSaving(true);
      setWeatherSettingsError("");
      setWeatherSettingsSaved(false);

      const response = await fetch(
        `${API_BASE_URL}/api/weather/geocode?query=${encodeURIComponent(
          query
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to find location"
        );
      }

      if (
        !Array.isArray(data.results) ||
        data.results.length === 0
      ) {
        throw new Error(
          "No matching location was found"
        );
      }

      const location = data.results[0];

      setWeatherSettings((current) => ({
        ...current,
        locationName: [
          location.name,
          location.state,
        ]
          .filter(Boolean)
          .join(", "),
        latitude: location.latitude,
        longitude: location.longitude,
        timezone:
          location.timezone ||
          current?.timezone ||
          "Australia/Adelaide",
      }));

      setWeatherLocation(
        [location.name, location.state]
          .filter(Boolean)
          .join(", ")
      );
    } catch (error) {
      console.error(error);

      setWeatherSettingsError(
        error.message ||
          "Unable to find location"
      );
    } finally {
      setWeatherSettingsSaving(false);
    }
  }

  async function saveWeatherSettings() {
    if (
      !weatherSettings?.locationName ||
      weatherSettings?.latitude == null ||
      weatherSettings?.longitude == null
    ) {
      setWeatherSettingsError(
        "Find a valid location before saving"
      );
      return;
    }

    try {
      setWeatherSettingsSaving(true);
      setWeatherSettingsError("");
      setWeatherSettingsSaved(false);

      const response = await fetch(
        `${API_BASE_URL}/api/weather/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locationName:
              weatherSettings.locationName,
            latitude:
              weatherSettings.latitude,
            longitude:
              weatherSettings.longitude,
            timezone:
              weatherSettings.timezone ||
              "Australia/Adelaide",
            warningsEnabled:
              weatherSettings.warningsEnabled ??
              true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save weather settings"
        );
      }

      setWeatherSettings(data);
      setWeatherLocation(
        data.locationName || ""
      );
      setWeatherSettingsSaved(true);
    } catch (error) {
      console.error(error);

      setWeatherSettingsError(
        error.message ||
          "Unable to save weather settings"
      );
    } finally {
      setWeatherSettingsSaving(false);
    }
  }

async function deleteCalendarSource(source) {
  try {
    setCalendarSourceDeleting(true);
    setCalendarSourcesError("");

    const response = await fetch(
      `${API_BASE_URL}/api/calendar-sources/${source.id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to delete calendar source"
      );
    }

    setCalendarSources((current) =>
      current.filter(
        (item) => item.id !== source.id
      )
    );

    if (
      editingCalendarSourceId === source.id
    ) {
      setEditingCalendarSourceId(null);
      setCalendarSourceFormOpen(false);
      setCalendarSourceName("");
      setCalendarSourceUrl("");
      setCalendarSourceFormError("");
    }

    setCalendarSourceToDelete(null);
  } catch (error) {
    console.error(error);

    setCalendarSourcesError(
      error.message ||
        "Unable to delete calendar source"
    );
  } finally {
    setCalendarSourceDeleting(false);
  }
}



  function editCalendarSource(source) {
  setEditingCalendarSourceId(source.id);

  setCalendarSourceName(
    source.name || ""
  );

setCalendarSourceUrl(
  source.sourceUrl || ""
);

setCalendarSourceSyncInterval(
  source.syncIntervalMinutes ?? 60
);

setCalendarSourceFormError("");
setCalendarSourceFormOpen(true);
}

async function toggleCalendarSource(source) {
  try {
    setCalendarSourcesError("");

    const response = await fetch(
      `${API_BASE_URL}/api/calendar-sources/${source.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isEnabled: !source.isEnabled,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to update calendar source"
      );
    }

    setCalendarSources((current) =>
      current.map((item) =>
        item.id === data.id ? data : item
      )
    );
  } catch (error) {
    console.error(error);

    setCalendarSourcesError(
      error.message ||
        "Unable to update calendar source"
    );
  }
}

async function updateCalendarSyncInterval(
  source,
  syncIntervalMinutes
) {
  try {
    setCalendarSourcesError("");

    const response = await fetch(
      `${API_BASE_URL}/api/calendar-sources/${source.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          syncIntervalMinutes:
            Number(syncIntervalMinutes),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to update sync interval"
      );
    }

    setCalendarSources((current) =>
      current.map((item) =>
        item.id === data.id ? data : item
      )
    );
  } catch (error) {
    console.error(error);

    setCalendarSourcesError(
      error.message ||
        "Unable to update sync interval"
    );
  }
}

async function syncCalendarSource(source) {
  try {
    setCalendarSourceSyncingId(source.id);
    setCalendarSourcesError("");

    const response = await fetch(
      `${API_BASE_URL}/api/calendar-sources/${source.id}/sync`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

if (!response.ok) {
  const sourcesResponse = await fetch(
    `${API_BASE_URL}/api/calendar-sources`
  );

  const sourcesData =
    await sourcesResponse.json();

  if (sourcesResponse.ok) {
    setCalendarSources(
      Array.isArray(sourcesData)
        ? sourcesData
        : []
    );
  }

  throw new Error(
    data.error ||
      "Unable to sync calendar source"
  );
}

const sourcesResponse = await fetch(
      `${API_BASE_URL}/api/calendar-sources`
    );

    const sourcesData =
      await sourcesResponse.json();

    if (!sourcesResponse.ok) {
      throw new Error(
        sourcesData.error ||
          "Calendar synced, but source status could not be refreshed"
      );
    }

    setCalendarSources(
      Array.isArray(sourcesData)
        ? sourcesData
        : []
    );
  } catch (error) {
    console.error(error);

// The source itself now contains the saved
// failed sync status and error from the backend.
  } finally {
    setCalendarSourceSyncingId(null);
  }
}

async function loadGoogleCalendars() {
  try {
    setGoogleCalendarsLoading(true);
    setGoogleCalendarError("");

    const response = await fetch(
      `${API_BASE_URL}/api/calendar-sources/google/calendars`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to load Google calendars"
      );
    }

    setGoogleCalendarConnectionId(
      data.connectionId ?? null
    );

    setGoogleCalendars(
      Array.isArray(data.calendars)
        ? data.calendars
        : []
    );

    setGoogleCalendarPickerOpen(true);
  } catch (error) {
    console.error(error);

    setGoogleCalendarError(
      error.message ||
        "Unable to load Google calendars"
    );

    setGoogleCalendars([]);
    setGoogleCalendarConnectionId(null);
  } finally {
    setGoogleCalendarsLoading(false);
  }
}

async function addGoogleCalendar(calendar) {
  try {
    setGoogleCalendarAddingId(calendar.id);
    setGoogleCalendarError("");

    const response = await fetch(
      `${API_BASE_URL}/api/calendar-sources/google/sources`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          googleConnectionId:
            googleCalendarConnectionId,
          providerCalendarId: calendar.id,
          name: calendar.name,
          colour: calendar.colour || null,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to add Google calendar"
      );
    }

    const sourcesResponse = await fetch(
      `${API_BASE_URL}/api/calendar-sources`
    );

    const sourcesData =
      await sourcesResponse.json();

    if (sourcesResponse.ok) {
      setCalendarSources(
        Array.isArray(sourcesData)
          ? sourcesData
          : []
      );
    }
  } catch (error) {
    console.error(error);

    setGoogleCalendarError(
      error.message ||
        "Unable to add Google calendar"
    );
  } finally {
    setGoogleCalendarAddingId(null);
  }
}

async function connectGoogleCalendar() {
  try {
    setGoogleCalendarError("");

    const response = await fetch(
      `${API_BASE_URL}/api/calendar-sources/google/connect`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to start Google Calendar connection"
      );
    }

    if (!data.authUrl) {
      throw new Error(
        "Google Calendar authorization URL was not returned"
      );
    }

    window.location.href = data.authUrl;
  } catch (error) {
    console.error(error);

    setGoogleCalendarError(
      error.message ||
        "Unable to connect Google Calendar"
    );
  }
}

async function addCalendarSource() {
  const name = calendarSourceName.trim();
  const sourceUrl = calendarSourceUrl.trim();

  if (!name) {
    setCalendarSourceFormError(
      "Calendar name is required"
    );
    return;
  }

  if (!sourceUrl) {
    setCalendarSourceFormError(
      "ICS calendar URL is required"
    );
    return;
  }

  try {
    setCalendarSourceSaving(true);
    setCalendarSourceFormError("");

    const isEditing =
      editingCalendarSourceId !== null;

    const existingSource = isEditing
      ? calendarSources.find(
          (source) =>
            source.id === editingCalendarSourceId
        )
      : null;

    const response = await fetch(
      isEditing
        ? `${API_BASE_URL}/api/calendar-sources/${editingCalendarSourceId}`
        : `${API_BASE_URL}/api/calendar-sources`,
      {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          sourceType: "ics",
          sourceUrl,
          colour:
            existingSource?.colour ?? null,
          isEnabled:
            existingSource?.isEnabled ?? true,
syncIntervalMinutes:
  calendarSourceSyncInterval,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          (isEditing
            ? "Unable to update calendar source"
            : "Unable to add calendar source")
      );
    }

    if (isEditing) {
      setCalendarSources((current) =>
        current.map((source) =>
          source.id === data.id
            ? data
            : source
        )
      );
    } else {
      setCalendarSources((current) => [
        ...current,
        data,
      ]);
    }

    setCalendarSourceName("");
    setCalendarSourceUrl("");
    setEditingCalendarSourceId(null);
    setCalendarSourceFormOpen(false);
  } catch (error) {
    console.error(error);

    setCalendarSourceFormError(
      error.message ||
        "Unable to save calendar source"
    );
  } finally {
    setCalendarSourceSaving(false);
  }
}

  return (
    <div className="settings-page">
      <section className="calendar-page-heading">
        <div>
          <p className="section-kicker">
            Settings
          </p>

          <h2>FamilyHub Settings</h2>

          <p>
            Manage your family and FamilyHub
            preferences.
          </p>
        </div>
      </section>

      <section className="settings-section">
  <div className="settings-section-heading">
    <div className="settings-section-icon">
      <CalendarDays size={22} />
    </div>

<div className="settings-section-heading-copy">
  <div>
    <h3>Calendar Sources</h3>
    <p>
      Connect external calendars to FamilyHub.
    </p>
  </div>

<div className="settings-calendar-heading-actions">
  <button
    type="button"
    className="settings-calendar-add-button"
    onClick={connectGoogleCalendar}
  >
    Connect Google Account
  </button>

<button
  type="button"
  className="settings-calendar-add-button"
  onClick={() => {
    if (googleCalendarPickerOpen) {
      setGoogleCalendarPickerOpen(false);
    } else {
      loadGoogleCalendars();
    }
  }}
  disabled={googleCalendarsLoading}
>
  {googleCalendarsLoading
    ? "Loading..."
    : googleCalendarPickerOpen
      ? "Hide Google Calendars"
      : "Choose Google Calendars"}
</button>

  <button
    type="button"
    className="settings-calendar-add-button"
    onClick={() => {
      if (calendarSourceFormOpen) {
        setCalendarSourceFormOpen(false);
        setEditingCalendarSourceId(null);
        setCalendarSourceName("");
        setCalendarSourceUrl("");
        setCalendarSourceFormError("");
      } else {
        setCalendarSourceFormOpen(true);
        setCalendarSourceSyncInterval(60);
        setEditingCalendarSourceId(null);
        setCalendarSourceName("");
        setCalendarSourceUrl("");
        setCalendarSourceFormError("");
      }
    }}
  >
    {calendarSourceFormOpen
      ? "Cancel"
      : "Add Calendar Source"}
  </button>
</div>
</div>
</div>

{googleCalendarPickerOpen && (
  <div className="settings-calendar-source-form">
    <div className="settings-calendar-form-field">

<span>Google Calendars</span>

      {googleCalendarError ? (
        <div className="settings-calendar-form-error">
          {googleCalendarError}
        </div>
      ) : googleCalendars.length === 0 ? (
        <span>No Google calendars found.</span>
      ) : (
        <div className="settings-calendar-source-list">
          {googleCalendars.map((calendar) => (
<div
  key={calendar.id}
  className="settings-calendar-source-row"
>
  <div className="settings-calendar-source-copy">
    <strong>{calendar.name}</strong>

    <small>
      {calendar.primary
        ? "Primary calendar"
        : "Google Calendar"}
    </small>
  </div>

  <div className="settings-calendar-source-status">
<button
  type="button"
  className="settings-calendar-save-button"
  onClick={() =>
    addGoogleCalendar(calendar)
  }
  disabled={
    googleCalendarAddingId === calendar.id ||
    calendarSources.some(
      (source) =>
        source.sourceType === "google" &&
        source.providerCalendarId === calendar.id
    )
  }
>
  {googleCalendarAddingId === calendar.id
    ? "Adding..."
    : calendarSources.some(
        (source) =>
          source.sourceType === "google" &&
          source.providerCalendarId === calendar.id
      )
      ? "Added"
      : "Add"}
</button>
  </div>
</div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

{calendarSourceFormOpen && (
  <div className="settings-calendar-source-form">
    <div className="settings-calendar-form-field">
      <span>Calendar name</span>

<input
  type="text"
  value={calendarSourceName}
  aria-label="Calendar name"
  onChange={(event) =>
    setCalendarSourceName(event.target.value)
  }
  placeholder="e.g. School Calendar"
/>
    </div>

    <div className="settings-calendar-form-field">
      <span>Calendar type</span>

      <select defaultValue="ics" aria-label="Calendar type">
        <option value="ics">
          ICS Calendar
        </option>
      </select>
    </div>

    <div className="settings-calendar-form-field">
  <span>Sync interval</span>

  <select
    value={calendarSourceSyncInterval}
    aria-label="Sync interval"
    onChange={(event) =>
      setCalendarSourceSyncInterval(
        Number(event.target.value)
      )
    }
  >
    <option value={15}>Every 15 minutes</option>
    <option value={30}>Every 30 minutes</option>
    <option value={60}>Every hour</option>
    <option value={120}>Every 2 hours</option>
    <option value={360}>Every 6 hours</option>
    <option value={720}>Every 12 hours</option>
    <option value={1440}>Once a day</option>
  </select>
</div>

    <div className="settings-calendar-form-field">
      <span>ICS calendar URL</span>

<input
  type="url"
  value={calendarSourceUrl}
  aria-label="ICS calendar URL"
  onChange={(event) =>
    setCalendarSourceUrl(event.target.value)
  }
  placeholder="https://example.com/calendar.ics"
/>
    </div>

  {calendarSourceFormError && (
  <div className="settings-calendar-form-error">
    {calendarSourceFormError}
  </div>
)}  

    <div className="settings-calendar-form-actions">
<button
  type="button"
  className="settings-calendar-save-button"
  onClick={addCalendarSource}
  disabled={calendarSourceSaving}
>
{calendarSourceSaving
  ? editingCalendarSourceId
    ? "Saving..."
    : "Adding..."
  : editingCalendarSourceId
    ? "Save Changes"
    : "Add Calendar"}
</button>
    </div>
  </div>
)}

<div className="settings-appearance-block">
  {calendarSourcesLoading ? (
    <span>Loading calendar sources...</span>
  ) : calendarSourcesError ? (
    <span>{calendarSourcesError}</span>
  ) : calendarSources.length === 0 ? (
    <span>
      No external calendars connected yet.
    </span>
  ) : (
<div className="settings-calendar-source-list">
  {calendarSources.map((source) => (
    <div
      key={source.id}
      className="settings-calendar-source-row"
    >
      <div className="settings-calendar-source-copy">
        <strong>{source.name}</strong>

<span>
  {source.sourceType === "ics"
    ? "ICS Calendar"
    : source.sourceType}
</span>

<small>
  Sync:{" "}
  {source.syncIntervalMinutes === 15
    ? "Every 15 minutes"
    : source.syncIntervalMinutes === 30
      ? "Every 30 minutes"
      : source.syncIntervalMinutes === 60
        ? "Every hour"
        : source.syncIntervalMinutes === 120
          ? "Every 2 hours"
          : source.syncIntervalMinutes === 360
            ? "Every 6 hours"
            : source.syncIntervalMinutes === 720
              ? "Every 12 hours"
              : source.syncIntervalMinutes === 1440
                ? "Once a day"
                : `Every ${source.syncIntervalMinutes} minutes`}
</small>

{source.sourceUrl && (
  <small>{source.sourceUrl}</small>
)}

{source.lastSyncStatus && (
  <>
    <small>
      Last sync:{" "}
      {source.lastSyncStatus === "success"
        ? "Successful"
        : "Failed"}
      {source.lastSyncedAt
        ? ` • ${new Date(
            source.lastSyncedAt + "Z"
          ).toLocaleString()}`
        : ""}
    </small>

    {source.lastSyncStatus === "error" &&
      source.lastSyncError && (
        <small className="settings-calendar-source-error">
          {source.lastSyncError}
        </small>
      )}
  </>
)}
      </div>

<div className="settings-calendar-source-status">
  <span>
    {source.isEnabled
      ? "Enabled"
      : "Disabled"}
  </span>

  <label className="settings-calendar-source-toggle">
    <input
      type="checkbox"
      className="settings-toggle-input"
      checked={source.isEnabled}
      aria-label={`Enable ${source.name}`}
      onChange={() =>
        toggleCalendarSource(source)
      }
    />

    <span className="settings-toggle-switch">
      <span className="settings-toggle-knob" />
    </span>
  </label>

  {source.sourceType === "google" && (
  <select
    className="settings-calendar-source-interval"
    aria-label={`Sync interval for ${source.name}`}
    value={source.syncIntervalMinutes ?? 60}
    onChange={(event) =>
      updateCalendarSyncInterval(
        source,
        event.target.value
      )
    }
  >
    <option value={15}>
      Every 15 minutes
    </option>
    <option value={30}>
      Every 30 minutes
    </option>
    <option value={60}>
      Every hour
    </option>
    <option value={360}>
      Every 6 hours
    </option>
    <option value={720}>
      Every 12 hours
    </option>
    <option value={1440}>
      Once a day
    </option>
  </select>
)}

<button
  type="button"
  className="settings-calendar-source-sync-button"
  onClick={() =>
    syncCalendarSource(source)
  }
  disabled={
    calendarSourceSyncingId === source.id ||
    !source.isEnabled
  }
>
  {calendarSourceSyncingId === source.id
    ? "Syncing..."
    : "Sync Now"}
</button>

{source.sourceType === "ics" && (
  <button
    type="button"
    className="settings-calendar-source-edit-button"
    onClick={() =>
      editCalendarSource(source)
    }
  >
    Edit
  </button>
)}

<button
  type="button"
  className="settings-calendar-source-delete-button"
  onClick={() =>
    setCalendarSourceToDelete(source)
  }
>
  Delete
</button>

</div>
    </div>
  ))}
</div>
  )}
</div>
</section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">
            <Users size={22} />
          </div>

          <div>
            <div className="settings-family-heading-row">
  <div>
    <h3>Family Members</h3>
    <p>
      Manage the people who use
      FamilyHub.
    </p>
  </div>

  <button
    type="button"
    className="settings-add-member-button"
    onClick={onAddMember}
  >
    + Add Member
  </button>
</div>
          </div>
        </div>

        <div className="settings-member-list">
          {members.map((member) => (
            <button
  type="button"
  key={member.id}
  className="settings-member-card"
  onClick={() =>
    onEditMember?.(member)
  }
>
<div
  className="settings-member-avatar"
  style={{
    backgroundColor: member.colour,
  }}
>
  {member.photo_url ? (
    <img
      src={`${API_BASE_URL}${member.photo_url}`}
      alt={member.name}
      className="family-member-avatar-photo"
    />
  ) : (
    member.initials ||
    member.name.charAt(0)
  )}
</div>

              <div className="settings-member-details">
                <strong>{member.name}</strong>
                <span>Family member</span>
              </div>
            </button>
          ))}
        </div>
      </section>

            <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">
            <CloudSun size={22} />
          </div>

          <div>
            <h3>Weather</h3>
            <p>
              Set the household location used for
              FamilyHub weather forecasts.
            </p>
          </div>
        </div>

        <div className="settings-appearance-block">
          {weatherSettingsLoading ? (
            <span>Loading weather settings...</span>
          ) : weatherSettingsError ? (
            <span>{weatherSettingsError}</span>
          ) : (
            <div className="settings-weather-fields">
<div className="settings-weather-location-row">
  <label className="settings-weather-field">
    <span>Household location</span>

    <input
      type="text"
      value={weatherLocation}
      onChange={(event) => {
        setWeatherLocation(
          event.target.value
        );

        setWeatherSettingsSaved(false);
      }}
      placeholder="Enter suburb or city"
    />
  </label>

  <button
    type="button"
    className="settings-weather-find-button"
    onClick={findWeatherLocation}
    disabled={weatherSettingsSaving}
  >
    {weatherSettingsSaving
      ? "Finding..."
      : "Find Location"}
  </button>
</div>

<label className="settings-weather-warning-toggle">
  <div>
    <strong>Weather warnings</strong>

    <span>
      Show FamilyHub alerts for heavy rain,
      thunderstorms, extreme heat and cold.
    </span>
  </div>

  <input
    type="checkbox"
    className="settings-toggle-input"
    checked={
      weatherSettings?.warningsEnabled ?? true
    }
    onChange={(event) => {
      setWeatherSettings((current) => ({
        ...current,
        warningsEnabled: event.target.checked,
      }));

      setWeatherSettingsSaved(false);
    }}
  />

  <span className="settings-toggle-switch">
    <span className="settings-toggle-knob" />
  </span>
</label>

<div className="settings-weather-actions">
  <button
    type="button"
    className="settings-weather-save-button"
    onClick={saveWeatherSettings}
    disabled={weatherSettingsSaving}
  >
    {weatherSettingsSaving
      ? "Saving..."
      : "Save Weather Settings"}
  </button>

  {weatherSettingsSaved && (
    <span className="settings-weather-saved">
      Saved
    </span>
  )}
</div>

              <div className="settings-weather-coordinates">
                <span>
                  Current coordinates
                </span>

                <strong>
                  {weatherSettings?.latitude},{" "}
                  {weatherSettings?.longitude}
                </strong>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="settings-section">
  <div className="settings-section-heading">
    <div className="settings-section-icon">
      <Bell size={22} />
    </div>

    <div>
      <h3>Notifications</h3>
      <p>
        Allow FamilyHub to show browser notifications
        for event and task reminders.
      </p>
    </div>
  </div>

  <div className="settings-appearance-block">
    <div className="settings-appearance-copy">
      <strong>Browser notifications</strong>

      <span>
        {notificationPermission === "granted" &&
          "Notifications are allowed on this device."}

        {notificationPermission === "denied" &&
          "Notifications are blocked in this browser."}

        {notificationPermission === "default" &&
          "Permission has not been requested yet."}

        {notificationPermission === "unsupported" &&
          "This browser does not support notifications."}
      </span>
    </div>

    {notificationPermission === "default" && (
      <button
        type="button"
        className="settings-weather-save-button"
        onClick={async () => {
          const permission =
            await Notification.requestPermission();

          setNotificationPermission(permission);
        }}
      >
        Enable Notifications
      </button>
    )}
  </div>
</section>

<section className="settings-section">
  <div className="settings-section-heading">
    <div className="settings-section-icon">
      <Settings size={22} />
    </div>

    <div>
      <h3>Appearance</h3>
      <p>
        Choose the main colour used across
        FamilyHub.
      </p>
    </div>
  </div>

  <div className="settings-appearance-block">
    <div className="settings-appearance-copy">
      <strong>Accent Colour</strong>
      <span>
        Used for buttons, navigation and
        selected items.
      </span>
    </div>

    <div className="settings-colour-options">
      {[
        {
          name: "Blue",
          value: "#2563eb",
        },
        {
          name: "Purple",
          value: "#7c3aed",
        },
        {
          name: "Green",
          value: "#16a34a",
        },
        {
          name: "Orange",
          value: "#ea580c",
        },
        {
          name: "Pink",
          value: "#db2777",
        },
        {
          name: "Red",
          value: "#dc2626",
        },
      ].map((colour) => (
        <button
          key={colour.value}
          type="button"
          className={`settings-colour-button ${
            accentColour === colour.value
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setAccentColour(colour.value)
          }
          title={colour.name}
          aria-pressed={accentColour === colour.value}
        >
          <span
            style={{
              backgroundColor:
                colour.value,
            }}
          />

          {colour.name}
        </button>
      ))}
    </div>

<div className="settings-theme-divider" />

<div className="settings-appearance-copy">
  <strong>Theme</strong>
  <span>
    Choose how FamilyHub should appear.
  </span>
</div>

<div className="settings-theme-options">
  {[
    {
      id: "light",
      label: "Light",
      icon: "☀",
    },
    {
      id: "dark",
      label: "Dark",
      icon: "☾",
    },
    {
      id: "system",
      label: "System",
      icon: "◐",
    },
  ].map((option) => (
    <button
      key={option.id}
      type="button"
      className={`settings-theme-button ${
        theme === option.id
          ? "selected"
          : ""
      }`}
      onClick={() => setTheme(option.id)}
      aria-pressed={theme === option.id}
    >
      <span className="settings-theme-icon">
        {option.icon}
      </span>

      <span>
        <strong>{option.label}</strong>

        <small>
          {option.id === "light" &&
            "Always use light mode"}

          {option.id === "dark" &&
            "Always use dark mode"}

          {option.id === "system" &&
            "Match this device"}
        </small>
      </span>
    </button>
  ))}
</div>

  </div>
</section>

{calendarSourceToDelete && (
  <div className="settings-confirm-overlay">
    <div className="settings-confirm-modal">
      <h3>Delete Calendar Source?</h3>

      <p>
        Are you sure you want to delete{" "}
        <strong>
          {calendarSourceToDelete.name}
        </strong>
        ?
      </p>

      <div className="settings-confirm-actions">
        <button
          type="button"
          className="settings-confirm-cancel-button"
          onClick={() =>
            setCalendarSourceToDelete(null)
          }
          disabled={calendarSourceDeleting}
        >
          Cancel
        </button>

        <button
          type="button"
          className="settings-confirm-delete-button"
          onClick={() =>
            deleteCalendarSource(
              calendarSourceToDelete
            )
          }
          disabled={calendarSourceDeleting}
        >
          {calendarSourceDeleting
            ? "Deleting..."
            : "Delete"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default SettingsPage;
