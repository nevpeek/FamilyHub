import { API_BASE_URL } from "./config/api";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  CheckSquare,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Home,
  Settings,
  ShoppingCart,
  Soup,
  Sun,
  PackageOpen,
  ListChecks,
  Users,
} from "lucide-react";
import "./App.css";
import "./tasks-polish.css";
import "./meals-polish.css";
import "./shopping-polish.css";
import "./lists-polish.css";
import "./pantry-polish.css";
import "./settings-polish.css";
import "./home-polish.css";
import "./responsive-polish.css";
import HomePage from "./pages/HomePage";
import CalendarPage from "./pages/CalendarPage";
import TasksPage from "./pages/TasksPage";
import MealsPage from "./pages/MealsPage";
import ShoppingPage from "./pages/ShoppingPage";
import ListsPage from "./pages/ListsPage";
import PantryPage from "./pages/PantryPage";
import SettingsPage from "./pages/SettingsPage";
import AddEventModal from "./components/AddEventModal";
import RecurringEventChoiceModal from "./components/RecurringEventChoiceModal";
import OccurrenceActionModal from "./components/OccurrenceActionModal";
import TaskModal from "./components/TaskModal";
import RecurringTaskChoiceModal from "./components/RecurringTaskChoiceModal";
import MealModal from "./components/MealModal";
import RecipeModal from "./components/RecipeModal";
import RecipeDetailsModal from "./components/RecipeDetailsModal";
import ShoppingItemModal from "./components/ShoppingItemModal";
import FamilyMemberModal from "./components/FamilyMemberModal";
import { MotionConfig, motion } from "motion/react";

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
  {
    id: "lists",
    label: "Lists",
    icon: ListChecks,
  },
  {
    id: "pantry",
    label: "Pantry",
    icon: PackageOpen,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
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

function getAmbientWeatherIcon(code) {
  if (code === 0) {
    return <Sun size={38} />;
  }

  if ([1, 2].includes(code)) {
    return <CloudSun size={38} />;
  }

  if (code === 3) {
    return <Cloud size={38} />;
  }

  if ([45, 48].includes(code)) {
    return <CloudFog size={38} />;
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return <CloudDrizzle size={38} />;
  }

  if (
    [61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return <CloudRain size={38} />;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <CloudSnow size={38} />;
  }

  if ([95, 96, 99].includes(code)) {
    return <CloudLightning size={38} />;
  }

  return <CloudSun size={38} />;
}

function formatAmbientCountdown(event, now) {
  if (
    !event ||
    event.all_day ||
    !event.start_time
  ) {
    return "";
  }

  const [hours, minutes] =
    event.start_time
      .split(":")
      .map(Number);

  const eventTime = new Date(now);

  eventTime.setHours(
    hours,
    minutes,
    0,
    0
  );

  const differenceMs =
    eventTime.getTime() - now.getTime();

  const totalMinutes = Math.max(
    0,
    Math.ceil(
      differenceMs / (1000 * 60)
    )
  );

  if (totalMinutes === 0) {
    return "now";
  }

  if (totalMinutes < 60) {
    return `in ${totalMinutes} min`;
  }

  const hoursAway = Math.floor(
    totalMinutes / 60
  );

  const minutesAway =
    totalMinutes % 60;

  if (minutesAway === 0) {
    return `in ${hoursAway} ${
      hoursAway === 1 ? "hr" : "hrs"
    }`;
  }

  return `in ${hoursAway} ${
    hoursAway === 1 ? "hr" : "hrs"
  } ${minutesAway} min`;
}

function getReminderTriggerTime({
  date,
  time,
  reminderMinutes,
}) {
  if (!date || !time) {
    return null;
  }

  const [hours, minutes] =
    time.split(":").map(Number);

  const triggerTime = new Date(
    `${date}T00:00:00`
  );

  triggerTime.setHours(
    hours,
    minutes,
    0,
    0
  );

  triggerTime.setMinutes(
    triggerTime.getMinutes() -
      Number(reminderMinutes || 0)
  );

  return triggerTime;
}

function App() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [activePage, setActivePage] = useState(() => {
  const params = new URLSearchParams(
    window.location.search
  );

  const googleConnected =
    params.get("google") === "connected";

  if (googleConnected) {
    window.history.replaceState(
      {},
      "",
      window.location.pathname
    );
  }

  return googleConnected
    ? "settings"
    : "home";
});

useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}, [activePage]);
  const [accentColour, setAccentColour] = useState(() => {
  return localStorage.getItem("familyhub-accent") || "#2563eb";
});
const [theme, setTheme] = useState(() => {
  return localStorage.getItem("familyhub-theme") || "light";
});
const [selectedMemberId, setSelectedMemberId] = useState("all");
const [currentTime, setCurrentTime] = useState(() => new Date());

const [wallMode, setWallMode] = useState(() => {
  return localStorage.getItem("familyhub-wall-mode") === "true";
});

const [isFullscreen, setIsFullscreen] = useState(() => {
  return Boolean(document.fullscreenElement);
});

const [ambientMode, setAmbientMode] = useState(false);
const [ambientWeather, setAmbientWeather] =
  useState(null);
const [addEventOpen, setAddEventOpen] = useState(false);
const [selectedEvent, setSelectedEvent] = useState(null);
const [selectedEventDate, setSelectedEventDate] = useState(null);
const [selectedEventAllDay, setSelectedEventAllDay] = useState(false);
const [selectedEventTime, setSelectedEventTime] = useState(null);
const [recurringChoiceEvent, setRecurringChoiceEvent] = useState(null);
const [occurrenceActionEvent, setOccurrenceActionEvent] = useState(null);
const [occurrenceEditEvent, setOccurrenceEditEvent] = useState(null);
const [futureEditEvent, setFutureEditEvent] = useState(null);

const [eventRefreshKey, setEventRefreshKey] = useState(0);
const [countdownRefreshKey, setCountdownRefreshKey] = useState(0);
const [taskRefreshKey, setTaskRefreshKey] = useState(0);
const [taskModalOpen, setTaskModalOpen] = useState(false);
const [selectedTask, setSelectedTask] = useState(null);

const [recurringChoiceTask, setRecurringChoiceTask] = useState(null);
const [taskEditMode, setTaskEditMode] = useState(null);

const [mealRefreshKey, setMealRefreshKey] = useState(0);
const [mealModalOpen, setMealModalOpen] = useState(false);
const [selectedMeal, setSelectedMeal] = useState(null);
const [newMealDefaults, setNewMealDefaults] = useState(null);
const [mealRecipeDefault, setMealRecipeDefault] = useState(null);

const [mealPlannerFocus, setMealPlannerFocus,] = useState(null);

const [recipeModalOpen, setRecipeModalOpen] = useState(false);
const [selectedRecipe, setSelectedRecipe] = useState(null);

const [recipeDetailsOpen, setRecipeDetailsOpen] = useState(false);
const [recipeDetailsRecipe, setRecipeDetailsRecipe] = useState(null);

const [recipeRefreshKey, setRecipeRefreshKey] = useState(0);

const [shoppingRefreshKey, setShoppingRefreshKey] = useState(0);
const [shoppingModalOpen, setShoppingModalOpen] = useState(false);
const [selectedShoppingItem, setSelectedShoppingItem] = useState(null);
const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
const [homeEvents, setHomeEvents] = useState([]);
const [homeEventsLoading, setHomeEventsLoading] = useState(true);
const [homeEventsError, setHomeEventsError] = useState("");
const [reminderEvents, setReminderEvents] = useState([]);

const [homeTasks, setHomeTasks] = useState([]);
const [homeTasksLoading, setHomeTasksLoading] = useState(true);
const [homeTasksError, setHomeTasksError] = useState("");
const [reminderTasks, setReminderTasks] = useState([]);
const [homeMeals, setHomeMeals] = useState([]);
const [homeMealsLoading, setHomeMealsLoading] = useState(true);
const [homeMealsError, setHomeMealsError] = useState("");
const [homeShoppingItems, setHomeShoppingItems] = useState([]);
const [homeShoppingLoading, setHomeShoppingLoading] = useState(true);
const [homeShoppingError, setHomeShoppingError] = useState("");
const [homeUpcomingMeals, setHomeUpcomingMeals] = useState([]);
const [homeUpcomingTasks, setHomeUpcomingTasks] = useState([]);

const [reminderMeals, setReminderMeals] = useState([]);

const [homeCountdowns, setHomeCountdowns] = useState([]);
const [homeCountdownsLoading, setHomeCountdownsLoading] = useState(true);
const [homeCountdownsError, setHomeCountdownsError] = useState("");
const [activeReminder, setActiveReminder] =
  useState(null);
const shownRemindersRef =
  useRef(new Set()); 
  
useEffect(() => {
  if (!activeReminder) {
    return;
  }

  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

const notification = new Notification(
  activeReminder.type === "event"
    ? "FamilyHub Event Reminder"
    : activeReminder.type === "meal"
      ? "FamilyHub Meal Reminder"
      : "FamilyHub Task Reminder",
    {
      body: `${activeReminder.title} • ${formatEventTime(
        activeReminder.scheduledTime
      )}`,
      tag: activeReminder.key,
    }
  );

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return () => {
    notification.close();
  };
}, [activeReminder]);
  


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

  useEffect(() => {
  localStorage.setItem(
    "familyhub-accent",
    accentColour
  );

  document.documentElement.style.setProperty(
    "--familyhub-accent",
    accentColour
  );
}, [accentColour]);

useEffect(() => {
  localStorage.setItem(
    "familyhub-theme",
    theme
  );

  const mediaQuery =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

  function applyTheme() {
    const resolvedTheme =
      theme === "system"
        ? mediaQuery.matches
          ? "dark"
          : "light"
        : theme;

    document.documentElement.setAttribute(
      "data-theme",
      resolvedTheme
    );
  }

  applyTheme();

  if (theme === "system") {
    mediaQuery.addEventListener(
      "change",
      applyTheme
    );
  }

  return () => {
    mediaQuery.removeEventListener(
      "change",
      applyTheme
    );
  };
}, [theme]);

useEffect(() => {
  function handleFullscreenChange() {
    setIsFullscreen(
      Boolean(document.fullscreenElement)
    );
  }

  document.addEventListener(
    "fullscreenchange",
    handleFullscreenChange
  );

  return () => {
    document.removeEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );
  };
}, []);

useEffect(() => {
  localStorage.setItem(
    "familyhub-wall-mode",
    String(wallMode)
  );
}, [wallMode]);

useEffect(() => {
  async function loadAmbientWeather() {
    try {
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

      setAmbientWeather(data);
    } catch (err) {
      console.error(
        "Ambient weather error:",
        err
      );

      setAmbientWeather(null);
    }
  }

  loadAmbientWeather();

  const interval = window.setInterval(
    loadAmbientWeather,
    15 * 60 * 1000
  );

  return () =>
    window.clearInterval(interval);
}, []);

useEffect(() => {
  if (!wallMode) {
    setAmbientMode(false);
    return;
  }

    if (activeReminder) {
    setAmbientMode(false);
    return;
  }

  let inactivityTimer;

  function resetAmbientTimer() {
    setAmbientMode(false);

    clearTimeout(inactivityTimer);

inactivityTimer = setTimeout(() => {
  setAmbientMode(true);
}, 10 * 1000);
  }

  const activityEvents = [
    "pointerdown",
    "keydown",
    "touchstart",
  ];

  activityEvents.forEach((eventName) => {
    window.addEventListener(
      eventName,
      resetAmbientTimer
    );
  });

  resetAmbientTimer();

  return () => {
    clearTimeout(inactivityTimer);

    activityEvents.forEach((eventName) => {
      window.removeEventListener(
        eventName,
        resetAmbientTimer
      );
    });
  };
}, [wallMode, activeReminder]);

  const todayKey = formatDateKey(currentTime);

const ambientRemainingEvents =
  homeEvents.filter((event) => {
    if (event.start_date !== todayKey) {
      return false;
    }

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

    const eventTime = new Date(currentTime);

    eventTime.setHours(
      hours,
      minutes,
      0,
      0
    );

    return eventTime >= currentTime;
  });

const ambientNextEvent =
  homeEvents
    .filter((event) => {
      if (event.start_date !== todayKey) {
        return false;
      }

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

      const eventTime = new Date(currentTime);

      eventTime.setHours(
        hours,
        minutes,
        0,
        0
      );

      return eventTime >= currentTime;
    })
    .sort((a, b) => {
      if (a.all_day && !b.all_day) {
        return -1;
      }

      if (!a.all_day && b.all_day) {
        return 1;
      }

      return (
        (a.start_time || "00:00")
          .localeCompare(
            b.start_time || "00:00"
          )
      );
    })[0] || null;

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
  async function loadReminderEvents() {
    try {
      const startDate = new Date(currentTime);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 3);

      const params = new URLSearchParams({
        start: formatDateKey(startDate),
        end: formatDateKey(endDate),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/events?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load reminder events"
        );
      }

      const data = await response.json();

      setReminderEvents(
        data.events || []
      );
    } catch (err) {
      console.error(
        "Event reminder load error:",
        err
      );

      setReminderEvents([]);
    }
  }

  loadReminderEvents();
}, [
  todayKey,
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
  async function loadReminderMeals() {
    try {
      const startDate = new Date(currentTime);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 3);

      const params = new URLSearchParams({
        start: formatDateKey(startDate),
        end: formatDateKey(endDate),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/meals?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load reminder meals"
        );
      }

      const data = await response.json();

      setReminderMeals(
        data.meals || []
      );
    } catch (err) {
      console.error(
        "Meal reminder load error:",
        err
      );

      setReminderMeals([]);
    }
  }

  loadReminderMeals();
}, [
  todayKey,
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

useEffect(() => {
  async function loadReminderTasks() {
    try {
      const startDate = new Date(currentTime);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 3);

      const params = new URLSearchParams({
        start: formatDateKey(startDate),
        end: formatDateKey(endDate),
        completed: "false",
      });

      const response = await fetch(
        `${API_BASE_URL}/api/tasks?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load reminder tasks"
        );
      }

      const data = await response.json();

      setReminderTasks(
        data.tasks || []
      );
    } catch (err) {
      console.error(
        "Task reminder load error:",
        err
      );

      setReminderTasks([]);
    }
  }

  loadReminderTasks();
}, [
  todayKey,
  taskRefreshKey,
]);


useEffect(() => {
  async function loadHomeCountdowns() {
    setHomeCountdownsLoading(true);
    setHomeCountdownsError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/countdowns`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load countdowns"
        );
      }

      const data = await response.json();

      setHomeCountdowns(
        data.countdowns || []
      );
    } catch (err) {
      console.error(err);

      setHomeCountdownsError(
        "Unable to load countdowns"
      );
    } finally {
      setHomeCountdownsLoading(false);
    }
  }

  loadHomeCountdowns();
}, [countdownRefreshKey, activePage]);

useEffect(() => {
  async function loadUpcomingHomeData() {
    try {
      const startDate = new Date(currentTime);
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() + 1);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2);

      const mealParams = new URLSearchParams({
        start: formatDateKey(startDate),
        end: formatDateKey(endDate),
        mealType: "dinner",
      });

      const taskParams = new URLSearchParams({
        start: formatDateKey(startDate),
        end: formatDateKey(endDate),
        completed: "false",
      });

      if (selectedMemberId !== "all") {
        mealParams.set(
          "memberId",
          String(selectedMemberId)
        );

        taskParams.set(
          "memberId",
          String(selectedMemberId)
        );
      }

      const [mealResponse, taskResponse] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/api/meals?${mealParams.toString()}`
          ),
          fetch(
            `${API_BASE_URL}/api/tasks?${taskParams.toString()}`
          ),
        ]);

      if (!mealResponse.ok || !taskResponse.ok) {
        throw new Error(
          "Failed to load upcoming home data"
        );
      }

      const [mealData, taskData] =
        await Promise.all([
          mealResponse.json(),
          taskResponse.json(),
        ]);

      setHomeUpcomingMeals(
        mealData.meals || []
      );

      setHomeUpcomingTasks(
        taskData.tasks || []
      );
    } catch (err) {
      console.error(err);

      setHomeUpcomingMeals([]);
      setHomeUpcomingTasks([]);
    }
  }

  loadUpcomingHomeData();
}, [
  todayKey,
  selectedMemberId,
  mealRefreshKey,
  taskRefreshKey,
]);

useEffect(() => {
  const now = currentTime;

  const reminderCandidates = [];

for (const event of reminderEvents) {
    if (
      !event.reminder_enabled ||
      event.all_day ||
      !event.start_date ||
      !event.start_time
    ) {
      continue;
    }

    const triggerTime =
      getReminderTriggerTime({
        date: event.start_date,
        time: event.start_time,
        reminderMinutes:
          event.reminder_minutes,
      });

    if (!triggerTime) {
      continue;
    }

    const eventTime =
      getReminderTriggerTime({
        date: event.start_date,
        time: event.start_time,
        reminderMinutes: 0,
      });

    const key =
      `event:${event.id}:` +
      `${event.start_date}:` +
      `${event.start_time}:` +
      `${event.reminder_minutes ?? 0}`;

    if (
      now >= triggerTime &&
      now <=
        new Date(
          eventTime.getTime() +
            5 * 60 * 1000
        ) &&
      !shownRemindersRef.current.has(key)
    ) {
      reminderCandidates.push({
        key,
        type: "event",
        title: event.title,
        scheduledTime: event.start_time,
        triggerTime,
      });
    }
  }

const tasksToCheck = reminderTasks;

  for (const task of tasksToCheck) {
    if (
      !task.reminder_enabled ||
      !task.due_date ||
      !task.due_time ||
      task.is_completed
    ) {
      continue;
    }

    const triggerTime =
      getReminderTriggerTime({
        date: task.due_date,
        time: task.due_time,
        reminderMinutes:
          task.reminder_minutes,
      });

    if (!triggerTime) {
      continue;
    }

    const taskTime =
      getReminderTriggerTime({
        date: task.due_date,
        time: task.due_time,
        reminderMinutes: 0,
      });

    const taskIdentity =
      task.occurrence_key || task.id;

    const key =
      `task:${taskIdentity}:` +
      `${task.due_date}:` +
      `${task.due_time}:` +
      `${task.reminder_minutes ?? 0}`;

    if (
      now >= triggerTime &&
      now <=
        new Date(
          taskTime.getTime() +
            5 * 60 * 1000
        ) &&
      !shownRemindersRef.current.has(key)
    ) {
      reminderCandidates.push({
        key,
        type: "task",
        title: task.title,
        scheduledTime: task.due_time,
        triggerTime,
      });
    }
  }

const mealsToCheck = reminderMeals;

  for (const meal of mealsToCheck) {
    if (
      !meal.reminder_enabled ||
      !meal.meal_date ||
      !meal.meal_time
    ) {
      continue;
    }

    const triggerTime =
      getReminderTriggerTime({
        date: meal.meal_date,
        time: meal.meal_time,
        reminderMinutes:
          meal.reminder_minutes,
      });

    if (!triggerTime) {
      continue;
    }

    const mealTime =
      getReminderTriggerTime({
        date: meal.meal_date,
        time: meal.meal_time,
        reminderMinutes: 0,
      });

    const key =
      `meal:${meal.id}:` +
      `${meal.meal_date}:` +
      `${meal.meal_time}:` +
      `${meal.reminder_minutes ?? 0}`;

    if (
      now >= triggerTime &&
      now <=
        new Date(
          mealTime.getTime() +
            5 * 60 * 1000
        ) &&
      !shownRemindersRef.current.has(key)
    ) {
      reminderCandidates.push({
        key,
        type: "meal",
        title: meal.title,
        scheduledTime: meal.meal_time,
        triggerTime,
      });
    }
  }

  if (
    !activeReminder &&
    reminderCandidates.length > 0
  ) {
    reminderCandidates.sort(
      (a, b) =>
        a.triggerTime.getTime() -
        b.triggerTime.getTime()
    );

    const nextReminder =
      reminderCandidates[0];

    shownRemindersRef.current.add(
      nextReminder.key
    );

setAmbientMode(false);
setActiveReminder(nextReminder);
  }
}, [
  currentTime,
  reminderEvents,
  reminderTasks,
  reminderMeals,
  activeReminder,
]);



  const activePageLabel = useMemo(() => {
    return (
      navigationItems.find((item) => item.id === activePage)?.label || "Home"
    );
  }, [activePage]);

return (
  <div
    className={`familyhub-shell ${
      wallMode ? "wall-mode" : ""
    } ${
      ambientMode ? "ambient-mode" : ""
    }`}
  >

{ambientMode && (
  <div className="ambient-display">
    <div className="ambient-clock">
      {formatClock(currentTime)}
    </div>

    <div className="ambient-date">
      {formatLongDate(currentTime)}
    </div>

    {ambientWeather?.current && (
  <div className="ambient-weather">
    <div className="ambient-weather-icon">
      {getAmbientWeatherIcon(
        ambientWeather.current.weatherCode
      )}
    </div>

    <div className="ambient-weather-copy">
      <strong>
        {Math.round(
          ambientWeather.current.temperature
        )}°
      </strong>

      <span>
        {getWeatherDescription(
          ambientWeather.current.weatherCode
        )}
        {" · Feels "}
        {Math.round(
          ambientWeather.current.apparentTemperature
        )}°
      </span>
    </div>
  </div>
)}

    <div className="ambient-summary">
<span>
  {ambientRemainingEvents.length}{" "}
  {ambientRemainingEvents.length === 1
    ? "event left"
    : "events left"}
</span>
      <span>
        {homeTasks.length} tasks
      </span>

      <span>
        {homeShoppingItems.length} shopping items
      </span>
    </div>

<div className="ambient-dinner">
  <span>Tonight</span>

<strong>
  {homeMeals.length > 0
    ? homeMeals[0].title ||
      "Dinner planned"
    : "No dinner planned"}
</strong>
</div>

{ambientNextEvent && (
  <div className="ambient-next-event">
    <span>Next up</span>

    {ambientNextEvent.members?.[0] && (
      <div className="ambient-next-member">
        <span
          className="ambient-next-member-avatar"
          style={{
            backgroundColor:
              ambientNextEvent.members[0].colour ||
              "#64748b",
          }}
        >
          {ambientNextEvent.members[0].photo_url ? (
            <img
              src={`${API_BASE_URL}${ambientNextEvent.members[0].photo_url}`}
              alt={ambientNextEvent.members[0].name}
            />
          ) : (
            ambientNextEvent.members[0].initials ||
            ambientNextEvent.members[0].name
              ?.slice(0, 1)
              .toUpperCase()
          )}
        </span>

        <strong>
          {ambientNextEvent.members[0].name}
        </strong>
      </div>
    )}

    <strong>
      {ambientNextEvent.title}
    </strong>

<small>
  {ambientNextEvent.all_day
    ? "All day"
    : `${formatEventTime(
        ambientNextEvent.start_time
      )} · ${formatAmbientCountdown(
        ambientNextEvent,
        currentTime
      )}`}
</small>
  </div>
)}

{!ambientNextEvent && (
  <div className="ambient-next-event ambient-next-event-empty">
    <span>Next up</span>

    <strong>
      No more events today
    </strong>

    <small>
      Enjoy the rest of the day
    </small>
  </div>
)}

<div className="ambient-wake-hint">
  Tap anywhere to return to FamilyHub
</div>

  </div>
)}
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

<div className="header-actions">
  {wallMode && !isFullscreen && (
  <span className="wall-mode-status">
    Wall Mode active
  </span>
)}
  <button
    type="button"
    className="wall-mode-button"
onClick={async () => {
  if (!wallMode) {
    setActivePage("home");
    setWallMode(true);

    try {
      await document.documentElement.requestFullscreen?.();
    } catch (error) {
      console.error(
        "Unable to enter fullscreen:",
        error
      );
    }

    return;
  }

  if (!isFullscreen) {
    try {
      await document.documentElement.requestFullscreen?.();
    } catch (error) {
      console.error(
        "Unable to enter fullscreen:",
        error
      );
    }

    return;
  }

  try {
    await document.exitFullscreen?.();
  } catch (error) {
    console.error(
      "Unable to exit fullscreen:",
      error
    );
  }

  setWallMode(false);
}}
>
{!wallMode
  ? "Wall Mode"
  : isFullscreen
    ? "Exit Wall Mode"
    : "Resume Fullscreen"}
  </button>

  <div className="header-date">
    <strong>{formatClock(currentTime)}</strong>
    <span>{formatLongDate(currentTime)}</span>
  </div>
</div>
      </header>

      <main className="familyhub-main">
{activePage === "home" && (
  <HomePage
    members={members}
    loading={loading}
    error={error}
    currentTime={currentTime}
    selectedMemberId={selectedMemberId}
    setSelectedMemberId={setSelectedMemberId}

    homeEvents={homeEvents}
    homeEventsLoading={homeEventsLoading}
    homeEventsError={homeEventsError}

    homeTasks={homeTasks}
    homeTasksLoading={homeTasksLoading}
    homeTasksError={homeTasksError}

    homeMeals={homeMeals}
    homeMealsLoading={homeMealsLoading}
    homeMealsError={homeMealsError}

    homeShoppingItems={homeShoppingItems}
    homeShoppingLoading={homeShoppingLoading}
    homeShoppingError={homeShoppingError}

homeUpcomingMeals={homeUpcomingMeals}
homeUpcomingTasks={homeUpcomingTasks}

homeCountdowns={homeCountdowns}
homeCountdownsLoading={homeCountdownsLoading}
homeCountdownsError={homeCountdownsError}

onNavigate={setActivePage}

    onAddEvent={() => {
      setSelectedEvent(null);
      setSelectedEventDate(null);
      setAddEventOpen(true);
    }}

    onAddTask={() => {
      setSelectedTask(null);
      setTaskModalOpen(true);
    }}

    onAddMeal={() => {
      setSelectedMeal(null);
      setNewMealDefaults(null);
      setMealRecipeDefault(null);
      setMealModalOpen(true);
    }}

    onAddShoppingItem={() => {
      setSelectedShoppingItem(null);
      setShoppingModalOpen(true);
    }}

    onEditTask={(task) => {
      setSelectedTask(task);
      setTaskModalOpen(true);
    }}

    onEditShoppingItem={(item) => {
      setSelectedShoppingItem(item);
      setShoppingModalOpen(true);
    }}

    onCompleteTask={() => {
      setTaskRefreshKey(
        (current) => current + 1
      );
    }}

    onCompleteShoppingItem={() => {
      setShoppingRefreshKey(
        (current) => current + 1
      );
    }}
  />
)}

        {activePage === "calendar" && (

     <CalendarPage
  members={members}
  selectedMemberId={selectedMemberId}
  setSelectedMemberId={setSelectedMemberId}
onAddEvent={(value = null) => {
  setSelectedEvent(null);
  setSelectedEventTime(null);

  if (
    value &&
    typeof value === "object" &&
    "allDay" in value
  ) {
    setSelectedEventDate(value.date);

    setSelectedEventAllDay(
      Boolean(value.allDay)
    );

    setSelectedEventTime(
      value.time || null
    );
  } else {
    setSelectedEventDate(value);
    setSelectedEventAllDay(false);

    if (value instanceof Date) {
      setSelectedEventTime(
        `${String(
          value.getHours()
        ).padStart(2, "0")}:${String(
          value.getMinutes()
        ).padStart(2, "0")}`
      );
    }
  }

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
  if (
    task.is_recurring &&
    task.is_occurrence
  ) {
    setRecurringChoiceTask(task);
    return;
  }

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
recipeRefreshKey={recipeRefreshKey}
mealPlannerFocus={mealPlannerFocus}
   onAddMeal={(defaults = null) => {
    setSelectedMeal(null);
    setNewMealDefaults(defaults);
    setMealRecipeDefault(null);
    setMealModalOpen(true);
  }}
  onEditMeal={(meal) => {
    setSelectedMeal(meal);
    setNewMealDefaults(null);
    setMealRecipeDefault(null);
    setMealModalOpen(true);
  }}
  onAddRecipe={() => {
    setSelectedRecipe(null);
    setRecipeModalOpen(true);
  }}
  onEditRecipe={(recipe) => {
    setSelectedRecipe(recipe);
    setRecipeModalOpen(true);
  }}
  onViewRecipe={(recipe) => {
    setRecipeDetailsRecipe(recipe);
    setRecipeDetailsOpen(true);
  }}

onPlanRecipe={async (
  recipe,
  defaults = null
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/recipes/${recipe.id}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to load recipe"
      );
    }

    setSelectedMeal(null);
    setNewMealDefaults(defaults);
    setMealRecipeDefault(
      data.recipe
    );
    setMealModalOpen(true);
  } catch (err) {
    console.error(err);

    window.alert(
      err.message ||
        "Unable to load recipe"
    );
  }
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

{activePage === "lists" && (
  <ListsPage
    members={members}
  />
)}

{activePage === "pantry" && (
  <PantryPage />
)}

{activePage === "settings" && (
<SettingsPage
  members={members}
  accentColour={accentColour}
  setAccentColour={setAccentColour}
  theme={theme}
  setTheme={setTheme}
    onEditMember={(member) =>
      setSelectedFamilyMember(member)
    }
    onAddMember={() =>
      setSelectedFamilyMember({
        id: null,
        name: "",
        initials: "",
        colour: "#3B82F6",
      })
    }
  />
)}
      </main>

{activeReminder && (
  <div className="reminder-popup">
    <div className="reminder-popup-card">
      <span className="reminder-popup-label">
{activeReminder.type === "event"
  ? "Event reminder"
  : activeReminder.type === "meal"
    ? "Meal reminder"
    : "Task reminder"}
      </span>

      <strong>
        {activeReminder.title}
      </strong>

<span>
  {formatEventTime(
    activeReminder.scheduledTime
  )}
</span>

<span className="reminder-popup-countdown">
  {(() => {
    const [hours, minutes] =
      activeReminder.scheduledTime
        .split(":")
        .map(Number);

    const scheduledTime =
      new Date(currentTime);

    scheduledTime.setHours(
      hours,
      minutes,
      0,
      0
    );

const differenceMs =
  scheduledTime.getTime() -
  currentTime.getTime();

if (differenceMs >= 0) {
  const minutesUntil = Math.ceil(
    differenceMs / (1000 * 60)
  );

  if (minutesUntil === 0) {
    return "Starting now";
  }

  return `Starts in ${minutesUntil} ${
    minutesUntil === 1
      ? "minute"
      : "minutes"
  }`;
}

const minutesAgo = Math.max(
  1,
  Math.floor(
    Math.abs(differenceMs) /
      (1000 * 60)
  )
);

return `Started ${minutesAgo} ${
  minutesAgo === 1
    ? "minute"
    : "minutes"
} ago`;
  })()}
</span>

<div className="reminder-popup-actions">
  <button
    type="button"
    onClick={() => {
      const snoozedReminder = {
        ...activeReminder,
        triggerTime: new Date(
          Date.now() + 5 * 60 * 1000
        ),
        key: `${activeReminder.key}:snooze:${Date.now()}`,
      };


      setActiveReminder(null);

      window.setTimeout(() => {
        setActiveReminder(snoozedReminder);
      }, 5 * 60 * 1000);
    }}
  >
    Snooze 5 min
  </button>

  <button
    type="button"
    onClick={() =>
      setActiveReminder(null)
    }
  >
    Dismiss
  </button>
</div>
    </div>
  </div>
)}      

<MotionConfig reducedMotion="user">
  <nav
    className="bottom-navigation"
    aria-label="Primary navigation"
  >
    {navigationItems.map((item) => {
      const Icon = item.icon;
      const isActive = activePage === item.id;

      return (
        <button
          type="button"
          key={item.id}
          className={`nav-button ${isActive ? "active" : ""}`}
          onClick={() => setActivePage(item.id)}
          aria-current={isActive ? "page" : undefined}
        >
          {isActive && (
            <motion.span
              className="nav-active-highlight"
              layoutId="familyhub-dock-highlight"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 38,
              }}
              aria-hidden="true"
            />
          )}

          <Icon size={22} />
          <span className="nav-label">{item.label}</span>
        </button>
      );
    })}
  </nav>
</MotionConfig>

<AddEventModal
  isOpen={addEventOpen}
  onClose={() => {
    setAddEventOpen(false);
    setSelectedEvent(null);
    setSelectedEventDate(null);
    setSelectedEventTime(null);
  }}
members={members}
initialDate={selectedEventDate}
initialAllDay={selectedEventAllDay}
eventToEdit={selectedEvent}
initialTime={selectedEventTime}
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
  setCountdownRefreshKey((current) => current + 1);
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

<RecurringTaskChoiceModal
  isOpen={Boolean(recurringChoiceTask)}
  task={recurringChoiceTask}
  onClose={() => {
    setRecurringChoiceTask(null);
  }}
onThisTask={() => {
  if (!recurringChoiceTask) {
    return;
  }

  setSelectedTask(recurringChoiceTask);
  setTaskEditMode("occurrence");
  setRecurringChoiceTask(null);
  setTaskModalOpen(true);
}}
onThisAndFuture={() => {
  if (!recurringChoiceTask) {
    return;
  }

  setSelectedTask(recurringChoiceTask);
  setTaskEditMode("future");
  setRecurringChoiceTask(null);
  setTaskModalOpen(true);
}}
  onEntireSeries={async () => {
  if (!recurringChoiceTask) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tasks/${recurringChoiceTask.id}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to load recurring task"
      );
    }

    setSelectedTask(data.task);
    setTaskEditMode("series");
    setRecurringChoiceTask(null);
    setTaskModalOpen(true);
  } catch (err) {
    console.error(err);

    window.alert(
      err.message ||
        "Unable to load recurring task"
    );
  }
}}
/>

<TaskModal
  open={taskModalOpen}
  task={selectedTask}
  editMode={taskEditMode}
  members={members}
  onClose={() => {
  setTaskModalOpen(false);
  setSelectedTask(null);
  setTaskEditMode(null);
}}
  onSaved={() => {
  setTaskRefreshKey((current) => current + 1);
  setTaskModalOpen(false);
  setSelectedTask(null);
  setTaskEditMode(null);
}}
/>

<MealModal
  isOpen={mealModalOpen}
  meal={selectedMeal}
  members={members}
  todayKey={todayKey}
  defaultMealDate={
    newMealDefaults?.mealDate || null
  }
  defaultMealType={
    newMealDefaults?.mealType || null
  }
    defaultRecipe={mealRecipeDefault}
  onClose={() => {
    setMealModalOpen(false);
    setSelectedMeal(null);
    setNewMealDefaults(null);
    setMealRecipeDefault(null);
  }}
onSaved={(savedMeal) => {
  if (
    selectedMemberId !== "all" &&
    savedMeal &&
    !(savedMeal.members || []).some(
      (member) =>
        member.id === selectedMemberId
    )
  ) {
    setSelectedMemberId("all");
  }

setMealRefreshKey(
  (current) => current + 1
);

if (savedMeal?.meal_date) {
  setMealPlannerFocus({
    date: savedMeal.meal_date,
    mealId: savedMeal.id,
    key: Date.now(),
  });
}

setMealModalOpen(false);
  setSelectedMeal(null);
  setNewMealDefaults(null);
  setMealRecipeDefault(null);
}}
/>

<RecipeModal
  open={recipeModalOpen}
  recipe={selectedRecipe}
  onClose={() => {
    setRecipeModalOpen(false);
    setSelectedRecipe(null);
  }}
  onSaved={() => {
    setRecipeRefreshKey((current) => current + 1);
    setRecipeModalOpen(false);
    setSelectedRecipe(null);
  }}
  onDeleted={() => {
    setRecipeRefreshKey((current) => current + 1);
    setRecipeModalOpen(false);
    setSelectedRecipe(null);
  }}
/>

<RecipeDetailsModal
  open={recipeDetailsOpen}
  recipe={recipeDetailsRecipe}
  members={members}
  onClose={() => {
    setRecipeDetailsOpen(false);
    setRecipeDetailsRecipe(null);
  }}
  onEdit={(recipe) => {
    setRecipeDetailsOpen(false);
    setRecipeDetailsRecipe(null);
    setSelectedRecipe(recipe);
    setRecipeModalOpen(true);
  }}
  onPlan={(recipe) => {
    setRecipeDetailsOpen(false);
    setRecipeDetailsRecipe(null);

    setSelectedMeal(null);
    setNewMealDefaults(null);
    setMealRecipeDefault(recipe);
    setMealModalOpen(true);
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

<FamilyMemberModal
  open={Boolean(selectedFamilyMember)}
  member={selectedFamilyMember}
  onClose={() => {
    setSelectedFamilyMember(null);
  }}
  onSaved={(savedMember) => {
    setMembers((current) => {
      const exists = current.some(
        (member) =>
          member.id === savedMember.id
      );

      if (exists) {
        return current.map((member) =>
          member.id === savedMember.id
            ? savedMember
            : member
        );
      }

      return [...current, savedMember];
    });

    setSelectedFamilyMember(null);
  }}
  onDeleted={(memberId) => {
    setMembers((current) =>
      current.filter(
        (member) =>
          member.id !== memberId
      )
    );

    if (selectedMemberId === memberId) {
      setSelectedMemberId("all");
    }

    setSelectedFamilyMember(null);
  }}
/>

    </div>
  );
}

export default App;