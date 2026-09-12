import {
  CheckSquare,
  ChevronRight,
} from "lucide-react";

function HomeListsPanel({
  homeLists,
  homeListsLoading,
  onNavigate,
}) {
  return (
    <article className="panel quick-panel home-lists-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">
            Family Lists
          </p>

          <h3>
            Household lists
          </h3>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() =>
            onNavigate("lists")
          }
        >
          View lists
          <ChevronRight size={18} />
        </button>
      </div>

      {homeListsLoading ? (
        <div className="small-empty-state">
          <CheckSquare size={24} />
          <span>
            Loading lists...
          </span>
        </div>
      ) : homeLists.length === 0 ? (
        <div className="small-empty-state">
          <CheckSquare size={24} />
          <span>
            No family lists yet
          </span>
        </div>
      ) : (
        <div className="home-family-lists">
          {homeLists
            .slice()
            .sort(
              (a, b) =>
                Number(
                  b.open_count || 0
                ) -
                Number(
                  a.open_count || 0
                )
            )
            .slice(0, 4)
            .map((list) => (
              <button
                key={list.id}
                type="button"
                className="home-family-list-card"
                style={{
                  "--list-colour":
                    list.colour ||
                    "#22c55e",
                }}
                onClick={() =>
                  onNavigate("lists")
                }
              >
                <span className="home-family-list-icon">
                  {list.icon || "📋"}
                </span>

                <span className="home-family-list-copy">
                  <strong>
                    {list.name}
                  </strong>

                  <small>
                    {Number(
                      list.open_count ||
                        0
                    )}{" "}
                    {Number(
                      list.open_count ||
                        0
                    ) === 1
                      ? "item open"
                      : "items open"}
                  </small>
                </span>

                <ChevronRight
                  size={16}
                />
              </button>
            ))}
        </div>
      )}
    </article>
  );
}

export default HomeListsPanel;