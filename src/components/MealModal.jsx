import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

function MealModal({
  isOpen,
  meal,
  members,
  todayKey,
  onClose,
  onSaved,
}) {
  const [title, setTitle] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const [mealDate, setMealDate] = useState(todayKey);
  const [mealType, setMealType] = useState("dinner");
  const [description, setDescription] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (meal) {
      setTitle(meal.title || "");

      setMemberIds(
        (meal.members || []).map(
          (member) => member.id
        )
      );

      setMealDate(
        meal.meal_date || todayKey
      );

      setMealType(
        meal.meal_type || "dinner"
      );

      setDescription(
        meal.description || ""
      );

      setRecipeUrl(
        meal.recipe_url || ""
      );
    } else {
      setTitle("");

      setMemberIds(
        members.map(
          (member) => member.id
        )
      );

      setMealDate(todayKey);
      setMealType("dinner");
      setDescription("");
      setRecipeUrl("");
    }

    setSaving(false);
    setError("");
  }, [
    isOpen,
    meal,
    members,
    todayKey,
  ]);

  if (!isOpen) {
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

    if (!title.trim()) {
      setError(
        "Please enter a meal name."
      );
      return;
    }

    if (!mealDate) {
      setError(
        "Please select a date."
      );
      return;
    }

    if (memberIds.length === 0) {
      setError(
        "Please select at least one family member."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        meal
          ? `${API_BASE_URL}/api/meals/${meal.id}`
          : `${API_BASE_URL}/api/meals`,
        {
          method: meal
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: title.trim(),
            mealDate,
            mealType,

            description:
              description.trim() || null,

            recipeUrl:
              recipeUrl.trim() || null,

            memberIds,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save meal"
        );
      }

      onSaved?.(data.meal);
      onClose();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save meal"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!meal) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${meal.title}"?`
      );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/meals/${meal.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete meal"
        );
      }

      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete meal"
      );
    } finally {
      setSaving(false);
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
          onClose();
        }
      }}
    >
      <div
        className="event-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="event-modal-header">
          <div>
            <p className="section-kicker">
              Meals
            </p>

            <h2>
              {meal
                ? "Edit Meal"
                : "Add Meal"}
            </h2>
          </div>

          <button
            type="button"
            className="event-modal-close"
            onClick={onClose}
            disabled={saving}
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
            <span>Meal name</span>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="e.g. Spaghetti Bolognese"
              autoFocus
            />
          </label>

          <div className="event-form-field">
            <span>Family members</span>

            <div className="event-member-picker">
              {members.map((member) => {
                const selected =
                  memberIds.includes(
                    member.id
                  );

                return (
                  <button
                    type="button"
                    key={member.id}
                    className={`event-member-option ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleMember(
                        member.id
                      )
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

          <div className="event-form-grid">
            <label className="event-form-field">
              <span>Date</span>

              <input
                type="date"
                value={mealDate}
                onChange={(event) =>
                  setMealDate(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label className="event-form-field">
              <span>Meal type</span>

              <select
                value={mealType}
                onChange={(event) =>
                  setMealType(
                    event.target.value
                  )
                }
              >
                <option value="breakfast">
                  Breakfast
                </option>

                <option value="lunch">
                  Lunch
                </option>

                <option value="dinner">
                  Dinner
                </option>

                <option value="snack">
                  Snack
                </option>
              </select>
            </label>
          </div>

          <label className="event-form-field">
            <span>Notes</span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Optional notes"
              rows={4}
            />
          </label>

          <label className="event-form-field">
            <span>Recipe link</span>

            <input
              type="url"
              value={recipeUrl}
              onChange={(event) =>
                setRecipeUrl(
                  event.target.value
                )
              }
              placeholder="https://..."
            />
          </label>

          {error && (
            <div className="event-form-error">
              {error}
            </div>
          )}

          <div className="event-modal-actions">
            <div>
              {meal && (
                <button
                  type="button"
                  className="event-delete-button"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              )}
            </div>

            <div className="event-modal-action-right">
              <button
                type="button"
                className="event-cancel-button"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="event-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : meal
                    ? "Save Changes"
                    : "Add Meal"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MealModal;