import { API_BASE_URL } from "../config/api";
import {
  ClipboardPaste,
  ImagePlus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

function parseRecipeMinutes(value) {
  const hours = Number(value.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/i)?.[1] || 0);
  const minutes = Number(value.match(/(\d+)\s*(?:minutes?|mins?)/i)?.[1] || 0);

  if (hours || minutes) {
    return Math.round(hours * 60 + minutes);
  }

  return Number(value.match(/\d+/)?.[0] || 0) || null;
}

function cleanCapturedLine(value) {
  return value
    .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
    .trim();
}

function parseCapturedRecipe(value) {
  const lines = String(value || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const captured = {
    title: "",
    description: [],
    ingredients: [],
    instructions: [],
    prepTime: null,
    cookTime: null,
    servings: null,
    recipeUrl: "",
  };

  let section = "description";

  lines.forEach((line) => {
    const heading = line.replace(/:$/, "").trim().toLowerCase();

    if (/^ingredients?$/.test(heading)) {
      section = "ingredients";
      return;
    }

    if (/^(instructions?|method|directions?|steps?)$/.test(heading)) {
      section = "instructions";
      return;
    }

    if (/^(description|notes?|about)$/.test(heading)) {
      section = "description";
      return;
    }

    const prepMatch = line.match(/^prep(?:aration)?\s*time\s*[:–-]\s*(.+)$/i);
    if (prepMatch) {
      captured.prepTime = parseRecipeMinutes(prepMatch[1]);
      return;
    }

    const cookMatch = line.match(/^(?:cook|cooking)\s*time\s*[:–-]\s*(.+)$/i);
    if (cookMatch) {
      captured.cookTime = parseRecipeMinutes(cookMatch[1]);
      return;
    }

    const servingsMatch = line.match(/^(?:serves|servings?|yield)\s*[:–-]?\s*(\d+)/i);
    if (servingsMatch) {
      captured.servings = Number(servingsMatch[1]);
      return;
    }

    const urlMatch = line.match(/https?:\/\/\S+/i);
    if (urlMatch && !captured.recipeUrl) {
      captured.recipeUrl = urlMatch[0].replace(/[),.;]+$/, "");
      return;
    }

    if (!captured.title) {
      captured.title = cleanCapturedLine(line);
      return;
    }

    const cleanedLine = cleanCapturedLine(line);
    if (cleanedLine) {
      captured[section].push(cleanedLine);
    }
  });

  return {
    ...captured,
    description: captured.description.join("\n"),
    ingredients: captured.ingredients.join("\n"),
    instructions: captured.instructions.join("\n"),
  };
}

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

  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureText, setCaptureText] = useState("");
  const [captureMessage, setCaptureMessage] = useState("");

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
    setCaptureOpen(false);
    setCaptureText("");
    setCaptureMessage("");
    setSaving(false);
    setError("");
  }, [
    open,
    recipe,
  ]);

  if (!open) {
    return null;
  }

  const ingredientRows =
    ingredients
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  function updateIngredientRow(
    index,
    value
  ) {
    const nextRows = [
      ...ingredientRows,
    ];

    nextRows[index] = value;

    setIngredients(
      nextRows.join("\n")
    );
  }

  function addIngredientRow() {
    const nextRows = [
      ...ingredientRows,
      "",
    ];

    setIngredients(
      nextRows.join("\n")
    );
  }

  function removeIngredientRow(
    index
  ) {
    const nextRows =
      ingredientRows.filter(
        (_, rowIndex) =>
          rowIndex !== index
      );

    setIngredients(
      nextRows.join("\n")
    );
  }

  function handleCaptureRecipe() {
    const captured = parseCapturedRecipe(captureText);

    if (!captured.title) {
      setCaptureMessage("Add some recipe text first.");
      return;
    }

    setTitle(captured.title);
    setDescription(captured.description);
    setIngredients(captured.ingredients);
    setInstructions(captured.instructions);

    if (captured.prepTime != null) {
      setPrepTime(String(captured.prepTime));
    }

    if (captured.cookTime != null) {
      setCookTime(String(captured.cookTime));
    }

    if (captured.servings != null) {
      setServings(String(captured.servings));
    }

    if (captured.recipeUrl) {
      setRecipeUrl(captured.recipeUrl);
    }

    const foundParts = [
      captured.ingredients && "ingredients",
      captured.instructions && "method",
      captured.prepTime != null && "prep time",
      captured.cookTime != null && "cook time",
      captured.servings != null && "servings",
    ].filter(Boolean);

    setCaptureMessage(
      foundParts.length
        ? `Details filled: ${foundParts.join(", ")}. Check them below before saving.`
        : "Recipe name filled. Add any missing details below before saving."
    );
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
        className="event-modal fh-dialog"
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
          {!recipe && (
            <section className="recipe-capture-panel event-form-full">
              <div className="recipe-capture-heading">
                <span className="recipe-capture-icon">
                  <ClipboardPaste size={20} />
                </span>

                <div>
                  <strong>Capture a copied recipe</strong>
                  <small>Paste the recipe text and review what FamilyHub finds.</small>
                </div>

                <button
                  type="button"
                  className="recipe-capture-toggle"
                  onClick={() => {
                    setCaptureOpen((current) => !current);
                    setCaptureMessage("");
                  }}
                  disabled={saving}
                >
                  {captureOpen ? "Hide" : "Paste recipe"}
                </button>
              </div>

              {captureOpen && (
                <div className="recipe-capture-body">
                  <textarea
                    value={captureText}
                    onChange={(event) => {
                      setCaptureText(event.target.value);
                      setCaptureMessage("");
                    }}
                    rows={9}
                    placeholder={"Recipe name\nPrep time: 15 min\nCook time: 30 min\nServes: 4\n\nIngredients\n2 cups flour\n\nMethod\n1. Mix the ingredients"}
                    aria-label="Copied recipe text"
                  />

                  <div className="recipe-capture-actions">
                    <small aria-live="polite">{captureMessage}</small>
                    <button
                      type="button"
                      className="recipe-capture-fill-button"
                      onClick={handleCaptureRecipe}
                      disabled={!captureText.trim() || saving}
                    >
                      Fill recipe details
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          <div className="recipe-editor-overview">
            <div className="recipe-editor-photo-column">
              <div className="event-form-field">
                <span>Photo</span>

                <div className="recipe-photo-editor">
                  {photoUrl ? (
                    <img
                      src={`${API_BASE_URL}${photoUrl}`}
                      alt=""
                    />
                  ) : (
                    <div className="recipe-photo-editor-empty">
                      <ImagePlus size={34} />

                      <span>
                        No photo yet
                      </span>
                    </div>
                  )}

                  <label className="recipe-photo-upload-button">
                    <ImagePlus size={17} />

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
            </div>

            <div className="recipe-editor-details-column">
              <label className="event-form-field">
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

              <label className="event-form-field">
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

              <div className="recipe-editor-meta-grid">
<label className="event-form-field">
  <span>
    Prep time
  </span>

  <div className="recipe-time-input">
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
      placeholder="0"
    />

    <span>min</span>
  </div>
</label>

<label className="event-form-field">
  <span>
    Cook time
  </span>

  <div className="recipe-time-input">
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
      placeholder="0"
    />

    <span>min</span>
  </div>
</label>

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
                      Select
                    </option>

                    <option value="pasta">
                      Pasta
                    </option>

                    <option value="chicken">
                      Chicken
                    </option>

                    <option value="beef">
                      Beef
                    </option>

                    <option value="pork">
                      Pork
                    </option>

                    <option value="seafood">
                      Seafood
                    </option>

                    <option value="pizza">
                      Pizza
                    </option>

                    <option value="bbq">
                      BBQ
                    </option>

                    <option value="slow-cooker">
                      Slow Cooker
                    </option>

                    <option value="mexican">
                      Mexican
                    </option>

                    <option value="asian">
                      Asian
                    </option>

                    <option value="indian">
                      Indian
                    </option>

                    <option value="vegetarian">
                      Vegetarian
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </label>
              </div>
            </div>
          </div>

<div className="recipe-editor-cooking-grid">
  <div className="event-form-field recipe-ingredients-field">
    <div className="recipe-ingredients-heading">
      <span>
        Ingredients
      </span>

      <button
        type="button"
        className="recipe-add-ingredient-button"
        onClick={addIngredientRow}
        disabled={saving}
      >
        <Plus size={14} />
        Add Ingredient
      </button>
    </div>

    <div className="recipe-ingredient-list">
      {ingredientRows.length > 0 ? (
        ingredientRows.map(
          (ingredient, index) => (
            <div
              className="recipe-ingredient-row"
              key={`${index}-${ingredient}`}
            >
              <span className="recipe-ingredient-number">
                {index + 1}
              </span>

              <input
                type="text"
                value={ingredient}
                onChange={(event) =>
                  updateIngredientRow(
                    index,
                    event.target.value
                  )
                }
                placeholder="Add ingredient..."
              />

              <button
                type="button"
                className="recipe-remove-ingredient-button"
                onClick={() =>
                  removeIngredientRow(
                    index
                  )
                }
                disabled={saving}
                aria-label={`Remove ingredient ${index + 1}`}
              >
                <X size={15} />
              </button>
            </div>
          )
        )
      ) : (
        <button
          type="button"
          className="recipe-empty-ingredient-button"
          onClick={addIngredientRow}
          disabled={saving}
        >
          <Plus size={16} />

          Add your first ingredient
        </button>
      )}
    </div>
  </div>

  <div className="event-form-field recipe-method-field">
    <div className="recipe-method-heading">
      <span>
        Instructions / Method
      </span>

      <button
        type="button"
        className="recipe-add-method-button"
        onClick={() => {
          const rows =
            instructions
              .split("\n")
              .filter(
                (item) =>
                  item.trim() !== ""
              );

          setInstructions(
            [...rows, ""].join("\n")
          );
        }}
        disabled={saving}
      >
        <Plus size={14} />
        Add Step
      </button>
    </div>

    <div className="recipe-method-list">
      {instructions
        .split("\n")
        .filter(
          (item) =>
            item.trim() !== ""
        )
        .map(
          (instruction, index, rows) => (
            <div
              className="recipe-method-row"
              key={`${index}-${instruction}`}
            >
              <span className="recipe-method-number">
                {index + 1}
              </span>

<textarea
  value={instruction}
  rows={3}
  onChange={(event) => {
    const nextRows = [
      ...rows,
    ];

    nextRows[index] =
      event.target.value;

    setInstructions(
      nextRows.join("\n")
    );
  }}
  placeholder="Describe this step..."
/>

              <button
                type="button"
                className="recipe-remove-method-button"
                onClick={() => {
                  const nextRows =
                    rows.filter(
                      (_, rowIndex) =>
                        rowIndex !==
                        index
                    );

                  setInstructions(
                    nextRows.join("\n")
                  );
                }}
                disabled={saving}
                aria-label={`Remove step ${index + 1}`}
              >
                <X size={15} />
              </button>
            </div>
          )
        )}

      {!instructions.trim() && (
        <button
          type="button"
          className="recipe-empty-method-button"
          onClick={() =>
            setInstructions(" ")
          }
          disabled={saving}
        >
          <Plus size={16} />

          Add your first step
        </button>
      )}
    </div>
  </div>
</div>

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
          <div className="reward-delete-confirm-modal fh-dialog">
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
