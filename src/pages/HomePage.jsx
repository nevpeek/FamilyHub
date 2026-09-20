import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useReducedMotion,
} from "motion/react";

import { API_BASE_URL } from "../config/api";
import { startAutoRefresh } from "../utils/startAutoRefresh";
import HomeHeader from "../components/HomeHeader";
import HomeTodayPanel from "../components/HomeTodayPanel";
import HomeChoresPanel from "../components/HomeChoresPanel";
import HomeCountdownPanel from "../components/HomeCountdownPanel";
import HomeContextCards from "../components/HomeContextCards";
import HomeCameraPanel from "../components/HomeCameraPanel";
import HomeDinnerPanel from "../components/HomeDinnerPanel";
import HomeFamilyOutlookPanel from "../components/HomeFamilyOutlookPanel";
import HomeListsPanel from "../components/HomeListsPanel";
import HomeQuickActions from "../components/HomeQuickActions";
import HomeFamilySelector from "../components/HomeFamilySelector";
import HomeSummaryLine from "../components/HomeSummaryLine";

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
const [layoutMode, setLayoutMode] = useState(false);
const defaultHomePanelOrder = [
  "today",
  "chores",
  "countdown",
  "camera",
  "context",
  "dinner",
  "outlook",
  "lists",
];

const defaultHomePanelSizes = {
  today: { width: 8, height: 1 },
  chores: { width: 8, height: 1 },
  countdown: { width: 4, height: 1 },
  camera: { width: 4, height: 1 },
  context: { width: 4, height: 1 },
  dinner: { width: 4, height: 1 },
  outlook: { width: 12, height: 1 },
  lists: { width: 12, height: 1 },
};

const [homePanelOrder, setHomePanelOrder] = useState(() => {
  try {
    const savedLayout = localStorage.getItem(
      "familyhub-home-panel-order"
    );

    if (savedLayout) {
      const parsedLayout = JSON.parse(savedLayout);

      if (Array.isArray(parsedLayout)) {
        return parsedLayout;
      }
    }
  } catch (error) {
    console.error(
      "Unable to load saved Home panel order:",
      error
    );
  }

  return defaultHomePanelOrder;
});

const [homePanelSizes, setHomePanelSizes] = useState(() => {
  try {
    const savedSizes = localStorage.getItem(
      "familyhub-home-panel-sizes"
    );

    if (savedSizes) {
      const parsedSizes =
        JSON.parse(savedSizes);

      if (
        parsedSizes &&
        typeof parsedSizes === "object"
      ) {
        return {
          ...defaultHomePanelSizes,
          ...parsedSizes,
        };
      }
    }
  } catch (error) {
    console.error(
      "Unable to load saved Home panel sizes:",
      error
    );
  }

  return {
    ...defaultHomePanelSizes,
  };
});

const [layoutStartOrder, setLayoutStartOrder] =
  useState(null);

const [layoutStartSizes, setLayoutStartSizes] =
  useState(null);  

const [draggedPanelId, setDraggedPanelId] =
  useState(null);

const [dragPosition, setDragPosition] =
  useState(null);

const [dragPanelRect, setDragPanelRect] =
  useState(null);

const dragPointerIdRef = useRef(null);

const dragStartPositionRef = useRef({
  x: 0,
  y: 0,
});

const dragPointerOffsetRef = useRef({
  x: 0,
  y: 0,
});

const resizeStateRef = useRef(null);

const layoutHoldTimerRef = useRef(null);

const suppressNextClickRef = useRef(false);

function clearLayoutHoldTimer() {
  if (layoutHoldTimerRef.current) {
    window.clearTimeout(
      layoutHoldTimerRef.current
    );

    layoutHoldTimerRef.current = null;
  }
}

function enterLayoutMode() {
  setLayoutStartOrder([
    ...homePanelOrder,
  ]);

  setLayoutStartSizes({
    ...homePanelSizes,
  });

  suppressNextClickRef.current = true;

  setLayoutMode(true);
}

function startLayoutHold() {
  if (layoutMode) {
    return;
  }

  clearLayoutHoldTimer();

  layoutHoldTimerRef.current =
    window.setTimeout(() => {
      enterLayoutMode();
      layoutHoldTimerRef.current = null;
    }, 650);
}

function saveHomeLayout() {
  try {
    localStorage.setItem(
      "familyhub-home-panel-order",
      JSON.stringify(homePanelOrder)
    );
    localStorage.setItem(
  "familyhub-home-panel-sizes",
  JSON.stringify(homePanelSizes)
);
  } catch (error) {
    console.error(
      "Unable to save Home layout:",
      error
    );
  }

setLayoutStartOrder(null);
setLayoutStartSizes(null);
setDraggedPanelId(null);
setLayoutMode(false);
}

function cancelHomeLayout() {
  if (layoutStartOrder) {
    setHomePanelOrder(
      layoutStartOrder
    );
  }

  if (layoutStartSizes) {
    setHomePanelSizes(
      layoutStartSizes
    );
  }

  setLayoutStartOrder(null);
  setLayoutStartSizes(null);
  setDraggedPanelId(null);
  setLayoutMode(false);
}

function resetHomeLayout() {
  setHomePanelOrder([
    ...defaultHomePanelOrder,
  ]);

  setHomePanelSizes({
    ...defaultHomePanelSizes,
  });
}

function resizeHomePanel(
  panelId,
  dimension,
  direction
) {
  setHomePanelSizes((currentSizes) => {
    const currentSize =
      currentSizes[panelId] ||
      defaultHomePanelSizes[panelId] ||
      { width: 4, height: 1 };

    const width =
      typeof currentSize === "number"
        ? currentSize
        : currentSize.width || 4;

    const height =
      typeof currentSize === "number"
        ? 1
        : currentSize.height || 1;

    if (dimension === "width") {
      const nextWidth =
        direction === "larger"
          ? Math.min(width + 2, 12)
          : Math.max(width - 2, 4);

      return {
        ...currentSizes,
        [panelId]: {
          width: nextWidth,
          height,
        },
      };
    }

    const nextHeight =
      direction === "larger"
        ? Math.min(height + 1, 3)
        : Math.max(height - 1, 1);

    return {
      ...currentSizes,
      [panelId]: {
        width,
        height: nextHeight,
      },
    };
  });
}

function getHomePanelWidth(panelId) {
  const panelSize =
    homePanelSizes[panelId] ||
    defaultHomePanelSizes[panelId] ||
    { width: 4, height: 1 };

  if (typeof panelSize === "number") {
    return Math.max(
      2,
      Math.min(12, panelSize)
    );
  }

  return Math.max(
    2,
    Math.min(
      12,
      panelSize.width || 4
    )
  );
}

function getHomePanelHeight(panelId) {
  const panelSize =
    homePanelSizes[panelId] ||
    defaultHomePanelSizes[panelId] ||
    { width: 4, height: 1 };

  if (typeof panelSize === "number") {
    return 1;
  }

  return Math.max(
    1,
    Math.min(
      3,
      panelSize.height || 1
    )
  );
}

function buildPackedHomeLayout(order) {
  const occupied = [];

  function isAreaFree(
    column,
    row,
    width,
    height
  ) {
    if (
      column < 1 ||
      column + width - 1 > 12
    ) {
      return false;
    }

    for (
      let checkRow = row;
      checkRow < row + height;
      checkRow += 1
    ) {
      for (
        let checkColumn = column;
        checkColumn <
        column + width;
        checkColumn += 1
      ) {
        if (
          occupied.some(
            (cell) =>
              cell.row === checkRow &&
              cell.column ===
                checkColumn
          )
        ) {
          return false;
        }
      }
    }

    return true;
  }

  function occupyArea(
    column,
    row,
    width,
    height
  ) {
    for (
      let occupyRow = row;
      occupyRow < row + height;
      occupyRow += 1
    ) {
      for (
        let occupyColumn = column;
        occupyColumn <
        column + width;
        occupyColumn += 1
      ) {
        occupied.push({
          row: occupyRow,
          column: occupyColumn,
        });
      }
    }
  }

  const layout = {};

  order.forEach((panelId) => {
    const width =
      getHomePanelWidth(panelId);

    const height =
      getHomePanelHeight(panelId);

    let row = 1;
    let placed = false;

    while (!placed) {
      for (
        let column = 1;
        column <= 13 - width;
        column += 1
      ) {
        if (
          isAreaFree(
            column,
            row,
            width,
            height
          )
        ) {
          layout[panelId] = {
            column,
            row,
            width,
            height,
          };

          occupyArea(
            column,
            row,
            width,
            height
          );

          placed = true;
          break;
        }
      }

      if (!placed) {
        row += 1;
      }
    }
  });

  return layout;
}

function getHomeGridMetrics() {
  const grid =
    document.querySelector(
      ".home-layout-grid"
    );

  if (!grid) {
    return null;
  }

  const rect =
    grid.getBoundingClientRect();

  const styles =
    window.getComputedStyle(grid);

  const columnGap =
    Number.parseFloat(
      styles.columnGap
    ) || 18;

  const rowGap =
    Number.parseFloat(
      styles.rowGap
    ) || 18;

  const usableWidth =
    rect.width -
    columnGap * 11;

  const columnWidth =
    usableWidth / 12;

  return {
    grid,
    rect,
    columnGap,
    rowGap,
    columnWidth,
    columnStep:
      columnWidth + columnGap,
    rowHeight: 220,
    rowStep:
      220 + rowGap,
  };
}

function getPointerGridCell(
  clientX,
  clientY
) {
  const metrics =
    getHomeGridMetrics();

  if (!metrics) {
    return null;
  }

  const relativeX =
    clientX -
    metrics.rect.left;

  const relativeY =
    clientY -
    metrics.rect.top;

  const column = Math.max(
    1,
    Math.min(
      12,
      Math.floor(
        relativeX /
          metrics.columnStep
      ) + 1
    )
  );

  const row = Math.max(
    1,
    Math.floor(
      relativeY /
        metrics.rowStep
    ) + 1
  );

  return {
    column,
    row,
  };
}

function getPanelAtGridCell(
  layout,
  column,
  row,
  ignoredPanelId
) {
  return Object.entries(
    layout
  ).find(
    ([
      panelId,
      position,
    ]) => {
      if (
        panelId === ignoredPanelId
      ) {
        return false;
      }

      const insideColumns =
        column >= position.column &&
        column <
          position.column +
            position.width;

      const insideRows =
        row >= position.row &&
        row <
          position.row +
            position.height;

      return (
        insideColumns &&
        insideRows
      );
    }
  );
}

function getDropOrderForCell(
  draggedId,
  column,
  row
) {
  const orderWithoutDragged =
    homePanelOrder.filter(
      (panelId) =>
        panelId !== draggedId
    );

  const packedWithoutDragged =
    buildPackedHomeLayout(
      orderWithoutDragged
    );

  const panelAtCell =
    getPanelAtGridCell(
      packedWithoutDragged,
      column,
      row,
      draggedId
    );

  if (panelAtCell) {
    const [targetPanelId] =
      panelAtCell;

    const targetIndex =
      orderWithoutDragged.indexOf(
        targetPanelId
      );

    const targetPosition =
      packedWithoutDragged[
        targetPanelId
      ];

    const targetMiddle =
      targetPosition.column +
      targetPosition.width / 2;

    const insertAfter =
      column >= targetMiddle;

    const insertIndex =
      insertAfter
        ? targetIndex + 1
        : targetIndex;

    const nextOrder = [
      ...orderWithoutDragged,
    ];

    nextOrder.splice(
      insertIndex,
      0,
      draggedId
    );

    return nextOrder;
  }

  const sortedPositions =
    Object.entries(
      packedWithoutDragged
    ).sort(
      (
        [, positionA],
        [, positionB]
      ) => {
        if (
          positionA.row !==
          positionB.row
        ) {
          return (
            positionA.row -
            positionB.row
          );
        }

        return (
          positionA.column -
          positionB.column
        );
      }
    );

  let insertIndex =
    orderWithoutDragged.length;

  for (
    let index = 0;
    index <
    sortedPositions.length;
    index += 1
  ) {
    const [
      panelId,
      position,
    ] = sortedPositions[index];

    const isLaterRow =
      position.row > row;

    const isLaterColumn =
      position.row === row &&
      position.column >= column;

    if (
      isLaterRow ||
      isLaterColumn
    ) {
      insertIndex =
        orderWithoutDragged.indexOf(
          panelId
        );

      break;
    }
  }

  const nextOrder = [
    ...orderWithoutDragged,
  ];

  nextOrder.splice(
    Math.max(
      0,
      insertIndex
    ),
    0,
    draggedId
  );

  return nextOrder;
}

function areHomeOrdersEqual(
  firstOrder,
  secondOrder
) {
  if (
    firstOrder.length !==
    secondOrder.length
  ) {
    return false;
  }

  return firstOrder.every(
    (panelId, index) =>
      panelId ===
      secondOrder[index]
  );
}

function handlePanelPointerDown(event, panelId) {
  if (!layoutMode || event.button !== 0 || dragPointerIdRef.current !== null) return;

  const panel = event.currentTarget.closest(".home-layout-item");
  if (!panel) return;

  event.preventDefault();
  event.stopPropagation();
  clearLayoutHoldTimer();

  const rect = panel.getBoundingClientRect();
  dragPointerIdRef.current = event.pointerId;
  dragStartPositionRef.current = {
    x: event.clientX,
    y: event.clientY,
    panelId,
    moved: false,
  };
  dragPointerOffsetRef.current = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  setDragPanelRect({
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  });
  setDragPosition({ left: rect.left, top: rect.top });
  setDraggedPanelId(panelId);
  event.currentTarget.setPointerCapture(event.pointerId);
}

function handlePanelPointerMove(event, panelId) {
  if (dragPointerIdRef.current !== event.pointerId ||
      dragStartPositionRef.current.panelId !== panelId) return;

  event.preventDefault();
  event.stopPropagation();

  const start = dragStartPositionRef.current;
  if (!start.moved && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 6) return;
  start.moved = true;

  setDragPosition({
    left: event.clientX - dragPointerOffsetRef.current.x,
    top: event.clientY - dragPointerOffsetRef.current.y,
  });
}

function finishPanelDrag(event, cancelled) {
  if (dragPointerIdRef.current !== event.pointerId) return;

  event.preventDefault();
  event.stopPropagation();
  clearLayoutHoldTimer();

  const { panelId, moved } = dragStartPositionRef.current;
  const grid = event.currentTarget.closest(".home-layout-grid");

  if (!cancelled && moved && grid) {
    const target = Array.from(grid.querySelectorAll(".home-layout-item")).find((panel) => {
      if (panel.dataset.panelId === panelId) return false;
      const rect = panel.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom;
    });

    if (target) {
      const targetId = target.dataset.panelId;
      setHomePanelOrder((currentOrder) => {
        const from = currentOrder.indexOf(panelId);
        const to = currentOrder.indexOf(targetId);
        if (from < 0 || to < 0 || from === to) return currentOrder;
        const next = [...currentOrder];
        next.splice(from, 1);
        next.splice(to, 0, panelId);
        return next;
      });
    }
  }

  dragPointerIdRef.current = null;
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
  setDragPosition(null);
  setDragPanelRect(null);
  setDraggedPanelId(null);
}

function handlePanelPointerUp(event) {
  finishPanelDrag(event, false);
}

function handlePanelPointerCancel(event) {
  finishPanelDrag(event, true);
}


function handleResizePointerDown(
  event,
  panelId
) {
  event.preventDefault();
  event.stopPropagation();

  const currentSize =
    homePanelSizes[panelId] ||
    defaultHomePanelSizes[panelId] ||
    { width: 4, height: 1 };

  const currentWidth =
    typeof currentSize === "number"
      ? currentSize
      : currentSize.width || 4;

  const currentHeight =
    typeof currentSize === "number"
      ? 1
      : currentSize.height || 1;

  const gridElement =
    event.currentTarget.closest(
      ".home-layout-grid"
    );

  const gridWidth =
    gridElement?.getBoundingClientRect()
      .width || 1200;

  resizeStateRef.current = {
    panelId,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: currentWidth,
    startHeight: currentHeight,
    columnWidth: gridWidth / 12,
  };

  setResizingPanelId(panelId);

  event.currentTarget.setPointerCapture?.(
    event.pointerId
  );
}

function handleResizePointerMove(
  event
) {
  const resizeState =
    resizeStateRef.current;

  if (
    !resizeState ||
    resizeState.pointerId !==
      event.pointerId
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const deltaX =
    event.clientX -
    resizeState.startX;

  const deltaY =
    event.clientY -
    resizeState.startY;

  const rawWidth =
    resizeState.startWidth +
    deltaX /
      resizeState.columnWidth;

  let nextWidth =
    Math.round(rawWidth / 2) * 2;

  nextWidth = Math.max(
    4,
    Math.min(12, nextWidth)
  );

  const rawHeight =
    resizeState.startHeight +
    deltaY / 220;

  let nextHeight =
    Math.round(rawHeight);

  nextHeight = Math.max(
    1,
    Math.min(3, nextHeight)
  );

  setHomePanelSizes(
    (currentSizes) => ({
      ...currentSizes,
      [resizeState.panelId]: {
        width: nextWidth,
        height: nextHeight,
      },
    })
  );
}

function handleResizePointerUp(
  event
) {
  if (
    resizeStateRef.current?.pointerId !==
    event.pointerId
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  resizeStateRef.current = null;

  setResizingPanelId(null);
}

function handleResizePointerCancel(
  event
) {
  if (
    resizeStateRef.current?.pointerId !==
    event.pointerId
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  resizeStateRef.current = null;

  setResizingPanelId(null);
}

useEffect(() => {
  return () => {
    clearLayoutHoldTimer();
  };
}, []);

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
  let cancelled = false;
  let inFlight = false;
  const controller = new AbortController();

  setWeatherLoading(true);

  async function loadWeather() {
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

      setWeather(data);
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error("Home weather refresh error:", err);
    } finally {
      inFlight = false;

      if (!cancelled) {
        setWeatherLoading(false);
      }
    }
  }


  loadWeather();

  const stopAutoRefresh = startAutoRefresh(loadWeather);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, []);

useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  const controller = new AbortController();

  setFamilyStarsLoading(true);

  async function loadFamilyStars() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/rewards/summary`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load family stars"
        );
      }

      if (cancelled) return;

      setFamilyStars(
        Array.isArray(data)
          ? data
          : data.members || data.summary || []
      );
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error("Family stars error:", err);
    } finally {
      inFlight = false;

      if (!cancelled) {
        setFamilyStarsLoading(false);
      }
    }
  }

  loadFamilyStars();

  const stopAutoRefresh = startAutoRefresh(loadFamilyStars);

  window.addEventListener(
    "familyhub-stars-updated",
    loadFamilyStars
  );

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();

    window.removeEventListener(
      "familyhub-stars-updated",
      loadFamilyStars
    );
  };
}, []);

useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  const controller = new AbortController();

  setHomeListsLoading(true);

  async function loadHomeLists() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lists`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load family lists"
        );
      }

      if (cancelled) return;

      setHomeLists(
        Array.isArray(data)
          ? data
          : data.lists || []
      );
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error("Home lists error:", err);
    } finally {
      inFlight = false;

      if (!cancelled) {
        setHomeListsLoading(false);
      }
    }
  }

  loadHomeLists();

  const stopAutoRefresh = startAutoRefresh(loadHomeLists);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
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

  function renderHomePanel(panelId) {
  switch (panelId) {
    case "today":
      return (
        <HomeTodayPanel
          currentTime={currentTime}
          todayEvents={todayEvents}
          homeEventsLoading={homeEventsLoading}
          homeEventsError={homeEventsError}
          nextTodayEvent={nextTodayEvent}
          onNavigate={onNavigate}
        />
      );

    case "chores":
      return (
        <HomeChoresPanel
          todayTaskAssignments={
            todayTaskAssignments
          }
          todayTaskCompletions={
            todayTaskCompletions
          }
          todayTaskProgress={
            todayTaskProgress
          }
          familyStars={familyStars}
          familyStarsLoading={
            familyStarsLoading
          }
          homeTasks={homeTasks}
          homeTasksLoading={
            homeTasksLoading
          }
          homeTasksError={
            homeTasksError
          }
          onNavigate={onNavigate}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onCompleteTask={
            onCompleteTask
          }
        />
      );

    case "countdown":
      return (
        <HomeCountdownPanel
          currentTime={currentTime}
          upcomingCountdowns={
            upcomingCountdowns
          }
          homeCountdownsLoading={
            homeCountdownsLoading
          }
          homeCountdownsError={
            homeCountdownsError
          }
        />
      );

    case "camera":
      return (
        <HomeCameraPanel
          onViewAll={() =>
            onNavigate("cameras")
          }
        />
      );

    case "context":
      return (
        <HomeContextCards
          homeMeals={homeMeals}
          openShoppingItems={
            openShoppingItems
          }
          onNavigate={onNavigate}
          onAddMeal={onAddMeal}
        />
      );

    case "dinner":
      return (
        <HomeDinnerPanel
          homeMeals={homeMeals}
          homeMealsLoading={
            homeMealsLoading
          }
          homeMealsError={
            homeMealsError
          }
          onNavigate={onNavigate}
          onAddMeal={onAddMeal}
        />
      );

    case "outlook":
      return (
        <HomeFamilyOutlookPanel
          upcomingDays={upcomingDays}
          onNavigate={onNavigate}
        />
      );

    case "lists":
      return (
        <HomeListsPanel
          homeLists={homeLists}
          homeListsLoading={
            homeListsLoading
          }
          onNavigate={onNavigate}
        />
      );

    default:
      return null;
  }
}

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

<HomeQuickActions
  onAddEvent={onAddEvent}
  onAddTask={onAddTask}
  onAddMeal={onAddMeal}
  onAddShoppingItem={onAddShoppingItem}
/>

<HomeFamilySelector
  members={members}
  loading={loading}
  error={error}
  selectedMemberId={selectedMemberId}
  setSelectedMemberId={setSelectedMemberId}
/>

<HomeSummaryLine
  todayEvents={todayEvents}
  todayTaskAssignments={todayTaskAssignments}
  todayTaskCompletions={todayTaskCompletions}
  homeMeals={homeMeals}
  openShoppingItems={openShoppingItems}
  homeLists={homeLists}
  onNavigate={onNavigate}
/>

{layoutMode && (
  <div className="home-layout-toolbar">
    <div className="home-layout-toolbar-copy">
      <strong>Edit Home</strong>

      <span>
        Drag panels to rearrange your Home screen.
      </span>
    </div>

    <div className="home-layout-toolbar-actions">
      <button
        type="button"
        className="home-layout-reset"
        onClick={resetHomeLayout}
      >
        Reset layout
      </button>

      <button
        type="button"
        className="home-layout-cancel"
        onClick={cancelHomeLayout}
      >
        Cancel
      </button>

      <button
        type="button"
        className="home-layout-done"
        onClick={saveHomeLayout}
      >
        Done
      </button>
    </div>
  </div>
)}

<section
  className={`home-layout-grid ${
    layoutMode
      ? "home-layout-grid-editing"
      : ""
  }`}
>
  {homePanelOrder.map((panelId) => {
    const packedLayout =
      buildPackedHomeLayout(
        homePanelOrder
      );

    const panelPosition =
      packedLayout[panelId];

    return (
      <motion.div
        layout
        key={panelId}
        data-panel-id={panelId}
        style={{
          gridColumn: `${
            panelPosition.column
          } / span ${
            panelPosition.width
          }`,

          gridRow: `${
            panelPosition.row
          } / span ${
            panelPosition.height
          }`,

          "--home-panel-height":
            `${panelPosition.height}`,
        }}
transition={{
  layout: {
    duration: reduceMotion
      ? 0
      : 0.24,

    ease: [
      0.22,
      1,
      0.36,
      1,
    ],
  },

  opacity: {
    duration: reduceMotion
      ? 0
      : 0.12,
  },
}}
animate={{
  scale: 1,
  x: 0,
  y: 0,
  opacity:
    draggedPanelId === panelId
      ? 0.18
      : 1,
}}
        className={`home-layout-item home-layout-item-${panelId} ${
          draggedPanelId === panelId
            ? "home-layout-item-dragging"
            : ""
        }`}
        onPointerDown={() => {
          if (!layoutMode) {
            startLayoutHold();
          }
        }}
        onPointerUp={
          clearLayoutHoldTimer
        }
        onPointerCancel={
          clearLayoutHoldTimer
        }
        onPointerLeave={
          clearLayoutHoldTimer
        }
      >
        {layoutMode && (
          <>
            <button
              type="button"
              className="home-layout-drag-bar"
              aria-label={`Move ${panelId} panel`}
              onPointerDown={(event) => {
                handlePanelPointerDown(
                  event,
                  panelId
                );
              }}
              onPointerMove={(event) => {
                handlePanelPointerMove(
                  event,
                  panelId
                );
              }}
              onPointerUp={(event) => {
                handlePanelPointerUp(
                  event
                );
              }}
              onPointerCancel={(event) => {
                handlePanelPointerCancel(
                  event
                );
              }}
            >
              <span />
              <span />
              <span />
            </button>

            <div
              className="home-layout-resize-controls"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
            >
              <div className="home-layout-size-control">
                <span className="home-layout-size-label">
                  Width
                </span>

                <button
                  type="button"
                  aria-label="Make panel narrower"
                  onClick={(event) => {
                    event.stopPropagation();

                    resizeHomePanel(
                      panelId,
                      "width",
                      "smaller"
                    );
                  }}
                >
                  −
                </button>

                <span className="home-layout-size-value">
                  {getHomePanelWidth(
                    panelId
                  )}
                </span>

                <button
                  type="button"
                  aria-label="Make panel wider"
                  onClick={(event) => {
                    event.stopPropagation();

                    resizeHomePanel(
                      panelId,
                      "width",
                      "larger"
                    );
                  }}
                >
                  +
                </button>
              </div>

              <div className="home-layout-size-control">
                <span className="home-layout-size-label">
                  Height
                </span>

                <button
                  type="button"
                  aria-label="Make panel shorter"
                  onClick={(event) => {
                    event.stopPropagation();

                    resizeHomePanel(
                      panelId,
                      "height",
                      "smaller"
                    );
                  }}
                >
                  −
                </button>

                <span className="home-layout-size-value">
                  {getHomePanelHeight(
                    panelId
                  )}
                </span>

                <button
                  type="button"
                  aria-label="Make panel taller"
                  onClick={(event) => {
                    event.stopPropagation();

                    resizeHomePanel(
                      panelId,
                      "height",
                      "larger"
                    );
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </>
        )}

        <div
          className={
            layoutMode
              ? "home-layout-panel-content home-layout-panel-content-locked"
              : "home-layout-panel-content"
          }
        >
          {renderHomePanel(
            panelId
          )}
        </div>
      </motion.div>
    );
  })}

  {draggedPanelId &&
    dragPosition &&
    dragPanelRect && (
      <div
        className="home-layout-floating-panel"
        style={{
          position: "fixed",

          left:
            `${dragPosition.left}px`,

          top:
            `${dragPosition.top}px`,

          width:
            `${dragPanelRect.width}px`,

          height:
            `${dragPanelRect.height}px`,

          zIndex: 10000,

          pointerEvents: "none",
        }}
      >
        <div className="home-layout-floating-panel-inner">
          {renderHomePanel(
            draggedPanelId
          )}
        </div>
      </div>
    )}
</section>

</motion.div>
  );
}
