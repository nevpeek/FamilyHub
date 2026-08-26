import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

function ShoppingItemModal({
  open,
  item,
  members,
  onClose,
  onSaved,
  onDeleted,
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] =
    useState("other");
  const [notes, setNotes] = useState("");
  const [memberIds, setMemberIds] =
    useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] =
    useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(item?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(item?.name || "");
    setQuantity(item?.quantity || "");
    setCategory(item?.category || "other");
    setNotes(item?.notes || "");

    if (item) {
      setMemberIds(
        (item.members || []).map(
          (member) => member.id
        )
      );
    } else {
      setMemberIds(
        members.map((member) => member.id)
      );
    }

    setError("");
    setSaving(false);
    setDeleting(false);
  }, [open, item, members]);

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

    if (!name.trim()) {
      setError("Item name is required.");
      return;
    }

    if (memberIds.length === 0) {
      setError(
        "Select at least one family member."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/shopping/${item.id}`
          : `${API_BASE_URL}/api/shopping`,
        {
          method: isEditing
            ? "PUT"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            quantity:
              quantity.trim() || null,
            category,
            notes:
              notes.trim() || null,
            memberIds,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save shopping item"
        );
      }

      onSaved?.(data.item);
      onClose?.();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save shopping item"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!item?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${item.name}" from the shopping list?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shopping/${item.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete shopping item"
        );
      }

      onDeleted?.(item.id);
      onClose?.();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete shopping item"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="modal-card shopping-item-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shopping-modal-title"
      >
        <div className="modal-header">
          <div>
            <p className="section-kicker">
              Shopping
            </p>

            <h2 id="shopping-modal-title">
              {isEditing
                ? "Edit Item"
                : "Add Item"}
            </h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <form
          className="shopping-item-form"
          onSubmit={handleSubmit}
        >
          <div className="form-field">
            <label htmlFor="shopping-name">
              Item name
            </label>

            <div className="shopping-name-input">
              <ShoppingCart size={19} />

              <input
                id="shopping-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Milk"
                autoFocus
              />
            </div>
          </div>

          <div className="shopping-form-row">
            <div className="form-field">
              <label htmlFor="shopping-quantity">
                Quantity
              </label>

              <input
                id="shopping-quantity"
                type="text"
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    event.target.value
                  )
                }
                placeholder="e.g. 2 bottles"
              />
            </div>

            <div className="form-field">
              <label htmlFor="shopping-category">
                Category
              </label>

              <select
                id="shopping-category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
              >
                <option value="produce">
                  Produce
                </option>

                <option value="meat">
                  Meat
                </option>

                <option value="dairy">
                  Dairy
                </option>

                <option value="bakery">
                  Bakery
                </option>

                <option value="pantry">
                  Pantry
                </option>

                <option value="frozen">
                  Frozen
                </option>

                <option value="household">
                  Household
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Family members</label>

            <div className="modal-member-buttons">
              {members.map((member) => {
                const selected =
                  memberIds.includes(member.id);

                return (
                  <button
                    key={member.id}
                    type="button"
                    className={`modal-member-button ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleMember(member.id)
                    }
                  >
                    <span
                      className="modal-member-dot"
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

          <div className="form-field">
            <label htmlFor="shopping-notes">
              Notes
            </label>

            <textarea
              id="shopping-notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Optional notes"
              rows={4}
            />
          </div>

          {error && (
            <div className="modal-form-error">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <div>
              {isEditing && (
                <button
                  type="button"
                  className="modal-delete-button"
                  onClick={handleDelete}
                  disabled={
                    saving || deleting
                  }
                >
                  <Trash2 size={18} />

                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>
              )}
            </div>

            <div className="modal-footer-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={onClose}
                disabled={
                  saving || deleting
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="modal-save-button"
                disabled={
                  saving || deleting
                }
              >
                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Item"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShoppingItemModal;