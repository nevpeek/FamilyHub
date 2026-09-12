import {
  CalendarDays,
} from "lucide-react";

function HomeCountdownPanel({
  currentTime,
  upcomingCountdowns,
  homeCountdownsLoading,
  homeCountdownsError,
}) {
  return (
    <article className="panel quick-panel home-countdown-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">
            Countdown
          </p>

          <h3>
            Important dates
          </h3>
        </div>
      </div>

      {homeCountdownsLoading ? (
        <div className="small-empty-state">
          <CalendarDays size={24} />
          <span>
            Loading countdowns...
          </span>
        </div>
      ) : homeCountdownsError ? (
        <div className="small-empty-state">
          <CalendarDays size={24} />
          <span>
            {homeCountdownsError}
          </span>
        </div>
      ) : upcomingCountdowns.length === 0 ? (
        <div className="small-empty-state">
          <CalendarDays size={24} />
          <span>
            No upcoming countdowns
          </span>
        </div>
      ) : (
        <div className="home-countdown-list">
          {upcomingCountdowns
            .slice(0, 3)
            .map((countdown) => {
              const targetDate =
                new Date(
                  `${countdown.target_date}T12:00:00`
                );

              const today =
                new Date(currentTime);

              today.setHours(
                0,
                0,
                0,
                0
              );

              const target =
                new Date(targetDate);

              target.setHours(
                0,
                0,
                0,
                0
              );

              const daysRemaining =
                Math.ceil(
                  (target - today) /
                    (
                      1000 *
                      60 *
                      60 *
                      24
                    )
                );

              const turningAge =
                countdown.category ===
                  "birthday" &&
                countdown.family_member_birthday
                  ? targetDate.getFullYear() -
                    Number(
                      countdown.family_member_birthday.slice(
                        0,
                        4
                      )
                    )
                  : null;

              return (
                <div
                  key={countdown.id}
                  className="home-countdown-card"
                  style={{
                    "--countdown-colour":
                      countdown.colour ||
                      "#7C3AED",
                  }}
                >
                  <div className="home-countdown-copy">
                    <strong>
                      {countdown.title}
                    </strong>

                    <span>
                      {new Intl.DateTimeFormat(
                        "en-AU",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      ).format(
                        targetDate
                      )}
                    </span>

                    {turningAge !== null && (
                      <span className="home-countdown-age">
                        Turning{" "}
                        {turningAge}
                      </span>
                    )}
                  </div>

                  <div className="home-countdown-days">
                    {daysRemaining === 0 ? (
                      <strong>
                        TODAY
                      </strong>
                    ) : (
                      <>
                        <strong>
                          {daysRemaining}
                        </strong>

                        <span>
                          {daysRemaining ===
                          1
                            ? "day"
                            : "days"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </article>
  );
}

export default HomeCountdownPanel;