import {
  ChevronRight,
  Clock3,
  PackageOpen,
  ShoppingCart,
  Soup,
  Sparkles,
} from "lucide-react";

function quantityNumber(value) {
  const match = String(value ?? "")
    .replace(",", ".")
    .match(/-?\d+(?:\.\d+)?/);

  return match ? Number(match[0]) : null;
}

function isRunningLow(item) {
  if (!Number(item?.low_stock_enabled)) return false;

  const quantity = quantityNumber(item.quantity);
  const threshold = Number(item.low_stock_threshold);

  return (
    quantity !== null &&
    Number.isFinite(threshold) &&
    quantity <= threshold
  );
}

function recipePantryScore(recipe, pantryItems) {
  const ingredients = String(recipe.ingredients || "").toLowerCase();

  return pantryItems.reduce((score, item) => {
    const name = String(item.name || "").trim().toLowerCase();
    return name && ingredients.includes(name) ? score + 1 : score;
  }, 0);
}

function recipeMinutes(recipe) {
  return (
    Number(recipe?.prep_time || 0) +
    Number(recipe?.cook_time || 0)
  );
}

function PlanningCard({ icon: Icon, eyebrow, title, detail, onClick }) {
  return (
    <button type="button" className="home-planning-card" onClick={onClick}>
      <span className="home-planning-card-icon">
        <Icon size={20} />
      </span>
      <span className="home-planning-card-copy">
        <small>{eyebrow}</small>
        <strong>{title}</strong>
        <span>{detail}</span>
      </span>
      <ChevronRight size={18} />
    </button>
  );
}

export default function HomeSmartPlanningPanel({
  pantryItems,
  recipes,
  openShoppingItems,
  upcomingDays,
  onNavigate,
  onPlanBusyMeal,
}) {
  const lowStockItems = pantryItems.filter(isRunningLow);

  const scoredRecipes = recipes
    .map((recipe) => ({
      recipe,
      score: recipePantryScore(recipe, pantryItems),
    }))
    .filter((item) => item.score > 0)
    .sort(
      (first, second) =>
        second.score - first.score ||
        String(first.recipe.title).localeCompare(String(second.recipe.title))
    );

  const suggestedRecipe = scoredRecipes[0];

  const busiestUnplannedDay = [...upcomingDays]
    .filter((day) => day.meals.length === 0)
    .sort((first, second) => {
      const firstPlans = first.events.length + first.tasks.length;
      const secondPlans = second.events.length + second.tasks.length;

      return secondPlans - firstPlans || first.date - second.date;
    })[0];

  const quickRecipes = recipes
    .filter((recipe) => recipeMinutes(recipe) > 0)
    .sort(
      (first, second) =>
        recipeMinutes(first) - recipeMinutes(second) ||
        String(first.title).localeCompare(String(second.title))
    );

  const quickRecipe =
    quickRecipes.find(
      (recipe) => recipe.id !== suggestedRecipe?.recipe.id
    ) || quickRecipes[0];

  const busyDayPlanCount = busiestUnplannedDay
    ? busiestUnplannedDay.events.length + busiestUnplannedDay.tasks.length
    : 0;

  const busyDayName = busiestUnplannedDay?.date.toLocaleDateString(
    "en-AU",
    { weekday: "long" }
  );

  return (
    <section className="home-smart-planning" aria-label="Smart planning suggestions">
      <div className="home-smart-planning-heading">
        <span><Sparkles size={18} /></span>
        <div>
          <p>Smart planning</p>
          <h3>Useful next steps</h3>
        </div>
      </div>

      <div className="home-smart-planning-grid">
        <PlanningCard
          icon={Soup}
          eyebrow="Cook from the pantry"
          title={suggestedRecipe?.recipe.title || "Browse saved recipes"}
          detail={
            suggestedRecipe
              ? `${suggestedRecipe.score} pantry ${suggestedRecipe.score === 1 ? "match" : "matches"}`
              : "Save ingredients to unlock suggestions"
          }
          onClick={() => onNavigate("meals")}
        />

        <PlanningCard
          icon={lowStockItems.length ? ShoppingCart : PackageOpen}
          eyebrow="Pantry check"
          title={
            lowStockItems.length
              ? `${lowStockItems.length} ${lowStockItems.length === 1 ? "item is" : "items are"} running low`
              : "Pantry levels look good"
          }
          detail={
            lowStockItems[0]?.name ||
            `${openShoppingItems.length} shopping ${openShoppingItems.length === 1 ? "item" : "items"} open`
          }
          onClick={() => onNavigate(lowStockItems.length ? "pantry" : "shopping")}
        />

        <PlanningCard
          icon={Clock3}
          eyebrow="Busy-day dinner"
          title={quickRecipe?.title || "Plan an easy dinner"}
          detail={
            busiestUnplannedDay && quickRecipe
              ? busyDayPlanCount > 0
                ? `${busyDayName} has ${busyDayPlanCount} ${busyDayPlanCount === 1 ? "plan" : "plans"} · ${recipeMinutes(quickRecipe)} min`
                : `Keep ${busyDayName} easy · ${recipeMinutes(quickRecipe)} min`
              : busiestUnplannedDay
                ? `${busyDayName} has no dinner planned`
                : "Your next seven dinners are covered"
          }
          onClick={() => {
            if (quickRecipe && busiestUnplannedDay) {
              onPlanBusyMeal(quickRecipe, {
                mealDate: busiestUnplannedDay.dateKey,
                mealType: "dinner",
              });
              return;
            }

            onNavigate("meals");
          }}
        />
      </div>
    </section>
  );
}
