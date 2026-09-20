import {
  ChevronRight,
  ShoppingCart,
} from "lucide-react";

function HomeContextCards({
  openShoppingItems,
  onNavigate,
}) {
  const count = openShoppingItems.length;

  return (
<article className="panel quick-panel home-shopping-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Shopping</p>
          <h3>Household shopping</h3>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() => onNavigate("shopping")}
        >
          View shopping
          <ChevronRight size={18} />
        </button>
      </div>

      <button
        type="button"
        className="home-shopping-summary"
        onClick={() => onNavigate("shopping")}
      >
        <span className="home-shopping-summary-icon">
          <ShoppingCart size={24} />
        </span>

        <span className="home-shopping-summary-copy">
          <strong>
            {count === 0
              ? "All stocked up"
              : `${count} ${count === 1 ? "item" : "items"} to pick up`}
          </strong>
          <small>
            {count === 0
              ? "Open Shopping to add an item"
              : "Open your shopping list"}
          </small>
        </span>

        <ChevronRight size={18} />
      </button>
    </article>
  );
}

export default HomeContextCards;