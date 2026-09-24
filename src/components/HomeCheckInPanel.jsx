import {
  Check,
  HandHeart,
  LoaderCircle,
  MessageCircleHeart,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { API_BASE_URL } from "../config/api";
import { startAutoRefresh } from "../utils/startAutoRefresh";

const moodOptions = [
  { id: "great", emoji: "😄", label: "Great" },
  { id: "good", emoji: "🙂", label: "Good" },
  { id: "okay", emoji: "😐", label: "Okay" },
  { id: "hard", emoji: "😟", label: "Hard" },
];

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMood(moodId) {
  return moodOptions.find((mood) => mood.id === moodId);
}

function memberPhotoUrl(member) {
  if (!member?.photo_url) {
    return "";
  }

  return member.photo_url.startsWith("http")
    ? member.photo_url
    : `${API_BASE_URL}${member.photo_url}`;
}

export default function HomeCheckInPanel({ members = [], currentTime }) {
  const checkinDate = useMemo(
    () => getDateKey(currentTime || new Date()),
    [currentTime]
  );
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [mood, setMood] = useState("");
  const [needsHelp, setNeedsHelp] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMemberId, setSavedMemberId] = useState(null);

  const loadCheckins = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) {
      setLoading(true);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/family-checkins?date=${encodeURIComponent(checkinDate)}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load check-ins");
      }

      setCheckins(data.checkins || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Unable to load check-ins");
    } finally {
      if (!quiet) {
        setLoading(false);
      }
    }
  }, [checkinDate]);

  useEffect(() => {
    loadCheckins();

    return startAutoRefresh(() => loadCheckins({ quiet: true }));
  }, [loadCheckins]);

  const rows = members.map((member) => {
    const checkin = checkins.find(
      (item) => Number(item.family_member_id) === Number(member.id)
    );

    return {
      ...member,
      ...checkin,
      id: member.id,
      checkinId: checkin?.id || null,
    };
  });

  function openEditor(member) {
    setEditingMemberId(member.id);
    setMood(member.mood || "");
    setNeedsHelp(Boolean(member.needs_help));
    setNote(member.note || "");
    setError("");
  }

  function closeEditor() {
    setEditingMemberId(null);
    setMood("");
    setNeedsHelp(false);
    setNote("");
  }

  async function saveCheckin(event) {
    event.preventDefault();

    if (!mood || !editingMemberId) {
      setError("Choose how you are feeling first.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/family-checkins/${editingMemberId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: checkinDate,
            mood,
            needsHelp,
            note,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save check-in");
      }

      const memberId = editingMemberId;
      await loadCheckins({ quiet: true });
      closeEditor();
      setSavedMemberId(memberId);

      window.setTimeout(() => {
        setSavedMemberId((current) =>
          current === memberId ? null : current
        );
      }, 2600);
    } catch (saveError) {
      setError(saveError.message || "Unable to save check-in");
    } finally {
      setSaving(false);
    }
  }

  const editingMember = rows.find(
    (member) => member.id === editingMemberId
  );
  const checkedInCount = rows.filter((member) => member.mood).length;

  return (
    <article className="panel quick-panel home-checkin-panel">
      <div className="panel-heading home-checkin-heading">
        <div>
          <p className="section-kicker">Family check-in</p>
          <h3>How is everyone?</h3>
        </div>

        <span className="home-checkin-count">
          {checkedInCount}/{rows.length} today
        </span>
      </div>

      {loading ? (
        <div className="small-empty-state">
          <LoaderCircle className="home-checkin-spinner" size={22} />
          <span>Loading check-ins...</span>
        </div>
      ) : error && rows.length === 0 ? (
        <div className="small-empty-state">
          <MessageCircleHeart size={22} />
          <span>{error}</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="small-empty-state">
          <MessageCircleHeart size={22} />
          <span>Add family members to start checking in.</span>
        </div>
      ) : (
        <div className="home-checkin-list">
          {rows.map((member) => {
            const memberMood = getMood(member.mood);
            const photoUrl = memberPhotoUrl(member);

            return (
              <button
                key={member.id}
                type="button"
                className={`home-checkin-person${member.needs_help ? " needs-help" : ""}`}
                onClick={() => openEditor(member)}
                aria-label={`Check in for ${member.name}`}
              >
                <span
                  className="home-checkin-avatar"
                  style={{ backgroundColor: member.colour || "#64748b" }}
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="" />
                  ) : (
                    member.initials || member.name?.slice(0, 2).toUpperCase()
                  )}
                </span>

                <span className="home-checkin-person-copy">
                  <strong>{member.name}</strong>
                  <span>
                    {memberMood
                      ? member.needs_help
                        ? `${memberMood.label} · needs a hand`
                        : memberMood.label
                      : "Tap to check in"}
                  </span>
                </span>

                <span className="home-checkin-mood" aria-hidden="true">
                  {savedMemberId === member.id
                    ? <Check size={20} />
                    : memberMood?.emoji || "＋"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {editingMember && (
        <form className="home-checkin-editor" onSubmit={saveCheckin}>
          <div className="home-checkin-editor-heading">
            <div>
              <span>Checking in as</span>
              <strong>{editingMember.name}</strong>
            </div>

            <button type="button" onClick={closeEditor} aria-label="Close check-in">
              <X size={18} />
            </button>
          </div>

          <div className="home-checkin-moods" role="group" aria-label="How are you feeling?">
            {moodOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={mood === option.id ? "selected" : ""}
                onClick={() => setMood(option.id)}
                aria-pressed={mood === option.id}
              >
                <span>{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>

          <label className={`home-checkin-help${needsHelp ? " selected" : ""}`}>
            <input
              type="checkbox"
              checked={needsHelp}
              onChange={(event) => setNeedsHelp(event.target.checked)}
            />
            <HandHeart size={20} />
            <span>
              <strong>I could use a hand</strong>
              Let the family know to check in with me
            </span>
          </label>

          <label className="home-checkin-note">
            <span>Anything you want to share? <small>Optional</small></span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={160}
              rows={2}
              placeholder="A short note for the family"
            />
          </label>

          {error && <p className="home-checkin-error">{error}</p>}

          <button className="home-checkin-save" type="submit" disabled={saving || !mood}>
            {saving ? "Saving..." : "Save check-in"}
          </button>
        </form>
      )}
    </article>
  );
}
