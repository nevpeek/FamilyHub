import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  Soup,
  Sunrise,
  SunMedium,
  Sunset,
} from "lucide-react";

function formatEventTime(time) {
  if (!time) return "All day";

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function isTaskComplete(task) {
  if (task.members?.length) {
    return task.members.every((member) => Boolean(member.is_completed));
  }

  return Boolean(task.is_completed);
}

function FocusCard({ icon: Icon, label, title, detail, onClick, tone }) {
  return (
    <button
      type="button"
      className={`home-focus-card home-focus-card-${tone}`}
      onClick={onClick}
    >
      <span className="home-focus-card-icon">
        <Icon size={20} />
      </span>

      <span className="home-focus-card-copy">
        <small>{label}</small>
        <strong>{title}</strong>
        <span>{detail}</span>
      </span>

      <ChevronRight size={18} className="home-focus-card-arrow" />
    </button>
  );
}

export default function HomeTodayMode({
  mode,
  nextTodayEvent,
  todayEvents,
  homeTasks,
  homeMeals,
  openShoppingItems,
  tomorrow,
  onNavigate,
}) {
  const remainingTasks = homeTasks.filter(
    (task) => !isTaskComplete(task)
  );
  const dinner =
    homeMeals.find(
      (meal) => String(meal.meal_type || "dinner").toLowerCase() === "dinner"
    ) || homeMeals[0];

  const tomorrowEvents = tomorrow?.events || [];
  const tomorrowMeals = tomorrow?.meals || [];
  const tomorrowDinner =
    tomorrowMeals.find(
      (meal) => String(meal.meal_type || "dinner").toLowerCase() === "dinner"
    ) || tomorrowMeals[0];

  const content = {
    morning: {
      icon: Sunrise,
      kicker: "Morning focus",
      title: "Ready for the day",
      description: "Appointments, chores and dinner are lined up in one place.",
    },
    afternoon: {
      icon: SunMedium,
      kicker: "Afternoon focus",
      title: "What needs attention next",
      description: "Keep pickups, remaining chores and tonight's dinner moving.",
    },
    evening: {
      icon: Sunset,
      kicker: "Evening focus",
      title: "Wrap up today and prepare tomorrow",
      description: "Finish anything outstanding and see what the morning brings.",
    },
  }[mode];

  const ModeIcon = content.icon;

  const scheduleCard =
    mode === "evening"
      ? {
          label: "Tomorrow",
          title:
            tomorrowEvents[0]?.title ||
            (tomorrowEvents.length ? `${tomorrowEvents.length} events` : "Calendar is clear"),
          detail: tomorrowEvents[0]
            ? formatEventTime(tomorrowEvents[0].start_time)
            : "Nothing scheduled yet",
        }
      : {
          label: nextTodayEvent ? "Up next" : "Today's calendar",
          title:
            nextTodayEvent?.title ||
            (todayEvents.length ? `${todayEvents.length} events today` : "Calendar is clear"),
          detail: nextTodayEvent
            ? formatEventTime(nextTodayEvent.start_time)
            : "No more timed events",
        };

  const mealCard =
    mode === "evening"
      ? {
          label: "Tomorrow's dinner",
          title: tomorrowDinner?.title || "Dinner is not planned",
          detail: tomorrowDinner ? "Ready for tomorrow" : "Plan ahead in Dinner Planner",
        }
      : {
          label: "Tonight's dinner",
          title: dinner?.title || "Dinner is not planned",
          detail: dinner ? "View the dinner plan" : "Choose something for tonight",
        };

  return (
    <section className={`home-today-mode home-today-mode-${mode}`}>
      <div className="home-today-mode-heading">
        <span className="home-today-mode-icon">
          <ModeIcon size={22} />
        </span>

        <div>
          <p>{content.kicker}</p>
          <h3>{content.title}</h3>
          <span>{content.description}</span>
        </div>
      </div>

      <div className="home-focus-grid">
        <FocusCard
          icon={CalendarDays}
          label={scheduleCard.label}
          title={scheduleCard.title}
          detail={scheduleCard.detail}
          tone="calendar"
          onClick={() => onNavigate("calendar")}
        />

        <FocusCard
          icon={CheckCircle2}
          label="Chores"
          title={
            remainingTasks.length
              ? `${remainingTasks.length} remaining`
              : "Everything is done"
          }
          detail={
            remainingTasks[0]?.title || "The family is all caught up"
          }
          tone="tasks"
          onClick={() => onNavigate("tasks")}
        />

        <FocusCard
          icon={dinner || tomorrowDinner ? Soup : ShoppingCart}
          label={mealCard.label}
          title={mealCard.title}
          detail={
            !dinner && mode !== "evening" && openShoppingItems.length
              ? `${openShoppingItems.length} shopping items open`
              : mealCard.detail
          }
          tone="meal"
          onClick={() => onNavigate("meals")}
        />
      </div>
    </section>
  );
}
