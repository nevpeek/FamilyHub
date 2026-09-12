import {
  ChevronRight,
  Plus,
  Soup,
} from "lucide-react";

function HomeDinnerPanel({
  homeMeals,
  homeMealsLoading,
  homeMealsError,
  onNavigate,
  onAddMeal,
}) {
  return (
    <article className="panel quick-panel home-dinner-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">
            Dinner
          </p>

          <h3>
            Tonight&apos;s meal
          </h3>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() =>
            onNavigate("meals")
          }
        >
          View meals
          <ChevronRight size={18} />
        </button>
      </div>

      {homeMealsLoading ? (
        <div className="small-empty-state">
          <Soup size={24} />
          <span>
            Loading dinner...
          </span>
        </div>
      ) : homeMealsError ? (
        <div className="small-empty-state">
          <Soup size={24} />
          <span>
            {homeMealsError}
          </span>
        </div>
      ) : homeMeals.length === 0 ? (
        <div className="small-empty-state">
          <Soup size={24} />

          <span>
            Nothing planned yet
          </span>

          <button
            type="button"
            className="home-dinner-plan-button"
            onClick={onAddMeal}
          >
            <Plus size={15} />
            Plan dinner
          </button>
        </div>
      ) : (
        <div className="home-meal-list">
          {homeMeals.map((meal) => (
            <div
              key={meal.id}
              className="home-meal-card"
            >
              <div className="home-meal-icon">
                <Soup size={22} />
              </div>

              <div className="home-meal-content">
                <strong>
                  {meal.title}
                </strong>

                <span className="home-meal-meta">
                  Dinner
                  {meal.description
                    ? ` · ${meal.description}`
                    : ""}
                </span>

                <div className="home-meal-members">
                  {(meal.members || []).map(
                    (member) => (
                      <span
                        key={member.id}
                        className="home-meal-member"
                      >
                        <span
                          className="home-meal-dot"
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
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default HomeDinnerPanel;