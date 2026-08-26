import { useEffect, useState } from "react";
import {
  Trash2,
  X,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

const colourOptions = [
  "#3B82F6",
  "#A855F7",
  "#EC4899",
  "#22C55E",
  "#F97316",
  "#EAB308",
  "#06B6D4",
  "#EF4444",
];

function FamilyMemberModal({
  open,
  member,
  onClose,
  onSaved,
  onDeleted,
}) {
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");
  const [colour, setColour] = useState("#3B82F6");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEditing = Boolean(member?.id);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open || !member) {
      return;
    }

    setName(member.name || "");
    setInitials(member.initials || "");
    setColour(member.colour || "#3B82F6");
    setSaving(false);
    setDeleting(false);
    setError("");
  }, [open, member]);

  if (!open || !member) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
  isEditing
    ? `${API_BASE_URL}/api/family/${member.id}`
    : `${API_BASE_URL}/api/family`,
  {
    method: isEditing
      ? "PATCH"
      : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.trim(),
      initials: initials.trim() || null,
      colour,
    }),
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update family member"
        );
      }

      onSaved?.(data.member);
      onClose?.();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update family member"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
  if (!member?.id) {
    return;
  }

  const confirmed = window.confirm(
    `Remove ${member.name} from FamilyHub?`
  );

  if (!confirmed) {
    return;
  }

  setDeleting(true);
  setError("");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/family/${member.id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to remove family member"
      );
    }

    onDeleted?.(member.id);
    onClose?.();
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to remove family member"
    );
  } finally {
    setDeleting(false);
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
          onClose?.();
        }
      }}
    >
      <div
        className="event-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="family-member-modal-title"
      >
        <div className="event-modal-header">
          <div>
            <p className="section-kicker">
              Family
            </p>

            <h2 id="family-member-modal-title">
  {isEditing
    ? "Edit Family Member"
    : "Add Family Member"}
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
          <label className="event-form-field">
            <span>Name</span>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              autoFocus
            />
          </label>

          <label className="event-form-field">
            <span>Initials</span>

            <input
              type="text"
              value={initials}
              maxLength={3}
              onChange={(event) =>
                setInitials(
                  event.target.value.toUpperCase()
                )
              }
              placeholder="e.g. N"
            />
          </label>

          <div className="event-form-field">
            <span>Colour</span>

            <div className="family-colour-options">
              {colourOptions.map(
                (colourOption) => (
                  <button
                    key={colourOption}
                    type="button"
                    className={`family-colour-option ${
                      colour === colourOption
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setColour(colourOption)
                    }
                    aria-label={`Select ${colourOption}`}
                  >
                    <span
                      style={{
                        backgroundColor:
                          colourOption,
                      }}
                    />
                  </button>
                )
              )}
            </div>
          </div>

          <div className="family-member-preview">
            <div
              className="settings-member-avatar"
              style={{
                backgroundColor: colour,
              }}
            >
              {initials ||
                name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>
                {name || "Family member"}
              </strong>

              <span>Preview</span>
            </div>
          </div>

          {error && (
            <div className="event-form-error">
              {error}
            </div>
          )}

          <div className="event-modal-actions">
            <div>
  {isEditing && (
    <button
      type="button"
      className="event-delete-button"
      onClick={handleDelete}
      disabled={saving || deleting}
    >
      <Trash2 size={18} />

      {deleting
        ? "Removing..."
        : "Remove Member"}
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
  : isEditing
    ? "Save Changes"
    : "Add Member"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FamilyMemberModal;