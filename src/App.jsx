import { API_BASE_URL } from "./config/api";
import { startAutoRefresh } from "./utils/startAutoRefresh";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  Camera,
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
import "./wall-mode.css";
import "./tablet-polish.css";
import CamerasPage from "./pages/CamerasPage";
import "./cameras.css";
import "./home-responsive.css";
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
    id: "cameras",
    label: "Cameras",
    icon: Camera,
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

function getDisplayScheduleState(currentDate, startTime, endTime) {
  const toMinutes = (value) => {
    const [hours, minutes] = String(value || "00:00").split(":").map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  if (startMinutes === endMinutes) {
    return { active: false, key: "" };
  }

  const overnight = startMinutes > endMinutes;
  const active = overnight
    ? currentMinutes >= startMinutes || currentMinutes < endMinutes
    : currentMinutes >= startMinutes && currentMinutes < endMinutes;

  const occurrenceDate = new Date(currentDate);
  if (overnight && currentMinutes < endMinutes) {
    occurrenceDate.setDate(occurrenceDate.getDate() - 1);
  }

  return {
    active,
    key: `${formatDateKey(occurrenceDate)}:${startTime}-${endTime}`,
  };
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
const [dailyBriefEnabled, setDailyBriefEnabled] = useState(() =>
  localStorage.getItem("familyhub-daily-brief-enabled") === "true"
);
const [dailyBriefTime, setDailyBriefTime] = useState(() =>
  localStorage.getItem("familyhub-daily-brief-time") || "07:00"
);

const [wallMode, setWallMode] = useState(() => {
  return localStorage.getItem("familyhub-wall-mode") === "true";
});

const [displayScheduleEnabled, setDisplayScheduleEnabled] = useState(() =>
  localStorage.getItem("familyhub-display-schedule-enabled") === "true"
);
const [displayScheduleStart, setDisplayScheduleStart] = useState(() =>
  localStorage.getItem("familyhub-display-schedule-start") || "20:00"
);
const [displayScheduleEnd, setDisplayScheduleEnd] = useState(() =>
  localStorage.getItem("familyhub-display-schedule-end") || "06:30"
);
const [displaySchedulePhotos, setDisplaySchedulePhotos] = useState(() =>
  localStorage.getItem("familyhub-display-schedule-photos") !== "false"
);
const [displayScheduleDismissedFor, setDisplayScheduleDismissedFor] = useState("");

const [isFullscreen, setIsFullscreen] = useState(() => {
  return Boolean(document.fullscreenElement);
});

const [ambientMode, setAmbientMode] = useState(false);
const [ambientPreviewMode, setAmbientPreviewMode] = useState(false);
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
const [newTaskDefaults, setNewTaskDefaults] = useState(null);

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

const recipeDetailsId = recipeDetailsRecipe?.id;

useEffect(() => {
  if (!recipeDetailsOpen || recipeDetailsId == null) return;

  let cancelled = false;
  let inFlight = false;
  const controller = new AbortController();

  async function loadOpenRecipe() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/recipes/${recipeDetailsId}`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (cancelled) return;

      if (response.status === 404) {
        setRecipeDetailsOpen(false);
        setRecipeDetailsRecipe(null);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load recipe"
        );
      }

      if (cancelled) return;

      setRecipeDetailsRecipe(data.recipe);
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error("Open recipe refresh error:", err);
    } finally {
      inFlight = false;
    }
  }

  loadOpenRecipe();

  const stopAutoRefresh = startAutoRefresh(loadOpenRecipe);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, [recipeDetailsOpen, recipeDetailsId]);

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
    let cancelled = false;
    let inFlight = false;
    let hasLoaded = false;
    const controller = new AbortController();

    setLoading(true);
    setError("");

    async function loadFamilyMembers() {
      if (cancelled || inFlight) return;

      inFlight = true;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/family`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load family members");
        }

        const data = await response.json();

        if (cancelled) return;

        const nextMembers = data.members || [];

        setMembers((current) =>
          JSON.stringify(current) === JSON.stringify(nextMembers)
            ? current
            : nextMembers
        );

        setSelectedMemberId((current) => {
          if (
            current === "all" ||
            nextMembers.some(
              (member) => String(member.id) === String(current)
            )
          ) {
            return current;
          }

          return "all";
        });

        setError("");
        hasLoaded = true;
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;

        console.error("Family members refresh error:", err);

        if (!hasLoaded) {
          setError(
            "Unable to connect to FamilyHub API. Retrying…"
          );
        }
      } finally {
        inFlight = false;

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFamilyMembers();

    const stopAutoRefresh = startAutoRefresh(loadFamilyMembers);

    return () => {
      cancelled = true;
      stopAutoRefresh();
      controller.abort();
    };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* Refresh household data when returning or reconnecting. */
useEffect(() => {
  let lastRefreshAt = 0;

  function refreshHouseholdData() {
    if (document.visibilityState !== "visible") {
      return;
    }

    setCurrentTime(new Date());

    if (!navigator.onLine) {
      return;
    }

    const now = Date.now();

    // Returning to the browser can fire several events together.
    if (now - lastRefreshAt < 5000) {
      return;
    }

    lastRefreshAt = now;

    setEventRefreshKey((value) => value + 1);
    setTaskRefreshKey((value) => value + 1);
    setMealRefreshKey((value) => value + 1);
    setShoppingRefreshKey((value) => value + 1);
    setCountdownRefreshKey((value) => value + 1);
  }

  document.addEventListener(
    "visibilitychange",
    refreshHouseholdData
  );

  window.addEventListener("focus", refreshHouseholdData);
  window.addEventListener("online", refreshHouseholdData);

  return () => {
    document.removeEventListener(
      "visibilitychange",
      refreshHouseholdData
    );

    window.removeEventListener("focus", refreshHouseholdData);
    window.removeEventListener("online", refreshHouseholdData);
  };
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
  localStorage.setItem(
    "familyhub-display-schedule-enabled",
    String(displayScheduleEnabled)
  );
  localStorage.setItem("familyhub-display-schedule-start", displayScheduleStart);
  localStorage.setItem("familyhub-display-schedule-end", displayScheduleEnd);
  localStorage.setItem(
    "familyhub-display-schedule-photos",
    String(displaySchedulePhotos)
  );
}, [
  displayScheduleEnabled,
  displayScheduleStart,
  displayScheduleEnd,
  displaySchedulePhotos,
]);

const displaySchedule = getDisplayScheduleState(
  currentTime,
  displayScheduleStart,
  displayScheduleEnd
);

const displayScheduleActive = displayScheduleEnabled && displaySchedule.active;

useEffect(() => {
  if (
    displayScheduleActive &&
    displayScheduleDismissedFor !== displaySchedule.key &&
    !activeReminder
  ) {
    setAmbientMode(true);
  }
}, [
  activeReminder,
  displaySchedule.key,
  displayScheduleActive,
  displayScheduleDismissedFor,
]);

useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  const controller = new AbortController();

  async function loadAmbientWeather() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/weather`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load weather"
        );
      }

      if (cancelled) return;

      setAmbientWeather(data);
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error("Ambient weather refresh error:", err);
    } finally {
      inFlight = false;
    }
  }

  loadAmbientWeather();

  const stopAutoRefresh = startAutoRefresh(loadAmbientWeather);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, []);

useEffect(() => {
  if (!wallMode) {
    if (!displayScheduleActive && !ambientPreviewMode) {
      setAmbientMode(false);
    }
    return;
  }

    if (activeReminder) {
    setAmbientMode(false);
    return;
  }

    if (ambientMode || ambientPreviewMode) {
    const previousFocus = document.activeElement;

    document.querySelector(".ambient-display")?.focus({
      preventScroll: true,
    });

    return () => {
      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }

  let inactivityTimer;

  function resetAmbientTimer() {
    setAmbientMode(false);

    clearTimeout(inactivityTimer);

inactivityTimer = window.setTimeout(() => {
  const openDialog = Array.from(
    document.querySelectorAll(
      [
        ".event-modal-backdrop",
        ".modal-backdrop",
        ".settings-confirm-overlay",
        ".settings-calendar-source-form",
        '[role="dialog"]',
      ].join(",")
    )
  ).some((element) => element.getClientRects().length > 0);

  const editingField = document.activeElement?.matches(
    'input, textarea, select, [contenteditable="true"]'
  );

  if (openDialog || editingField) {
    resetAmbientTimer();
    return;
  }

  setAmbientMode(true);
}, 2 * 60 * 1000);
  }

const activityEvents = [
  "pointerdown",
  "pointermove",
  "keydown",
  "touchstart",
  "touchmove",
  "wheel",
  "input",
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
}, [
  wallMode,
  activeReminder,
  ambientMode,
  ambientPreviewMode,
  displayScheduleActive,
]);

const todayKey = formatDateKey(currentTime);

const ambientHour = currentTime.getHours();

const ambientGreeting =
  ambientHour < 12
    ? "Good morning"
    : ambientHour < 18
      ? "Good afternoon"
      : "Good evening";

const ambientPhotoMembers = members.filter((member) => member.photo_url);
const ambientPhotoMember = ambientPhotoMembers.length
  ? ambientPhotoMembers[
      Math.floor(currentTime.getMinutes() / 5) % ambientPhotoMembers.length
    ]
  : null;
const ambientPhotoUrl = ambientPhotoMember
  ? ambientPhotoMember.photo_url.startsWith("http")
    ? ambientPhotoMember.photo_url
    : `${API_BASE_URL}${ambientPhotoMember.photo_url}`
  : "";

const ambientTomorrow = new Date(currentTime);
ambientTomorrow.setDate(ambientTomorrow.getDate() + 1);

const ambientTomorrowKey = formatDateKey(ambientTomorrow);

const ambientTomorrowEvents = homeEvents.filter(
  (event) => event.start_date === ambientTomorrowKey
);  

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
  let cancelled = false;
  let inFlight = false;
  let hasLoaded = false;
  const controller = new AbortController();

  setHomeEventsLoading(true);
  setHomeEventsError("");

  async function loadHomeEvents() {
    if (cancelled || inFlight) return;

    inFlight = true;

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
        params.set("memberId", String(selectedMemberId));
      }

      const response = await fetch(
        `${API_BASE_URL}/api/events?${params.toString()}`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load home events");
      }

      const data = await response.json();

      if (cancelled) return;

      setHomeEvents(data.events || []);
      setHomeEventsError("");
      hasLoaded = true;
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error(err);

      if (!hasLoaded) {
        setHomeEventsError(
          "Unable to load calendar events. Retrying…"
        );
      }
    } finally {
      inFlight = false;

      if (!cancelled) {
        setHomeEventsLoading(false);
      }
    }
  }

  loadHomeEvents();
  const stopAutoRefresh = startAutoRefresh(loadHomeEvents);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, [
  todayKey,
  selectedMemberId,
  eventRefreshKey,
]);

useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  const controller = new AbortController();

  async function loadReminderEvents() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 3);

      const params = new URLSearchParams({
        start: formatDateKey(startDate),
        end: formatDateKey(endDate),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/events?${params.toString()}`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load reminder events");
      }

      const data = await response.json();

      if (cancelled) return;

      setReminderEvents(data.events || []);
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error("Event reminder load error:", err);
    } finally {
      inFlight = false;
    }
  }

  loadReminderEvents();

  const stopAutoRefresh = startAutoRefresh(loadReminderEvents);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, [
  todayKey,
  eventRefreshKey,
]);
useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  let hasLoaded = false;
  const controller = new AbortController();

  setHomeMealsLoading(true);
  setHomeMealsError("");

  async function loadHomeMeals() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const params = new URLSearchParams({
        start: todayKey,
        end: todayKey,
        mealType: "dinner",
      });

      if (selectedMemberId !== "all") {
        params.set("memberId", String(selectedMemberId));
      }

      const response = await fetch(
        `${API_BASE_URL}/api/meals?${params.toString()}`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load tonight's meal");
      }

      const data = await response.json();

      if (cancelled) return;

      setHomeMeals(data.meals || []);
      setHomeMealsError("");
      hasLoaded = true;
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error(err);

      if (!hasLoaded) {
        setHomeMealsError(
          "Unable to load tonight's meal. Retrying…"
        );
      }
    } finally {
      inFlight = false;

      if (!cancelled) {
        setHomeMealsLoading(false);
      }
    }
  }

  loadHomeMeals();

  const stopAutoRefresh = startAutoRefresh(loadHomeMeals);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, [
  todayKey,
  selectedMemberId,
  mealRefreshKey,
]);

useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  const controller = new AbortController();

  async function loadReminderMeals() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 3);

      const params = new URLSearchParams({
        start: formatDateKey(startDate),
        end: formatDateKey(endDate),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/meals?${params.toString()}`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load reminder meals");
      }

      const data = await response.json();

      if (cancelled) return;

      setReminderMeals(data.meals || []);
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error("Meal reminder load error:", err);
    } finally {
      inFlight = false;
    }
  }

  loadReminderMeals();

  const stopAutoRefresh = startAutoRefresh(loadReminderMeals);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, [
  todayKey,
  mealRefreshKey,
]);

useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  let hasLoaded = false;
  const controller = new AbortController();

  setHomeShoppingLoading(true);
  setHomeShoppingError("");

  async function loadHomeShopping() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const params = new URLSearchParams({
        completed: "false",
      });

      if (selectedMemberId !== "all") {
        params.set("memberId", String(selectedMemberId));
      }

      const response = await fetch(
        `${API_BASE_URL}/api/shopping?${params.toString()}`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load shopping list");
      }

      const data = await response.json();

      if (cancelled) return;

      setHomeShoppingItems(data.items || []);
      setHomeShoppingError("");
      hasLoaded = true;
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error(err);

      if (!hasLoaded) {
        setHomeShoppingError(
          "Unable to load shopping list. Retrying…"
        );
      }
    } finally {
      inFlight = false;

      if (!cancelled) {
        setHomeShoppingLoading(false);
      }
    }
  }

  loadHomeShopping();
  const stopAutoRefresh = startAutoRefresh(loadHomeShopping);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, [
  selectedMemberId,
  shoppingRefreshKey,
]);

useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  let hasLoaded = false;
  const controller = new AbortController();

  setHomeTasksLoading(true);
  setHomeTasksError("");

  async function loadHomeTasks() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const params = new URLSearchParams({
        start: todayKey,
        end: todayKey,
        completed: "false",
      });

      if (selectedMemberId !== "all") {
        params.set("memberId", String(selectedMemberId));
      }

      const response = await fetch(
        `${API_BASE_URL}/api/tasks?${params.toString()}`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load home tasks");
      }

      const data = await response.json();

      if (cancelled) return;

      setHomeTasks(data.tasks || []);
      setHomeTasksError("");
      hasLoaded = true;
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error(err);

      if (!hasLoaded) {
        setHomeTasksError(
          "Unable to load today's tasks. Retrying…"
        );
      }
    } finally {
      inFlight = false;

      if (!cancelled) {
        setHomeTasksLoading(false);
      }
    }
  }

  loadHomeTasks();
  const stopAutoRefresh = startAutoRefresh(loadHomeTasks);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, [
  todayKey,
  selectedMemberId,
  taskRefreshKey,
]);

useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  const controller = new AbortController();

  async function loadReminderTasks() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 3);

      const params = new URLSearchParams({
        start: formatDateKey(startDate),
        end: formatDateKey(endDate),
        completed: "false",
      });

      const response = await fetch(
        `${API_BASE_URL}/api/tasks?${params.toString()}`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load reminder tasks");
      }

      const data = await response.json();

      if (cancelled) return;

      setReminderTasks(data.tasks || []);
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error("Task reminder load error:", err);
    } finally {
      inFlight = false;
    }
  }

  loadReminderTasks();

  const stopAutoRefresh = startAutoRefresh(loadReminderTasks);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, [
  todayKey,
  taskRefreshKey,
]);


useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  let hasLoaded = false;
  const controller = new AbortController();

  setHomeCountdownsLoading(true);
  setHomeCountdownsError("");

  async function loadHomeCountdowns() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/countdowns`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load countdowns");
      }

      const data = await response.json();

      if (cancelled) return;

      setHomeCountdowns(data.countdowns || []);
      setHomeCountdownsError("");
      hasLoaded = true;
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error(err);

      if (!hasLoaded) {
        setHomeCountdownsError(
          "Unable to load countdowns. Retrying…"
        );
      }
    } finally {
      inFlight = false;

      if (!cancelled) {
        setHomeCountdownsLoading(false);
      }
    }
  }

  loadHomeCountdowns();

  const stopAutoRefresh = startAutoRefresh(loadHomeCountdowns);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, [countdownRefreshKey, activePage]);

useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  const controller = new AbortController();

  async function loadUpcomingHomeData() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const startDate = new Date();
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
        mealParams.set("memberId", String(selectedMemberId));
        taskParams.set("memberId", String(selectedMemberId));
      }

      const requestOptions = {
        signal: controller.signal,
        cache: "no-store",
      };

      const [mealResponse, taskResponse] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/meals?${mealParams.toString()}`,
          requestOptions
        ),
        fetch(
          `${API_BASE_URL}/api/tasks?${taskParams.toString()}`,
          requestOptions
        ),
      ]);

      if (!mealResponse.ok || !taskResponse.ok) {
        throw new Error("Failed to load upcoming home data");
      }

      const [mealData, taskData] = await Promise.all([
        mealResponse.json(),
        taskResponse.json(),
      ]);

      if (cancelled) return;

      setHomeUpcomingMeals(mealData.meals || []);
      setHomeUpcomingTasks(taskData.tasks || []);
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error(err);
    } finally {
      inFlight = false;
    }
  }

  loadUpcomingHomeData();

  const stopAutoRefresh = startAutoRefresh(loadUpcomingHomeData);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, [
  todayKey,
  selectedMemberId,
  mealRefreshKey,
  taskRefreshKey,
]);

const dailyBriefSummary = useMemo(() => {
  const eventCount = homeEvents.filter(
    (event) => event.start_date === todayKey
  ).length;
  const taskCount = homeTasks.filter(
    (task) => !task.is_completed
  ).length;
  const dinner = homeMeals.find(
    (meal) => meal.meal_type === "dinner"
  ) || homeMeals[0];

  const parts = [
    `${eventCount} ${eventCount === 1 ? "event" : "events"}`,
    `${taskCount} ${taskCount === 1 ? "task" : "tasks"}`,
    dinner ? `Dinner: ${dinner.title}` : "Dinner is not planned",
  ];

  if (homeShoppingItems.length > 0) {
    parts.push(`${homeShoppingItems.length} shopping items`);
  }

  return parts.join(" • ");
}, [homeEvents, homeTasks, homeMeals, homeShoppingItems, todayKey]);

useEffect(() => {
  localStorage.setItem(
    "familyhub-daily-brief-enabled",
    String(dailyBriefEnabled)
  );
  localStorage.setItem(
    "familyhub-daily-brief-time",
    dailyBriefTime
  );
}, [dailyBriefEnabled, dailyBriefTime]);

useEffect(() => {
  if (
    !dailyBriefEnabled ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const [hour, minute] = dailyBriefTime.split(":").map(Number);
  const scheduled = new Date(currentTime);
  scheduled.setHours(hour, minute, 0, 0);
  const latest = new Date(scheduled.getTime() + 5 * 60 * 1000);
  const sentKey = `familyhub-daily-brief-sent:${todayKey}`;

  if (
    currentTime < scheduled ||
    currentTime > latest ||
    localStorage.getItem(sentKey) === "true"
  ) {
    return;
  }

  const notification = new Notification("FamilyHub Daily Brief", {
    body: dailyBriefSummary,
    tag: `familyhub-daily-brief-${todayKey}`,
  });

  localStorage.setItem(sentKey, "true");
  notification.onclick = () => {
    window.focus();
    setActivePage("home");
    notification.close();
  };
}, [
  currentTime,
  dailyBriefEnabled,
  dailyBriefTime,
  dailyBriefSummary,
  todayKey,
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
      ambientMode || ambientPreviewMode ? "ambient-mode" : ""
    }`}
  >

{(ambientMode || ambientPreviewMode) && (
  <div
    className="ambient-display"
    style={
      displaySchedulePhotos && ambientPhotoUrl
        ? {
            backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.72), rgba(2, 6, 23, 0.9)), url("${ambientPhotoUrl}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }
        : undefined
    }
    role="button"
    tabIndex={0}
    aria-label="Return to FamilyHub"
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      if (displayScheduleActive) {
        setDisplayScheduleDismissedFor(displaySchedule.key);
      }
      setAmbientPreviewMode(false);
      setAmbientMode(false);
    }}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        if (displayScheduleActive) {
          setDisplayScheduleDismissedFor(displaySchedule.key);
        }
        setAmbientPreviewMode(false);
        setAmbientMode(false);
      }
    }}
  >
    <div className="ambient-clock">
      {formatClock(currentTime)}
    </div>

    <div className="ambient-date">
      {formatLongDate(currentTime)}
    </div>

  <div className="ambient-household-focus">
  <strong>{ambientGreeting}</strong>

  <span>
    {ambientHour < 12
      ? "Your day at a glance"
      : ambientHour < 18
        ? "The rest of your day"
        : "Tonight and tomorrow"}
  </span>

  {ambientHour >= 18 && (
    <small>
      {homeEventsLoading
        ? "Checking tomorrow’s calendar…"
        : homeEventsError
          ? "Tomorrow’s calendar is unavailable"
          : ambientTomorrowEvents.length === 0
            ? "Nothing on the calendar tomorrow"
            : `${ambientTomorrowEvents.length} ${
                ambientTomorrowEvents.length === 1
                  ? "event"
                  : "events"
              } on the calendar tomorrow`}
    </small>
  )}
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
{activePage === "cameras" && <CamerasPage />}
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

    onPlanBusyMeal={(recipe, defaults) => {
      setSelectedMeal(null);
      setNewMealDefaults(defaults);
      setMealRecipeDefault(recipe);
      setMealModalOpen(true);
    }}

    onAddEvent={() => {
      setSelectedEvent(null);
      setSelectedEventDate(null);
      setAddEventOpen(true);
    }}

    onAddTask={() => {
      setSelectedTask(null);
      setNewTaskDefaults(null);
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
  onAddTask={(defaults = null) => {
    setSelectedTask(null);
    setNewTaskDefaults(defaults);
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
  wallMode={wallMode}
  onWallModeChange={async (enabled) => {
    setWallMode(enabled);
    setAmbientMode(false);

    try {
      if (enabled && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
      } else if (!enabled && document.fullscreenElement) {
        await document.exitFullscreen?.();
      }
    } catch (error) {
      console.warn("Unable to change fullscreen mode:", error);
    }
  }}
  members={members}
  accentColour={accentColour}
  setAccentColour={setAccentColour}
  theme={theme}
  setTheme={setTheme}
  dailyBriefEnabled={dailyBriefEnabled}
  setDailyBriefEnabled={setDailyBriefEnabled}
  dailyBriefTime={dailyBriefTime}
  setDailyBriefTime={setDailyBriefTime}
  dailyBriefSummary={dailyBriefSummary}
  displayScheduleEnabled={displayScheduleEnabled}
  setDisplayScheduleEnabled={setDisplayScheduleEnabled}
  displayScheduleStart={displayScheduleStart}
  setDisplayScheduleStart={setDisplayScheduleStart}
  displayScheduleEnd={displayScheduleEnd}
  setDisplayScheduleEnd={setDisplayScheduleEnd}
  displaySchedulePhotos={displaySchedulePhotos}
  setDisplaySchedulePhotos={setDisplaySchedulePhotos}
  onPreviewDisplay={() => {
    setAmbientPreviewMode(true);
    setAmbientMode(true);
  }}
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
    <div className="reminder-popup-card fh-dialog">
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
    className="bottom-navigation" style={{ "--navigation-count": navigationItems.length }}
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
  defaultCategory={newTaskDefaults?.category || "chore"}
  onClose={() => {
  setTaskModalOpen(false);
  setSelectedTask(null);
  setTaskEditMode(null);
  setNewTaskDefaults(null);
}}
  onSaved={() => {
  setTaskRefreshKey((current) => current + 1);
  setTaskModalOpen(false);
  setSelectedTask(null);
  setTaskEditMode(null);
  setNewTaskDefaults(null);
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
