import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
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
  const reduceMotion = useReducedMotion();
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

  const [deleteConfirmOpen, setDeleteConfirmOpen] =
  useState(false);

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
<motion.div
  className="event-modal-backdrop"
  initial={reduceMotion ? false : { opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: reduceMotion ? 0 : 0.18 }}
  onMouseDown={(event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }}
>
  <motion.div
    className="event-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="shopping-modal-title"
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
  <label className="event-form-field event-form-full">
    <span>Item name</span>

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
  </label>

  <div className="event-form-grid event-form-full">
    <label className="event-form-field">
      <span>Quantity</span>

      <input
        id="shopping-quantity"
        type="text"
        value={quantity}
        onChange={(event) =>
          setQuantity(event.target.value)
        }
        placeholder="e.g. 2 bottles"
      />
    </label>

    <label className="event-form-field">
      <span>Category</span>

      <select
        id="shopping-category"
        value={category}
        onChange={(event) =>
          setCategory(event.target.value)
        }
      >
        <option value="produce">Produce</option>
        <option value="meat">Meat</option>
        <option value="dairy">Dairy</option>
        <option value="bakery">Bakery</option>
        <option value="pantry">Pantry</option>
        <option value="frozen">Frozen</option>
        <option value="household">Household</option>
        <option value="other">Other</option>
      </select>
    </label>
  </div>

  <div className="event-form-field event-form-full">
    <span>Family members</span>

    <div className="event-member-picker">
      {members.map((member) => {
        const selected =
          memberIds.includes(member.id);

        return (
          <button
            key={member.id}
            type="button"
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
                backgroundColor: member.colour,
              }}
            />

            {member.name}
          </button>
        );
      })}
    </div>
  </div>

  <label className="event-form-field event-form-full">
    <span>Notes</span>

    <textarea
      id="shopping-notes"
      value={notes}
      onChange={(event) =>
        setNotes(event.target.value)
      }
      placeholder="Optional notes"
      rows={4}
    />
  </label>

  {error && (
    <div className="event-form-error event-form-full">
      {error}
    </div>
  )}

  <div className="event-modal-actions event-form-full">
    <div>
      {isEditing && (
        <button
          type="button"
          className="event-delete-button"
onClick={() =>
  setDeleteConfirmOpen(true)
}
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
          : isEditing
            ? "Save Changes"
            : "Add Item"}
      </button>
    </div>
  </div>
</form>
            </motion.div>

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
          <div className="reward-delete-confirm-modal">
            <div className="reward-delete-confirm-icon">
              <Trash2 size={24} />
            </div>

            <div className="reward-delete-confirm-copy">
              <span>Delete Shopping Item</span>

              <h2>{item?.name}</h2>

              <p>
                Are you sure you want to delete this item?
              </p>

              <small>
                This will remove it from the Shopping list.
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
    </motion.div>
  );
}

export default ShoppingItemModal;