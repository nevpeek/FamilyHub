import { API_BASE_URL } from "../config/api";

function HomeFamilySelector({
  members,
  loading,
  error,
  selectedMemberId,
  setSelectedMemberId,
}) {
  return (
    <section className="family-filter-section family-selector-section">
      {loading && (
        <p className="status-message">
          Loading family...
        </p>
      )}

      {error && (
        <p className="status-message status-message-error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="family-selector">
          <button
            type="button"
            className={`family-selector-button family-selector-everyone ${
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
              className={`family-selector-button ${
                selectedMemberId === member.id
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedMemberId(member.id)
              }
            >
              <span
                className="family-selector-avatar"
                style={{
                  backgroundColor:
                    member.colour,
                }}
              >
                {member.photo_url ? (
                  <img
                    src={`${API_BASE_URL}${member.photo_url}`}
                    alt={member.name}
                  />
                ) : (
                  member.initials ||
                  member.name
                    .charAt(0)
                    .toUpperCase()
                )}
              </span>

              {member.name}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default HomeFamilySelector;