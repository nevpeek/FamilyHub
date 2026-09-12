import {
  ChevronRight,
  ShoppingCart,
} from "lucide-react";

function HomeContextCards({
  homeMeals,
  openShoppingItems,
  onNavigate,
  onAddMeal,
}) {
  return (
    <>
      <button
        type="button"
        className="home-tonight-context"
        onClick={() =>
          homeMeals.length > 0
            ? onNavigate("meals")
            : onAddMeal?.()
        }
      >
        <span>Tonight</span>

        <strong>
          {homeMeals.length > 0
            ? homeMeals[0].title
            : "Plan dinner"}
        </strong>

        <ChevronRight
          className="home-tonight-arrow"
          size={16}
        />
      </button>

      {openShoppingItems.length > 0 && (
        <button
          type="button"
          className="home-shopping-context"
          onClick={() =>
            onNavigate("shopping")
          }
        >
          <span className="home-shopping-context-label">
            <ShoppingCart size={14} />
            Shopping
          </span>

          <strong>
            {openShoppingItems.length}{" "}
            {openShoppingItems.length === 1
              ? "item"
              : "items"}{" "}
            left
          </strong>

          <ChevronRight
            className="home-shopping-context-arrow"
            size={16}
          />
        </button>
      )}
    </>
  );
}

export default HomeContextCards;