import { API_BASE_URL } from "../config/api";
import { useEffect, useState } from "react";
import FoodPicture from "./FoodPicture";

const FAMILYHUB_API_KEY =
  import.meta.env.VITE_FAMILYHUB_API_KEY;

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

function getAutomaticPantryCategory(
  value
) {
  const name =
    String(value || "")
      .toLowerCase()
      .replace(
        /[^a-z0-9\s]/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (!name) {
    return "pantry";
  }

  const hasAny = (
    terms
  ) =>
    terms.some(
      (term) =>
        name === term ||
        name.includes(
          ` ${term} `
        ) ||
        name.startsWith(
          `${term} `
        ) ||
        name.endsWith(
          ` ${term}`
        )
    );

  /*
   * Fresh fruit, vegetables
   * and herbs.
   */

  if (
    hasAny([
      "apple",
      "apples",
      "avocado",
      "avocados",
      "banana",
      "bananas",
      "blueberry",
      "blueberries",
      "broccoli",
      "cabbage",
      "capsicum",
      "capsicums",
      "carrot",
      "carrots",
      "cauliflower",
      "celery",
      "cherry",
      "cherries",
      "corn",
      "cucumber",
      "cucumbers",
      "eggplant",
      "garlic",
      "grape",
      "grapes",
      "kiwi",
      "lemon",
      "lemons",
      "lettuce",
      "lime",
      "limes",
      "mango",
      "mangoes",
      "mushroom",
      "mushrooms",
      "onion",
      "onions",
      "orange",
      "oranges",
      "peach",
      "peaches",
      "pear",
      "pears",
      "peas",
      "pineapple",
      "potato",
      "potatoes",
      "pumpkin",
      "spinach",
      "strawberry",
      "strawberries",
      "sweet potato",
      "sweet potatoes",
      "tomato",
      "tomatoes",
      "watermelon",
      "zucchini",
      "basil",
      "coriander",
      "mint",
      "parsley",
      "rosemary",
      "thyme",
    ])
  ) {
    return "produce";
  }

  /*
   * Meat and seafood.
   */

  if (
    hasAny([
      "bacon",
      "beef",
      "beef mince",
      "steak",
      "chicken",
      "chicken breast",
      "chicken thigh",
      "chicken drumstick",
      "ham",
      "lamb",
      "lamb chop",
      "pork",
      "pork chop",
      "pork mince",
      "sausage",
      "sausages",
      "hot dog",
      "hot dogs",
      "fish",
      "salmon",
      "tuna",
      "prawn",
      "prawns",
      "shrimp",
    ])
  ) {
    return "meat";
  }

  /*
   * Dairy and refrigerated
   * staples.
   */

  if (
    hasAny([
      "milk",
      "cheese",
      "butter",
      "cream",
      "yoghurt",
      "yogurt",
      "custard",
      "egg",
      "eggs",
    ])
  ) {
    return "dairy";
  }

  /*
   * Bread and bakery products.
   */

  if (
    hasAny([
      "bread",
      "bread roll",
      "bread rolls",
      "bun",
      "buns",
      "hot dog buns",
      "naan",
      "naan bread",
      "wrap",
      "wraps",
      "bagel",
      "bagels",
      "croissant",
      "croissants",
    ])
  ) {
    return "bakery";
  }

  /*
   * Drinks.
   */

  if (
    hasAny([
      "coke",
      "coca cola",
      "pepsi",
      "lemonade",
      "juice",
      "water",
      "soft drink",
      "soft drinks",
      "sports drink",
      "energy drink",
    ])
  ) {
    return "drinks";
  }

  /*
   * Frozen foods.
   */

  if (
    hasAny([
      "frozen",
      "ice cream",
      "frozen chips",
      "frozen peas",
      "frozen vegetables",
    ])
  ) {
    return "frozen";
  }

  return "pantry";
}

export default function PantryItemModal({
  open,
  item = null,
  onClose,
  onSaved,
  onDeleted,
}) {
const [name, setName] = useState("");
const [quantity, setQuantity] = useState("");

const [
  packSize,
  setPackSize,
] = useState("");

const [
  lowStockEnabled,
  setLowStockEnabled,
] = useState(false);

const [
  lowStockThreshold,
  setLowStockThreshold,
] = useState("");

const [
  autoAddToShopping,
  setAutoAddToShopping,
] = useState(false);

const [
  restockQuantity,
  setRestockQuantity,
] = useState("");

const [category, setCategory] =
  useState("pantry");

const [
  categoryManuallySelected,
  setCategoryManuallySelected,
] = useState(false);

const [notes, setNotes] = useState("");
  const [saving, setSaving] =
    useState(false);

    const [deleteConfirmOpen, setDeleteConfirmOpen] =
  useState(false);

const [error, setError] =
  useState("");

const [imageLookupName, setImageLookupName] =
  useState("");

const [imageLookupLoading, setImageLookupLoading] =
  useState(false);

const [changeImageOpen, setChangeImageOpen] =
  useState(false);

const [imageUploading, setImageUploading] =
  useState(false);

const [customImageVersion, setCustomImageVersion] =
  useState(0);

const [imageSource, setImageSource] =
  useState(null);

const [imageUrlMode, setImageUrlMode] =
  useState(false);

const [customImageUrl, setCustomImageUrl] =
  useState("");

const [imageActionLoading, setImageActionLoading] =
  useState(false);

const [automaticImageMode, setAutomaticImageMode] =
  useState(false);

const [automaticImages, setAutomaticImages] =
  useState([]);

const [automaticImagesLoading, setAutomaticImagesLoading] =
  useState(false);

function notifyFoodImageChanged(
  foodName = name
) {
  const cleanFoodName =
    String(foodName || "")
      .trim();

  if (!cleanFoodName) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "familyhub-food-image-changed",
      {
        detail: {
          name:
            cleanFoodName,
        },
      }
    )
  );
}

useEffect(() => {
  if (!open) {
    return;
  }

setName(item?.name || "");

setQuantity(
  item?.id
    ? String(item?.quantity || "1")
    : "1"
);

setPackSize(
  item?.pack_size !== null &&
    item?.pack_size !== undefined
    ? String(item.pack_size)
    : ""
);

setLowStockEnabled(true);

setLowStockThreshold(
  item?.low_stock_threshold !== null &&
    item?.low_stock_threshold !==
      undefined
    ? String(
        item.low_stock_threshold
      )
    : "1"
);

setAutoAddToShopping(
  item?.id
    ? Boolean(
        item?.auto_add_to_shopping
      )
    : true
);

setRestockQuantity(
  item?.restock_quantity !== null &&
    item?.restock_quantity !==
      undefined
    ? String(
        item.restock_quantity
      )
    : "1"
);

setCategory(
  item?.category || "pantry"
);

setCategoryManuallySelected(
  Boolean(item?.id)
);

setNotes(item?.notes || "");
setImageLookupName(
  item?.name || ""
);
setImageLookupLoading(false);
setChangeImageOpen(false);
setImageUploading(false);
setCustomImageVersion(0);
setImageSource(null);
setImageUrlMode(false);
setCustomImageUrl("");
setImageActionLoading(false);
setAutomaticImageMode(false);
setAutomaticImages([]);
setAutomaticImagesLoading(false);
setError("");
}, [open, item]);

useEffect(() => {
  if (!open) {
    return;
  }

  const cleanName =
    name.trim();

  if (!cleanName) {
    setImageLookupName("");
    setImageLookupLoading(false);
    setImageSource(null);
    return;
  }

  setImageLookupLoading(true);
  setImageSource(null);

  const controller =
    new AbortController();

  const timer =
    window.setTimeout(
      async () => {
        try {
          const response =
            await fetch(
              `${API_BASE_URL}/api/food-images?name=${encodeURIComponent(
                cleanName
              )}`,
              {
                headers: {
                  "X-FamilyHub-Key":
                    FAMILYHUB_API_KEY,
                },

                signal:
                  controller.signal,
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Unable to find image"
            );
          }

          setImageLookupName(
            cleanName
          );

          setImageSource(
            data.source || null
          );
        } catch (err) {
          if (
            err.name !==
            "AbortError"
          ) {
            console.error(err);

            setImageLookupName(
              cleanName
            );

            setImageSource(
              null
            );
          }
        } finally {
          if (
            !controller.signal
              .aborted
          ) {
            setImageLookupLoading(
              false
            );
          }
        }
      },
      500
    );

  return () => {
    window.clearTimeout(
      timer
    );

    controller.abort();
  };
}, [
  open,
  name,
  customImageVersion,
]);

if (!open) {
  return null;
}

async function handleCustomImageUpload(
  event
) {
  const file =
    event.target.files?.[0];

  event.target.value = "";

  if (!file) {
    return;
  }

  const cleanName =
    name.trim();

  if (!cleanName) {
    setError(
      "Enter the item name before choosing an image."
    );
    return;
  }

  setImageUploading(true);
  setError("");

  try {
    const formData =
      new FormData();

    formData.append(
      "name",
      cleanName
    );

    formData.append(
      "image",
      file
    );

    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/custom`,
        {
          method: "POST",

          headers: {
            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },

          body: formData,
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to upload image"
      );
    }

setImageLookupName(
  cleanName
);

setImageSource(
  "custom-upload"
);

setCustomImageVersion(
  (current) =>
    current + 1
);

notifyFoodImageChanged(
  cleanName
);

setChangeImageOpen(false);
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to upload image"
    );
  } finally {
    setImageUploading(false);
  }
}

async function handleCustomImageUrl() {
  const cleanName =
    name.trim();

  const cleanUrl =
    customImageUrl.trim();

  if (!cleanName) {
    setError(
      "Enter the item name before choosing an image."
    );
    return;
  }

  if (!cleanUrl) {
    setError(
      "Paste an image URL first."
    );
    return;
  }

  setImageActionLoading(true);
  setError("");

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/custom-url`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },

          body: JSON.stringify({
            name: cleanName,
            imageUrl: cleanUrl,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to use image URL"
      );
    }

    setImageLookupName(
      cleanName
    );

    setImageSource(
      "custom-upload"
    );

    setCustomImageVersion(
      (current) =>
        current + 1
    );

    notifyFoodImageChanged(cleanName);

    setCustomImageUrl("");
    setImageUrlMode(false);
    setChangeImageOpen(false);
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to use image URL"
    );
  } finally {
    setImageActionLoading(false);
  }
}

async function handleSelectAutomaticImage(
  option
) {
  const cleanName =
    name.trim();

  if (
    !cleanName ||
    !option?.imageUrl
  ) {
    setError(
      "That automatic image does not have a usable image URL."
    );
    return;
  }

  setImageActionLoading(true);
  setError("");

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/select`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },

          body: JSON.stringify({
            name:
              cleanName,

            imageUrl:
              option.imageUrl,

            matchedProduct:
              option.matchedProduct ||
              cleanName,

            barcode:
              option.barcode ||
              null,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to select image"
      );
    }

    setImageSource(
      data.source ||
        "open-food-facts-selected"
    );

setCustomImageVersion(
  (current) =>
    current + 1
);

notifyFoodImageChanged(cleanName);

setAutomaticImageMode(
  false
);

setAutomaticImages(
  []
);

setChangeImageOpen(
  false
);

setImageUrlMode(
  false
);

setCustomImageUrl(
  ""
);
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to select image"
    );
  } finally {
    setImageActionLoading(
      false
    );
  }
}

async function handleAutomaticImages() {
  const cleanName =
    name.trim();

  if (!cleanName) {
    return;
  }

  setAutomaticImageMode(true);
  setImageUrlMode(false);
  setAutomaticImagesLoading(true);
  setAutomaticImages([]);
  setError("");

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/options?name=${encodeURIComponent(
          cleanName
        )}`,
        {
          headers: {
            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to find automatic images"
      );
    }

    setAutomaticImages(
      Array.isArray(
        data.options
      )
        ? data.options
        : []
    );
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to find automatic images"
    );
  } finally {
    setAutomaticImagesLoading(
      false
    );
  }
}

async function handleRotateImage(
  direction
) {
  const cleanName =
    name.trim();

  if (!cleanName) {
    setError(
      "Enter the item name before rotating the image."
    );
    return;
  }

  setImageActionLoading(true);
  setError("");

  try {
    const currentResponse =
      await fetch(
        `${API_BASE_URL}/api/food-images?name=${encodeURIComponent(
          cleanName
        )}`,
        {
          headers: {
            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },
        }
      );

    const currentData =
      await currentResponse.json();

    if (!currentResponse.ok) {
      throw new Error(
        currentData.error ||
          "Unable to read image rotation"
      );
    }

    const currentRotation =
      Number(
        currentData.rotation || 0
      );

    const nextRotation =
      direction === "left"
        ? (currentRotation + 270) %
          360
        : (currentRotation + 90) %
          360;

    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/rotation`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },

          body: JSON.stringify({
            name: cleanName,
            rotation:
              nextRotation,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to rotate image"
      );
    }

    setCustomImageVersion(
      (current) =>
        current + 1
    );

    notifyFoodImageChanged(cleanName);
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to rotate image"
    );
  } finally {
    setImageActionLoading(false);
  }
}

async function handleResetImage() {
  
  const cleanName =
    name.trim();

  if (!cleanName) {
    return;
  }

  setImageActionLoading(true);
  setError("");

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/reset`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },

          body: JSON.stringify({
            name: cleanName,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to reset image"
      );
    }

    setImageLookupName(
      cleanName
    );

    setImageSource(
      data.source || null
    );

    setCustomImageVersion(
      (current) =>
        current + 1
    );

    notifyFoodImageChanged(cleanName);

    setCustomImageUrl("");
    setImageUrlMode(false);
    setChangeImageOpen(false);
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to reset image"
    );
  } finally {
    setImageActionLoading(false);
  }
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
    quantity.trim() || "1",

  packSize:
    packSize.trim() || null,

  category,

  notes:
    notes.trim() || null,

  isAvailable: 1,

  /*
   * Running Low is now a standard
   * Pantry feature for every item.
   */
  lowStockEnabled: 1,

  lowStockThreshold:
    lowStockThreshold !== ""
      ? Number(
          lowStockThreshold
        )
      : 1,

  autoAddToShopping:
    autoAddToShopping
      ? 1
      : 0,

  restockQuantity:
    autoAddToShopping &&
    restockQuantity.trim()
      ? restockQuantity.trim()
      : "1",
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
        className="pantry-item-modal fh-dialog"
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

<div className="pantry-item-image-preview">
  <div className="pantry-item-image-preview-picture">
    {imageLookupName ? (
      <FoodPicture
        key={`${imageLookupName}-${customImageVersion}`}
        name={imageLookupName}
        category={category}
        size="large"
      />
    ) : (
      <FoodPicture
        name=""
        category={category}
        size="large"
      />
    )}
  </div>

  <div className="pantry-item-image-preview-copy">
    <span>
      Item Picture
    </span>

    <strong>
      {imageLookupName ||
        "Enter an item name"}
    </strong>

<small>
  {imageUploading
    ? "Uploading your image..."
    : imageLookupLoading
      ? "Finding the best picture..."
      : imageSource ===
          "custom-upload"
        ? "Custom picture"
        : imageLookupName
          ? "Automatically selected by FamilyHub"
          : "Start typing an item name to find a picture."}
</small>

{imageLookupName && (
  <div className="pantry-image-change-controls">
    {!changeImageOpen ? (
      <button
        type="button"
        className="pantry-change-image-button"
        onClick={() => {
          setChangeImageOpen(
            true
          );

          setImageUrlMode(
            false
          );

          setAutomaticImageMode(
            false
          );
        }}
        disabled={
          imageUploading ||
          imageActionLoading
        }
      >
        Change Image
      </button>
    ) : automaticImageMode ? (
      <div className="pantry-automatic-image-panel">
        <div className="pantry-automatic-image-heading">
          <strong>
            Automatic Images
          </strong>

          <small>
            Choose the picture that best matches this item.
          </small>
        </div>

        {automaticImagesLoading ? (
          <div className="pantry-automatic-image-message">
            Finding pictures...
          </div>
        ) : automaticImages.length > 0 ? (
          <div className="pantry-automatic-image-grid">
            {automaticImages.map(
              (
                option,
                index
              ) => (
<button
  key={
    option.barcode ||
    `${option.imageUrl}-${index}`
  }
  type="button"
  className="pantry-automatic-image-option"
  title={
    option.matchedProduct ||
    "Automatic image"
  }
  onClick={() =>
    handleSelectAutomaticImage(
      option
    )
  }
  disabled={
    imageActionLoading
  }
>
<span className="pantry-automatic-image-option-picture">
  <img
    src={
      option.imageUrl.startsWith("/uploads/")
        ? `${API_BASE_URL}${option.imageUrl}`
        : option.imageUrl
    }
    alt={
      option.matchedProduct ||
      ""
    }
    loading="lazy"
    onError={() => {
      setAutomaticImages(
        (current) =>
          current.filter(
            (item) =>
              item.imageUrl !==
              option.imageUrl
          )
      );
    }}
  />
</span>

<span className="pantry-automatic-image-option-name">
  <span>
    {option.matchedProduct ||
      "Product"}
  </span>

  {option.preferred && (
    <strong className="pantry-automatic-image-preferred">
      ✓ Preferred
    </strong>
  )}
</span>
                </button>
              )
            )}
          </div>
        ) : (
          <div className="pantry-automatic-image-message">
            No automatic pictures found.
          </div>
        )}

        <button
          type="button"
          className="pantry-image-change-cancel"
          onClick={() => {
            setAutomaticImageMode(
              false
            );

            setAutomaticImages(
              []
            );
          }}
          disabled={
            automaticImagesLoading
          }
        >
          Back
        </button>
      </div>
    ) : !imageUrlMode ? (
      <div className="pantry-image-change-panel">
        <div className="pantry-image-change-primary">
          <button
            type="button"
            className="pantry-automatic-images-button"
            onClick={
              handleAutomaticImages
            }
            disabled={
              imageUploading ||
              imageActionLoading
            }
          >
            Automatic Images
          </button>

          <label className="pantry-upload-image-button">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleCustomImageUpload
              }
              disabled={
                imageUploading ||
                imageActionLoading
              }
            />

            <span>
              {imageUploading
                ? "Uploading..."
                : "Choose Image"}
            </span>
          </label>

          <button
            type="button"
            className="pantry-image-url-button"
            onClick={() => {
              setImageUrlMode(
                true
              );

              setAutomaticImageMode(
                false
              );
            }}
            disabled={
              imageUploading ||
              imageActionLoading
            }
          >
            Paste URL
          </button>
        </div>

        <div className="pantry-image-change-tools">
          <button
            type="button"
            className="pantry-image-tool-button"
            onClick={() =>
              handleRotateImage(
                "left"
              )
            }
            disabled={
              imageUploading ||
              imageActionLoading
            }
            title="Rotate picture left"
          >
            <span aria-hidden="true">
              ↶
            </span>
            Rotate
          </button>

          <button
            type="button"
            className="pantry-image-tool-button"
            onClick={() =>
              handleRotateImage(
                "right"
              )
            }
            disabled={
              imageUploading ||
              imageActionLoading
            }
            title="Rotate picture right"
          >
            Rotate
            <span aria-hidden="true">
              ↷
            </span>
          </button>

          {imageSource ===
            "custom-upload" && (
            <button
              type="button"
              className="pantry-image-tool-button pantry-image-tool-reset"
              onClick={
                handleResetImage
              }
              disabled={
                imageUploading ||
                imageActionLoading
              }
              title="Return to the automatically selected picture"
            >
              {imageActionLoading
                ? "Resetting..."
                : "Reset"}
            </button>
          )}
        </div>
      </div>
    ) : (
      <div className="pantry-image-url-entry">
        <input
          type="url"
          value={
            customImageUrl
          }
          onChange={(
            event
          ) =>
            setCustomImageUrl(
              event.target.value
            )
          }
          placeholder="Paste direct image URL"
          autoFocus
          disabled={
            imageActionLoading
          }
        />

        <div className="pantry-image-url-actions">
          <button
            type="button"
            className="pantry-upload-image-button"
            onClick={
              handleCustomImageUrl
            }
            disabled={
              imageActionLoading ||
              !customImageUrl.trim()
            }
          >
            {imageActionLoading
              ? "Saving..."
              : "Use Image"}
          </button>

          <button
            type="button"
            className="pantry-image-change-cancel"
            onClick={() => {
              setImageUrlMode(
                false
              );

              setCustomImageUrl(
                ""
              );
            }}
            disabled={
              imageActionLoading
            }
          >
            Back
          </button>
        </div>
      </div>
    )}
  </div>
)}
  </div>
</div>

<label className="pantry-item-field">
  <span>Item</span>

<input
  type="text"
  value={name}
  onChange={(event) => {
    const nextName =
      event.target.value;

    setName(
      nextName
    );

    /*
     * Only automatically choose the
     * category when creating a new
     * Pantry item.
     *
     * Existing items keep whatever
     * category the user previously
     * selected.
     */

if (
  !item?.id &&
  !categoryManuallySelected
) {
  setCategory(
    getAutomaticPantryCategory(
      nextName
    )
  );
}
  }}
  placeholder="e.g. Weet-Bix"
  autoFocus
/>
</label>

<div className="pantry-stock-fields">
  <label>
    <span>Quantity</span>

<input
  type="number"
  min="0"
  step="1"
  required
  value={quantity}
  onChange={(event) =>
    setQuantity(
      event.target.value
    )
  }
  placeholder="e.g. 1"
/>

    <small>
      How many of this item you
      currently have.
    </small>
  </label>

  <label>
    <span>Pack Size</span>

    <input
      type="text"
      value={packSize}
      onChange={(event) =>
        setPackSize(
          event.target.value
        )
      }
      placeholder="e.g. 1kg, 2L, 180g"
    />

    <small>
      Optional size of each
      package or item.
    </small>
  </label>
</div>

<div className="pantry-low-stock-control">

<div className="pantry-low-stock-heading">
  <div>
    <strong>
      Stock Settings
    </strong>

    <small>
      FamilyHub keeps track of when
      this item is running low.
    </small>
  </div>
</div>

  <div className="pantry-low-stock-options">

<label className="pantry-low-stock-threshold">
  <span>
    Low At
  </span>

  <input
    type="number"
    min="0"
    step="1"
    required
    value={lowStockThreshold}
    onChange={(event) =>
      setLowStockThreshold(
        event.target.value
      )
    }
    placeholder="e.g. 1"
  />

  <small>
    Mark as Running Low when{" "}
    {lowStockThreshold || "this many"}{" "}
    or fewer remain.
  </small>
</label>

    <div className="pantry-auto-shopping-section">
      <div className="pantry-auto-shopping-control">
        <div>
          <strong>
            Automatically add to Shopping
          </strong>

          <small>
            Add this item to the shared
            Shopping List when it becomes
            Running Low.
          </small>
        </div>

        <button
          type="button"
          className={`pantry-low-stock-toggle ${
            autoAddToShopping
              ? "is-active"
              : ""
          }`}
          onClick={() =>
            setAutoAddToShopping(
              (current) =>
                !current
            )
          }
          aria-label="Automatically add to Shopping"
          aria-pressed={
            autoAddToShopping
          }
        >
          <span />
        </button>
      </div>

      {autoAddToShopping && (
        <label className="pantry-restock-quantity">
          <span>
            Buy Quantity
          </span>

          <input
            type="number"
            min="1"
            step="1"
            value={restockQuantity}
            onChange={(event) =>
              setRestockQuantity(
                event.target.value
              )
            }
            placeholder="e.g. 1"
          />

<small>
  Number of items to add to
  Shopping when Running Low.
</small>
        </label>
      )}
    </div>
  </div>
</div>

        <label className="pantry-item-field">
          <span>Category</span>

<select
  value={category}
  onChange={(event) => {
    setCategory(
      event.target.value
    );

    setCategoryManuallySelected(
      true
    );
  }}
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
            className="reward-delete-confirm-modal fh-dialog"
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
