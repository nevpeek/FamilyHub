import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:3001";

const pantryCategories = [
  "produce",
  "meat",
  "dairy",
  "bakery",
  "pantry",
  "frozen",
  "drinks",
  "household",
  "other",
];

export default function PantryItemModal({
  open,
  item = null,
  onClose,
  onSaved,
  onDeleted,
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] =
    useState("pantry");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] =
    useState(false);

    const [deleteConfirmOpen, setDeleteConfirmOpen] =
  useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(item?.name || "");
    setQuantity(item?.quantity || "");
    setCategory(
      item?.category || "pantry"
    );
    setNotes(item?.notes || "");
    setError("");
  }, [open, item]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Pantry item name is required"
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const isEditing =
        Boolean(item?.id);

      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/pantry/${item.id}`
          : `${API_BASE_URL}/api/pantry`,
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
            isAvailable: 1,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save pantry item"
        );
      }

      onSaved?.(data.item);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save pantry item"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!item?.id) {
      return;
    }


    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pantry/${item.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete pantry item"
        );
      }

      onDeleted?.(item.id);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete pantry item"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="event-modal-backdrop"
      onClick={onClose}
    >
      <form
        className="pantry-item-modal"
        onSubmit={handleSubmit}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <p className="section-kicker">
          Pantry
        </p>

        <h2>
          {item
            ? "Edit Pantry Item"
            : "Add Pantry Item"}
        </h2>

        <label className="pantry-item-field">
          <span>Item</span>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            placeholder="e.g. Rice"
            autoFocus
          />
        </label>

        <label className="pantry-item-field">
          <span>Quantity</span>

          <input
            type="text"
            value={quantity}
            onChange={(event) =>
              setQuantity(
                event.target.value
              )
            }
            placeholder="e.g. 2 kg"
          />
        </label>

        <label className="pantry-item-field">
          <span>Category</span>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
          >
            {pantryCategories.map(
              (value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value
                    .charAt(0)
                    .toUpperCase() +
                    value.slice(1)}
                </option>
              )
            )}
          </select>
        </label>

        <label className="pantry-item-field">
          <span>Notes</span>

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value
              )
            }
            placeholder="Optional notes"
            rows={3}
          />
        </label>

        {error && (
          <div className="event-form-error">
            {error}
          </div>
        )}

        <div className="pantry-item-actions">
          {item?.id && (
            <button
              type="button"
              className="pantry-item-delete"
onClick={() =>
  setDeleteConfirmOpen(true)
}
              disabled={saving}
            >
              Delete
            </button>
          )}

          <button
            type="button"
            className="pantry-item-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="pantry-item-save"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : item
                ? "Save Changes"
                : "Add Item"}
          </button>
        </div>
      </form>

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
          <div
            className="reward-delete-confirm-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="reward-delete-confirm-copy">
              <span>Delete Pantry Item</span>

              <h2>{item?.name}</h2>

              <p>
                Are you sure you want to delete this pantry item?
              </p>

              <small>
                This item will be permanently removed from your pantry.
              </small>
            </div>

            <div className="reward-delete-confirm-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setDeleteConfirmOpen(false)
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="reward-delete-confirm-button"
                disabled={saving}
                onClick={async () => {
                  await handleDelete();
                  setDeleteConfirmOpen(false);
                }}
              >
                {saving
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