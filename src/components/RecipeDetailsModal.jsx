import { API_BASE_URL } from "../config/api";
import { startAutoRefresh } from "../utils/startAutoRefresh";
import {
  CalendarPlus,
  Clock3,
  ExternalLink,
  Pencil,
  ShoppingCart,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

function RecipeDetailsModal({
  open,
  recipe,
  members,
  onClose,
  onEdit,
  onPlan,
}) {
  const [
    addingToShopping,
    setAddingToShopping,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    shoppingPickerOpen,
    setShoppingPickerOpen,
  ] = useState(false);

  const [
    selectedIngredients,
    setSelectedIngredients,
  ] = useState([]);

  const [
    pantryItems,
    setPantryItems,
  ] = useState([]);

  const [
    pantryLoading,
    setPantryLoading,
  ] = useState(false);

  const [
    shoppingSuccess,
    setShoppingSuccess,
  ] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let inFlight = false;
    const controller = new AbortController();

    setPantryLoading(true);

    async function loadPantry() {
      if (cancelled || inFlight) return;

      inFlight = true;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/pantry`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load pantry"
          );
        }

        if (cancelled) return;

        setPantryItems(
          (data.items || []).filter(
            (item) => item.is_available !== 0
          )
        );
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;

        console.error("Recipe pantry refresh error:", err);
      } finally {
        inFlight = false;

        if (!cancelled) {
          setPantryLoading(false);
        }
      }
    }

    loadPantry();

    const stopAutoRefresh = startAutoRefresh(loadPantry);

    return () => {
      cancelled = true;
      stopAutoRefresh();
      controller.abort();
    };
  }, [open]);

  if (!open || !recipe) {
    return null;
  }

  const ingredients =
    (recipe.ingredients || "")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

  const instructions =
    (recipe.instructions || "")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

  function normalizePantryName(value) {
    let normalized = String(
      value || ""
    )
      .trim()
      .toLowerCase();

    /*
     * Remove recipe quantities before
     * comparing with Pantry.
     *
     * Examples:
     *
     * 2 Garlic Cloves
     *   -> Garlic Cloves
     *
     * 750g Ground Lamb Mince
     *   -> Ground Lamb Mince
     *
     * 1 1/2 tbsp Olive Oil
     *   -> Olive Oil
     */
    normalized = normalized
      .replace(
        /^\s*\d+\s+\d+\s*\/\s*\d+\s*/i,
        ""
      )
      .replace(
        /^\s*\d+\s*\/\s*\d+\s*/i,
        ""
      )
      .replace(
        /^\s*\d+(?:\.\d+)?\s*/i,
        ""
      );

    /*
     * Remove a measurement unit left at
     * the beginning after the quantity.
     */
    normalized = normalized.replace(
      /^(?:kg|g|mg|l|ml|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds)\b\.?\s*/i,
      ""
    );

    /*
     * Normal Pantry-name cleanup.
     */
    normalized = normalized
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (
      normalized.endsWith("ies") &&
      normalized.length > 4
    ) {
      normalized =
        normalized.slice(0, -3) + "y";
    } else if (
      normalized.endsWith("es") &&
      normalized.length > 4
    ) {
      normalized =
        normalized.slice(0, -2);
    } else if (
      normalized.endsWith("s") &&
      !normalized.endsWith("ss") &&
      normalized.length > 3
    ) {
      normalized =
        normalized.slice(0, -1);
    }

    return normalized;
  }

  function ingredientMatchesPantry(
    ingredient
  ) {
    const ingredientName =
      normalizePantryName(
        ingredient
      );

    if (!ingredientName) {
      return false;
    }

    return pantryItems.some(
      (pantryItem) => {
        const pantryName =
          normalizePantryName(
            pantryItem.name
          );

        if (!pantryName) {
          return false;
        }

        return (
          ingredientName === pantryName ||
          ingredientName.includes(
            pantryName
          ) ||
          pantryName.includes(
            ingredientName
          )
        );
      }
    );
  }

  function openShoppingPicker() {
    const ingredientsNotInPantry =
      ingredients
        .map((ingredient, index) => ({
          ingredient,
          index,
        }))
        .filter(
          ({ ingredient }) =>
            !ingredientMatchesPantry(
              ingredient
            )
        )
        .map(({ index }) => index);

    setSelectedIngredients(
      ingredientsNotInPantry
    );

    setError("");
    setShoppingPickerOpen(true);
  }

  function toggleShoppingIngredient(index) {
    setSelectedIngredients(
      (current) =>
        current.includes(index)
          ? current.filter(
              (item) => item !== index
            )
          : [...current, index]
    );
  }

  async function handleAddToShopping() {
    const ingredientsToAdd =
      ingredients.filter(
        (_, index) =>
          selectedIngredients.includes(
            index
          )
      );

    if (ingredientsToAdd.length === 0) {
      return;
    }

    setAddingToShopping(true);
    setError("");

    try {
      const memberIds =
        members.map(
          (member) => member.id
        );

      for (
        const ingredient
        of ingredientsToAdd
      ) {
        const response =
          await fetch(
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
                  `From recipe: ${recipe.title}`,
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

      setShoppingPickerOpen(false);

      setShoppingSuccess(
        `${ingredientsToAdd.length} ingredient${
          ingredientsToAdd.length === 1
            ? ""
            : "s"
        } added to Shopping`
      );

      window.setTimeout(() => {
        setShoppingSuccess("");
      }, 3200);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to add ingredients"
      );
    } finally {
      setAddingToShopping(false);
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
        className="recipe-details-modal fh-dialog"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="recipe-details-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={21} />
        </button>

        {recipe.photo_url && (
          <div className="recipe-details-photo">
            <img
              src={`${API_BASE_URL}${recipe.photo_url}`}
              alt={recipe.title}
            />
          </div>
        )}

        <div className="recipe-details-content">
          <div className="recipe-details-heading">

<div>
  <h2>
    {recipe.title}
  </h2>

  {recipe.description && (
    <p>
      {recipe.description}
    </p>
  )}
</div>

            <button
              type="button"
              className="recipe-details-edit"
              onClick={() =>
                onEdit?.(recipe)
              }
            >
              <Pencil size={17} />
              Edit
            </button>
          </div>

                    {(recipe.prep_time != null ||
            recipe.cook_time != null ||
            recipe.servings != null ||
            recipe.category) && (
            <div className="recipe-details-meta">
              {recipe.prep_time != null && (
                <div className="recipe-details-meta-item">
                  <Clock3 size={18} />

                  <div>
                    <span>Prep</span>
                    <strong>
                      {recipe.prep_time} min
                    </strong>
                  </div>
                </div>
              )}

              {recipe.cook_time != null && (
                <div className="recipe-details-meta-item">
                  <Clock3 size={18} />

                  <div>
                    <span>Cook</span>
                    <strong>
                      {recipe.cook_time} min
                    </strong>
                  </div>
                </div>
              )}

              {recipe.servings != null && (
                <div className="recipe-details-meta-item">
                  <Users size={18} />

                  <div>
                    <span>Serves</span>
                    <strong>
                      {recipe.servings}
                    </strong>
                  </div>
                </div>
              )}

              {recipe.category && (
                <div className="recipe-details-meta-item">
                  <Tags size={18} />

                  <div>
                    <span>Category</span>
                    <strong>
                      {recipe.category
                        .replace("-", " ")
                        .replace(
                          /\b\w/g,
                          (letter) =>
                            letter.toUpperCase()
                        )}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          <section className="recipe-details-section">
            <div className="recipe-details-section-heading">
              <h3>Ingredients</h3>

              <span>
                {ingredients.length}{" "}
                {ingredients.length === 1
                  ? "ingredient"
                  : "ingredients"}
              </span>
            </div>

            {ingredients.length > 0 ? (
              <ul className="recipe-details-ingredients">
                {ingredients.map(
                  (
                    ingredient,
                    index
                  ) => (
                    <li
                      key={`${ingredient}-${index}`}
                    >
                      {ingredient}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="recipe-details-empty">
                No ingredients added.
              </p>
            )}
                    </section>

          {instructions.length > 0 && (
            <section className="recipe-details-section">
              <div className="recipe-details-section-heading">
                <h3>Method</h3>

                <span>
                  {instructions.length}{" "}
                  {instructions.length === 1
                    ? "step"
                    : "steps"}
                </span>
              </div>

              <ol className="recipe-details-method">
                {instructions.map(
                  (instruction, index) => (
                    <li
                      key={`${index}-${instruction}`}
                    >
                      <span className="recipe-method-number">
                        {index + 1}
                      </span>

                      <p>
                        {instruction}
                      </p>
                    </li>
                  )
                )}
              </ol>
            </section>
          )}

          {error && (
            <div className="event-form-error">
              {error}
            </div>
          )}

          {shoppingPickerOpen && (
            <div
              className="recipe-shopping-picker-backdrop"
              onMouseDown={(event) => {
                if (
                  event.target ===
                  event.currentTarget
                ) {
                  setShoppingPickerOpen(false);
                }
              }}
            >
              <div
                className="recipe-shopping-picker recipe-shopping-picker-modal fh-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={`Add ${recipe.title} ingredients to Shopping`}
              >
              <div className="recipe-shopping-picker-heading">
                <div>
                  <h3>
                    Add ingredients
                  </h3>

                  <p>
                    {recipe.title} · Choose what you need to buy.
                  </p>
                </div>

                <button
                  type="button"
                  className="recipe-shopping-picker-close"
                  onClick={() =>
                    setShoppingPickerOpen(
                      false
                    )
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <div className="recipe-shopping-picker-tools">
<button
  type="button"
  onClick={() =>
    setSelectedIngredients(
      ingredients
        .map(
          (
            ingredient,
            index
          ) => ({
            ingredient,
            index,
          })
        )
        .filter(
          ({ ingredient }) =>
            !ingredientMatchesPantry(
              ingredient
            )
        )
        .map(
          ({ index }) =>
            index
        )
    )
  }
>
  Select all
</button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedIngredients(
                      []
                    )
                  }
                >
                  Clear all
                </button>

                <span>
                  {
                    selectedIngredients.length
                  }{" "}
                  selected
                </span>
              </div>

              <div className="recipe-shopping-picker-list">
                {ingredients.map(
                  (
                    ingredient,
                    index
                  ) => {
                    const checked =
                      selectedIngredients.includes(
                        index
                      );

                    const alreadyHave =
                      ingredientMatchesPantry(
                        ingredient
                      );

                    return (
                      <label
                        key={`${ingredient}-${index}`}
                        className={`recipe-shopping-picker-item ${
                          alreadyHave
                            ? "already-have"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={
                            checked
                          }
                          onChange={() =>
                            toggleShoppingIngredient(
                              index
                            )
                          }
                        />

                        <span className="recipe-shopping-picker-text">
                          {ingredient}
                        </span>

<span
  className={`recipe-shopping-stock-badge ${
    alreadyHave
      ? "in-pantry"
      : "need-to-buy"
  }`}
>
  {alreadyHave
    ? "✓ In Pantry"
    : "Need to Buy"}
</span>
                      </label>
                    );
                  }
                )}
              </div>

              <div className="recipe-shopping-picker-footer">
                <button
                  type="button"
                  className="recipe-shopping-picker-cancel"
                  onClick={() =>
                    setShoppingPickerOpen(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="recipe-shopping-picker-add"
                  onClick={
                    handleAddToShopping
                  }
                  disabled={
                    addingToShopping ||
                    selectedIngredients.length ===
                      0
                  }
                >
                  <ShoppingCart
                    size={17}
                  />

                  {addingToShopping
                    ? "Adding..."
                    : `Add ${selectedIngredients.length} Selected`}
                </button>
              </div>
            </div>
          </div>
          )}

                    {shoppingSuccess && (
            <div
              className="recipe-shopping-success"
              role="status"
              aria-live="polite"
            >
              <div className="recipe-shopping-success-icon">
                ✓
              </div>

              <div className="recipe-shopping-success-copy">
                <strong>
                  Added to Shopping
                </strong>

                <span>
                  {shoppingSuccess}
                </span>
              </div>

              <button
                type="button"
                className="recipe-shopping-success-close"
                onClick={() =>
                  setShoppingSuccess("")
                }
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="recipe-details-actions"></div>

          <div className="recipe-details-actions">
            <button
              type="button"
              className="recipe-details-shopping"
                           onClick={
                openShoppingPicker
              }
              disabled={
                addingToShopping ||
                ingredients.length === 0
              }
            >
              <ShoppingCart
                size={17}
              />

              {addingToShopping
                ? "Adding..."
                : "Add to Shopping List"}
            </button>

            {recipe.recipe_url && (
              <a
                href={
                  recipe.recipe_url
                }
                target="_blank"
                rel="noreferrer"
                className="recipe-details-link"
              >
                <ExternalLink
                  size={17}
                />
                Original Recipe
              </a>
            )}

            <button
              type="button"
              className="recipe-details-plan"
              onClick={() =>
                onPlan?.(recipe)
              }
            >
              <CalendarPlus
                size={17}
              />
              Plan this meal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetailsModal;
