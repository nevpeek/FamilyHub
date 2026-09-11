import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:3001";

function RewardModal({
  reward,
  onClose,
  onSaved,
}) {
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [starCost, setStarCost] =
    useState(10);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    showDeleteConfirm,
    setShowDeleteConfirm,
  ] = useState(false);

  const isEditing =
    Boolean(reward?.id);

  useEffect(() => {
    setTitle(
      reward?.title || ""
    );

    setDescription(
      reward?.description || ""
    );

    setStarCost(
      reward?.star_cost !== undefined &&
      reward?.star_cost !== null
        ? Number(reward.star_cost)
        : 10
    );

    setError("");
    setShowDeleteConfirm(false);
  }, [reward]);

  async function handleDelete() {
    if (!reward?.id) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/rewards/${reward.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete reward"
        );
      }

      onSaved?.({
        id: reward.id,
        deleted: true,
      });

      onClose?.();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete reward"
      );
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle =
      title.trim();

    if (!cleanTitle) {
      setError(
        "Enter a reward name."
      );

      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/tasks/rewards/${reward.id}`
          : `${API_BASE_URL}/api/tasks/rewards`,
        {
          method:
            isEditing
              ? "PUT"
              : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: cleanTitle,

            description:
              description.trim() ||
              null,

            starCost:
              Math.max(
                0,
                Number(starCost) || 0
              ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save reward"
        );
      }

      onSaved?.(
        data.reward
      );

      onClose?.();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save reward"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="modal-backdrop"
        onMouseDown={(event) => {
          if (
            event.target ===
              event.currentTarget &&
            !saving &&
            !showDeleteConfirm
          ) {
            onClose?.();
          }
        }}
      >
        <div className="event-modal reward-modal">
          <div className="event-modal-heading">
            <div>
              <span className="section-kicker">
                ⭐ Family Rewards
              </span>

              <h2>
                {isEditing
                  ? "Edit Reward"
                  : "Add Reward"}
              </h2>

              <p>
                Choose something worth
                saving stars for.
              </p>
            </div>

            <button
              type="button"
              className="modal-close-button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close reward"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="event-form"
          >
            <div className="event-field">
              <label htmlFor="reward-title">
                Reward
              </label>

              <input
                id="reward-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Choose dessert"
                autoFocus
              />
            </div>

            <div className="event-field">
              <label htmlFor="reward-description">
                Description
              </label>

              <textarea
                id="reward-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Optional details"
                rows={3}
              />
            </div>

            <div className="event-field">
              <label>
                Star Cost
              </label>

              <div className="reward-cost-picker">
                {[
                  5,
                  10,
                  20,
                  30,
                  50,
                  100,
                ].map(
                  (value) => (
                    <button
                      key={value}
                      type="button"
                      className={`reward-cost-option ${
                        starCost === value
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setStarCost(value)
                      }
                    >
                      {value} ⭐
                    </button>
                  )
                )}
              </div>

              <input
                type="number"
                min="0"
                step="1"
                value={starCost}
                onChange={(event) =>
                  setStarCost(
                    Number(
                      event.target.value
                    )
                  )
                }
              />
            </div>

            {error && (
              <div className="event-form-error">
                {error}
              </div>
            )}

            <div className="event-modal-actions">
              {isEditing && (
                <button
                  type="button"
                  className="reward-delete-button"
                  onClick={() =>
                    setShowDeleteConfirm(
                      true
                    )
                  }
                  disabled={saving}
                >
                  Delete Reward
                </button>
              )}

              <div className="reward-modal-action-spacer" />

              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="add-event-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Save Reward"
                    : "Add Reward"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          className="modal-backdrop reward-delete-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !saving
            ) {
              setShowDeleteConfirm(
                false
              );
            }
          }}
        >
          <div className="reward-delete-confirm-modal">
            <div className="reward-delete-confirm-icon">
              🗑️
            </div>

            <div className="reward-delete-confirm-copy">
              <span>
                Delete Reward
              </span>

              <h2>
                {reward?.title}
              </h2>

              <p>
                Are you sure you want to
                delete this reward?
              </p>

              <small>
                This removes it from the
                family rewards list.
              </small>
            </div>

            <div className="reward-delete-confirm-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={saving}
                onClick={() =>
                  setShowDeleteConfirm(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="reward-delete-confirm-button"
                disabled={saving}
                onClick={handleDelete}
              >
                {saving
                  ? "Deleting..."
                  : "Delete Reward"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RewardModal;