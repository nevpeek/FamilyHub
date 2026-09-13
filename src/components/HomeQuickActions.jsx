import {
  CalendarDays,
  CheckSquare,
  ShoppingCart,
  Soup,
} from "lucide-react";

function HomeQuickActions({
  onAddEvent,
  onAddTask,
  onAddMeal,
  onAddShoppingItem,
}) {
  return (
    <section className="home-quick-actions">
      <button
        type="button"
        className="home-quick-action"
        onClick={() => onAddEvent?.()}
      >
        <CalendarDays size={22} />
        <span>Event</span>
      </button>

      <button
        type="button"
        className="home-quick-action"
        onClick={() => onAddTask?.()}
      >
        <CheckSquare size={22} />
        <span>Task</span>
      </button>

      <button
        type="button"
        className="home-quick-action"
        onClick={() => onAddMeal?.()}
      >
        <Soup size={22} />
        <span>Meal</span>
      </button>

      <button
        type="button"
        className="home-quick-action"
        onClick={() => onAddShoppingItem?.()}
      >
        <ShoppingCart size={22} />
        <span>Shopping</span>
      </button>
    </section>
  );
}

export default HomeQuickActions;