import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Circle,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Plus,
  ShoppingCart,
  Snowflake,
  Soup,
  Star,
  Sun,
} from "lucide-react";

import { API_BASE_URL } from "../config/api";

function formatLongDate(date) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatEventTime(time) {
  if (!time) {
    return "";
  }

  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getGreeting(date) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function getWeatherDescription(code) {
  if (code === 0) return "Clear";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Cloudy";

  if ([45, 48].includes(code)) return "Foggy";

  if ([51, 53, 55].includes(code)) {
    return "Drizzle";
  }

  if ([56, 57].includes(code)) {
    return "Freezing drizzle";
  }

  if ([61, 63, 65].includes(code)) {
    return "Rain";
  }

  if ([66, 67].includes(code)) {
    return "Freezing rain";
  }

  if ([71, 73, 75, 77].includes(code)) {
    return "Snow";
  }

  if ([80, 81, 82].includes(code)) {
    return "Showers";
  }

  if ([85, 86].includes(code)) {
    return "Snow showers";
  }

  if ([95, 96, 99].includes(code)) {
    return "Thunderstorm";
  }

  return "Weather";
}

function getWeatherIcon(code) {
  if (code === 0) {
    return <Sun size={28} />;
  }

  if ([1, 2].includes(code)) {
    return <CloudSun size={28} />;
  }

  if (code === 3) {
    return <Cloud size={28} />;
  }

  if ([45, 48].includes(code)) {
    return <CloudFog size={28} />;
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return <CloudDrizzle size={28} />;
  }

  if (
    [61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return <CloudRain size={28} />;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <CloudSnow size={28} />;
  }

  if ([95, 96, 99].includes(code)) {
    return <CloudLightning size={28} />;
  }

  return <CloudSun size={28} />;
}

export default function HomePage({
  members,
  loading,
  error,
  currentTime,
  selectedMemberId,
  setSelectedMemberId,

  homeEvents,
  homeEventsLoading,
  homeEventsError,

  homeTasks,
  homeTasksLoading,
  homeTasksError,

  homeMeals,
  homeMealsLoading,
  homeMealsError,

  homeShoppingItems,
  homeShoppingLoading,
  homeShoppingError,

homeUpcomingMeals,
homeUpcomingTasks,

homeCountdowns,
homeCountdownsLoading,
homeCountdownsError,

onNavigate,
  onAddEvent,
  onAddTask,
  onAddMeal,
  onAddShoppingItem,
  onEditTask,
  onEditShoppingItem,
  onCompleteTask,
  onCompleteShoppingItem,
}) {

const reduceMotion = useReducedMotion();
const [weather, setWeather] = useState(null);
const [weatherLoading, setWeatherLoading] =
  useState(true);

  const [familyStars, setFamilyStars] =
  useState([]);

const [familyStarsLoading, setFamilyStarsLoading] =
  useState(true);

  const [homeLists, setHomeLists] =
  useState([]);

const [homeListsLoading, setHomeListsLoading] =
  useState(true);


useEffect(() => {
  async function loadWeather() {
    try {
      setWeatherLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/weather`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load weather"
        );
      }

      setWeather(data);
    } catch (err) {
      console.error(
        "Weather error:",
        err
      );

      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  }

  loadWeather();

  const interval = window.setInterval(
    loadWeather,
    15 * 60 * 1000
  );

  return () =>
    window.clearInterval(interval);
}, []);

useEffect(() => {
  async function loadFamilyStars() {
    try {
      setFamilyStarsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/tasks/rewards/summary`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load family stars"
        );
      }

      setFamilyStars(
        Array.isArray(data)
          ? data
          : data.members ||
            data.summary ||
            []
      );
    } catch (err) {
      console.error(
        "Family stars error:",
        err
      );

      setFamilyStars([]);
    } finally {
      setFamilyStarsLoading(false);
    }
  }

  loadFamilyStars();

  window.addEventListener(
    "familyhub-stars-updated",
    loadFamilyStars
  );

  return () => {
    window.removeEventListener(
      "familyhub-stars-updated",
      loadFamilyStars
    );
  };
}, []);

useEffect(() => {
  async function loadHomeLists() {
    try {
      setHomeListsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/lists`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load family lists"
        );
      }

      setHomeLists(
        Array.isArray(data)
          ? data
          : data.lists || []
      );
    } catch (err) {
      console.error(
        "Home lists error:",
        err
      );

      setHomeLists([]);
    } finally {
      setHomeListsLoading(false);
    }
  }

  loadHomeLists();
}, []);

const currentHour = currentTime.getHours();

const homeDayMode =
  currentHour < 12
    ? "morning"
    : currentHour >= 17
      ? "evening"
      : "day";

const homeDayHeading =
  homeDayMode === "morning"
    ? "Morning overview"
    : homeDayMode === "evening"
      ? "Evening overview"
      : "Today at a glance";      

  const todayKey = [
    currentTime.getFullYear(),
    String(
      currentTime.getMonth() + 1
    ).padStart(2, "0"),
    String(
      currentTime.getDate()
    ).padStart(2, "0"),
  ].join("-");

  const todayEvents =
    homeEvents.filter(
      (event) =>
        event.start_date === todayKey
    );

    const upcomingTodayEvents =
  todayEvents.filter((event) => {
    if (event.all_day) {
      return true;
    }

    if (!event.start_time) {
      return false;
    }

    const [hours, minutes] =
      event.start_time
        .split(":")
        .map(Number);

    const eventTime = new Date(
      currentTime
    );

    eventTime.setHours(
      hours,
      minutes,
      0,
      0
    );

    return eventTime >= currentTime;
  });

const nextTodayEvent =
  upcomingTodayEvents[0] || null;

  const openShoppingItems =
  homeShoppingItems.filter(
    (item) => !item.is_completed
  );


      const todayTaskAssignments =
    homeTasks.reduce(
      (total, task) =>
        total +
        Math.max(
          task.members?.length || 0,
          1
        ),
      0
    );

  const todayTaskCompletions =
    homeTasks.reduce(
      (total, task) => {
        if (task.members?.length) {
          return (
            total +
            task.members.filter(
              (member) =>
                Boolean(
                  member.is_completed
                )
            ).length
          );
        }

        return (
          total +
          (task.is_completed ? 1 : 0)
        );
      },
      0
    );

  const todayTaskProgress =
    todayTaskAssignments > 0
      ? Math.round(
          (todayTaskCompletions /
            todayTaskAssignments) *
            100
        )
      : 0;

const upcomingCountdowns = homeCountdowns
  .filter((countdown) => {
    const targetDate = new Date(
      `${countdown.target_date}T12:00:00`
    );

    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0);

    targetDate.setHours(0, 0, 0, 0);

    return targetDate >= today;
  })
  .sort((a, b) =>
    String(a.target_date).localeCompare(
      String(b.target_date)
    )
  );      

const upcomingDayCount = 7;



const upcomingDays = Array.from(
  { length: upcomingDayCount },
  (_, index) => {
      const date = new Date(currentTime);

      date.setHours(0, 0, 0, 0);
      date.setDate(
        date.getDate() + index + 1
      );

      const dateKey = [
        date.getFullYear(),
        String(
          date.getMonth() + 1
        ).padStart(2, "0"),
        String(
          date.getDate()
        ).padStart(2, "0"),
      ].join("-");

      return {
        date,
        dateKey,

        events: homeEvents.filter(
          (event) =>
            event.start_date === dateKey
        ),

        meals: homeUpcomingMeals.filter(
          (meal) =>
            meal.meal_date === dateKey
        ),

        tasks: homeUpcomingTasks.filter(
          (task) =>
            task.due_date === dateKey
        ),
      };
    }
  );

  return (
<motion.div
  className="home-page apple-home"
  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: reduceMotion ? 0 : 0.25,
    ease: [0.22, 1, 0.36, 1],
  }}
>
      <section className="page-title-row">
        <div>
<p className="section-kicker">
  {homeDayHeading}
</p>

<h2>
  {getGreeting(currentTime)}
</h2>

<p className="page-description home-today-date">
  {new Intl.DateTimeFormat(
    "en-AU",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  ).format(currentTime)}
</p>
        </div>

<div className="home-header-actions">
  <div className="home-weather">
    {weather?.current
  ? getWeatherIcon(
      weather.current.weatherCode
    )
  : <CloudSun size={28} />}

    <div>
      <strong>
        {weatherLoading
          ? "--°"
          : weather?.current
            ? `${Math.round(
                weather.current.temperature
              )}°`
            : "--°"}
      </strong>

      <span>
        {weather?.current
          ? `${getWeatherDescription(
              weather.current.weatherCode
            )} · Feels ${Math.round(
              weather.current.apparentTemperature
            )}°`
          : "Gawler"}
      </span>
    </div>
  </div>


</div>
</section>

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

<div className="home-summary-line">
<button
  type="button"
  className="home-summary-link"
  onClick={() => onNavigate("calendar")}
>
  <strong>{todayEvents.length}</strong>{" "}
  {todayEvents.length === 1
    ? "event"
    : "events"}{" "}
  today
</button>

  <span>·</span>

<button
  type="button"
  className="home-summary-link"
  onClick={() => onNavigate("tasks")}
>
  {todayTaskAssignments > 0 ? (
    <>
      <strong>
        {todayTaskCompletions}/{todayTaskAssignments}
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
  onClick={() => onNavigate("meals")}
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
  onClick={() => onNavigate("shopping")}
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
  onClick={() => onNavigate("lists")}
>
  <strong>
    {homeLists.reduce(
      (total, list) =>
        total +
        Number(
          list.open_count || 0
        ),
      0
    )}
  </strong>{" "}
  list items open
</button>
</div>

      <section className="dashboard-layout">
        <div className="dashboard-main-column">
          <article className="panel today-panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">
                  Today
                </p>

                <h3>
                  {formatLongDate(currentTime)}
                </h3>
              </div>

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  onNavigate("calendar")
                }
              >
                View calendar
                <ChevronRight size={18} />
              </button>
            </div>

            {homeEventsLoading ? (
              <div className="empty-state">
                <div>
                  <h4>Loading events...</h4>
                </div>
              </div>
            ) : homeEventsError ? (
              <div className="empty-state">
                <div>
                  <h4>
                    {homeEventsError}
                  </h4>
                </div>
              </div>
            ) : todayEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <CalendarDays size={28} />
                </div>

                <div>
                  <h4>No events today</h4>

                  <p>
                    Nothing scheduled for the
                    selected family members.
                  </p>
                </div>
              </div>
            ) : (
              <div className="home-event-list">
{todayEvents.map((event) => {
  const primaryMember =
    event.members?.[0];

  let isPastEvent = false;

  if (
    !event.all_day &&
    event.start_time
  ) {
    const [hours, minutes] =
      event.start_time
        .split(":")
        .map(Number);

    const eventTime = new Date(
      currentTime
    );

    eventTime.setHours(
      hours,
      minutes,
      0,
      0
    );

    isPastEvent =
      eventTime < currentTime;
  }

  return (
                    <div
                      key={
                        event.occurrence_key ||
                        event.id
                      }
className={`home-event-card ${
  isPastEvent ? "is-past" : ""
}`}
style={{
  "--accent":
    primaryMember?.colour ||
    event.colour_override ||
    event.colourOverride ||
    "#64748b",
}}
                    >
<div className="home-event-time">
  {event.all_day
    ? "All day"
    : formatEventTime(
        event.start_time
      )}
</div>

<div className="home-event-main">
  <strong>
    {event.title}
  </strong>
</div>

<div className="home-event-members">
  {(event.members || []).map(
    (member) => (
      <span
        key={member.id}
        className="home-event-member"
        title={member.name}
      >
        <span
          className="home-event-avatar"
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

        <span className="home-event-member-name">
          {member.name}
        </span>
      </span>
    )
  )}
</div>
                    </div>
                  );
                })}

{nextTodayEvent && (
<button
  type="button"
  className="home-next-up"
  onClick={() => onNavigate("calendar")}
  style={{
      "--next-up-colour":
        nextTodayEvent.members?.[0]?.colour ||
        nextTodayEvent.colour_override ||
        nextTodayEvent.colourOverride ||
        "#64748b",
    }}
  >
    <span className="home-next-up-label">
      Next up
    </span>

{nextTodayEvent.members?.[0] && (
  <div
    className="home-next-up-member"
    title={nextTodayEvent.members[0].name}
  >
    {nextTodayEvent.members[0].photo_url ? (
      <img
        src={nextTodayEvent.members[0].photo_url}
        alt=""
      />
    ) : (
      <span
        style={{
          backgroundColor:
            nextTodayEvent.members[0].colour ||
            "#64748b",
        }}
      >
        {nextTodayEvent.members[0].initials}
      </span>
    )}

    <span className="home-next-up-member-name">
      {nextTodayEvent.members[0].name}
    </span>
  </div>
)}

    <strong>
      {nextTodayEvent.all_day
        ? nextTodayEvent.title
        : `${formatEventTime(
            nextTodayEvent.start_time
          )} · ${nextTodayEvent.title}`}
    </strong>
    <ChevronRight
  className="home-next-up-arrow"
  size={17}
/>
</button>
)}

{!nextTodayEvent && (
  <div className="today-status">
    <strong>Day underway</strong>

    <span>
      No more events scheduled today
    </span>
  </div>
)}
              </div>
            )}
          </article>

          {/* Chores panel will move here */}

      <article className="panel quick-panel home-chores-panel">
            <div className="panel-heading">
<div className="home-chore-heading-copy">
  <p className="section-kicker">
    Chores & routines
  </p>

  <h3>
    Today&apos;s family progress
  </h3>

{todayTaskAssignments > 0 && (
  <div className="home-chore-progress">
    <div className="home-chore-progress-copy">
      <span>
        {todayTaskCompletions} of{" "}
        {todayTaskAssignments} done
      </span>

      <strong>
        {todayTaskProgress}%
      </strong>
    </div>

    <div className="home-chore-progress-track">
      <span
        className="home-chore-progress-fill"
        style={{
          width: `${todayTaskProgress}%`,
        }}
      />
    </div>
  </div>
)}
</div>

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  onNavigate("tasks")
                }
              >
                View tasks
                <ChevronRight size={18} />
              </button>
</div>

<div className="home-family-stars">
  <div className="home-family-stars-heading">
    <span>Family Stars</span>

    <button
      type="button"
      onClick={() =>
        onNavigate("tasks")
      }
    >
      Rewards
      <ChevronRight size={14} />
    </button>
  </div>

  {familyStarsLoading ? (
    <div className="home-family-stars-loading">
      Loading stars...
    </div>
  ) : (
    <div className="home-family-stars-list">
      {familyStars.map((member) => (
        <div
          key={member.id}
          className="home-family-star-member"
          style={{
            "--member-colour":
              member.colour ||
              "#64748b",
          }}
        >
          <span className="home-family-star-avatar">
            {member.photo_url ? (
              <img
                src={
                  member.photo_url.startsWith(
                    "http"
                  )
                    ? member.photo_url
                    : `${API_BASE_URL}${member.photo_url}`
                }
                alt={member.name}
              />
            ) : (
              member.initials ||
              member.name
                ?.slice(0, 1)
                .toUpperCase()
            )}
          </span>

          <span className="home-family-star-name">
            {member.name}
          </span>

          <strong>
            <Star size={14} />
            {Number(
              member.stars ??
                member.total_stars ??
                0
            )}
          </strong>
        </div>
      ))}
    </div>
  )}
</div>

{homeTasksLoading ? (
              <div className="small-empty-state">
                <CheckSquare size={24} />
                <span>
                  Loading tasks...
                </span>
              </div>
            ) : homeTasksError ? (
              <div className="small-empty-state">
                <CheckSquare size={24} />
                <span>
                  {homeTasksError}
                </span>
              </div>
            ) : homeTasks.length === 0 ? (
              <div className="home-tasks-clear">
                <div className="home-tasks-clear-icon">
                  <CheckSquare size={20} />
                </div>

                <div className="home-tasks-clear-copy">
                  <strong>
                    All clear today
                  </strong>

                  <span>
                    No tasks are due.
                  </span>
                </div>

                <button
                  type="button"
                  className="home-tasks-add"
                  onClick={onAddTask}
                >
                  <Plus size={15} />
                  Add task
                </button>
              </div>
            ) : (
              <div className="home-task-list">
                {homeTasks.map(
                  (task) => (
                    <div
                      key={task.id}
                      className="home-task-item"
                    >
<div className="home-task-member-checks">
  {(task.members?.length
    ? task.members
    : [
        {
          id: null,
          name: "Complete",
          is_completed:
            Boolean(
              task.is_completed
            ),
        },
      ]
  ).map((member) => {
    const completed =
      Boolean(
        member.is_completed
      );

    return (
      <button
        key={
          member.id ??
          `task-${task.id}`
        }
        type="button"
        className={`home-task-member-check ${
          completed
            ? "completed"
            : ""
        }`}
        style={{
          "--member-colour":
            member.colour ||
            "#22c55e",
        }}
        onClick={async () => {
          try {
            const url =
              member.id
                ? `${API_BASE_URL}/api/tasks/${task.id}/members/${member.id}/completion`
                : `${API_BASE_URL}/api/tasks/${task.id}/completion`;

            const response =
              await fetch(
                url,
                {
                  method:
                    "PATCH",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body:
                    JSON.stringify({
                      completed:
                        !completed,
                      occurrenceDate:
                        task.occurrence_date ||
                        task.due_date ||
                        "",
                    }),
                }
              );

            const data =
              await response.json();

            if (!response.ok) {
              throw new Error(
                data.error ||
                  "Unable to update task"
              );
            }

            onCompleteTask?.();
          } catch (err) {
            console.error(err);

            window.alert(
              err.message ||
                "Unable to update task"
            );
          }
        }}
        title={
          member.id
            ? `${member.name} ${
                completed
                  ? "done"
                  : "not done"
              }`
            : completed
              ? "Completed"
              : "Complete"
        }
      >
        {member.photo_url ? (
          <img
            src={
              member.photo_url.startsWith(
                "http"
              )
                ? member.photo_url
                : `${API_BASE_URL}${member.photo_url}`
            }
            alt={member.name}
          />
        ) : (
          <span>
            {member.initials ||
              member.name
                ?.slice(0, 1)
                .toUpperCase()}
          </span>
        )}

        {completed && (
          <span className="home-task-member-checkmark">
            ✓
          </span>
        )}
      </button>
    );
  })}
</div>

                      <button
                        type="button"
                        className="home-task-content"
                        onClick={() =>
                          onEditTask?.(
                            task
                          )
                        }
                      >
                        <div className="home-task-main">
                          <strong>
                            {task.title}
                          </strong>

                          <span>
                            {task.due_time
                              ? formatEventTime(
                                  task.due_time
                                )
                              : "Today"}
                          </span>
                        </div>

                        <div className="home-task-members">
                          {(
                            task.members ||
                            []
                          ).map(
                            (member) => (
                              <span
                                key={
                                  member.id
                                }
                                className="home-task-member"
                              >
                                <span
                                  className="home-task-dot"
                                  style={{
                                    backgroundColor:
                                      member.colour,
                                  }}
                                />

                                {
                                  member.name
                                }
                              </span>
                            )
                          )}
                        </div>
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </article>    

        </div>

        <aside className="dashboard-side-column">

<article className="panel quick-panel home-countdown-panel">
  <div className="panel-heading">
    <div>
      <p className="section-kicker">
        Countdown
      </p>

      <h3>Important dates</h3>
    </div>
  </div>

  {homeCountdownsLoading ? (
    <div className="small-empty-state">
      <CalendarDays size={24} />
      <span>Loading countdowns...</span>
    </div>
  ) : homeCountdownsError ? (
    <div className="small-empty-state">
      <CalendarDays size={24} />
      <span>{homeCountdownsError}</span>
    </div>
  ) : upcomingCountdowns.length === 0 ? (
    <div className="small-empty-state">
      <CalendarDays size={24} />
      <span>No upcoming countdowns</span>
    </div>
  ) : (
    <div className="home-countdown-list">
      {upcomingCountdowns
        .slice(0, 3)
        .map((countdown) => {
          const targetDate = new Date(
            `${countdown.target_date}T12:00:00`
          );

          const today = new Date(currentTime);
          today.setHours(0, 0, 0, 0);

          const target = new Date(targetDate);
          target.setHours(0, 0, 0, 0);

          const daysRemaining = Math.ceil(
            (target - today) /
              (1000 * 60 * 60 * 24)
          );

          const turningAge =
            countdown.category === "birthday" &&
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
                  ).format(targetDate)}
                </span>

                {turningAge !== null && (
                  <span className="home-countdown-age">
                    Turning {turningAge}
                  </span>
                )}
              </div>

              <div className="home-countdown-days">
                {daysRemaining === 0 ? (
                  <strong>TODAY</strong>
                ) : (
                  <>
                    <strong>
                      {daysRemaining}
                    </strong>

                    <span>
                      {daysRemaining === 1
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

<button
  type="button"
  className="home-tonight-context"
 onClick={() =>
  homeMeals.length > 0
    ? onNavigate("meals")
    : onAddMeal?.()
}
>
  <span>Tonight</span>

<strong>
  {homeMeals.length > 0
    ? homeMeals[0].title
    : "Plan dinner"}
</strong>
  <ChevronRight
  className="home-tonight-arrow"
  size={16}
/>
</button>

{openShoppingItems.length > 0 && (
  <button
    type="button"
    className="home-shopping-context"
    onClick={() => onNavigate("shopping")}
  >
<span className="home-shopping-context-label">
  <ShoppingCart size={14} />
  Shopping
</span>

    <strong>
      {openShoppingItems.length}{" "}
      {openShoppingItems.length === 1
        ? "item"
        : "items"}{" "}
      left
    </strong>

    <ChevronRight
      className="home-shopping-context-arrow"
      size={16}
    />
  </button>
)}

<article className="panel quick-panel home-dinner-panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Dinner</p>
                <h3>Tonight&apos;s meal</h3>
              </div>
              <button type="button" className="text-button" onClick={() => onNavigate("meals")}>
                View meals
                <ChevronRight size={18} />
              </button>
            </div>

            {homeMealsLoading ? (
              <div className="small-empty-state"><Soup size={24} /><span>Loading dinner...</span></div>
            ) : homeMealsError ? (
              <div className="small-empty-state"><Soup size={24} /><span>{homeMealsError}</span></div>
            ) : homeMeals.length === 0 ? (
<div className="small-empty-state">
  <Soup size={24} />
  <span>Nothing planned yet</span>

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
                  <div key={meal.id} className="home-meal-card">
                    <div className="home-meal-icon"><Soup size={22} /></div>
                    <div className="home-meal-content">
                      <strong>{meal.title}</strong>
                      <span className="home-meal-meta">Dinner{meal.description ? ` · ${meal.description}` : ""}</span>
                      <div className="home-meal-members">
                        {(meal.members || []).map((member) => (
                          <span key={member.id} className="home-meal-member">
                            <span className="home-meal-dot" style={{ backgroundColor: member.colour }} />
                            {member.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>


        </aside>

<article className="panel upcoming-panel">
  <div className="panel-heading">
    <div>
      <p className="section-kicker">
        Family Outlook
      </p>

      <h3>Next 7 days</h3>
    </div>
  </div>

  <div className="upcoming-placeholder">
    {upcomingDays.map(
      (
        {
          date,
          dateKey,
          events,
          meals,
          tasks,
        },
        index
      ) => {
        const dayLabel =
          index === 0
            ? "Tomorrow"
            : new Intl.DateTimeFormat(
                "en-AU",
                {
                  weekday: "long",
                }
              ).format(date);

        const eventCount = events.length;
        const mealCount = meals.length;
        const taskCount = tasks.length;

        const totalItems =
          eventCount +
          mealCount +
          taskCount;

        return (
          <button
            key={dateKey}
            type="button"
            className={`home-outlook-day ${
              totalItems === 0
                ? "empty"
                : ""
            }`}
            onClick={() =>
              onNavigate("calendar")
            }
          >
            <div className="home-outlook-date">
              <span>{dayLabel}</span>

              <strong>
                {date.getDate()}
              </strong>

              <small>
                {new Intl.DateTimeFormat(
                  "en-AU",
                  {
                    month: "short",
                  }
                ).format(date)}
              </small>
            </div>

            <div className="home-outlook-content">
              {totalItems === 0 ? (
                <span className="home-outlook-empty">
                  Nothing planned
                </span>
              ) : (
                <>
                  <div className="home-outlook-counts">
                    {eventCount > 0 && (
                      <span>
                        <CalendarDays size={14} />
                        {eventCount}
                      </span>
                    )}

                    {taskCount > 0 && (
                      <span>
                        <CheckSquare size={14} />
                        {taskCount}
                      </span>
                    )}

                    {mealCount > 0 && (
                      <span>
                        <Soup size={14} />
                        {mealCount}
                      </span>
                    )}
                  </div>

                  <div className="home-outlook-preview">
                    {events[0] && (
                      <span>
                        <i
                          style={{
                            backgroundColor:
                              events[0]
                                .members?.[0]
                                ?.colour ||
                              "#64748b",
                          }}
                        />

                        {events[0].title}
                      </span>
                    )}

                    {meals[0] && (
                      <span>
                        <Soup size={13} />
                        {meals[0].title}
                      </span>
                    )}

                    {!events[0] &&
                      !meals[0] &&
                      taskCount > 0 && (
                        <span>
                          <CheckSquare size={13} />
                          {taskCount}{" "}
                          {taskCount === 1
                            ? "task"
                            : "tasks"}{" "}
                          due
                        </span>
                      )}
                  </div>
                </>
              )}
            </div>

            <ChevronRight
              className="home-outlook-arrow"
              size={16}
            />
          </button>
        );
      }
    )}
  </div>
</article>

<article className="panel quick-panel home-lists-panel">
  <div className="panel-heading">
    <div>
      <p className="section-kicker">
        Family Lists
      </p>

      <h3>Household lists</h3>
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
      <span>Loading lists...</span>
    </div>
  ) : homeLists.length === 0 ? (
    <div className="small-empty-state">
      <CheckSquare size={24} />
      <span>No family lists yet</span>
    </div>
  ) : (
    <div className="home-family-lists">
      {homeLists
        .slice()
        .sort(
          (a, b) =>
            Number(b.open_count || 0) -
            Number(a.open_count || 0)
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
                  list.open_count || 0
                )}{" "}
                {Number(
                  list.open_count || 0
                ) === 1
                  ? "item open"
                  : "items open"}
              </small>
            </span>

            <ChevronRight size={16} />
          </button>
        ))}
    </div>
  )}
</article>    

      </section>
    </motion.div>
  );
}
