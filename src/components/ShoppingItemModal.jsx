import { API_BASE_URL } from "../config/api";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import FoodPicture from "./FoodPicture";
import {
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

const FAMILYHUB_API_KEY =
  import.meta.env.VITE_FAMILYHUB_API_KEY;

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

const [
  imageLookupName,
  setImageLookupName,
] = useState("");

const [
  imageLookupLoading,
  setImageLookupLoading,
] = useState(false);

const [
  imageSource,
  setImageSource,
] = useState(null);

const [
  customImageVersion,
  setCustomImageVersion,
] = useState(0);

const [
  changeImageOpen,
  setChangeImageOpen,
] = useState(false);

const [
  imageUploading,
  setImageUploading,
] = useState(false);

const [
  imageUrlMode,
  setImageUrlMode,
] = useState(false);

const [
  customImageUrl,
  setCustomImageUrl,
] = useState("");

const [
  imageActionLoading,
  setImageActionLoading,
] = useState(false);

const [
  automaticImageMode,
  setAutomaticImageMode,
] = useState(false);

const [
  automaticImages,
  setAutomaticImages,
] = useState([]);

const [
  automaticImagesLoading,
  setAutomaticImagesLoading,
] = useState(false);

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

setImageLookupName(
  item?.name || ""
);

setImageLookupLoading(false);
setImageSource(null);
setCustomImageVersion(0);
setChangeImageOpen(false);
setImageUploading(false);
setImageUrlMode(false);
setCustomImageUrl("");
setImageActionLoading(false);
setAutomaticImageMode(false);
setAutomaticImages([]);
setAutomaticImagesLoading(false);

setError("");
setSaving(false);
setDeleting(false);
  }, [open, item, members]);

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

            setImageSource(null);
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
          name: cleanFoodName,
        },
      }
    )
  );
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

    notifyFoodImageChanged(
      cleanName
    );

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
            name: cleanName,

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

    notifyFoodImageChanged(
      cleanName
    );

    setAutomaticImageMode(false);
    setAutomaticImages([]);
    setChangeImageOpen(false);
    setImageUrlMode(false);
    setCustomImageUrl("");
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to select image"
    );
  } finally {
    setImageActionLoading(false);
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

    notifyFoodImageChanged(
      cleanName
    );
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

    notifyFoodImageChanged(
      cleanName
    );

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
  <div className="shopping-item-image-preview event-form-full">
    <div className="shopping-item-image-picture">
      <FoodPicture
        key={`${imageLookupName}-${customImageVersion}`}
        name={
          imageLookupName ||
          name.trim()
        }
        category={category}
        size="large"
      />
    </div>

    <div className="shopping-item-image-copy">
      <span>
        Item Picture
      </span>

      <strong>
        {name.trim() ||
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
              : name.trim()
                ? "Shared FamilyHub picture"
                : "Start typing an item name to find a picture."}
      </small>

{name.trim() && (
  <div className="shopping-image-change-controls">
    {!changeImageOpen ? (
      <button
        type="button"
        className="shopping-change-image-button"
        onClick={() => {
          setChangeImageOpen(true);
          setImageUrlMode(false);
          setAutomaticImageMode(false);
        }}
        disabled={
          imageUploading ||
          imageActionLoading
        }
      >
        Change Image
      </button>
    ) : automaticImageMode ? (
      <div className="shopping-automatic-image-panel">
        <div className="shopping-automatic-image-heading">
          <strong>
            Automatic Images
          </strong>

          <small>
            Choose the picture that best matches this item.
          </small>
        </div>

        {automaticImagesLoading ? (
          <div className="shopping-automatic-image-message">
            Finding pictures...
          </div>
        ) : automaticImages.length > 0 ? (
          <div className="shopping-automatic-image-grid">
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
                  className="shopping-automatic-image-option"
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
                  <span className="shopping-automatic-image-option-picture">
                    <img
                      src={
                        option.imageUrl.startsWith(
                          "/uploads/"
                        )
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
                              (
                                currentItem
                              ) =>
                                currentItem.imageUrl !==
                                option.imageUrl
                            )
                        );
                      }}
                    />
                  </span>

                  <span className="shopping-automatic-image-option-name">
                    <span>
                      {option.matchedProduct ||
                        "Product"}
                    </span>

                    {option.preferred && (
                      <strong className="shopping-automatic-image-preferred">
                        ✓ Preferred
                      </strong>
                    )}
                  </span>
                </button>
              )
            )}
          </div>
        ) : (
          <div className="shopping-automatic-image-message">
            No automatic pictures found.
          </div>
        )}

        <button
          type="button"
          className="shopping-image-change-cancel"
          onClick={() => {
            setAutomaticImageMode(
              false
            );

            setAutomaticImages([]);
          }}
          disabled={
            automaticImagesLoading
          }
        >
          Back
        </button>
      </div>
    ) : !imageUrlMode ? (
      <div className="shopping-image-change-panel">
        <div className="shopping-image-change-primary">
          <button
            type="button"
            className="shopping-automatic-images-button"
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

          <label className="shopping-upload-image-button">
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
            className="shopping-image-url-button"
            onClick={() => {
              setImageUrlMode(true);
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

        <div className="shopping-image-change-tools">
          <button
            type="button"
            className="shopping-image-tool-button"
            onClick={() =>
              handleRotateImage(
                "left"
              )
            }
            disabled={
              imageUploading ||
              imageActionLoading
            }
          >
            ↶ Rotate
          </button>

          <button
            type="button"
            className="shopping-image-tool-button"
            onClick={() =>
              handleRotateImage(
                "right"
              )
            }
            disabled={
              imageUploading ||
              imageActionLoading
            }
          >
            Rotate ↷
          </button>

          {imageSource ===
            "custom-upload" && (
            <button
              type="button"
              className="shopping-image-tool-button shopping-image-tool-reset"
              onClick={
                handleResetImage
              }
              disabled={
                imageUploading ||
                imageActionLoading
              }
            >
              {imageActionLoading
                ? "Resetting..."
                : "Reset"}
            </button>
          )}

          <button
            type="button"
            className="shopping-image-change-cancel"
            onClick={() => {
              setChangeImageOpen(false);
              setImageUrlMode(false);
              setAutomaticImageMode(
                false
              );
              setAutomaticImages([]);
            }}
            disabled={
              imageUploading ||
              imageActionLoading
            }
          >
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <div className="shopping-image-url-entry">
        <input
          type="url"
          value={customImageUrl}
          onChange={(event) =>
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

        <div className="shopping-image-url-actions">
          <button
            type="button"
            className="shopping-upload-image-button"
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
            className="shopping-image-change-cancel"
            onClick={() => {
              setImageUrlMode(false);
              setCustomImageUrl("");
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
