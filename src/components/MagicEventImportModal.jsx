import { useState } from "react";
import {
  AlertTriangle,
  CalendarPlus,
  FileText,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { API_BASE_URL } from "../config/api";

const MONTHS = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  sept: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function validDateKey(year, month, day) {
  const date = new Date(year, month, day);
  return date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
      ? dateKey(year, month, day)
      : null;
}

function parseDate(text, referenceDate) {
  let match = text.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (match) {
    return {
      value: validDateKey(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      matched: match[0],
    };
  }

  match = text.match(/\b(\d{1,2})[/.](\d{1,2})[/.](20\d{2}|\d{2})\b/);
  if (match) {
    const year = Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3]);
    return {
      value: validDateKey(year, Number(match[2]) - 1, Number(match[1])),
      matched: match[0],
    };
  }

  match = text.match(
    /\b(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)?,?\s*(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(20\d{2}))?\b/i
  );

  if (match) {
    const month = MONTHS[match[2].toLowerCase()];
    let year = match[3] ? Number(match[3]) : referenceDate.getFullYear();
    let value = validDateKey(year, month, Number(match[1]));

    if (!match[3] && value && value < dateKey(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())) {
      year += 1;
      value = validDateKey(year, month, Number(match[1]));
    }

    return { value, matched: match[0] };
  }

  match = text.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(20\d{2}))?\b/i
  );

  if (match) {
    const month = MONTHS[match[1].toLowerCase()];
    const year = match[3] ? Number(match[3]) : referenceDate.getFullYear();
    return {
      value: validDateKey(year, month, Number(match[2])),
      matched: match[0],
    };
  }

  return { value: null, matched: "" };
}

function parseTimeValue(hoursValue, minutesValue, meridiem) {
  let hours = Number(hoursValue);
  const minutes = Number(minutesValue || 0);

  if (meridiem?.toLowerCase() === "pm" && hours < 12) hours += 12;
  if (meridiem?.toLowerCase() === "am" && hours === 12) hours = 0;

  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseTimes(text) {
  const matches = [...text.matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|\b([01]?\d|2[0-3]):([0-5]\d)\b/gi)];
  const values = matches
    .map((match) =>
      match[4]
        ? parseTimeValue(match[4], match[5], null)
        : parseTimeValue(match[1], match[2], match[3])
    )
    .filter(Boolean);

  return {
    startTime: values[0] || "",
    endTime: values[1] || "",
    matched: matches.map((match) => match[0]),
  };
}

function addOneHour(time) {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  return `${String((hours + 1) % 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseIcs(text) {
  const blocks = text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];

  return blocks.map((block, index) => {
    const summary = block.match(/^SUMMARY:(.*)$/im)?.[1]?.trim() || `Imported event ${index + 1}`;
    const location = block.match(/^LOCATION:(.*)$/im)?.[1]?.trim() || "";
    const start = block.match(/^DTSTART(?:;[^:]*)?:(\d{8})(?:T(\d{4,6}))?/im);
    const end = block.match(/^DTEND(?:;[^:]*)?:(\d{8})(?:T(\d{4,6}))?/im);
    const startDate = start ? `${start[1].slice(0, 4)}-${start[1].slice(4, 6)}-${start[1].slice(6, 8)}` : "";
    const startTime = start?.[2] ? `${start[2].slice(0, 2)}:${start[2].slice(2, 4)}` : "";
    const endDate = end ? `${end[1].slice(0, 4)}-${end[1].slice(4, 6)}-${end[1].slice(6, 8)}` : startDate;
    const endTime = end?.[2] ? `${end[2].slice(0, 2)}:${end[2].slice(2, 4)}` : "";

    return {
      id: `ics-${index}`,
      selected: true,
      title: summary.replace(/\\,/g, ","),
      startDate,
      endDate,
      startTime,
      endTime,
      allDay: !startTime,
      location: location.replace(/\\,/g, ","),
    };
  }).filter((event) => event.startDate);
}

function parseMagicImportText(text, referenceDate = new Date()) {
  if (/BEGIN:VEVENT/i.test(text)) return parseIcs(text);

  const rawBlocks = text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const candidates = rawBlocks.flatMap((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const datedLines = lines.filter((line) => parseDate(line, referenceDate).value);
    return datedLines.length > 1 ? datedLines : [block];
  });

  return candidates.map((block, index) => {
    const parsedDate = parseDate(block, referenceDate);
    if (!parsedDate.value) return null;

    const times = parseTimes(block);
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const explicitLocation = block.match(/(?:^|\n)\s*(?:location|where)\s*:\s*([^\n]+)/i)?.[1]?.trim();

    let title = lines.find((line) => {
      const withoutDate = line.replace(parsedDate.matched, "").trim();
      return withoutDate && !/^(?:date|time|when|location|where)\s*:/i.test(line);
    }) || "";

    title = title.replace(parsedDate.matched, "");
    times.matched.forEach((time) => {
      title = title.replace(time, "");
    });
    title = title
      .replace(/\b(?:on|from|until)\b/gi, " ")
      .replace(/\s+(?:at|@)\s+.*$/i, "")
      .replace(/^[\s,;:\-–—]+|[\s,;:\-–—]+$/g, "")
      .replace(/\s{2,}/g, " ");

    return {
      id: `text-${index}`,
      selected: true,
      title: title || `Imported event ${index + 1}`,
      startDate: parsedDate.value,
      endDate: parsedDate.value,
      startTime: times.startTime,
      endTime: times.endTime || addOneHour(times.startTime),
      allDay: !times.startTime,
      location: explicitLocation || "",
    };
  }).filter(Boolean);
}

export default function MagicEventImportModal({
  open,
  members,
  onClose,
  onImported,
}) {
  const [sourceText, setSourceText] = useState("");
  const [events, setEvents] = useState([]);
  const [existingEvents, setExistingEvents] = useState([]);
  const [memberIds, setMemberIds] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  function closeModal() {
    setSourceText("");
    setEvents([]);
    setExistingEvents([]);
    setMemberIds([]);
    setError("");
    setSaving(false);
    setImportedCount(0);
    onClose();
  }

  if (!open) return null;

  async function analyse() {
    const parsed = parseMagicImportText(sourceText);
    setEvents(parsed);
    setError(parsed.length ? "" : "No dated events were found. Include a date such as 25/09/2026 or 25 September 2026.");

    if (!parsed.length) {
      setExistingEvents([]);
      return;
    }

    const dates = parsed.map((event) => event.startDate).sort();
    const params = new URLSearchParams({ start: dates[0], end: dates[dates.length - 1] });

    try {
      const response = await fetch(`${API_BASE_URL}/api/events?${params.toString()}`, { cache: "no-store" });
      const data = response.ok ? await response.json() : { events: [] };
      setExistingEvents(data.events || []);
    } catch {
      setExistingEvents([]);
    }
  }

  function updateEvent(id, changes) {
    setEvents((current) =>
      current.map((event) => event.id === id ? { ...event, ...changes } : event)
    );
  }

  function conflictsFor(event) {
    if (event.allDay || !event.startTime || !event.endTime || memberIds.length === 0) return [];

    const proposedStart = new Date(`${event.startDate}T${event.startTime}:00`);
    const proposedEnd = new Date(`${event.endDate || event.startDate}T${event.endTime}:00`);

    return existingEvents.filter((existing) => {
      if (existing.all_day || !existing.start_time) return false;
      const assigned = (existing.members || []).map((member) => String(member.id));
      const sharesMember = assigned.length === 0 || memberIds.some((id) => assigned.includes(String(id)));
      if (!sharesMember) return false;

      const existingStart = new Date(`${existing.start_date}T${existing.start_time}:00`);
      const existingEnd = new Date(`${existing.end_date || existing.start_date}T${existing.end_time || existing.start_time}:00`);
      return proposedStart < existingEnd && proposedEnd > existingStart;
    });
  }

  async function importEvents() {
    const selected = events.filter((event) => event.selected);
    if (!selected.length) {
      setError("Select at least one event to import.");
      return;
    }

    if (selected.some((event) => !event.title.trim() || !event.startDate)) {
      setError("Every selected event needs a title and date.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let created = 0;

      for (const event of selected) {
        const response = await fetch(`${API_BASE_URL}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: event.title.trim(),
            startDate: event.startDate,
            endDate: event.endDate || event.startDate,
            startTime: event.allDay ? null : event.startTime || null,
            endTime: event.allDay ? null : event.endTime || null,
            allDay: event.allDay,
            location: event.location.trim() || null,
            category: "other",
            source: "familyhub-magic-import",
            memberIds,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Unable to import ${event.title}`);
        created += 1;
      }

      setImportedCount(created);
      onImported?.(created);
    } catch (err) {
      setError(err.message || "Unable to import these events.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="event-modal-backdrop magic-import-backdrop">
      <div className="magic-import-modal fh-dialog" role="dialog" aria-modal="true" aria-labelledby="magic-import-title">
        <div className="magic-import-header">
          <div>
            <p className="section-kicker"><Sparkles size={15} /> Magic Import</p>
            <h2 id="magic-import-title">Turn a notice into events</h2>
            <span>Nothing is added until you review and confirm it.</span>
          </div>
          <button type="button" className="event-modal-close" onClick={closeModal} aria-label="Close"><X size={21} /></button>
        </div>

        {importedCount > 0 ? (
          <div className="magic-import-success">
            <CalendarPlus size={38} />
            <h3>{importedCount} {importedCount === 1 ? "event" : "events"} added</h3>
            <p>The calendar has been refreshed with the imported schedule.</p>
            <button type="button" className="add-event-button" onClick={closeModal}>Done</button>
          </div>
        ) : (
          <>
            <div className="magic-import-source">
              <label>
                <span>Paste a notice, email, or schedule</span>
                <textarea
                  value={sourceText}
                  onChange={(event) => setSourceText(event.target.value)}
                  placeholder={"Soccer training — Tuesday 29 September 2026, 6:00 pm–7:00 pm\nLocation: Gawler Oval"}
                  autoFocus
                />
              </label>

              <div className="magic-import-source-actions">
                <label className="magic-import-file">
                  <Upload size={17} />
                  Load text, CSV, or ICS
                  <input
                    type="file"
                    accept=".txt,.csv,.ics,text/plain,text/calendar"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setSourceText(await file.text());
                      setEvents([]);
                      setError("");
                    }}
                  />
                </label>

                <button type="button" className="magic-import-analyse" onClick={analyse} disabled={!sourceText.trim()}>
                  <Sparkles size={17} /> Find events
                </button>
              </div>
            </div>

            {events.length > 0 && (
              <div className="magic-import-review">
                <div className="magic-import-review-heading">
                  <div><strong>Review detected events</strong><span>{events.filter((event) => event.selected).length} selected</span></div>
                  <div className="magic-import-members">
                    <span>Assign to</span>
                    {members.map((member) => (
                      <button
                        type="button"
                        key={member.id}
                        className={memberIds.includes(member.id) ? "selected" : ""}
                        onClick={() => setMemberIds((current) => current.includes(member.id) ? current.filter((id) => id !== member.id) : [...current, member.id])}
                        style={{ "--member-colour": member.colour }}
                      >
                        {member.initials || member.name.charAt(0)} {member.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="magic-import-list">
                  {events.map((event) => {
                    const conflicts = conflictsFor(event);

                    return (
                    <article key={event.id} className={`magic-import-event ${event.selected ? "selected" : ""}`}>
                      <input
                        type="checkbox"
                        checked={event.selected}
                        onChange={(changeEvent) => updateEvent(event.id, { selected: changeEvent.target.checked })}
                        aria-label={`Import ${event.title}`}
                      />
                      <div className="magic-import-event-fields">
                        <input value={event.title} onChange={(changeEvent) => updateEvent(event.id, { title: changeEvent.target.value })} aria-label="Event title" />
                        <div>
                          <input type="date" value={event.startDate} onChange={(changeEvent) => updateEvent(event.id, { startDate: changeEvent.target.value, endDate: changeEvent.target.value })} aria-label="Event date" />
                          <label className="magic-import-all-day"><input type="checkbox" checked={event.allDay} onChange={(changeEvent) => updateEvent(event.id, { allDay: changeEvent.target.checked })} />All day</label>
                          {!event.allDay && <><input type="time" value={event.startTime} onChange={(changeEvent) => updateEvent(event.id, { startTime: changeEvent.target.value })} aria-label="Start time" /><input type="time" value={event.endTime} onChange={(changeEvent) => updateEvent(event.id, { endTime: changeEvent.target.value })} aria-label="End time" /></>}
                        </div>
                        <input value={event.location} onChange={(changeEvent) => updateEvent(event.id, { location: changeEvent.target.value })} placeholder="Location (optional)" aria-label="Location" />
                        {conflicts.length > 0 && (
                          <div className="magic-import-conflict" role="status">
                            <AlertTriangle size={17} />
                            <span>
                              Overlaps {conflicts.map((conflict) => conflict.title).slice(0, 2).join(" and ")}.
                              Check the time before importing.
                            </span>
                          </div>
                        )}
                      </div>
                      <button type="button" className="magic-import-remove" onClick={() => setEvents((current) => current.filter((item) => item.id !== event.id))} aria-label={`Remove ${event.title}`}><Trash2 size={17} /></button>
                    </article>
                    );
                  })}
                </div>
              </div>
            )}

            {error && <p className="magic-import-error" role="alert">{error}</p>}

            <div className="magic-import-footer">
              <span><FileText size={16} /> Check names, dates, and times before importing.</span>
              <div>
                <button type="button" className="secondary-button" onClick={closeModal}>Cancel</button>
                <button type="button" className="add-event-button" onClick={importEvents} disabled={saving || !events.some((event) => event.selected)}>
                  <CalendarPlus size={18} />
                  {saving ? "Importing…" : `Import ${events.filter((event) => event.selected).length || ""} ${events.filter((event) => event.selected).length === 1 ? "Event" : "Events"}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
