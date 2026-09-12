import { API_BASE_URL } from "../config/api";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

function EventDetailsModal({
  event,
  onClose,
  onEdit,
}) {
  const [eventWeather, setEventWeather] =
    useState(null);

  const [eventWeatherLoading, setEventWeatherLoading] =
    useState(false);

  useEffect(() => {
    if (
      !event?.weather_lat ||
      !event?.weather_lon ||
      !event?.start_date
    ) {
      setEventWeather(null);
      return;
    }

    let cancelled = false;

    async function loadEventWeather() {
      setEventWeatherLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/weather?latitude=${event.weather_lat}&longitude=${event.weather_lon}`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load event weather"
          );
        }

        const data = await response.json();

        const forecast =
          data.daily?.find(
            (day) =>
              day.date === event.start_date
          ) || null;

        if (!cancelled) {
          setEventWeather(forecast);
        }
      } catch (err) {
        console.error(
          "Unable to load event weather:",
          err
        );

        if (!cancelled) {
          setEventWeather(null);
        }
      } finally {
        if (!cancelled) {
          setEventWeatherLoading(false);
        }
      }
    }

    loadEventWeather();

    return () => {
      cancelled = true;
    };
  }, [
    event?.weather_lat,
    event?.weather_lon,
    event?.start_date,
  ]);

  if (!event) {
    return null;
  }

  return (
    <div className="event-modal-backdrop">
      <div
        className="event-modal event-details-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="event-modal-header">
          <div>
            <p className="section-kicker">
              Event
            </p>

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

<div className="event-details-content">
  <div className="event-details-section">
    <span className="event-details-label">
      Date & Time
    </span>

    <strong>
      {new Date(
        `${event.start_date}T12:00:00`
      ).toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </strong>

    <span>
      {event.all_day
        ? "All day"
        : `${event.start_time || ""}${
            event.end_time
              ? ` – ${event.end_time}`
              : ""
          }`}
    </span>
  </div>

  {event.members?.length > 0 && (
    <div className="event-details-section">
      <span className="event-details-label">
        Family
      </span>

      <div className="event-details-members">
        {event.members.map((member) => (
          <span
            key={member.id}
            className="event-details-member"
          >
            <span
              className="event-details-member-avatar"
              style={{
                backgroundColor: member.colour,
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
          </span>
        ))}
      </div>
    </div>
  )}

  {(event.location || event.address) && (
    <div className="event-details-section">
      <span className="event-details-label">
        Location
      </span>

      {event.location && (
        <strong>{event.location}</strong>
      )}

      {event.address && (
        <span>{event.address}</span>
      )}
    </div>
  )}

  {event.weather_lat &&
  event.weather_lon && (
    <div className="event-details-section">
      <span className="event-details-label">
        Weather
      </span>

      {eventWeatherLoading ? (
        <span>Loading forecast...</span>
      ) : eventWeather ? (
        <>
          <strong>
            {Math.round(
              eventWeather.temperatureMax
            )}
            ° /{" "}
            {Math.round(
              eventWeather.temperatureMin
            )}
            °
          </strong>

          <span>
            Rain chance:{" "}
            {eventWeather.precipitationProbability ??
              0}
            %
          </span>

{eventWeather.warnings?.length > 0 && (
  <div className="event-weather-warnings">
    {eventWeather.warnings.map(
      (warning, index) => (
        <div
          key={`${warning.type}-${index}`}
          className={`event-weather-warning event-weather-warning-${warning.severity}`}
        >
          <strong>
            {warning.title}
          </strong>

          <span>
            {warning.message}
          </span>
        </div>
      )
    )}
  </div>
)}

        </>
      ) : (
        <span>
          Forecast not available yet
        </span>
      )}
    </div>
  )}

  {event.url && (
    <div className="event-details-section">
      <span className="event-details-label">
        Event Link
      </span>

      <a
        href={event.url}
        target="_blank"
        rel="noreferrer"
        className="event-details-link"
      >
        Open event link
      </a>
    </div>
  )}

  {event.notes && (
    <div className="event-details-section">
      <span className="event-details-label">
        Notes
      </span>

      <p className="event-details-notes">
        {event.notes}
      </p>
    </div>
  )}

  {event.category && (
    <div className="event-details-section">
      <span className="event-details-label">
        Category
      </span>

      <span className="event-details-category">
        {event.category}
      </span>
    </div>
  )}
</div>

        <div className="event-modal-actions">
          <div />

          <div className="event-modal-action-right">
            <button
              type="button"
              className="event-cancel-button"
              onClick={onClose}
            >
              Close
            </button>

            <button
              type="button"
              className="event-save-button"
              onClick={() => onEdit?.(event)}
            >
              Edit Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailsModal;
