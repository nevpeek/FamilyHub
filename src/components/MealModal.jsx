import { API_BASE_URL } from "../config/api";
import { startAutoRefresh } from "../utils/startAutoRefresh";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ExternalLink,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

function MealModal({
  isOpen,
  meal,
  members,
  todayKey,
  defaultMealDate,
  defaultMealType,
  defaultRecipe,
  onClose,
  onSaved,
}) {
  const reduceMotion = useReducedMotion();  
  const [title, setTitle] = useState("");
  const [memberIds, setMemberIds] = useState([]);
const [mealDate, setMealDate] = useState(todayKey);
const [mealType, setMealType] = useState("dinner");
const [mealTime, setMealTime] = useState("");
const [reminderEnabled, setReminderEnabled] = useState(false);
const [reminderMinutes, setReminderMinutes] = useState(30);
const [description, setDescription] = useState("");
const [recipeUrl, setRecipeUrl] = useState("");
const [ingredients, setIngredients] = useState("");
const [saving, setSaving] = useState(false);
const [addingToShopping, setAddingToShopping] =
  useState(false);

const [recipes, setRecipes] = useState([]);
const [selectedRecipeId, setSelectedRecipeId] =
  useState("");

const [error, setError] = useState("");

const [deleteConfirmOpen, setDeleteConfirmOpen] =
  useState(false);

const isPlanningRecipe =
  !meal && Boolean(defaultRecipe);

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

setMealTime(
  meal.meal_time || ""
);

setReminderEnabled(
  Boolean(meal.reminder_enabled)
);

setReminderMinutes(
  meal.reminder_minutes ?? 30
);

setDescription(
  meal.description || ""
);
      setRecipeUrl(
  meal.recipe_url || ""
);

setIngredients(
  meal.ingredients || ""
);
        } else {
      setMemberIds(
        members.map(
          (member) => member.id
        )
      );

      setMealDate(
        defaultMealDate || todayKey
      );

setMealType(
  defaultMealType || "dinner"
);

setMealTime("");

setReminderEnabled(false);
setReminderMinutes(30);

if (defaultRecipe) {
        setTitle(
          defaultRecipe.title || ""
        );

        setDescription(
          defaultRecipe.description || ""
        );

        setIngredients(
          defaultRecipe.ingredients || ""
        );

        setRecipeUrl(
          defaultRecipe.recipe_url || ""
        );

        setSelectedRecipeId(
          String(defaultRecipe.id)
        );
      } else {
        setTitle("");
        setDescription("");
        setRecipeUrl("");
        setIngredients("");
        setSelectedRecipeId("");
      }
    }
       if (meal?.recipe_id) {
      setSelectedRecipeId(
        String(meal.recipe_id)
      );
    } else if (defaultRecipe?.id) {
      setSelectedRecipeId(
        String(defaultRecipe.id)
      );
    } else {
      setSelectedRecipeId("");
    }

    setSaving(false);
    setError("");
  }, [
    isOpen,
    meal,
    todayKey,
    defaultMealDate,
    defaultMealType,
    defaultRecipe,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    let inFlight = false;
    const controller = new AbortController();

    async function loadRecipes() {
      if (cancelled || inFlight) return;

      inFlight = true;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/recipes`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load recipes"
          );
        }

        if (cancelled) return;

        setRecipes(data.recipes || []);
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;

        console.error("Meal recipe picker refresh error:", err);
      } finally {
        inFlight = false;
      }
    }

    loadRecipes();

    const stopAutoRefresh = startAutoRefresh(loadRecipes);

    return () => {
      cancelled = true;
      stopAutoRefresh();
      controller.abort();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

    const linkedRecipe =
    meal?.recipe_id
      ? recipes.find(
          (recipe) =>
            String(recipe.id) ===
            String(meal.recipe_id)
        )
      : null;

  function toggleMember(memberId) {
    setMemberIds((current) =>
      current.includes(memberId)
        ? current.filter(
            (id) => id !== memberId
          )
        : [...current, memberId]
    );
  }

    function handleRecipeChange(event) {
    const recipeId =
      event.target.value;

    setSelectedRecipeId(
      recipeId
    );

    if (!recipeId) {
      return;
    }

    const recipe =
      recipes.find(
        (item) =>
          String(item.id) ===
          String(recipeId)
      );

    if (!recipe) {
      return;
    }

    setTitle(
      recipe.title || ""
    );

    setDescription(
      recipe.description || ""
    );

    setIngredients(
      recipe.ingredients || ""
    );

    setRecipeUrl(
      recipe.recipe_url || ""
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

if (reminderEnabled && !mealTime) {
  setError(
    "Please select a meal time for the reminder."
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
mealTime:
  mealTime || null,
reminderEnabled,
reminderMinutes:
  reminderEnabled
    ? reminderMinutes
    : null,

description:
  description.trim() || null,

            recipeUrl:
  recipeUrl.trim() || null,

ingredients:
  ingredients.trim() || null,

recipeId:
  selectedRecipeId
    ? Number(selectedRecipeId)
    : null,

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

  async function handleAddIngredientsToShopping() {
  const ingredientItems = ingredients
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (ingredientItems.length === 0) {
    setError(
      "Add at least one ingredient first."
    );
    return;
  }

  if (memberIds.length === 0) {
    setError(
      "Select at least one family member."
    );
    return;
  }

  setAddingToShopping(true);
  setError("");

  try {
    for (const ingredient of ingredientItems) {
      const response = await fetch(
        `${API_BASE_URL}/api/shopping`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: ingredient,
            quantity: null,
            category: "other",
            notes:
              title.trim()
                ? `From meal: ${title.trim()}`
                : "Added from Meal Planner",
            memberIds,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Unable to add "${ingredient}"`
        );
      }
    }

    window.alert(
      `${ingredientItems.length} ingredient${
        ingredientItems.length === 1
          ? ""
          : "s"
      } added to the Shopping list.`
    );
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to add ingredients to the Shopping list"
    );
  } finally {
    setAddingToShopping(false);
  }
}

  async function handleDelete() {
    if (!meal) {
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
    <motion.div
      className="event-modal-backdrop"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="event-modal"
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
              Meals
            </p>

<h2>
  {meal
    ? "Edit Meal"
    : isPlanningRecipe
      ? "Plan This Meal"
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

          {isPlanningRecipe && (
  <div className="meal-plan-recipe-summary event-form-full">
    <span>Selected meal</span>
    <strong>{title}</strong>
  </div>
)}

                    {meal?.recipe_id && (
            <div className="meal-linked-recipe event-form-full">
              <div className="meal-linked-recipe-info">
                <span className="meal-linked-recipe-label">
                  Linked Recipe
                </span>

                <strong>
                  {linkedRecipe?.title ||
                    meal.title}
                </strong>
              </div>

              {(linkedRecipe?.recipe_url ||
                meal.recipe_url) && (
                <a
                  className="meal-linked-recipe-button"
                  href={
                    linkedRecipe?.recipe_url ||
                    meal.recipe_url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={16} />
                  View Recipe
                </a>
              )}
            </div>
          )}


{!meal && !isPlanningRecipe && (
            <div className="event-form-field event-form-full">
              <span>Saved Recipe</span>

              <select
                value={selectedRecipeId}
                onChange={
                  handleRecipeChange
                }
              >
                <option value="">
                  Start from scratch
                </option>

                {recipes.map(
                  (recipe) => (
                    <option
                      key={recipe.id}
                      value={recipe.id}
                    >
                      {recipe.title}
                    </option>
                  )
                )}
              </select>

              {recipes.length > 0 && (
                <small className="meal-recipe-hint">
                  Choose a saved recipe to fill in
                  the meal details automatically.
                </small>
              )}
            </div>
          )}

{!isPlanningRecipe && (
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
)}

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
    <span>Time</span>

    <input
      type="time"
      value={mealTime}
      onChange={(event) =>
        setMealTime(
          event.target.value
        )
      }
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

{mealTime && (
  <div className="event-form-grid">
    <label className="event-all-day">
      <input
        type="checkbox"
        checked={reminderEnabled}
        onChange={(event) =>
          setReminderEnabled(
            event.target.checked
          )
        }
      />

      <span>Remind me</span>
    </label>

    {reminderEnabled && (
      <label className="event-form-field">
        <span>Reminder</span>

        <select
          value={reminderMinutes}
          onChange={(event) =>
            setReminderMinutes(
              Number(event.target.value)
            )
          }
        >
          <option value={0}>
            At meal time
          </option>

          <option value={5}>
            5 minutes before
          </option>

          <option value={15}>
            15 minutes before
          </option>

          <option value={30}>
            30 minutes before
          </option>

          <option value={60}>
            1 hour before
          </option>

          <option value={120}>
            2 hours before
          </option>
        </select>
      </label>
    )}
  </div>
)}

{!isPlanningRecipe && (
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
)}

{!isPlanningRecipe && (
<div className="event-form-field event-form-full">
  <span>Ingredients</span>

  <textarea
    value={ingredients}
    onChange={(event) =>
      setIngredients(
        event.target.value
      )
    }
    placeholder={
      "One item per line\n500g mince\n1 onion\n2 carrots\nPasta sauce"
    }
    rows={6}
  />

  {ingredients.trim() && (
    <button
      type="button"
      className="meal-add-shopping-button"
      onClick={
        handleAddIngredientsToShopping
      }
      disabled={
        saving ||
        addingToShopping
      }
    >
      <ShoppingCart size={17} />

      {addingToShopping
        ? "Adding..."
        : "Add ingredients to Shopping List"}
    </button>
  )}
</div>
)}

{!isPlanningRecipe && (
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
)}

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
                  onClick={() =>
  setDeleteConfirmOpen(true)
}
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
    : isPlanningRecipe
      ? "Plan Meal"
      : "Add Meal"}
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
              <span>Delete Meal</span>

              <h2>{meal?.title}</h2>

              <p>
                Are you sure you want to delete this meal?
              </p>

              <small>
                This will remove it from the meal planner.
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
                  : "Delete Meal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default MealModal;
