import { API_BASE_URL } from "../config/api";
import {
  ImagePlus,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

function RecipeModal({
  open,
  recipe,
  onClose,
  onSaved,
  onDeleted,
}) {
  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    ingredients,
    setIngredients,
  ] = useState("");

  const [
    instructions,
    setInstructions,
  ] = useState("");

  const [
    recipeUrl,
    setRecipeUrl,
  ] = useState("");

  const [
    photoUrl,
    setPhotoUrl,
  ] = useState("");

  const [
    prepTime,
    setPrepTime,
  ] = useState("");

  const [
    cookTime,
    setCookTime,
  ] = useState("");

  const [
    servings,
    setServings,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);

  const [
    importingRecipe,
    setImportingRecipe,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

    const [deleteConfirmOpen, setDeleteConfirmOpen] =
  useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(
      recipe?.title || ""
    );

    setDescription(
      recipe?.description || ""
    );

       setIngredients(
      recipe?.ingredients || ""
    );

    setInstructions(
      recipe?.instructions || ""
    );

    setRecipeUrl(
      recipe?.recipe_url || ""
    );

    setPhotoUrl(
      recipe?.photo_url || ""
    );

    setPrepTime(
      recipe?.prep_time != null
        ? String(
            recipe.prep_time
          )
        : ""
    );

    setCookTime(
      recipe?.cook_time != null
        ? String(
            recipe.cook_time
          )
        : ""
    );

    setServings(
      recipe?.servings != null
        ? String(
            recipe.servings
          )
        : ""
    );

         setCategory(
  recipe?.category || ""
);

setUploadingPhoto(false);
    setSaving(false);
    setError("");
  }, [
    open,
    recipe,
  ]);

  if (!open) {
    return null;
  }

  async function handleImportRecipe() {
    const url =
      recipeUrl.trim();

    if (!url) {
      setError(
        "Enter a recipe link first."
      );
      return;
    }

    setImportingRecipe(true);
    setError("");

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/recipes/import-url`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              url,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to import recipe"
        );
      }

      const imported =
        data.recipe;

      setTitle(
        imported.title || ""
      );

      setDescription(
        imported.description || ""
      );

           setIngredients(
        imported.ingredients || ""
      );

      setInstructions(
        imported.instructions || ""
      );

      setRecipeUrl(
        imported.recipeUrl || url
      );

      setPhotoUrl(
        imported.photoUrl || ""
      );

      setPrepTime(
        imported.prepTime != null
          ? String(
              imported.prepTime
            )
          : ""
      );

      setCookTime(
        imported.cookTime != null
          ? String(
              imported.cookTime
            )
          : ""
      );

      setServings(
        imported.servings != null
          ? String(
              imported.servings
            )
          : ""
      );

      setCategory(
  imported.category
    ? imported.category
        .trim()
        .toLowerCase()
    : ""
);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to import recipe"
      );
    } finally {
      setImportingRecipe(false);
    }
  }

  async function handlePhotoUpload(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingPhoto(true);
    setError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "photo",
        file
      );

      const response =
        await fetch(
          `${API_BASE_URL}/api/recipes/upload-photo`,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to upload photo"
        );
      }

      setPhotoUrl(
        data.photoUrl
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to upload photo"
      );
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError(
        "Enter a recipe name."
      );
      return;
    }

    const parsedPrepTime =
      prepTime === ""
        ? null
        : Number(prepTime);

    const parsedCookTime =
      cookTime === ""
        ? null
        : Number(cookTime);

    const parsedServings =
      servings === ""
        ? null
        : Number(servings);

    if (
      parsedPrepTime != null &&
      (
        !Number.isInteger(
          parsedPrepTime
        ) ||
        parsedPrepTime < 0
      )
    ) {
      setError(
        "Prep time must be a whole number of minutes."
      );
      return;
    }

    if (
      parsedCookTime != null &&
      (
        !Number.isInteger(
          parsedCookTime
        ) ||
        parsedCookTime < 0
      )
    ) {
      setError(
        "Cook time must be a whole number of minutes."
      );
      return;
    }

    if (
      parsedServings != null &&
      (
        !Number.isInteger(
          parsedServings
        ) ||
        parsedServings < 1
      )
    ) {
      setError(
        "Servings must be at least 1."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response =
        await fetch(
          recipe
            ? `${API_BASE_URL}/api/recipes/${recipe.id}`
            : `${API_BASE_URL}/api/recipes`,
          {
            method: recipe
              ? "PUT"
              : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                title:
                  title.trim(),

                description:
                  description.trim() ||
                  null,

                ingredients:
                  ingredients.trim() ||
                  null,

                instructions:
                  instructions.trim() ||
                  null,

                recipeUrl:
                  recipeUrl.trim() ||
                  null,

                photoUrl:
                  photoUrl || null,

                prepTime:
                  parsedPrepTime,

                cookTime:
                  parsedCookTime,

                servings:
                  parsedServings,

                category:
                  category.trim() ||
                  null,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save recipe"
        );
      }

      onSaved?.(
        data.recipe
      );

      onClose();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save recipe"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!recipe) {
      return;
    }


    setSaving(true);
    setError("");

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/recipes/${recipe.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete recipe"
        );
      }

      onDeleted?.(
        recipe.id
      );

      onClose();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete recipe"
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
              Recipes
            </p>

            <h2>
              {recipe
                ? "Edit Recipe"
                : "Add Recipe"}
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
          <div className="event-form-field event-form-full">
            <span>Photo</span>

            <div className="recipe-photo-editor">
              {photoUrl ? (
                <img
                  src={`${API_BASE_URL}${photoUrl}`}
                  alt=""
                />
              ) : (
                <div className="recipe-photo-editor-empty">
                  <ImagePlus
                    size={34}
                  />

                  <span>
                    No photo yet
                  </span>
                </div>
              )}

              <label className="recipe-photo-upload-button">
                <ImagePlus
                  size={17}
                />

                {uploadingPhoto
                  ? "Uploading..."
                  : photoUrl
                    ? "Change Photo"
                    : "Add Photo"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handlePhotoUpload
                  }
                  disabled={
                    uploadingPhoto ||
                    saving
                  }
                />
              </label>
            </div>
          </div>

          <label className="event-form-field event-form-full">
            <span>
              Recipe name
            </span>

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

          <label className="event-form-field event-form-full">
            <span>
              Description
            </span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Optional description"
              rows={3}
            />
          </label>

          <div className="event-form-grid">
            <label className="event-form-field">
              <span>
                Prep time
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={prepTime}
                onChange={(event) =>
                  setPrepTime(
                    event.target.value
                  )
                }
                placeholder="Minutes"
              />
            </label>

            <label className="event-form-field">
              <span>
                Cook time
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={cookTime}
                onChange={(event) =>
                  setCookTime(
                    event.target.value
                  )
                }
                placeholder="Minutes"
              />
            </label>
          </div>

          <div className="event-form-grid">
            <label className="event-form-field">
              <span>
                Servings
              </span>

              <input
                type="number"
                min="1"
                step="1"
                value={servings}
                onChange={(event) =>
                  setServings(
                    event.target.value
                  )
                }
                placeholder="e.g. 4"
              />
            </label>

            <label className="event-form-field">
              <span>
                Category
              </span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select category
                </option>

                <option value="breakfast">
                  Breakfast
                </option>

                <option value="lunch">
                  Lunch
                </option>

                <option value="dinner">
                  Dinner
                </option>

                <option value="pasta">
                  Pasta
                </option>

                <option value="bbq">
                  BBQ
                </option>

                <option value="slow-cooker">
                  Slow Cooker
                </option>

                <option value="dessert">
                  Dessert
                </option>

                <option value="snack">
                  Snack
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </label>
          </div>

                  <label className="event-form-field event-form-full">
            <span>
              Ingredients
            </span>

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
              rows={7}
            />
          </label>

          <label className="event-form-field event-form-full">
            <span>
              Instructions / Method
            </span>

            <textarea
              value={instructions}
              onChange={(event) =>
                setInstructions(
                  event.target.value
                )
              }
              placeholder={
                "One step per line\nBrown the mince.\nAdd the onion and garlic.\nSimmer for 30 minutes."
              }
              rows={9}
            />
          </label>

          <div className="event-form-field event-form-full">
            <span>
              Recipe link
            </span>

            <div className="recipe-import-row">
              <input
                type="url"
                value={recipeUrl}
                onChange={(event) =>
                  setRecipeUrl(
                    event.target.value
                  )
                }
                placeholder="Paste recipe URL..."
                disabled={
                  importingRecipe ||
                  saving
                }
              />

              <button
                type="button"
                className="recipe-import-button"
                onClick={
                  handleImportRecipe
                }
                disabled={
                  importingRecipe ||
                  saving ||
                  !recipeUrl.trim()
                }
              >
                {importingRecipe
                  ? "Importing..."
                  : "Import Recipe"}
              </button>
            </div>

            <small className="recipe-import-help">
              Paste a recipe website link and FamilyHub will fill in the details.
            </small>
          </div>

          {error && (
            <div className="event-form-error event-form-full">
              {error}
            </div>
          )}

          <div className="event-modal-actions event-form-full">
            <div>
              {recipe && (
                <button
                  type="button"
                  className="event-delete-button"
onClick={() =>
  setDeleteConfirmOpen(true)
}
                  disabled={saving}
                >
                  <Trash2
                    size={18}
                  />
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
                disabled={
                  saving ||
                  uploadingPhoto
                }
              >
                {saving
                  ? "Saving..."
                  : recipe
                    ? "Save Changes"
                    : "Add Recipe"}
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
          <div className="reward-delete-confirm-modal">
            <div className="reward-delete-confirm-icon">
              <Trash2 size={24} />
            </div>

            <div className="reward-delete-confirm-copy">
              <span>Delete Recipe</span>

              <h2>{recipe?.title}</h2>

              <p>
                Are you sure you want to delete this recipe?
              </p>

              <small>
                This will remove it from your Recipe Library.
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
                  : "Delete Recipe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeModal;
