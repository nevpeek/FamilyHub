import {
  CalendarDays,
  Layers3,
  Repeat2,
  X,
} from "lucide-react";

function RecurringTaskChoiceModal({
  isOpen,
  task,
  onClose,
  onThisTask,
  onThisAndFuture,
  onEntireSeries,
}) {
  if (!isOpen || !task) {
    return null;
  }

  return (
    <div className="event-modal-backdrop">
      <div
        className="recurring-choice-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="event-modal-header">
          <div>
            <p className="section-kicker">
              Recurring task
            </p>

            <h2>{task.title}</h2>
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

        <div className="recurring-choice-content">
          <p>
            This task is part of a recurring series.
            What would you like to change?
          </p>

          <button
            type="button"
            className="recurring-choice-button"
            onClick={onThisTask}
          >
            <div className="recurring-choice-icon">
              <CalendarDays size={24} />
            </div>

            <div>
              <strong>This task only</strong>

              <span>
                Change or remove only this occurrence.
              </span>
            </div>
          </button>

          <button
            type="button"
            className="recurring-choice-button"
            onClick={onThisAndFuture}
          >
            <div className="recurring-choice-icon">
              <Repeat2 size={24} />
            </div>

            <div>
              <strong>This and future tasks</strong>

              <span>
                Change this occurrence and all
                later occurrences.
              </span>
            </div>
          </button>

          <button
            type="button"
            className="recurring-choice-button"
            onClick={onEntireSeries}
          >
            <div className="recurring-choice-icon">
              <Layers3 size={24} />
            </div>

            <div>
              <strong>Entire series</strong>

              <span>
                Change every occurrence in this
                recurring task.
              </span>
            </div>
          </button>

          <button
            type="button"
            className="event-secondary-button recurring-choice-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecurringTaskChoiceModal;