import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Home,
  Plus,
  ShoppingCart,
  Soup,
  Users,
} from "lucide-react";
import "./App.css";
import CalendarPage from "./pages/CalendarPage";
import AddEventModal from "./components/AddEventModal";
import RecurringEventChoiceModal from "./components/RecurringEventChoiceModal";
import OccurrenceActionModal from "./components/OccurrenceActionModal";

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

const [eventRefreshKey, setEventRefreshKey] = useState(0);

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

  const activePageLabel = useMemo(() => {
    return (
      navigationItems.find((item) => item.id === activePage)?.label || "Home"
    );
  }, [activePage]);

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

          <button
  type="button"
  className="add-event-button"
  onClick={() => {
  setSelectedEvent(null);
  setSelectedEventDate(null);
  setAddEventOpen(true);
}}
>
  <Plus size={22} />
  <span>Add Event</span>
</button>
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

              <div className="empty-state">
                <div className="empty-icon">
                  <CalendarDays size={28} />
                </div>

                <div>
                  <h4>No events today</h4>
                  <p>
                    Events for the selected family members will appear here.
                  </p>
                </div>
              </div>
            </article>

            <article className="panel upcoming-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Coming up</p>
                  <h3>Next few days</h3>
                </div>
              </div>

              <div className="upcoming-placeholder">
                <div>
                  <span>Tomorrow</span>
                  <strong>No events planned</strong>
                </div>

                <div>
                  <span>Friday</span>
                  <strong>No events planned</strong>
                </div>

                <div>
                  <span>Saturday</span>
                  <strong>No events planned</strong>
                </div>
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
              </div>

              <div className="small-empty-state">
                <CheckSquare size={24} />
                <span>No tasks due today</span>
              </div>
            </article>

            <article className="panel quick-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Dinner</p>
                  <h3>Tonight&apos;s meal</h3>
                </div>
              </div>

              <div className="small-empty-state">
                <Soup size={24} />
                <span>Nothing planned yet</span>
              </div>
            </article>

            <article className="panel quick-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Shopping</p>
                  <h3>Shared list</h3>
                </div>
              </div>

              <div className="small-empty-state">
                <ShoppingCart size={24} />
                <span>Your shopping list is empty</span>
              </div>
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
          <div className="placeholder-page">
            <p className="section-kicker">Tasks</p>
            <h2>Tasks are coming next</h2>
          </div>
        )}

        {activePage === "meals" && (
          <div className="placeholder-page">
            <p className="section-kicker">Meals</p>
            <h2>Meal planning is coming soon</h2>
          </div>
        )}

        {activePage === "shopping" && (
          <div className="placeholder-page">
            <p className="section-kicker">Shopping</p>
            <h2>Shopping lists are coming soon</h2>
          </div>
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

    </div>
  );
}

export default App;