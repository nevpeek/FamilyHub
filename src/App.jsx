import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CheckSquare,
  Circle,
  ChevronRight,
  Home,
  Plus,
  ShoppingCart,
  Soup,
  Users,
} from "lucide-react";
import "./App.css";
import CalendarPage from "./pages/CalendarPage";
import TasksPage from "./pages/TasksPage";
import MealsPage from "./pages/MealsPage";
import ShoppingPage from "./pages/ShoppingPage";
import AddEventModal from "./components/AddEventModal";
import RecurringEventChoiceModal from "./components/RecurringEventChoiceModal";
import OccurrenceActionModal from "./components/OccurrenceActionModal";
import TaskModal from "./components/TaskModal";
import MealModal from "./components/MealModal";
import ShoppingItemModal from "./components/ShoppingItemModal";

const API_BASE_URL = "http://localhost:3001";

const navigationItems = [
  {
    id: "home",
    label: "Home",
    icon: Home,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarDays,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: CheckSquare,
  },
  {
    id: "meals",
    label: "Meals",
    icon: Soup,
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: ShoppingCart,
  },
];

function formatLongDate(date) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatClock(date) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

function App() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [selectedMemberId, setSelectedMemberId] = useState("all");
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [addEventOpen, setAddEventOpen] = useState(false);
const [selectedEvent, setSelectedEvent] = useState(null);
const [selectedEventDate, setSelectedEventDate] = useState(null);

const [recurringChoiceEvent, setRecurringChoiceEvent] = useState(null);
const [occurrenceActionEvent, setOccurrenceActionEvent] = useState(null);
const [occurrenceEditEvent, setOccurrenceEditEvent] = useState(null);
const [futureEditEvent, setFutureEditEvent] = useState(null);

const [eventRefreshKey, setEventRefreshKey] = useState(0);
const [taskRefreshKey, setTaskRefreshKey] = useState(0);
const [taskModalOpen, setTaskModalOpen] = useState(false);
const [selectedTask, setSelectedTask] = useState(null);
const [mealRefreshKey, setMealRefreshKey] = useState(0);
const [mealModalOpen, setMealModalOpen] = useState(false);
const [selectedMeal, setSelectedMeal] = useState(null);
const [shoppingRefreshKey, setShoppingRefreshKey] = useState(0);
const [shoppingModalOpen, setShoppingModalOpen] = useState(false);
const [selectedShoppingItem, setSelectedShoppingItem] = useState(null);
const [quickAddOpen, setQuickAddOpen] = useState(false);
const quickAddRef = useRef(null);
const [homeEvents, setHomeEvents] = useState([]);
const [homeEventsLoading, setHomeEventsLoading] = useState(true);
const [homeEventsError, setHomeEventsError] = useState("");

const [homeTasks, setHomeTasks] = useState([]);
const [homeTasksLoading, setHomeTasksLoading] = useState(true);
const [homeTasksError, setHomeTasksError] = useState("");
const [homeMeals, setHomeMeals] = useState([]);
const [homeMealsLoading, setHomeMealsLoading] = useState(true);
const [homeMealsError, setHomeMealsError] = useState("");
const [homeShoppingItems, setHomeShoppingItems] = useState([]);
const [homeShoppingLoading, setHomeShoppingLoading] = useState(true);
const [homeShoppingError, setHomeShoppingError] = useState("");

useEffect(() => {
  function handleOutsideClick(event) {
    if (
      quickAddRef.current &&
      !quickAddRef.current.contains(event.target)
    ) {
      setQuickAddOpen(false);
    }
  }

  document.addEventListener(
    "mousedown",
    handleOutsideClick
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleOutsideClick
    );
  };
}, []);

  useEffect(() => {
    async function loadFamilyMembers() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/family`);

        if (!response.ok) {
          throw new Error("Failed to load family members");
        }

        const data = await response.json();

        setMembers(data.members || []);
      } catch (err) {
        console.error(err);
        setError("Unable to connect to FamilyHub API");
      } finally {
        setLoading(false);
      }
    }

    loadFamilyMembers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const todayKey = formatDateKey(currentTime);

useEffect(() => {
  async function loadHomeEvents() {
    setHomeEventsLoading(true);
    setHomeEventsError("");

    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 3);

      const params = new URLSearchParams({
        start: formatDateKey(startDate),
        end: formatDateKey(endDate),
      });

      if (selectedMemberId !== "all") {
        params.set(
          "memberId",
          String(selectedMemberId)
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/events?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load home events"
        );
      }

      const data = await response.json();

      setHomeEvents(data.events || []);
    } catch (err) {
      console.error(err);
      setHomeEventsError(
        "Unable to load calendar events"
      );
    } finally {
      setHomeEventsLoading(false);
    }
  }

  loadHomeEvents();
}, [
  todayKey,
  selectedMemberId,
  eventRefreshKey,
]);

useEffect(() => {
  async function loadHomeMeals() {
    setHomeMealsLoading(true);
    setHomeMealsError("");

    try {
      const params = new URLSearchParams({
        start: todayKey,
        end: todayKey,
        mealType: "dinner",
      });

      if (selectedMemberId !== "all") {
        params.set(
          "memberId",
          String(selectedMemberId)
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/meals?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load tonight's meal"
        );
      }

      const data = await response.json();

      setHomeMeals(data.meals || []);
    } catch (err) {
      console.error(err);

      setHomeMealsError(
        "Unable to load tonight's meal"
      );
    } finally {
      setHomeMealsLoading(false);
    }
  }

  loadHomeMeals();
}, [
  todayKey,
  selectedMemberId,
  mealRefreshKey,
]);

useEffect(() => {
  async function loadHomeShopping() {
    setHomeShoppingLoading(true);
    setHomeShoppingError("");

    try {
      const params = new URLSearchParams({
        completed: "false",
      });

      if (selectedMemberId !== "all") {
        params.set(
          "memberId",
          String(selectedMemberId)
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/shopping?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load shopping list"
        );
      }

      const data = await response.json();

      setHomeShoppingItems(
        data.items || []
      );
    } catch (err) {
      console.error(err);

      setHomeShoppingError(
        "Unable to load shopping list"
      );
    } finally {
      setHomeShoppingLoading(false);
    }
  }

  loadHomeShopping();
}, [
  selectedMemberId,
  shoppingRefreshKey,
]);

useEffect(() => {
  async function loadHomeTasks() {
    setHomeTasksLoading(true);
    setHomeTasksError("");

    try {
      const params = new URLSearchParams({
        start: todayKey,
        end: todayKey,
        completed: "false",
      });

      if (selectedMemberId !== "all") {
        params.set(
          "memberId",
          String(selectedMemberId)
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/tasks?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load home tasks"
        );
      }

      const data = await response.json();

      setHomeTasks(data.tasks || []);
    } catch (err) {
      console.error(err);

      setHomeTasksError(
        "Unable to load today's tasks"
      );
    } finally {
      setHomeTasksLoading(false);
    }
  }

  loadHomeTasks();
}, [
  todayKey,
  selectedMemberId,
  taskRefreshKey,
]);

  const activePageLabel = useMemo(() => {
    return (
      navigationItems.find((item) => item.id === activePage)?.label || "Home"
    );
  }, [activePage]);

  const todayEvents = homeEvents.filter(
  (event) => event.start_date === todayKey
);

const upcomingDays = Array.from(
  { length: 3 },
  (_, index) => {
    const date = new Date(currentTime);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index + 1);

    const dateKey = formatDateKey(date);

    return {
      date,
      dateKey,
      events: homeEvents.filter(
        (event) => event.start_date === dateKey
      ),
    };
  }
);

  function renderHomePage() {
    return (
      <>
        <section className="page-title-row">
          <div>
            <p className="section-kicker">{activePageLabel}</p>
            <h2>Good morning</h2>
            <p className="page-description">
              Here&apos;s what&apos;s happening with the family.
            </p>
          </div>

<div
  className="quick-add-wrapper"
  ref={quickAddRef}
>
  <button
    type="button"
    className="add-event-button"
    onClick={() =>
      setQuickAddOpen(
        (current) => !current
      )
    }
  >
    <Plus size={22} />
    <span>Add</span>
  </button>

  {quickAddOpen && (
    <div className="quick-add-menu">
      <button
        type="button"
        onClick={() => {
          setQuickAddOpen(false);

          setSelectedEvent(null);
          setSelectedEventDate(null);
          setAddEventOpen(true);
        }}
      >
        <CalendarDays size={19} />

        <div>
          <strong>Event</strong>
          <span>
            Add something to the calendar
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          setQuickAddOpen(false);

          setSelectedTask(null);
          setTaskModalOpen(true);
        }}
      >
        <CheckSquare size={19} />

        <div>
          <strong>Task</strong>
          <span>
            Add a chore or family job
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          setQuickAddOpen(false);

          setSelectedMeal(null);
          setMealModalOpen(true);
        }}
      >
        <Soup size={19} />

        <div>
          <strong>Meal</strong>
          <span>
            Plan a meal
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          setQuickAddOpen(false);

          setSelectedShoppingItem(null);
          setShoppingModalOpen(true);
        }}
      >
        <ShoppingCart size={19} />

        <div>
          <strong>Shopping item</strong>
          <span>
            Add something to the shared list
          </span>
        </div>
      </button>
    </div>
  )}
</div>
        </section>

        <section className="family-filter-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Family</p>
              <h3>Show schedule for</h3>
            </div>
          </div>

          {loading && <p className="status-message">Loading family...</p>}

          {error && (
            <p className="status-message status-message-error">
              {error}
            </p>
          )}

          {!loading && !error && (
            <div className="family-filters">
              <button
                type="button"
                className={`family-filter ${
                  selectedMemberId === "all" ? "selected" : ""
                }`}
                onClick={() => setSelectedMemberId("all")}
              >
                <div className="family-avatar family-avatar-all">
                  <Users size={22} />
                </div>

                <div className="family-filter-copy">
                  <strong>Everyone</strong>
                  <span>All schedules</span>
                </div>
              </button>

              {members.map((member) => (
                <button
                  type="button"
                  key={member.id}
                  className={`family-filter ${
                    selectedMemberId === member.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedMemberId(member.id)}
                >
                  <div
                    className="family-avatar"
                    style={{ backgroundColor: member.colour }}
                  >
                    {member.initials || member.name.charAt(0)}
                  </div>

                  <div className="family-filter-copy">
                    <strong>{member.name}</strong>
                    <span>Family member</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-layout">
          <div className="dashboard-main-column">
            <article className="panel today-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Today</p>
                  <h3>{formatLongDate(currentTime)}</h3>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={() => setActivePage("calendar")}
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
      <h4>{homeEventsError}</h4>
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
        Nothing scheduled for the selected family members.
      </p>
    </div>
  </div>
) : (
  <div className="home-event-list">
    {todayEvents.map((event) => {
      const primaryMember =
        event.members?.[0];

      return (
        <div
          key={event.occurrence_key || event.id}
          className="home-event-card"
          style={{
            borderLeftColor:
              primaryMember?.colour ||
              "#64748b",
          }}
        >
          <div className="home-event-main">
            <strong>{event.title}</strong>

            <span>
              {event.all_day
                ? "All day"
                : formatEventTime(
                    event.start_time
                  )}
            </span>
          </div>

          <div className="home-event-members">
            {(event.members || []).map(
              (member) => (
                <span
                  key={member.id}
                  className="home-event-member"
                >
                  <span
                    className="home-event-dot"
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
      );
    })}
  </div>
)}
            </article>

            <article className="panel upcoming-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Coming up</p>
                  <h3>Next few days</h3>
                </div>
              </div>

              <div className="upcoming-placeholder">
  {upcomingDays.map(
    ({ date, dateKey, events }, index) => {
      const dayLabel =
        index === 0
          ? "Tomorrow"
          : new Intl.DateTimeFormat(
              "en-AU",
              {
                weekday: "long",
              }
            ).format(date);

      return (
        <div key={dateKey}>
          <span>{dayLabel}</span>

          {events.length === 0 ? (
            <strong>
              No events planned
            </strong>
          ) : (
            <div className="upcoming-event-list">
              {events.map((event) => (
                <div
                  key={
                    event.occurrence_key ||
                    event.id
                  }
                  className="upcoming-event"
                >
                  <strong>
                    {event.title}
                  </strong>

                  <small>
                    {event.all_day
                      ? "All day"
                      : formatEventTime(
                          event.start_time
                        )}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  )}
</div>
            </article>
          </div>

          <aside className="dashboard-side-column">
           <article className="panel quick-panel">
  <div className="panel-heading">
    <div>
      <p className="section-kicker">Tasks</p>
      <h3>Today&apos;s chores</h3>
    </div>

    <button
      type="button"
      className="text-button"
      onClick={() => setActivePage("tasks")}
    >
      View tasks
      <ChevronRight size={18} />
    </button>
  </div>

  {homeTasksLoading ? (
    <div className="small-empty-state">
      <CheckSquare size={24} />
      <span>Loading tasks...</span>
    </div>
  ) : homeTasksError ? (
    <div className="small-empty-state">
      <CheckSquare size={24} />
      <span>{homeTasksError}</span>
    </div>
  ) : homeTasks.length === 0 ? (
    <div className="small-empty-state">
      <CheckSquare size={24} />
      <span>No tasks due today</span>
    </div>
  ) : (
    <div className="home-task-list">
      {homeTasks.map((task) => (
        <div
          key={task.id}
          className="home-task-item"
        >
          <button
            type="button"
            className="home-task-check"
            onClick={async () => {
              try {
                const response = await fetch(
                  `${API_BASE_URL}/api/tasks/${task.id}/completion`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      completed: true,
                    }),
                  }
                );

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(
                    data.error ||
                      "Unable to complete task"
                  );
                }

                setTaskRefreshKey(
                  (current) => current + 1
                );
              } catch (err) {
                console.error(err);

                window.alert(
                  err.message ||
                    "Unable to complete task"
                );
              }
            }}
            aria-label={`Complete ${task.title}`}
          >
           <Circle size={20} />
          </button>

          <button
            type="button"
            className="home-task-content"
            onClick={() => {
              setSelectedTask(task);
              setTaskModalOpen(true);
            }}
          >
            <div className="home-task-main">
              <strong>{task.title}</strong>

              <span>
                {task.due_time
                  ? formatEventTime(
                      task.due_time
                    )
                  : "Today"}
              </span>
            </div>

            <div className="home-task-members">
              {(task.members || []).map(
                (member) => (
                  <span
                    key={member.id}
                    className="home-task-member"
                  >
                    <span
                      className="home-task-dot"
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
          </button>
        </div>
      ))}
    </div>
  )}
</article>

            <article className="panel quick-panel">
  <div className="panel-heading">
    <div>
      <p className="section-kicker">Dinner</p>
      <h3>Tonight&apos;s meal</h3>
    </div>

    <button
      type="button"
      className="text-button"
      onClick={() => setActivePage("meals")}
    >
      View meals
      <ChevronRight size={18} />
    </button>
  </div>

  {homeMealsLoading ? (
    <div className="small-empty-state">
      <Soup size={24} />
      <span>Loading dinner...</span>
    </div>
  ) : homeMealsError ? (
    <div className="small-empty-state">
      <Soup size={24} />
      <span>{homeMealsError}</span>
    </div>
  ) : homeMeals.length === 0 ? (
    <div className="small-empty-state">
      <Soup size={24} />
      <span>Nothing planned yet</span>
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
            <strong>{meal.title}</strong>

            {meal.description && (
              <span>{meal.description}</span>
            )}

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

            <article className="panel quick-panel">
  <div className="panel-heading">
    <div>
      <p className="section-kicker">Shopping</p>
      <h3>Shared list</h3>
    </div>

    <button
      type="button"
      className="text-button"
      onClick={() => setActivePage("shopping")}
    >
      View list
      <ChevronRight size={18} />
    </button>
  </div>

  {homeShoppingLoading ? (
    <div className="small-empty-state">
      <ShoppingCart size={24} />
      <span>Loading shopping list...</span>
    </div>
  ) : homeShoppingError ? (
    <div className="small-empty-state">
      <ShoppingCart size={24} />
      <span>{homeShoppingError}</span>
    </div>
  ) : homeShoppingItems.length === 0 ? (
    <div className="small-empty-state">
      <ShoppingCart size={24} />
      <span>Your shopping list is empty</span>
    </div>
  ) : (
    <div className="home-shopping-list">
      {homeShoppingItems.map((item) => (
        <div
          key={item.id}
          className="home-shopping-item"
        >
          <button
            type="button"
            className="home-shopping-check"
            onClick={async () => {
              try {
                const response = await fetch(
                  `${API_BASE_URL}/api/shopping/${item.id}/completion`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      completed: true,
                    }),
                  }
                );

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(
                    data.error ||
                      "Unable to complete shopping item"
                  );
                }

                setShoppingRefreshKey(
                  (current) => current + 1
                );
              } catch (err) {
                console.error(err);

                window.alert(
                  err.message ||
                    "Unable to update shopping item"
                );
              }
            }}
            aria-label={`Complete ${item.name}`}
          >
            <Circle size={20} />
          </button>

          <button
            type="button"
            className="home-shopping-content"
            onClick={() => {
              setSelectedShoppingItem(item);
              setShoppingModalOpen(true);
            }}
          >
            <div className="home-shopping-main">
              <strong>{item.name}</strong>

              <span>
                {item.quantity || item.category}
              </span>
            </div>

            <div className="home-shopping-members">
              {(item.members || []).map(
                (member) => (
                  <span
                    key={member.id}
                    className="home-shopping-member"
                  >
                    <span
                      className="home-shopping-dot"
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
          </button>
        </div>
      ))}
    </div>
  )}
</article>
          </aside>
        </section>
      </>
    );
  }

  return (
    <div className="familyhub-shell">
      <header className="familyhub-header">
        <div className="brand-area">
          <div className="brand-mark">
            <Users size={28} />
          </div>

          <div>
            <p className="brand-kicker">Family command centre</p>
            <h1>FamilyHub</h1>
          </div>
        </div>

        <div className="header-date">
          <strong>{formatClock(currentTime)}</strong>
          <span>{formatLongDate(currentTime)}</span>
        </div>
      </header>

      <main className="familyhub-main">
        {activePage === "home" && renderHomePage()}

        {activePage === "calendar" && (

     <CalendarPage
  members={members}
  selectedMemberId={selectedMemberId}
  setSelectedMemberId={setSelectedMemberId}
  onAddEvent={(date = null) => {
    setSelectedEvent(null);
    setSelectedEventDate(date);
    setAddEventOpen(true);
  }}
  onEditEvent={(event) => {
  if (event.is_recurring && event.is_occurrence) {
    setRecurringChoiceEvent(event);
    return;
  }

  setSelectedEvent(event);
  setSelectedEventDate(null);
  setAddEventOpen(true);
}}
  eventRefreshKey={eventRefreshKey}
/>
        )}

        {activePage === "tasks" && (
  
  <TasksPage
  members={members}
  selectedMemberId={selectedMemberId}
  setSelectedMemberId={setSelectedMemberId}
  taskRefreshKey={taskRefreshKey}
  onAddTask={() => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  }}
  onEditTask={(task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  }}
  onTaskChanged={() => {
    setTaskRefreshKey((current) => current + 1);
  }}
/>
)}

       {activePage === "meals" && (
  <MealsPage
    members={members}
    selectedMemberId={selectedMemberId}
    setSelectedMemberId={setSelectedMemberId}
    mealRefreshKey={mealRefreshKey}
    onAddMeal={() => {
      setSelectedMeal(null);
      setMealModalOpen(true);
    }}
    onEditMeal={(meal) => {
      setSelectedMeal(meal);
      setMealModalOpen(true);
    }}
  />
)}

       {activePage === "shopping" && (
  <ShoppingPage
    members={members}
    selectedMemberId={selectedMemberId}
    setSelectedMemberId={setSelectedMemberId}
    shoppingRefreshKey={shoppingRefreshKey}
    onAddItem={() => {
      setSelectedShoppingItem(null);
      setShoppingModalOpen(true);
    }}
    onEditItem={(item) => {
      setSelectedShoppingItem(item);
      setShoppingModalOpen(true);
    }}
    onItemChanged={() => {
      setShoppingRefreshKey((current) => current + 1);
    }}
  />
)}
      </main>

      <nav className="bottom-navigation" aria-label="Primary navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              type="button"
              key={item.id}
              className={`nav-button ${isActive ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

<AddEventModal
  isOpen={addEventOpen}
  onClose={() => {
    setAddEventOpen(false);
    setSelectedEvent(null);
    setSelectedEventDate(null);
  }}
  members={members}
  initialDate={selectedEventDate}
  eventToEdit={selectedEvent}
  onEventSaved={() => {
    setEventRefreshKey((current) => current + 1);
  }}
  onEventDeleted={() => {
    setEventRefreshKey((current) => current + 1);
  }}
/>

<RecurringEventChoiceModal
  isOpen={Boolean(recurringChoiceEvent)}
  event={recurringChoiceEvent}
  onClose={() => {
    setRecurringChoiceEvent(null);
  }}
    onThisEvent={() => {
    setOccurrenceActionEvent(recurringChoiceEvent);
    setRecurringChoiceEvent(null);
  }}
  onThisAndFuture={() => {
    setFutureEditEvent(recurringChoiceEvent);
    setRecurringChoiceEvent(null);
  }}
  onEntireSeries={() => {
    setSelectedEvent(recurringChoiceEvent);
    setSelectedEventDate(null);
    setRecurringChoiceEvent(null);
    setAddEventOpen(true);
  }}
/>

<OccurrenceActionModal
  isOpen={Boolean(occurrenceActionEvent)}
  event={occurrenceActionEvent}
  onClose={() => {
    setOccurrenceActionEvent(null);
  }}
  onEditOccurrence={(event) => {
    setOccurrenceEditEvent(event);
    setOccurrenceActionEvent(null);
  }}
  onOccurrenceDeleted={() => {
    setEventRefreshKey((current) => current + 1);
  }}
/>

<AddEventModal
  isOpen={Boolean(occurrenceEditEvent)}
  onClose={() => {
    setOccurrenceEditEvent(null);
  }}
  members={members}
  eventToEdit={occurrenceEditEvent}
  occurrenceEditMode
  onEventSaved={() => {
    setEventRefreshKey((current) => current + 1);
    setOccurrenceEditEvent(null);
  }}
/>

<AddEventModal
  isOpen={Boolean(futureEditEvent)}
  onClose={() => {
    setFutureEditEvent(null);
  }}
  members={members}
  eventToEdit={futureEditEvent}
  futureEditMode
  onEventSaved={() => {
    setEventRefreshKey((current) => current + 1);
    setFutureEditEvent(null);
  }}
/>

<TaskModal
  open={taskModalOpen}
  task={selectedTask}
  members={members}
  onClose={() => {
    setTaskModalOpen(false);
    setSelectedTask(null);
  }}
  onSaved={() => {
    setTaskRefreshKey((current) => current + 1);
    setTaskModalOpen(false);
    setSelectedTask(null);
  }}
/>

<MealModal
  isOpen={mealModalOpen}
  meal={selectedMeal}
  members={members}
  todayKey={todayKey}
  onClose={() => {
    setMealModalOpen(false);
    setSelectedMeal(null);
  }}
  onSaved={() => {
    setMealRefreshKey((current) => current + 1);
    setMealModalOpen(false);
    setSelectedMeal(null);
  }}
/>

<ShoppingItemModal
  open={shoppingModalOpen}
  item={selectedShoppingItem}
  members={members}
  onClose={() => {
    setShoppingModalOpen(false);
    setSelectedShoppingItem(null);
  }}
  onSaved={() => {
    setShoppingRefreshKey((current) => current + 1);
    setShoppingModalOpen(false);
    setSelectedShoppingItem(null);
  }}
  onDeleted={() => {
    setShoppingRefreshKey((current) => current + 1);
    setShoppingModalOpen(false);
    setSelectedShoppingItem(null);
  }}
/>

    </div>
  );
}

export default App;