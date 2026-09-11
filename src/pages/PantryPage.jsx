import { useEffect, useMemo, useState } from "react";
import {
  PackageOpen,
  Plus,
  Search,
} from "lucide-react";
import PantryItemModal from "../components/PantryItemModal";
import FoodPicture from "../components/FoodPicture";

const API_BASE_URL = "http://localhost:3001";

export default function PantryPage() {
  const [items, setItems] = useState([]);
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
    async function loadPantry() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/pantry`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load pantry"
          );
        }

        setItems(data.items || []);
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to load pantry"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPantry();
  }, []);

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
        categoryFilter === "all" ||
        item.category ===
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

      <section className="pantry-toolbar">
        <div className="pantry-search">
          <Search size={18} />

          <input
            type="search"
            aria-label="Search pantry"
            placeholder="Search pantry..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />
        </div>

        <div className="pantry-toolbar-actions">
          <select
            aria-label="Filter pantry by category"
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
            <option value="drinks">
              Drinks
            </option>
            <option value="household">
              Household
            </option>
            <option value="other">
              Other
            </option>
          </select>

          <span className="pantry-count">
            {filteredItems.length}{" "}
            {filteredItems.length === 1
              ? "item"
              : "items"}
          </span>
        </div>
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
  <strong>
    {item.name}
  </strong>

                <span>
                  {item.quantity ||
                    "In pantry"}
                </span>

                <small>
                  {item.category}
                </small>
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
