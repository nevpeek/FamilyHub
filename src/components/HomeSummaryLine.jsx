function HomeSummaryLine({
  todayEvents,
  todayTaskAssignments,
  todayTaskCompletions,
  homeMeals,
  openShoppingItems,
  homeLists,
  onNavigate,
}) {
  const openListItems = homeLists.reduce(
    (total, list) =>
      total +
      Number(
        list.open_count || 0
      ),
    0
  );

  return (
    <div className="home-summary-line">
      <button
        type="button"
        className="home-summary-link"
        onClick={() =>
          onNavigate("calendar")
        }
      >
        <strong>
          {todayEvents.length}
        </strong>{" "}
        {todayEvents.length === 1
          ? "event"
          : "events"}{" "}
        today
      </button>

      <span>·</span>

      <button
        type="button"
        className="home-summary-link"
        onClick={() =>
          onNavigate("tasks")
        }
      >
        {todayTaskAssignments > 0 ? (
          <>
            <strong>
              {todayTaskCompletions}/
              {todayTaskAssignments}
            </strong>{" "}
            chores done
          </>
        ) : (
          "No chores due"
        )}
      </button>

      <span>·</span>

      <button
        type="button"
        className="home-summary-link"
        onClick={() =>
          onNavigate("meals")
        }
      >
        {homeMeals.length > 0
          ? `${homeMeals[0].title} tonight`
          : "No dinner planned"}
      </button>

      {openShoppingItems.length > 0 && (
        <>
          <span>·</span>

          <button
            type="button"
            className="home-summary-link"
            onClick={() =>
              onNavigate("shopping")
            }
          >
            <strong>
              {openShoppingItems.length}
            </strong>{" "}
            {openShoppingItems.length === 1
              ? "shopping item"
              : "shopping items"}
          </button>
        </>
      )}

      <span>·</span>

      <button
        type="button"
        className="home-summary-link"
        onClick={() =>
          onNavigate("lists")
        }
      >
        <strong>
          {openListItems}
        </strong>{" "}
        list items open
      </button>
    </div>
  );
}

export default HomeSummaryLine;