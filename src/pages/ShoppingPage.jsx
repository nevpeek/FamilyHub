import { API_BASE_URL } from "../config/api";
import { useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  Circle,
  PackageOpen,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import FoodPicture from "../components/FoodPicture";

const SHOPPING_CATEGORIES = [
  {
    id: "produce",
    label: "Produce",
  },
  {
    id: "meat",
    label: "Meat",
  },
  {
    id: "dairy",
    label: "Dairy",
  },
  {
    id: "bakery",
    label: "Bakery",
  },
  {
    id: "pantry",
    label: "Pantry",
  },
  {
    id: "frozen",
    label: "Frozen",
  },
  {
    id: "household",
    label: "Household",
  },
  {
    id: "other",
    label: "Other",
  },
];

function ShoppingPage({
  members,
  selectedMemberId,
  setSelectedMemberId,
  shoppingRefreshKey,
  onAddItem,
  onEditItem,
  onItemChanged,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompleted, setShowCompleted] =
    useState(false);
  const [categoryFilter, setCategoryFilter] =
    useState("all");

    const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] =
  useState(false);

const [clearCompletedConfirmOpen, setClearCompletedConfirmOpen] =
  useState(false);

const [deletingAll, setDeletingAll] =
  useState(false);

const [clearingCompleted, setClearingCompleted] =
  useState(false);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (selectedMemberId !== "all") {
          params.set(
            "memberId",
            String(selectedMemberId)
          );
        }

        if (!showCompleted) {
          params.set(
            "completed",
            "false"
          );
        }

        if (categoryFilter !== "all") {
          params.set(
            "category",
            categoryFilter
          );
        }

        const query = params.toString();

        const response = await fetch(
          `${API_BASE_URL}/api/shopping${
            query ? `?${query}` : ""
          }`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load shopping items"
          );
        }

        const data = await response.json();

        setItems(data.items || []);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load shopping list"
        );
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [
    selectedMemberId,
    showCompleted,
    categoryFilter,
    shoppingRefreshKey,
  ]);

  const activeItems = useMemo(
    () =>
      items.filter(
        (item) => !item.is_completed
      ),
    [items]
  );

  const completedItems = useMemo(
    () =>
      items.filter(
        (item) => item.is_completed
      ),
    [items]
  );

  const groupedActiveItems =
    useMemo(() => {
      return SHOPPING_CATEGORIES
        .map((category) => ({
          ...category,
          items: activeItems.filter(
            (item) =>
              (item.category ||
                "other") ===
              category.id
          ),
        }))
        .filter(
          (category) =>
            category.items.length > 0
        );
    }, [activeItems]);

  async function toggleItemCompletion(item) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shopping/${item.id}/completion`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            completed:
              !item.is_completed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update shopping item"
        );
      }

      setItems((current) =>
        current
          .map((entry) =>
            entry.id === item.id
              ? data.item
              : entry
          )
          .filter((entry) =>
            showCompleted
              ? true
              : !entry.is_completed
          )
      );

      onItemChanged?.();
    } catch (err) {
      console.error(err);

      window.alert(
        err.message ||
          "Unable to update shopping item"
      );
    }
  }

    async function deleteAllItems() {
setDeletingAll(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shopping/all`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete shopping list"
        );
      }

      setItems([]);

      onItemChanged?.();


} catch (err) {
  console.error(err);

  window.alert(
    err.message ||
      "Unable to delete shopping list"
  );
} finally {
  setDeletingAll(false);
}
  }

    async function moveItemToPantry(item) {
    try {
      const pantryResponse =
        await fetch(
          `${API_BASE_URL}/api/pantry`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: item.name,
              quantity:
                item.quantity || null,
              category:
                item.category || "other",
              notes: null,
            }),
          }
        );

      const pantryData =
        await pantryResponse.json();

      if (
        !pantryResponse.ok &&
        pantryResponse.status !== 409
      ) {
        throw new Error(
          pantryData.error ||
            "Unable to add item to Pantry"
        );
      }

      const deleteResponse =
        await fetch(
          `${API_BASE_URL}/api/shopping/${item.id}`,
          {
            method: "DELETE",
          }
        );

      const deleteData =
        await deleteResponse.json();

      if (!deleteResponse.ok) {
        throw new Error(
          deleteData.error ||
            "Unable to remove shopping item"
        );
      }

      setItems((current) =>
        current.filter(
          (entry) =>
            entry.id !== item.id
        )
      );

      onItemChanged?.();
    } catch (err) {
      console.error(err);

      window.alert(
        err.message ||
          "Unable to move item to Pantry"
      );
    }
  }


  async function clearCompletedItems() {
    if (completedItems.length === 0) {
      return;
    }

    setClearingCompleted(true);


    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shopping/completed/all`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to clear completed items"
        );
      }

      setItems((current) =>
        current.filter(
          (item) =>
            !item.is_completed
        )
      );

      onItemChanged?.();
} catch (err) {
  console.error(err);

  window.alert(
    err.message ||
      "Unable to clear completed items"
  );
} finally {
  setClearingCompleted(false);
}
  }

  function renderItem(item) {
    return (
      <article
        key={item.id}
        className={`shopping-card ${
          item.is_completed
            ? "completed"
            : ""
        }`}
      >
        <button
          type="button"
          className="shopping-complete-button"
          onClick={() =>
            toggleItemCompletion(item)
          }
          aria-label={
            item.is_completed
              ? "Mark item incomplete"
              : "Mark item complete"
          }
        >
          {item.is_completed ? (
            <CheckCircle2 size={28} />
          ) : (
            <Circle size={28} />
          )}
        </button>

        <button
          type="button"
          className="shopping-card-content"
          onClick={() =>
            onEditItem?.(item)
          }
        >
<div className="shopping-card-main">
  <div className="shopping-item-with-picture">
    <FoodPicture
      name={item.name}
      category={item.category}
      size="large"
    />

    <div className="shopping-item-details">
      <span className="shopping-category">
        {item.category}
      </span>

      <h3>{item.name}</h3>

      {item.notes && (
                <p>
                  {item.notes
                    .replace(
                      /From recipe:\s*/gi,
                      ""
                    )
                    .replace(
                      /Meal plan:\s*/gi,
                      ""
                    )
                    .replace(
                      /;\s*/g,
                      " · "
                    )}
                </p>
              )}
            </div>
          </div>

          {item.quantity && (
              <span className="shopping-quantity">
                {item.quantity}
              </span>
            )}
          </div>
        </button>

        {item.is_completed && (
          <button
            type="button"
            className="shopping-move-pantry"
            onClick={() =>
              moveItemToPantry(item)
            }
            title="Move to Pantry"
          >
            <PackageOpen size={16} />
            <span>Move to Pantry</span>
          </button>
        )}
      </article>
    );
  }

  return (
    <div className="shopping-page">
      <section className="calendar-page-heading">
        <div>
          <p className="section-kicker">
            Shopping
          </p>

          <h2>Shared Shopping List</h2>

          <p>
            Keep one family shopping list
            everyone can update.
          </p>
        </div>

        <div className="shopping-heading-actions">
          <button
            type="button"
            className="shopping-delete-all-button"
onClick={() =>
  setDeleteAllConfirmOpen(true)
}
            disabled={items.length === 0}
          >
            <Trash2 size={18} />
            <span>Delete All</span>
          </button>

          <button
            type="button"
            className="add-event-button"
            onClick={onAddItem}
          >
            <Plus size={22} />
            <span>Add Item</span>
          </button>
        </div>
      </section>
<section className="family-selector family-selector-section">
  <button
    type="button"
    className={`family-selector-button family-selector-everyone ${
      selectedMemberId === "all"
        ? "selected"
        : ""
    }`}
    onClick={() =>
      setSelectedMemberId("all")
    }
  >
    Everyone
  </button>

  {members.map((member) => (
    <button
      type="button"
      key={member.id}
      className={`family-selector-button ${
        selectedMemberId === member.id
          ? "selected"
          : ""
      }`}
      onClick={() =>
        setSelectedMemberId(member.id)
      }
    >
      <span
        className="family-selector-avatar"
        style={{
          backgroundColor: member.colour,
        }}
      >
        {member.photo_url ? (
          <img
            src={`${API_BASE_URL}${member.photo_url}`}
            alt={member.name}
          />
        ) : (
          member.initials ||
          member.name.charAt(0).toUpperCase()
        )}
      </span>

      {member.name}
    </button>
  ))}
</section>

      <section className="shopping-toolbar">
        <div>
          <strong>
            {activeItems.length} needed
          </strong>

          {showCompleted && (
            <span>
              {completedItems.length} completed
            </span>
          )}
        </div>

        <div className="shopping-toolbar-actions">
          <select
            aria-label="Filter shopping by category"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All categories
            </option>

            <option value="produce">
              Produce
            </option>

            <option value="meat">
              Meat
            </option>

            <option value="dairy">
              Dairy
            </option>

            <option value="bakery">
              Bakery
            </option>

            <option value="pantry">
              Pantry
            </option>

            <option value="frozen">
              Frozen
            </option>

            <option value="household">
              Household
            </option>

            <option value="other">
              Other
            </option>
          </select>

          <label className="shopping-show-completed">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(event) =>
                setShowCompleted(
                  event.target.checked
                )
              }
            />

            <span>
              Show completed
            </span>
          </label>

          {completedItems.length > 0 && (
            <button
              type="button"
              className="shopping-clear-completed"
onClick={() =>
  setClearCompletedConfirmOpen(true)
}
            >
              <Trash2 size={15} />
              Clear Completed
            </button>
          )}

        </div>
      </section>

      {loading ? (
        <div className="panel shopping-status-panel">
          Loading shopping list...
        </div>
      ) : error ? (
        <div className="panel shopping-status-panel shopping-status-error">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="panel shopping-empty-state">
          <ShoppingCart size={34} />

          <div>
            <h3>Shopping list is empty</h3>

            <p>
              Add an item or change the filters.
            </p>
          </div>
        </div>
           ) : (
        <>
          {groupedActiveItems.map(
            (category) => (
              <section
                key={category.id}
                className={`shopping-section shopping-section-${category.id}`}
              >
                <div className="shopping-section-heading">
                  <div>
                    <span className="shopping-section-name">
                      {category.label}
                    </span>

                    <span className="shopping-section-divider">
                      ·
                    </span>

                    <span className="shopping-section-count">
                      {category.items.length}
                    </span>
                  </div>

                  <span className="shopping-section-line" />
                </div>

                <div className="shopping-checklist-grid">
                  {category.items.map(
                    renderItem
                  )}
                </div>
              </section>
            )
          )}

          {showCompleted &&
            completedItems.length > 0 && (
              <section className="shopping-completed-block">
                <div className="shopping-completed-title">
                  <div>
                    <CheckCircle2
                      size={18}
                    />

                    <strong>
                      Completed
                    </strong>
                  </div>

                  <span>
                    {
                      completedItems.length
                    }
                  </span>
                </div>

                <div className="shopping-checklist-grid completed">
                  {completedItems.map(
                    renderItem
                  )}
                </div>
              </section>
            )}
        </>
      )}

      {deleteAllConfirmOpen && (
        <div
          className="modal-backdrop reward-delete-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteAllConfirmOpen(false);
            }
          }}
        >
          <div className="reward-delete-confirm-modal">
            <div className="reward-delete-confirm-icon">
              <Trash2 size={24} />
            </div>

            <div className="reward-delete-confirm-copy">
              <span>Delete Shopping List</span>

              <h2>Delete All Items?</h2>

              <p>
                Are you sure you want to delete every item
                from the shopping list?
              </p>

              <small>
                This cannot be undone.
              </small>
            </div>

            <div className="reward-delete-confirm-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setDeleteAllConfirmOpen(false)
                }
                disabled={deletingAll}
              >
                Cancel
              </button>

              <button
                type="button"
                className="reward-delete-confirm-button"
                disabled={deletingAll}
                onClick={async () => {
                  await deleteAllItems();
                  setDeleteAllConfirmOpen(false);
                }}
              >
                {deletingAll
                  ? "Deleting..."
                  : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {clearCompletedConfirmOpen && (
        <div
          className="modal-backdrop reward-delete-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setClearCompletedConfirmOpen(false);
            }
          }}
        >
          <div className="reward-delete-confirm-modal">
            <div className="reward-delete-confirm-icon">
              <Trash2 size={24} />
            </div>

            <div className="reward-delete-confirm-copy">
              <span>Clear Completed</span>

              <h2>
                Clear {completedItems.length} Completed{" "}
                {completedItems.length === 1
                  ? "Item"
                  : "Items"}?
              </h2>

              <p>
                This will remove the completed items from
                the shopping list.
              </p>

              <small>
                Items still needed will not be removed.
              </small>
            </div>

            <div className="reward-delete-confirm-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setClearCompletedConfirmOpen(false)
                }
                disabled={clearingCompleted}
              >
                Cancel
              </button>

              <button
                type="button"
                className="reward-delete-confirm-button"
                disabled={clearingCompleted}
                onClick={async () => {
                  await clearCompletedItems();
                  setClearCompletedConfirmOpen(false);
                }}
              >
                {clearingCompleted
                  ? "Clearing..."
                  : "Clear Completed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingPage;