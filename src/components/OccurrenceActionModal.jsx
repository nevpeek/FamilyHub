import { Pencil, Trash2, X } from "lucide-react";

const API_BASE_URL = "http://localhost:3001";

function OccurrenceActionModal({
  isOpen,
  event,
  onClose,
  onEditOccurrence,
  onOccurrenceDeleted,
}) {
  if (!isOpen || !event) {
    return null;
  }

  async function handleDeleteOccurrence() {
    const confirmed = window.confirm(
      `Remove "${event.title}" on ${event.occurrence_date}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/events/${event.series_event_id || event.id}/occurrences/${event.occurrence_date}/cancel`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to remove occurrence"
        );
      }

      onOccurrenceDeleted?.();
      onClose();
    } catch (error) {
      console.error(error);
      window.alert(
        error.message || "Unable to remove occurrence"
      );
    }
  }

  return (
    <div className="event-modal-backdrop">
      <div
        className="occurrence-action-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="event-modal-header">
          <div>
            <p className="section-kicker">Single occurrence</p>
            <h2>{event.title}</h2>
          </div>

          <button
            type="button"
            className="event-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="occurrence-action-content">
          <p>
            You&apos;re working with only the occurrence on{" "}
            <strong>{event.occurrence_date}</strong>.
          </p>

          <button
            type="button"
            className="recurring-choice-button"
            onClick={() => onEditOccurrence?.(event)}
          >
            <div className="recurring-choice-icon">
              <Pencil size={22} />
            </div>

            <div>
              <strong>Edit this occurrence</strong>
              <span>
                Change only this date and leave the rest of the series alone.
              </span>
            </div>
          </button>

          <button
            type="button"
            className="event-delete-button occurrence-delete-button"
            onClick={handleDeleteOccurrence}
          >
            <Trash2 size={18} />
            Remove this occurrence
          </button>

          <button
            type="button"
            className="event-secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default OccurrenceActionModal;