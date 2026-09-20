import { useEffect, useMemo, useState } from "react";
import {
  PackageOpen,
  Plus,
  Search,
} from "lucide-react";
import PantryItemModal from "../components/PantryItemModal";
import FoodPicture from "../components/FoodPicture";
import { API_BASE_URL } from "../config/api";
import { startAutoRefresh } from "../utils/startAutoRefresh";

function getPantryQuantityNumber(
  quantity
) {
  if (
    quantity === null ||
    quantity === undefined ||
    quantity === ""
  ) {
    return null;
  }

  const match = String(quantity)
    .trim()
    .replace(",", ".")
    .match(/-?\d+(?:\.\d+)?/);

  if (!match) {
    return null;
  }

  const value = Number(match[0]);

  return Number.isFinite(value)
    ? value
    : null;
}

function isPantryItemRunningLow(
  item
) {
  if (
    !Number(item?.low_stock_enabled)
  ) {
    return false;
  }

  const quantity =
    getPantryQuantityNumber(
      item?.quantity
    );

  const threshold =
    Number(
      item?.low_stock_threshold
    );

  if (
    quantity === null ||
    !Number.isFinite(threshold)
  ) {
    return false;
  }

  return quantity <= threshold;
}

function normalizePantryItemName(
  value
) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isPantryItemOnShoppingList(
  pantryItem,
  shoppingItems
) {
  const pantryName =
    normalizePantryItemName(
      pantryItem?.name
    );

  return shoppingItems.some(
    (shoppingItem) =>
      !shoppingItem.is_completed &&
      normalizePantryItemName(
        shoppingItem.name
      ) === pantryName
  );
}

export default function PantryPage() {

const [items, setItems] = useState([]);

const [
  shoppingItems,
  setShoppingItems,
] = useState([]);

const [
  addingToShoppingId,
  setAddingToShoppingId,
] = useState(null);

const [
  adjustingQuantityId,
  setAdjustingQuantityId,
] = useState(null);

const [loading, setLoading] =
  useState(true);

const [error, setError] =
  useState("");

const [searchTerm, setSearchTerm] =
  useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [pantryModalOpen, setPantryModalOpen] =
    useState(false);

  const [selectedPantryItem, setSelectedPantryItem] =
    useState(null);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    let hasLoaded = false;
    const controller = new AbortController();

    setLoading(true);
    setError("");

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

        setItems(data.items || []);
        setError("");
        hasLoaded = true;
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;

        console.error("Pantry refresh error:", err);

        if (!hasLoaded) {
          setError(
            "Unable to load pantry. Retrying…"
          );
        }
      } finally {
        inFlight = false;

        if (!cancelled) {
          setLoading(false);
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
}, []);

useEffect(() => {
  let cancelled = false;

  async function loadShoppingItems() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shopping?completed=false`,
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        cancelled
      ) {
        return;
      }

      setShoppingItems(
        data.items || []
      );
    } catch (err) {
      if (!cancelled) {
        console.error(
          "Unable to load Shopping items:",
          err
        );
      }
    }
  }

  loadShoppingItems();

  const stopAutoRefresh =
    startAutoRefresh(
      loadShoppingItems
    );

  return () => {
    cancelled = true;
    stopAutoRefresh();
  };
}, []);

async function addPantryItemToShopping(
  item
) {
  if (
    addingToShoppingId !== null
  ) {
    return;
  }

  setAddingToShoppingId(item.id);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/shopping/from-pantry`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name: item.name,
          category:
            item.category ||
            "other",
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to add item to Shopping"
      );
    }

    if (data.item) {
      setShoppingItems(
        (current) => {
          const exists =
            current.some(
              (shoppingItem) =>
                shoppingItem.id ===
                data.item.id
            );

          if (exists) {
            return current.map(
              (shoppingItem) =>
                shoppingItem.id ===
                data.item.id
                  ? data.item
                  : shoppingItem
            );
          }

          return [
            ...current,
            data.item,
          ];
        }
      );
    }
  } catch (err) {
    console.error(err);

    window.alert(
      err.message ||
        "Unable to add item to Shopping"
    );
  } finally {
    setAddingToShoppingId(
      null
    );
  }
}

async function adjustPantryQuantity(
  item,
  adjustment
) {
  if (
    adjustingQuantityId !== null
  ) {
    return;
  }

  setAdjustingQuantityId(item.id);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/pantry/${item.id}/quantity`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          adjustment,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to update Pantry quantity"
      );
    }

    if (data.item) {
      setItems((current) =>
        current.map(
          (pantryItem) =>
            pantryItem.id ===
            data.item.id
              ? data.item
              : pantryItem
        )
      );
    }

    /*
     * If dropping the quantity caused
     * automatic Shopping to add this
     * item, refresh the active Shopping
     * list immediately so the Pantry
     * badge changes to:
     *
     * ✓ On Shopping List
     */
    if (
      data.automaticShopping?.added
    ) {
      const shoppingResponse =
        await fetch(
          `${API_BASE_URL}/api/shopping?completed=false`,
          {
            cache: "no-store",
          }
        );

      if (shoppingResponse.ok) {
        const shoppingData =
          await shoppingResponse.json();

        setShoppingItems(
          shoppingData.items || []
        );
      }
    }
  } catch (err) {
    console.error(err);

    window.alert(
      err.message ||
        "Unable to update Pantry quantity"
    );
  } finally {
    setAdjustingQuantityId(null);
  }
}

const filteredItems = useMemo(() => {

  const search =
    searchTerm.trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch =
      !search ||
      [
        item.name,
        item.category,
        item.notes,
      ]
        .filter(Boolean)
        .some((value) =>
          value
            .toLowerCase()
            .includes(search)
        );

    const matchesCategory =
      categoryFilter === "all"
        ? true
        : categoryFilter ===
            "running-low"
          ? isPantryItemRunningLow(
              item
            )
          : item.category ===
            categoryFilter;

    return (
      matchesSearch &&
      matchesCategory
    );
  });
}, [
  items,
  searchTerm,
  categoryFilter,
]);

const runningLowCount =
  useMemo(
    () =>
      items.filter(
        isPantryItemRunningLow
      ).length,
    [items]
  );

  return (
    <div className="pantry-page">
      <section className="page-title-row">
        <div>
          <p className="section-kicker">
            Pantry
          </p>

          <h2>Already Have</h2>

          <p className="page-description">
            Keep track of ingredients and
            staples already in the house.
          </p>
        </div>

        <button
          type="button"
          className="add-event-button"
          onClick={() => {
            setSelectedPantryItem(null);
            setPantryModalOpen(true);
          }}
        >
          <Plus size={20} />
          <span>Add Item</span>
        </button>
      </section>

<section className="pantry-toolbar pantry-toolbar-combined">
  <div className="pantry-search">
    <Search size={18} />

    <input
      type="search"
      placeholder="Search pantry..."
      value={searchTerm}
      onChange={(event) =>
        setSearchTerm(
          event.target.value
        )
      }
    />
  </div>

  <div
    className="pantry-category-filter"
    role="group"
    aria-label="Filter pantry by category"
  >
{[
  ["all", "All"],
  [
    "running-low",
    "Running Low",
  ],
  ["produce", "Produce"],
  ["meat", "Meat"],
  ["dairy", "Dairy"],
  ["bakery", "Bakery"],
  ["pantry", "Pantry"],
  ["frozen", "Frozen"],
  ["drinks", "Drinks"],
  ["household", "Household"],
  ["other", "Other"],
].map(
  ([value, label]) => {
    const count =
      value === "all"
        ? items.length
        : value ===
            "running-low"
          ? runningLowCount
          : items.filter(
              (item) =>
                item.category ===
                value
            ).length;

    return (
      <button
        key={value}
        type="button"
        className={`pantry-category-filter-button ${
          categoryFilter === value
            ? "is-active"
            : ""
        } ${
          value ===
          "running-low"
            ? "pantry-running-low-filter"
            : ""
        }`}
        onClick={() =>
          setCategoryFilter(
            value
          )
        }
        aria-pressed={
          categoryFilter === value
        }
      >
        <span>{label}</span>

        <small>
          {count}
        </small>
      </button>
    );
  }
)}
  </div>

  <span className="pantry-count">
    {filteredItems.length}{" "}
    {filteredItems.length === 1
      ? "item"
      : "items"}
  </span>
</section>

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">
            <PackageOpen size={28} />
          </div>

          <div>
            <h4>Loading pantry...</h4>
          </div>
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-icon">
            <PackageOpen size={28} />
          </div>

          <div>
            <h4>{error}</h4>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <PackageOpen size={28} />
          </div>

          <div>
            <h4>
              {items.length === 0
                ? "Your pantry is empty"
                : "No pantry items found"}
            </h4>

            <p>
              {items.length === 0
                ? "Add things you already have at home."
                : "Try a different search."}
            </p>
          </div>
        </div>
      ) : (
        <div className="pantry-grid">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="pantry-card"
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedPantryItem(item);
                setPantryModalOpen(true);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  setSelectedPantryItem(item);
                  setPantryModalOpen(true);
                }
              }}
            >
<FoodPicture
  name={item.name}
  category={item.category}
  size="large"
/>

<div className="pantry-card-content">
  <div className="pantry-card-heading">
    <strong className="pantry-card-name">
      {item.name}
    </strong>

    {item.pack_size && (
      <span className="pantry-card-pack-size">
        {item.pack_size}
      </span>
    )}
  </div>

<div className="pantry-card-details">
<div
  className="pantry-quantity-stepper"
  onClick={(event) =>
    event.stopPropagation()
  }
>
  <button
    type="button"
    className="pantry-quantity-stepper-button"
    disabled={
      adjustingQuantityId ===
        item.id ||
      Number(item.quantity) <= 0
    }
    onClick={(event) => {
      event.stopPropagation();

      adjustPantryQuantity(
        item,
        -1
      );
    }}
    aria-label={`Decrease ${item.name} quantity`}
  >
    −
  </button>

  <span className="pantry-quantity-stepper-value">
    {item.quantity ?? 1}
  </span>

  <button
    type="button"
    className="pantry-quantity-stepper-button"
    disabled={
      adjustingQuantityId ===
      item.id
    }
    onClick={(event) => {
      event.stopPropagation();

      adjustPantryQuantity(
        item,
        1
      );
    }}
    aria-label={`Increase ${item.name} quantity`}
  >
    +
  </button>
</div>

<div className="pantry-card-badges">
  {isPantryItemRunningLow(
    item
  ) && (
    <>
      <span className="pantry-low-stock-badge">
        LOW
      </span>

      {isPantryItemOnShoppingList(
        item,
        shoppingItems
      ) ? (
        <span className="pantry-on-shopping-badge">
          ✓ On Shopping List
        </span>
      ) : (
        <button
          type="button"
          className="pantry-add-shopping-button"
          disabled={
            addingToShoppingId ===
            item.id
          }
          onClick={(event) => {
            event.stopPropagation();

            addPantryItemToShopping(
              item
            );
          }}
        >
          {addingToShoppingId ===
          item.id
            ? "Adding..."
            : "+ Shopping"}
        </button>
      )}
    </>
  )}

  <span
    className={`pantry-category-badge pantry-category-${item.category}`}
  >
    {item.category}
  </span>
</div>
</div>
</div>

            </article>
          ))}
        </div>
      )}
      <PantryItemModal
        open={pantryModalOpen}
        item={selectedPantryItem}
        onClose={() => {
          setPantryModalOpen(false);
          setSelectedPantryItem(null);
        }}
        onSaved={(savedItem) => {
          setItems((current) => {
            const exists = current.some(
              (item) =>
                item.id === savedItem.id
            );

            if (exists) {
              return current.map((item) =>
                item.id === savedItem.id
                  ? savedItem
                  : item
              );
            }

            return [
              ...current,
              savedItem,
            ];
          });

          setPantryModalOpen(false);
          setSelectedPantryItem(null);
        }}
        onDeleted={(itemId) => {
          setItems((current) =>
            current.filter(
              (item) =>
                item.id !== itemId
            )
          );

          setPantryModalOpen(false);
          setSelectedPantryItem(null);
        }}
      />
    </div>
  );
}
