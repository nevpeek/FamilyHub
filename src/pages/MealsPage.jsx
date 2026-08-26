import { useEffect, useMemo, useState } from "react";
import {
  Coffee,
  Plus,
  Sandwich,
  Soup,
  Utensils,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

function formatMealDate(dateKey) {
  if (!dateKey) {
    return "";
  }

  const [year, month, day] =
    dateKey.split("-").map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function getMealIcon(mealType) {
  switch (mealType) {
    case "breakfast":
      return Coffee;

    case "lunch":
      return Sandwich;

    case "dinner":
      return Soup;

    default:
      return Utensils;
  }
}

function MealsPage({
  members,
  selectedMemberId,
  setSelectedMemberId,
  mealRefreshKey,
  onAddMeal,
  onEditMeal,
}) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mealTypeFilter, setMealTypeFilter] =
    useState("all");

  useEffect(() => {
    async function loadMeals() {
      setLoading(true);
      setError("");

      try {
        const params =
          new URLSearchParams();

        if (selectedMemberId !== "all") {
          params.set(
            "memberId",
            String(selectedMemberId)
          );
        }

        if (mealTypeFilter !== "all") {
          params.set(
            "mealType",
            mealTypeFilter
          );
        }

        const query = params.toString();

        const response = await fetch(
          `${API_BASE_URL}/api/meals${
            query ? `?${query}` : ""
          }`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load meals"
          );
        }

        const data =
          await response.json();

        setMeals(data.meals || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load meals");
      } finally {
        setLoading(false);
      }
    }

    loadMeals();
  }, [
    selectedMemberId,
    mealTypeFilter,
    mealRefreshKey,
  ]);

  const groupedMeals = useMemo(() => {
    const groups = new Map();

    for (const meal of meals) {
      if (!groups.has(meal.meal_date)) {
        groups.set(
          meal.meal_date,
          []
        );
      }

      groups.get(meal.meal_date).push(
        meal
      );
    }

    return [...groups.entries()];
  }, [meals]);

  return (
    <div className="meals-page">
      <section className="calendar-page-heading">
        <div>
          <p className="section-kicker">
            Meals
          </p>

          <h2>Meal Planner</h2>

          <p>
            Plan meals for the family and
            keep dinner organised.
          </p>
        </div>

        <button
          type="button"
          className="add-event-button"
          onClick={onAddMeal}
        >
          <Plus size={22} />
          <span>Add Meal</span>
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

      <section className="meals-toolbar">
        <strong>
          {meals.length} planned
        </strong>

        <div className="meal-type-filters">
          {[
            "all",
            "breakfast",
            "lunch",
            "dinner",
            "snack",
          ].map((type) => (
            <button
              type="button"
              key={type}
              className={
                mealTypeFilter === type
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setMealTypeFilter(type)
              }
            >
              {type === "all"
                ? "All"
                : type
                    .charAt(0)
                    .toUpperCase() +
                  type.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="panel meal-status-panel">
          Loading meals...
        </div>
      ) : error ? (
        <div className="panel meal-status-panel meal-status-error">
          {error}
        </div>
      ) : meals.length === 0 ? (
        <div className="panel meal-empty-state">
          <Soup size={34} />

          <div>
            <h3>No meals planned</h3>
            <p>
              Add a meal or change the
              filters.
            </p>
          </div>
        </div>
      ) : (
        <div className="meal-day-list">
          {groupedMeals.map(
            ([dateKey, dayMeals]) => (
              <section
                key={dateKey}
                className="meal-day-group"
              >
                <div className="meal-day-heading">
                  <span>
                    {formatMealDate(
                      dateKey
                    )}
                  </span>
                </div>

                <div className="meal-card-list">
                  {dayMeals.map((meal) => {
                    const Icon =
                      getMealIcon(
                        meal.meal_type
                      );

                    return (
                      <button
                        type="button"
                        key={meal.id}
                        className="meal-card"
                        onClick={() =>
                          onEditMeal?.(
                            meal
                          )
                        }
                      >
                        <div className="meal-card-icon">
                          <Icon size={24} />
                        </div>

                        <div className="meal-card-content">
                          <div className="meal-card-top">
                            <div>
                              <span className="meal-card-type">
                                {
                                  meal.meal_type
                                }
                              </span>

                              <h3>
                                {meal.title}
                              </h3>

                              {meal.description && (
                                <p>
                                  {
                                    meal.description
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="meal-card-members">
                            {(
                              meal.members ||
                              []
                            ).map(
                              (member) => (
                                <span
                                  key={
                                    member.id
                                  }
                                  className="meal-card-member"
                                >
                                  <span
                                    className="meal-card-dot"
                                    style={{
                                      backgroundColor:
                                        member.colour,
                                    }}
                                  />

                                  {
                                    member.name
                                  }
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default MealsPage;