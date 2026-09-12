import { API_BASE_URL } from "../config/api";
import {
  useEffect,
  useState,
} from "react";

import {
  Trash2,
  X,
} from "lucide-react";

const ICON_OPTIONS = [
  "📋",
  "🎒",
  "🏫",
  "🛠️",
  "🎁",
  "🏖️",
  "🏠",
  "🧳",
  "🎂",
  "✅",
];

const COLOUR_OPTIONS = [
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#eab308",
  "#ef4444",
  "#06b6d4",
];

const LIST_TEMPLATES = [
  {
    id: "blank",
    name: "Blank List",
    icon: "📋",
    colour: "#22c55e",
    items: [],
  },
  {
    id: "packing",
    name: "Packing",
    icon: "🧳",
    colour: "#3b82f6",
    items: [
      "Clothes",
      "Toiletries",
      "Chargers",
      "Medication",
      "Shoes",
      "Tickets & documents",
    ],
  },
  {
    id: "school",
    name: "School",
    icon: "🎒",
    colour: "#8b5cf6",
    items: [
      "Pens & pencils",
      "Books",
      "Lunch",
      "Drink bottle",
      "Homework",
      "Sports gear",
    ],
  },
  {
    id: "birthday",
    name: "Birthday",
    icon: "🎁",
    colour: "#ec4899",
    items: [
      "Birthday present",
      "Card",
      "Cake",
      "Decorations",
      "Food & drinks",
      "Invitations",
    ],
  },
  {
    id: "holiday",
    name: "Holiday",
    icon: "🏖️",
    colour: "#f97316",
    items: [
      "Accommodation",
      "Travel plans",
      "Activities",
      "Bookings",
      "Packing",
      "Spending money",
    ],
  },
];

function ListModal({
  list,
  onClose,
  onSaved,
  onDeleted,
  mode = "edit",
  initialName = "",
}) {
  const [name, setName] =
    useState("");

  const [icon, setIcon] =
    useState("📋");

  const [colour, setColour] =
    useState("#22c55e");

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

    const [deleteConfirmOpen, setDeleteConfirmOpen] =
  useState(false);

  const [error, setError] =
    useState("");

    const [selectedTemplate, setSelectedTemplate] =
  useState("blank");

useEffect(() => {
  setName(
    mode === "create"
      ? initialName
      : list?.name || ""
  );

  setIcon(
    list?.icon || "📋"
  );

  setColour(
    list?.colour || "#22c55e"
  );

  setError("");
}, [
  list,
  mode,
  initialName,
]);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanName =
      name.trim();

    if (!cleanName) {
      setError(
        "Enter a list name."
      );

      return;
    }

    setSaving(true);
    setError("");

    try {
const isCreate =
  mode === "create";

const response = await fetch(
  isCreate
    ? `${API_BASE_URL}/api/lists`
    : `${API_BASE_URL}/api/lists/${list.id}`,
  {
    method:
      isCreate
        ? "POST"
        : "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: cleanName,
            icon,
            colour,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (isCreate
              ? "Unable to create list"
              : "Unable to update list")
        );
      }

      let savedList = data.list;

      if (isCreate) {
        const template =
          LIST_TEMPLATES.find(
            (item) =>
              item.id === selectedTemplate
          );

        if (template?.items?.length) {
          for (const itemTitle of template.items) {
            const itemResponse =
              await fetch(
                `${API_BASE_URL}/api/lists/${data.list.id}/items`,
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body: JSON.stringify({
                    title: itemTitle,
                    memberIds: [],
                  }),
                }
              );

            const itemData =
              await itemResponse.json();

            if (!itemResponse.ok) {
              throw new Error(
                itemData.error ||
                  `Unable to add ${itemTitle}`
              );
            }
          }

          const refreshedResponse =
            await fetch(
              `${API_BASE_URL}/api/lists/${data.list.id}`
            );

          const refreshedData =
            await refreshedResponse.json();

          if (!refreshedResponse.ok) {
            throw new Error(
              refreshedData.error ||
                "Unable to load created list"
            );
          }

          savedList =
            refreshedData.list;
        }
      }

      onSaved?.(savedList);
      onClose?.();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update list"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lists/${list.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete list"
        );
      }

      onDeleted?.(list.id);
      onClose?.();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete list"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <div className="event-modal list-modal">
        <div className="event-modal-heading">
          <div>
            <p className="page-kicker">
              FAMILY LIST
            </p>

<h2>
  {mode === "create"
    ? "Create List"
    : "Edit List"}
</h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form
          className="event-form"
          onSubmit={handleSubmit}
        >
{mode === "create" && (
  <div className="form-field">
    <span>Start with a template</span>

    <div className="list-template-picker">
      {LIST_TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          className={`list-template-option ${
            selectedTemplate === template.id
              ? "selected"
              : ""
          }`}
          onClick={() => {
            setSelectedTemplate(template.id);

            setIcon(template.icon);
            setColour(template.colour);

            if (
              !name.trim() ||
              LIST_TEMPLATES.some(
                (item) =>
                  item.name === name
              )
            ) {
              setName(
                template.id === "blank"
                  ? initialName
                  : template.name
              );
            }
          }}
        >
          <span className="list-template-icon">
            {template.icon}
          </span>

          <strong>
            {template.name}
          </strong>

          <small>
            {template.items.length
              ? `${template.items.length} starter items`
              : "Start from scratch"}
          </small>
        </button>
      ))}
    </div>
  </div>
)}

          <label className="form-field">
            <span>
              List name
            </span>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              autoFocus
            />
          </label>

          <div className="form-field">
            <span>
              Icon
            </span>

            <div className="list-icon-picker">
              {ICON_OPTIONS.map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    className={`list-icon-option ${
                      icon === option
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setIcon(option)
                    }
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="form-field">
            <span>
              Colour
            </span>

            <div className="list-colour-picker">
              {COLOUR_OPTIONS.map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    className={`list-colour-option ${
                      colour === option
                        ? "selected"
                        : ""
                    }`}
                    style={{
                      "--list-colour":
                        option,
                    }}
                    onClick={() =>
                      setColour(option)
                    }
                    aria-label={`Choose ${option}`}
                  />
                )
              )}
            </div>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="event-modal-actions list-modal-actions">
{mode !== "create" ? (
  
  <button
    type="button"
    className="list-item-delete-button"
onClick={() =>
  setDeleteConfirmOpen(true)
}
    disabled={
      saving ||
      deleting
    }
  >
    <Trash2 size={17} />

    {deleting
      ? "Deleting..."
      : "Delete List"}
  </button>
) : (
  <span />
)}

            <div>
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
                disabled={
                  saving ||
                  deleting
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={
                  saving ||
                  deleting ||
                  !name.trim()
                }
              >
{saving
  ? "Saving..."
  : mode === "create"
    ? "Create List"
    : "Save List"}
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
              <span>Delete List</span>

              <h2>{list?.name}</h2>

              <p>
                Are you sure you want to delete this list?
              </p>

              <small>
                All items inside this list will also be removed.
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
                  : "Delete List"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListModal;
