import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  ShoppingCart,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

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
            <div>
              <span className="shopping-category">
                {item.category}
              </span>

              <h3>{item.name}</h3>

              {item.notes && (
                <p>{item.notes}</p>
              )}
            </div>

            {item.quantity && (
              <span className="shopping-quantity">
                {item.quantity}
              </span>
            )}
          </div>

          <div className="shopping-card-members">
            {(item.members || []).map(
              (member) => (
                <span
                  key={member.id}
                  className="shopping-member"
                >
                  <span
                    className="shopping-member-dot"
                    style={{
                      backgroundColor:
                        member.colour,
                    }}
                  />

                  {member.name}
                </span>
              )
            )}
          </div>
        </button>
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

        <button
          type="button"
          className="add-event-button"
          onClick={onAddItem}
        >
          <Plus size={22} />
          <span>Add Item</span>
        </button>
      </section>

      <section className="calendar-family-filters">
        <button
          type="button"
          className={`calendar-person-filter ${
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
            className={`calendar-person-filter ${
              selectedMemberId === member.id
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setSelectedMemberId(member.id)
            }
          >
            <span
              className="calendar-person-dot"
              style={{
                backgroundColor:
                  member.colour,
              }}
            />

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
        <div className="shopping-list">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}

export default ShoppingPage;