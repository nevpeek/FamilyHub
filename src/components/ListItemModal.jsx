import { API_BASE_URL } from "../config/api";
import {
  useEffect,
  useState,
} from "react";

import {
  Trash2,
  X,
} from "lucide-react";

function ListItemModal({
  item,
  members = [],
  onClose,
  onSaved,
}) {
  const [title, setTitle] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [selectedMemberIds, setSelectedMemberIds] =
    useState([]);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

    const [deleteConfirmOpen, setDeleteConfirmOpen] =
  useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setTitle(item?.title || "");
    setNotes(item?.notes || "");

    setSelectedMemberIds(
      (item?.members || []).map(
        (member) =>
          Number(member.id)
      )
    );

    setError("");
  }, [item]);

  function toggleMember(memberId) {
    const numericId =
      Number(memberId);

    setSelectedMemberIds(
      (current) =>
        current.includes(numericId)
          ? current.filter(
              (id) =>
                id !== numericId
            )
          : [
              ...current,
              numericId,
            ]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle =
      title.trim();

    if (!cleanTitle) {
      setError(
        "Enter an item name."
      );

      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lists/items/${item.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: cleanTitle,
            notes:
              notes.trim() ||
              null,
            memberIds:
              selectedMemberIds,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update item"
        );
      }

      onSaved?.(data.list);
      onClose?.();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update item"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lists/items/${item.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete item"
        );
      }

      onSaved?.(data.list);
      onClose?.();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete item"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <div className="event-modal list-item-modal fh-dialog">
        <div className="event-modal-heading">
          <div>
            <p className="page-kicker">
              FAMILY LIST
            </p>

            <h2>
              Edit List Item
            </h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form
          className="event-form"
          onSubmit={handleSubmit}
        >
          <label className="form-field">
            <span>
              Item
            </span>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              autoFocus
            />
          </label>

          <label className="form-field">
            <span>
              Notes
            </span>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional notes"
              rows={4}
            />
          </label>

          <div className="form-field">
            <span>
              Family members
            </span>

            <div className="list-item-member-picker">
              {members.map(
                (member) => {
                  const memberId =
                    Number(
                      member.id
                    );

                  const selected =
                    selectedMemberIds.includes(
                      memberId
                    );

                  return (
                    <button
                      key={member.id}
                      type="button"
                      className={`list-item-member-option ${
                        selected
                          ? "selected"
                          : ""
                      }`}
                      style={{
                        "--member-colour":
                          member.colour ||
                          "#22c55e",
                      }}
                      onClick={() =>
                        toggleMember(
                          memberId
                        )
                      }
                    >
                      <span className="list-item-member-avatar">
                        {member.photo_url ? (
<img
  src={
    member.photo_url.startsWith("http")
      ? member.photo_url
      : `${API_BASE_URL}${member.photo_url}`
  }
  alt={member.name}
/>
                        ) : (
                          member.initials ||
                          member.name
                            ?.slice(
                              0,
                              1
                            )
                            .toUpperCase()
                        )}
                      </span>

                      <span>
                        {member.name}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="event-modal-actions list-item-modal-actions">
            <button
              type="button"
              className="list-item-delete-button"
onClick={() =>
  setDeleteConfirmOpen(true)
}
              disabled={
                saving ||
                deleting
              }
            >
              <Trash2 size={17} />

              {deleting
                ? "Deleting..."
                : "Delete Item"}
            </button>

            <div>
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
                disabled={
                  saving ||
                  deleting
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={
                  saving ||
                  deleting ||
                  !title.trim()
                }
              >
                {saving
                  ? "Saving..."
                  : "Save Item"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {deleteConfirmOpen && (
        <div
          className="modal-backdrop reward-delete-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteConfirmOpen(false);
            }
          }}
        >
          <div className="reward-delete-confirm-modal fh-dialog">
            <div className="reward-delete-confirm-icon">
              <Trash2 size={24} />
            </div>

            <div className="reward-delete-confirm-copy">
              <span>Delete Item</span>

              <h2>{item?.title}</h2>

              <p>
                Are you sure you want to delete this item?
              </p>

              <small>
                This item will be permanently removed from the list.
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
                disabled={deleting}
                onClick={async () => {
                  await handleDelete();
                  setDeleteConfirmOpen(false);
                }}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListItemModal;
