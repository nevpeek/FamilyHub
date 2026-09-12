import { useEffect, useState } from "react";
import {
  motion,
  useReducedMotion,
} from "motion/react";
import {
  CalendarDays,
  CheckSquare,
  ShoppingCart,
  Soup,
} from "lucide-react";

import { API_BASE_URL } from "../config/api";
import HomeHeader from "../components/HomeHeader";
import HomeTodayPanel from "../components/HomeTodayPanel";
import HomeChoresPanel from "../components/HomeChoresPanel";
import HomeCountdownPanel from "../components/HomeCountdownPanel";
import HomeContextCards from "../components/HomeContextCards";
import HomeDinnerPanel from "../components/HomeDinnerPanel";
import HomeFamilyOutlookPanel from "../components/HomeFamilyOutlookPanel";
import HomeListsPanel from "../components/HomeListsPanel";

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
<HomeHeader
  currentTime={currentTime}
  homeDayHeading={homeDayHeading}
  weather={weather}
  weatherLoading={weatherLoading}
/>

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

<HomeTodayPanel
  currentTime={currentTime}
  todayEvents={todayEvents}
  homeEventsLoading={homeEventsLoading}
  homeEventsError={homeEventsError}
  nextTodayEvent={nextTodayEvent}
  onNavigate={onNavigate}
/>

 <HomeChoresPanel
  todayTaskAssignments={todayTaskAssignments}
  todayTaskCompletions={todayTaskCompletions}
  todayTaskProgress={todayTaskProgress}
  familyStars={familyStars}
  familyStarsLoading={familyStarsLoading}
  homeTasks={homeTasks}
  homeTasksLoading={homeTasksLoading}
  homeTasksError={homeTasksError}
  onNavigate={onNavigate}
  onAddTask={onAddTask}
  onEditTask={onEditTask}
  onCompleteTask={onCompleteTask}
/>  

</div>

<aside className="dashboard-side-column">

<HomeCountdownPanel
  currentTime={currentTime}
  upcomingCountdowns={upcomingCountdowns}
  homeCountdownsLoading={homeCountdownsLoading}
  homeCountdownsError={homeCountdownsError}
/>

<HomeContextCards
  homeMeals={homeMeals}
  openShoppingItems={openShoppingItems}
  onNavigate={onNavigate}
  onAddMeal={onAddMeal}
/>

<HomeDinnerPanel
  homeMeals={homeMeals}
  homeMealsLoading={homeMealsLoading}
  homeMealsError={homeMealsError}
  onNavigate={onNavigate}
  onAddMeal={onAddMeal}
/>

</aside>

<HomeFamilyOutlookPanel
  upcomingDays={upcomingDays}
  onNavigate={onNavigate}
/>

<HomeListsPanel
  homeLists={homeLists}
  homeListsLoading={homeListsLoading}
  onNavigate={onNavigate}
/>

</section>
</motion.div>
  );
}
