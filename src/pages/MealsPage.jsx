import { API_BASE_URL } from "../config/api";
import { startAutoRefresh } from "../utils/startAutoRefresh";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CalendarPlus,
  Coffee,
  Copy,
  Dices,
  Image,
  Pencil,
  Plus,
  Sandwich,
  ShoppingCart,
  Soup,
  Utensils,
  X,
} from "lucide-react";

function toDateKey(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfWeek(date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const day = result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() + difference
  );

  return result;
}

function addDays(date, amount) {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount
  );

  return result;
}

function getWeekDays(weekStart) {
  return Array.from(
    { length: 7 },
    (_, index) =>
      addDays(
        weekStart,
        index
      )
  );
}

function getMealIcon(mealType) {
  switch (mealType) {
    case "breakfast":
      return Coffee;

    case "lunch":
      return Sandwich;

    case "dinner":
      return Soup;

    default:
      return Utensils;
  }
}

function formatWeekStart(date) {
  return new Intl.DateTimeFormat(
    "en-AU",
    {
      day: "numeric",
      month: "short",
    }
  ).format(date);
}

function formatWeekEnd(date) {
  return new Intl.DateTimeFormat(
    "en-AU",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function MealsPage({
  members,
  selectedMemberId,
  setSelectedMemberId,
  mealRefreshKey,
  recipeRefreshKey,
  mealPlannerFocus,
  onAddMeal,
  onEditMeal,
  onAddRecipe,
  onEditRecipe,
  onViewRecipe,
  onPlanRecipe,
}) {
  const replacingTemplateRef = useRef(false);
  const [templateReplaceError, setTemplateReplaceError] = useState("");

  const [meals, setMeals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    addingWeekToShopping,
    setAddingWeekToShopping,
  ] = useState(false);

const [
  shoppingMessage,
  setShoppingMessage,
] = useState("");

useEffect(() => {
  if (!shoppingMessage) {
    return;
  }

  const timer = window.setTimeout(() => {
    setShoppingMessage("");
  }, 3200);

  return () => {
    window.clearTimeout(timer);
  };
}, [shoppingMessage]);
const [
  plannerMessage,
  setPlannerMessage,
] = useState("");

useEffect(() => {
  if (!plannerMessage) {
    return;
  }

  const timer = window.setTimeout(() => {
    setPlannerMessage("");
  }, 3200);

  return () => {
    window.clearTimeout(timer);
  };
}, [plannerMessage]);

  const [
    weekShoppingPickerOpen,
    setWeekShoppingPickerOpen,
  ] = useState(false);

  const [
    weekShoppingIngredients,
    setWeekShoppingIngredients,
  ] = useState([]);

  const [
    selectedWeekIngredients,
    setSelectedWeekIngredients,
  ] = useState([]);

  const [
    pantryItems,
    setPantryItems,
  ] = useState([]);

  const [view, setView] =
    useState("planner");

  const [
    mealWheelOpen,
    setMealWheelOpen,
  ] = useState(false);

  const [
    wheelResult,
    setWheelResult,
  ] = useState(null);

  const [
    wheelSpinning,
    setWheelSpinning,
  ] = useState(false);

const [
  wheelRotation,
  setWheelRotation,
] = useState(0);


  const [
    wheelGroup,
    setWheelGroup,
  ] = useState("all");

  const [
    wheelCustomRecipes,
    setWheelCustomRecipes,
  ] = useState([]);

  const [
    wheelCustomGroupLoading,
    setWheelCustomGroupLoading,
  ] = useState(false);

  const [
    wheelGroups,
    setWheelGroups,
  ] = useState([]);

  const [
    wheelGroupsLoading,
    setWheelGroupsLoading,
  ] = useState(false);

  const [
    wheelGroupManagerOpen,
    setWheelGroupManagerOpen,
  ] = useState(false);

  const [
    newWheelGroupName,
    setNewWheelGroupName,
  ] = useState("");

  const [
    wheelGroupSaving,
    setWheelGroupSaving,
  ] = useState(false);

  const [
    wheelGroupError,
    setWheelGroupError,
  ] = useState("");

  const [
    editingWheelGroup,
    setEditingWheelGroup,
  ] = useState(null);

  const [
    selectedWheelRecipeIds,
    setSelectedWheelRecipeIds,
  ] = useState([]);

  const [
    wheelRecipesSaving,
    setWheelRecipesSaving,
  ] = useState(false);

  const [recipes, setRecipes] =
    useState([]);

    const [
  recipeSearch,
  setRecipeSearch,
] = useState("");

const [
  recipeCategory,
  setRecipeCategory,
] = useState("all");

const [
  recipeQuickFilter,
  setRecipeQuickFilter,
] = useState("all");

  const [
    recipesLoading,
    setRecipesLoading,
  ] = useState(false);

  const [
    recipesError,
    setRecipesError,
  ] = useState("");

  const mealTypeFilter = "dinner";

  const [
  mealToCopy,
  setMealToCopy,
] = useState(null);

const [
  copyMealDate,
  setCopyMealDate,
] = useState("");

const [
  draggedMeal,
  setDraggedMeal,
] = useState(null);

const [
  dragOverSlot,
  setDragOverSlot,
] = useState(null);

const [
  highlightedMealId,
  setHighlightedMealId,
] = useState(null);

const [
  slotRecipePicker,
  setSlotRecipePicker,
] = useState(null);

const [
  copyLastWeekOpen,
  setCopyLastWeekOpen,
] = useState(false);

const [
  clearWeekOpen,
  setClearWeekOpen,
] = useState(false);

const [
  clearingWeek,
  setClearingWeek,
] = useState(false);

const [
  weekTemplatesOpen,
  setWeekTemplatesOpen,
] = useState(false);

const [
  weekTemplates,
  setWeekTemplates,
] = useState([]);

const [
  loadingWeekTemplates,
  setLoadingWeekTemplates,
] = useState(false);

const [
  templateToDelete,
  setTemplateToDelete,
] = useState(null);

const [
  deletingWeekTemplate,
  setDeletingWeekTemplate,
] = useState(false);

const [
  saveTemplateOpen,
  setSaveTemplateOpen,
] = useState(false);

const [
  templateName,
  setTemplateName,
] = useState("");

const [
  savingWeekTemplate,
  setSavingWeekTemplate,
] = useState(false);

const [
  duplicateWeekTemplate,
  setDuplicateWeekTemplate,
] = useState(null);

const [
  previousWeekMeals,
  setPreviousWeekMeals,
] = useState([]);

const [
  selectedPreviousMeals,
  setSelectedPreviousMeals,
] = useState([]);

const [
  loadingPreviousWeek,
  setLoadingPreviousWeek,
] = useState(false);

const [
  weekStart,
  setWeekStart,
] = useState(() =>
  startOfWeek(new Date())
);
  const weekDays = useMemo(
    () => getWeekDays(weekStart),
    [weekStart]
  );

const weekEnd = weekDays[6];

useEffect(() => {
  if (!mealPlannerFocus?.date) {
    return;
  }

  const focusDate = new Date(
    `${mealPlannerFocus.date}T12:00:00`
  );

  setView("planner");

  setWeekStart(
    startOfWeek(focusDate)
  );

  if (mealPlannerFocus.mealId) {
    setHighlightedMealId(
      mealPlannerFocus.mealId
    );

    const timeout = window.setTimeout(
      () => {
        setHighlightedMealId(null);
      },
      3000
    );

    return () =>
      window.clearTimeout(timeout);
  }
}, [mealPlannerFocus]);

useEffect(() => {
  let cancelled = false;
  let inFlight = false;
  let hasLoaded = false;
  const controller = new AbortController();

  setLoading(true);
  setError("");

  async function loadMeals() {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const params = new URLSearchParams({
        start: toDateKey(weekStart),
        end: toDateKey(weekEnd),
      });

      if (selectedMemberId !== "all") {
        params.set("memberId", String(selectedMemberId));
      }

      if (mealTypeFilter !== "all") {
        params.set("mealType", mealTypeFilter);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/meals?${params.toString()}`,
        {
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load meals");
      }

      const data = await response.json();

      if (cancelled) return;

      setMeals(data.meals || []);
      setError("");
      hasLoaded = true;
    } catch (err) {
      if (cancelled || err.name === "AbortError") return;

      console.error("Meal Planner refresh error:", err);

      if (!hasLoaded) {
        setError("Unable to load meals. Retrying…");
      }
    } finally {
      inFlight = false;

      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  loadMeals();

  const stopAutoRefresh = startAutoRefresh(loadMeals);

  return () => {
    cancelled = true;
    stopAutoRefresh();
    controller.abort();
  };
}, [
  selectedMemberId,
  mealTypeFilter,
  mealRefreshKey,
  weekStart,
]);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    let hasLoaded = false;
    const controller = new AbortController();

    setRecipesLoading(true);
    setRecipesError("");

    async function loadRecipes() {
      if (cancelled || inFlight) return;

      inFlight = true;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/recipes`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load recipes"
          );
        }

        if (cancelled) return;

        setRecipes(data.recipes || []);
        setRecipesError("");
        hasLoaded = true;
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;

        console.error("Recipes refresh error:", err);

        if (!hasLoaded) {
          setRecipesError(
            "Unable to load recipes. Retrying…"
          );
        }
      } finally {
        inFlight = false;

        if (!cancelled) {
          setRecipesLoading(false);
        }
      }
    }

    loadRecipes();

    const stopAutoRefresh = startAutoRefresh(loadRecipes);

    return () => {
      cancelled = true;
      stopAutoRefresh();
      controller.abort();
    };
  }, [recipeRefreshKey]);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    const controller = new AbortController();

    setWheelGroupsLoading(true);

    async function loadWheelGroups() {
      if (cancelled || inFlight) return;

      inFlight = true;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/meal-wheel-groups`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load wheel groups"
          );
        }

        if (cancelled) return;

        setWheelGroups(data.groups || []);
      } catch (error) {
        if (cancelled || error.name === "AbortError") return;

        console.error("Wheel groups refresh error:", error);
      } finally {
        inFlight = false;

        if (!cancelled) {
          setWheelGroupsLoading(false);
        }
      }
    }

    loadWheelGroups();

    const stopAutoRefresh = startAutoRefresh(loadWheelGroups);

    return () => {
      cancelled = true;
      stopAutoRefresh();
      controller.abort();
    };
  }, []);

    const recipeCategories = [
    ...new Set(
      recipes
        .map(
          (recipe) =>
            recipe.category
        )
        .filter(Boolean)
    ),
  ].sort();

  const wheelRecipes =
    wheelGroup === "all"
      ? recipes
      : wheelGroup.startsWith(
            "custom:"
          )
        ? wheelCustomRecipes
        : recipes.filter(
            (recipe) =>
              recipe.category ===
              wheelGroup
          );

            const wheelGroupLabel =
    wheelGroup === "all"
      ? "All Recipes"
      : wheelGroup.startsWith(
            "custom:"
          )
        ? wheelGroups.find(
            (group) =>
              `custom:${group.id}` ===
              wheelGroup
          )?.name || "Custom Group"
        : wheelGroup
            .replace("-", " ")
            .replace(
              /\b\w/g,
              (letter) =>
                letter.toUpperCase()
            );

const filteredRecipes =
  recipes.filter((recipe) => {
    const search =
      recipeSearch
        .trim()
        .toLowerCase();

    const matchesSearch =
      !search ||
      recipe.title
        ?.toLowerCase()
        .includes(search) ||
      recipe.description
        ?.toLowerCase()
        .includes(search) ||
      recipe.ingredients
        ?.toLowerCase()
        .includes(search);

    const matchesCategory =
      recipeCategory === "all" ||
      recipe.category ===
        recipeCategory;

    const totalTime =
      Number(
        recipe.prep_time || 0
      ) +
      Number(
        recipe.cook_time || 0
      );

    const matchesQuickFilter =
      recipeQuickFilter === "all" ||
      (
        recipeQuickFilter ===
          "under30" &&
        totalTime > 0 &&
        totalTime <= 30
      ) ||
      (
        recipeQuickFilter ===
          "serves4" &&
        Number(
          recipe.servings || 0
        ) >= 4
      );

    return (
      matchesSearch &&
      matchesCategory &&
      matchesQuickFilter
    );
  });


  const mealTypes = [
    "dinner",
  ];

  function getMealsForSlot(
    dateKey,
    mealType
  ) {
    return meals.filter(
      (meal) =>
        meal.meal_date ===
          dateKey &&
        meal.meal_type ===
          mealType
    );
  }

async function handleDropMeal(
  meal,
  mealDate,
  mealType
) {
  if (!meal) {
    return;
  }

  if (
    meal.meal_date === mealDate &&
    meal.meal_type === mealType
  ) {
    setDraggedMeal(null);
    setDragOverSlot(null);
    return;
  }

  const existingMeal = meals.find(
    (item) =>
      item.id !== meal.id &&
      item.meal_date === mealDate &&
      item.meal_type === mealType
  );

  const originalDate = meal.meal_date;
  const originalType = meal.meal_type;

  async function updateMeal(
    mealToUpdate,
    newDate,
    newType
  ) {
    const response = await fetch(
      `${API_BASE_URL}/api/meals/${mealToUpdate.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          title: mealToUpdate.title,
          mealDate: newDate,
          mealType: newType,
          description:
            mealToUpdate.description ||
            null,
          recipeUrl:
            mealToUpdate.recipe_url ||
            null,
          ingredients:
            mealToUpdate.ingredients ||
            null,
          recipeId:
            mealToUpdate.recipe_id ||
            null,
          memberIds: (
            mealToUpdate.members || []
          ).map(
            (member) => member.id
          ),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to move meal"
      );
    }

    return data.meal;
  }

  try {
    let swappedMeal = null;

    if (existingMeal) {
      swappedMeal = await updateMeal(
        existingMeal,
        originalDate,
        originalType
      );
    }

    const movedMeal = await updateMeal(
      meal,
      mealDate,
      mealType
    );

    setMeals((current) =>
      current.map((item) => {
        if (item.id === movedMeal.id) {
          return movedMeal;
        }

        if (
          swappedMeal &&
          item.id === swappedMeal.id
        ) {
          return swappedMeal;
        }

        return item;
      })
    );
  } catch (err) {
    console.error(err);
  } finally {
    setDraggedMeal(null);
    setDragOverSlot(null);
  }
}

async function handleOpenCopyLastWeek() {
  if (loadingPreviousWeek) {
    return;
  }

  setLoadingPreviousWeek(true);

  try {
    const previousStart =
      addDays(weekStart, -7);

    const previousEnd =
      addDays(weekEnd, -7);

    const params =
      new URLSearchParams({
        start: toDateKey(previousStart),
        end: toDateKey(previousEnd),
        mealType: "dinner",
      });

    if (selectedMemberId !== "all") {
      params.set(
        "memberId",
        String(selectedMemberId)
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/meals?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to load last week's dinners"
      );
    }

    const previousMeals =
      data.meals || [];

    setPreviousWeekMeals(
      previousMeals
    );

    setSelectedPreviousMeals(
      previousMeals.map(
        (meal) => meal.id
      )
    );

    setCopyLastWeekOpen(true);
  } catch (error) {
    console.error(
      "Copy last week error:",
      error
    );

    setShoppingMessage(
      error.message ||
        "Unable to load last week's dinners"
    );
  } finally {
    setLoadingPreviousWeek(false);
  }
}

async function handleClearWeek() {
  if (
    clearingWeek ||
    meals.length === 0
  ) {
    return;
  }

  setClearingWeek(true);

  try {
    const mealsToDelete = [
      ...meals,
    ];

    const deletedMealIds = [];

    for (const meal of mealsToDelete) {
      const response = await fetch(
        `${API_BASE_URL}/api/meals/${meal.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Unable to remove "${meal.title}"`
        );
      }

      deletedMealIds.push(
        meal.id
      );
    }

    setMeals((current) =>
      current.filter(
        (meal) =>
          !deletedMealIds.includes(
            meal.id
          )
      )
    );

    setClearWeekOpen(false);
  } catch (error) {
    console.error(
      "Clear week error:",
      error
    );

    window.alert(
      error.message ||
        "Unable to clear this week's dinners"
    );
  } finally {
    setClearingWeek(false);
  }
}

async function loadWeekTemplates() {
  if (loadingWeekTemplates) {
    return;
  }

  setLoadingWeekTemplates(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/meal-templates`,
      {
        cache: "no-store",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to load week templates"
      );
    }

    setWeekTemplates(
      Array.isArray(data.templates)
        ? data.templates
        : []
    );
  } catch (error) {
    console.error(
      "Week template load error:",
      error
    );

    setPlannerMessage(
      error.message ||
        "Unable to load week templates"
    );
  } finally {
    setLoadingWeekTemplates(false);
  }
}

async function handleSaveWeekTemplate() {
  const cleanName =
    templateName.trim();

  if (
    !cleanName ||
    savingWeekTemplate ||
    meals.length === 0
  ) {
    return;
  }

  const existingTemplate =
    weekTemplates.find(
      (template) =>
        String(template.name || "")
          .trim()
          .toLowerCase() ===
        cleanName.toLowerCase()
    );

  if (existingTemplate) {
    setTemplateReplaceError("");
    setDuplicateWeekTemplate({
      ...existingTemplate,
      replacementName: cleanName,
    });

    return;
  }

  setSavingWeekTemplate(true);

  try {
    const templateMeals =
      meals.map((meal) => {
        const mealDate =
          new Date(
            `${meal.meal_date}T12:00:00`
          );

        const startDate =
          new Date(weekStart);

        startDate.setHours(
          12,
          0,
          0,
          0
        );

        const dayOffset =
          Math.round(
            (
              mealDate.getTime() -
              startDate.getTime()
            ) /
              (
                1000 *
                60 *
                60 *
                24
              )
          );

        return {
          dayOffset,

          title:
            meal.title,

          mealTime:
            meal.meal_time || null,

          description:
            meal.description || null,

          recipeUrl:
            meal.recipe_url || null,

          ingredients:
            meal.ingredients || null,

          recipeId:
            meal.recipe_id || null,

          reminderEnabled:
            Boolean(
              meal.reminder_enabled
            ),

          reminderMinutes:
            meal.reminder_minutes ??
            null,

          memberIds: (
            meal.members || []
          ).map(
            (member) => member.id
          ),
        };
      });

    const response = await fetch(
      `${API_BASE_URL}/api/meal-templates`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          name: cleanName,
          meals: templateMeals,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to save week template"
      );
    }

    if (data.template) {
      setWeekTemplates(
        (current) => [
          data.template,
          ...current,
        ]
      );
    }

    setTemplateName("");
    setSaveTemplateOpen(false);
  } catch (error) {
    console.error(
      "Save week template error:",
      error
    );

    window.alert(
      error.message ||
        "Unable to save week template"
    );
  } finally {
    setSavingWeekTemplate(false);
  }
}


async function handleCopySelectedPreviousMeals() {
  const mealsToCopy =
    previousWeekMeals.filter(
      (meal) =>
        selectedPreviousMeals.includes(
          meal.id
        )
    );

  if (mealsToCopy.length === 0) {
    return;
  }

  setLoadingPreviousWeek(true);

  try {
    const copiedMeals = [];
    const skippedMeals = [];

    for (const meal of mealsToCopy) {
      const originalDate =
        new Date(
          `${meal.meal_date}T12:00:00`
        );

      const targetDate =
        toDateKey(
          addDays(originalDate, 7)
        );

      const existingDinner =
        meals.find(
          (currentMeal) =>
            currentMeal.meal_date ===
              targetDate &&
            currentMeal.meal_type ===
              "dinner"
        );

      if (existingDinner) {
        skippedMeals.push({
          meal,
          targetDate,
          existingDinner,
        });

        continue;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/meals`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: meal.title,

            mealDate: targetDate,

            mealType: "dinner",

            description:
              meal.description || null,

            recipeUrl:
              meal.recipe_url || null,

            ingredients:
              meal.ingredients || null,

            recipeId:
              meal.recipe_id || null,

            memberIds: (
              meal.members || []
            ).map(
              (member) => member.id
            ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Unable to copy "${meal.title}"`
        );
      }

      if (data.meal) {
        copiedMeals.push(
          data.meal
        );
      }
    }

    if (copiedMeals.length > 0) {
      setMeals((current) => [
        ...current,
        ...copiedMeals,
      ]);
    }

    setCopyLastWeekOpen(false);

    setPreviousWeekMeals([]);

    setSelectedPreviousMeals([]);

    if (
      copiedMeals.length > 0 &&
      skippedMeals.length > 0
    ) {
      setShoppingMessage(
        `${copiedMeals.length} dinner${
          copiedMeals.length === 1
            ? ""
            : "s"
        } copied. ${
          skippedMeals.length
        } occupied day${
          skippedMeals.length === 1
            ? " was"
            : "s were"
        } skipped.`
      );
    } else if (
      skippedMeals.length > 0
    ) {
      setShoppingMessage(
        `Nothing copied. ${
          skippedMeals.length
        } selected day${
          skippedMeals.length === 1
            ? " already has"
            : "s already have"
        } dinner planned.`
      );
    } else {
      setShoppingMessage(
        `${copiedMeals.length} dinner${
          copiedMeals.length === 1
            ? ""
            : "s"
        } copied from last week.`
      );
    }
  } catch (error) {
    console.error(
      "Copy last week error:",
      error
    );

    setShoppingMessage(
      error.message ||
        "Unable to copy last week's dinners"
    );
  } finally {
    setLoadingPreviousWeek(false);
  }
}

async function handleUseWeekTemplate(
  template
) {
  if (
    !template ||
    loadingWeekTemplates
  ) {
    return;
  }

  const templateMeals =
    Array.isArray(template.meals)
      ? template.meals
      : [];

  if (templateMeals.length === 0) {
    window.alert(
      "This template does not contain any dinners."
    );

    return;
  }

  setLoadingWeekTemplates(true);

  try {
    const createdMeals = [];
    const skippedMeals = [];

    for (
      const templateMeal of templateMeals
    ) {
      const dayOffset =
        Number(
          templateMeal.day_offset
        );

      if (
        !Number.isInteger(dayOffset) ||
        dayOffset < 0 ||
        dayOffset > 6
      ) {
        continue;
      }

      const targetDate =
        toDateKey(
          addDays(
            weekStart,
            dayOffset
          )
        );

      const existingDinner =
        meals.find(
          (meal) =>
            meal.meal_date ===
              targetDate &&
            meal.meal_type ===
              "dinner"
        );

      if (existingDinner) {
        skippedMeals.push({
          templateMeal,
          targetDate,
          existingDinner,
        });

        continue;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/meals`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title:
              templateMeal.title,

            mealDate:
              targetDate,

            mealType:
              "dinner",

            mealTime:
              templateMeal.meal_time ||
              null,

            description:
              templateMeal.description ||
              null,

            recipeUrl:
              templateMeal.recipe_url ||
              null,

            ingredients:
              templateMeal.ingredients ||
              null,

            recipeId:
              templateMeal.recipe_id ||
              null,

            reminderEnabled:
              Boolean(
                templateMeal.reminder_enabled
              ),

            reminderMinutes:
              templateMeal.reminder_minutes ??
              null,

            memberIds: (
              templateMeal.members || []
            ).map(
              (member) => member.id
            ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Unable to add "${templateMeal.title}"`
        );
      }

      if (data.meal) {
        createdMeals.push(
          data.meal
        );
      }
    }

    if (createdMeals.length > 0) {
      setMeals((current) => [
        ...current,
        ...createdMeals,
      ]);
    }

    setWeekTemplatesOpen(false);

if (
  createdMeals.length > 0 &&
  skippedMeals.length > 0
) {
  setPlannerMessage(
    `${createdMeals.length} dinner${
      createdMeals.length === 1
        ? ""
        : "s"
    } added from "${template.name}" · ${
      skippedMeals.length
    } occupied day${
      skippedMeals.length === 1
        ? ""
        : "s"
    } skipped`
  );
} else if (
  skippedMeals.length > 0
) {
  setPlannerMessage(
    `Nothing added · ${
      skippedMeals.length
    } day${
      skippedMeals.length === 1
        ? " already has"
        : "s already have"
    } dinner planned`
  );
} else {
  setPlannerMessage(
    `${createdMeals.length} dinner${
      createdMeals.length === 1
        ? ""
        : "s"
    } added from "${template.name}"`
  );
}
  } catch (error) {
    console.error(
      "Use week template error:",
      error
    );

    window.alert(
      error.message ||
        "Unable to use week template"
    );
  } finally {
    setLoadingWeekTemplates(false);
  }
}

async function handleReplaceWeekTemplate() {
  if (
    !duplicateWeekTemplate ||
    savingWeekTemplate ||
    replacingTemplateRef.current ||
    meals.length === 0
  ) {
    return;
  }

  replacingTemplateRef.current = true;
  setTemplateReplaceError("");
  setSavingWeekTemplate(true);

  try {
    const templateMeals =
      meals.map((meal) => {
        const mealDate =
          new Date(
            `${meal.meal_date}T12:00:00`
          );

        const startDate =
          new Date(weekStart);

        startDate.setHours(
          12,
          0,
          0,
          0
        );

        const dayOffset =
          Math.round(
            (
              mealDate.getTime() -
              startDate.getTime()
            ) /
              (
                1000 *
                60 *
                60 *
                24
              )
          );

        return {
          dayOffset,

          title:
            meal.title,

          mealTime:
            meal.meal_time || null,

          description:
            meal.description || null,

          recipeUrl:
            meal.recipe_url || null,

          ingredients:
            meal.ingredients || null,

          recipeId:
            meal.recipe_id || null,

          reminderEnabled:
            Boolean(
              meal.reminder_enabled
            ),

          reminderMinutes:
            meal.reminder_minutes ??
            null,

          memberIds: (
            meal.members || []
          ).map(
            (member) => member.id
          ),
        };
      });

    // One server transaction preserves the saved template if any step fails.
    const replaceResponse = await fetch(
      `${API_BASE_URL}/api/meal-templates/${duplicateWeekTemplate.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: duplicateWeekTemplate.replacementName || duplicateWeekTemplate.name,
          meals: templateMeals,
        }),
      }
    );

    const replaceData =
      await replaceResponse.json();

    if (!replaceResponse.ok) {
      throw new Error(
        replaceData.error ||
          "Unable to save replacement template"
      );
    }

    /*
     * Replace the old template in
     * frontend state.
     */
    setWeekTemplates(
      (current) => [
        replaceData.template,
        ...current.filter(
          (template) =>
            Number(template.id) !==
            Number(
              duplicateWeekTemplate.id
            )
        ),
      ]
    );

    const replacedName =
      duplicateWeekTemplate
        .replacementName ||
      duplicateWeekTemplate.name;

    setDuplicateWeekTemplate(null);
    setTemplateName("");
    setSaveTemplateOpen(false);

    setPlannerMessage(
      `"${replacedName}" template updated`
    );
  } catch (error) {
    console.error(
      "Replace week template error:",
      error
    );

    setTemplateReplaceError(
      error.message || "Unable to replace week template. Please try again."
    );
  } finally {
    replacingTemplateRef.current = false;
    setSavingWeekTemplate(false);
  }
}

async function handleDeleteWeekTemplate(
  template
) {
  if (
    !template ||
    deletingWeekTemplate
  ) {
    return;
  }

  setDeletingWeekTemplate(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/meal-templates/${template.id}`,
      {
        method: "DELETE",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to delete week template"
      );
    }

    setWeekTemplates(
      (current) =>
        current.filter(
          (item) =>
            Number(item.id) !==
            Number(template.id)
        )
    );

    setTemplateToDelete(null);

    setPlannerMessage(
      `"${template.name}" template deleted`
    );
  } catch (error) {
    console.error(
      "Delete week template error:",
      error
    );

    window.alert(
      error.message ||
        "Unable to delete week template"
    );
  } finally {
    setDeletingWeekTemplate(false);
  }
}


async function handleCopyMeal() {
  if (!mealToCopy || !copyMealDate) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/meals`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          title: mealToCopy.title,
          mealDate: copyMealDate,
          mealType:
            mealToCopy.meal_type,
          description:
            mealToCopy.description ||
            null,
          recipeUrl:
            mealToCopy.recipe_url ||
            null,
          ingredients:
            mealToCopy.ingredients ||
            null,
          recipeId:
            mealToCopy.recipe_id ||
            null,
          memberIds: (
            mealToCopy.members || []
          ).map(
            (member) => member.id
          ),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to copy meal"
      );
    }

    setMealToCopy(null);
    setCopyMealDate("");

    setWeekStart(
      startOfWeek(
        new Date(
          `${copyMealDate}T12:00:00`
        )
      )
    );
  } catch (err) {
    console.error(err);
  }
}

function normalizePantryName(value) {
  let normalized = String(
    value || ""
  )
    .trim()
    .toLowerCase();

  /*
   * Remove a recipe quantity from the beginning
   * before comparing the ingredient with Pantry.
   *
   * Examples:
   *
   * 2 Garlic Cloves
   *   -> Garlic Cloves
   *
   * 750g Ground Lamb Mince Or Beef
   *   -> Ground Lamb Mince Or Beef
   *
   * 1 1/2 tbsp Olive Oil
   *   -> Olive Oil
   */
  normalized = normalized
    .replace(
      /^\s*\d+\s+\d+\s*\/\s*\d+\s*/i,
      ""
    )
    .replace(
      /^\s*\d+\s*\/\s*\d+\s*/i,
      ""
    )
    .replace(
      /^\s*\d+(?:\.\d+)?\s*/i,
      ""
    );

  /*
   * Remove a measurement unit left at
   * the beginning after the quantity.
   */
  normalized = normalized.replace(
    /^(?:kg|g|mg|l|ml|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds)\b\.?\s*/i,
    ""
  );

  /*
   * Normal Pantry-name cleanup.
   */
  normalized = normalized
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (
    normalized.endsWith("ies") &&
    normalized.length > 4
  ) {
    normalized =
      normalized.slice(0, -3) + "y";
  } else if (
    normalized.endsWith("es") &&
    normalized.length > 4
  ) {
    normalized =
      normalized.slice(0, -2);
  } else if (
    normalized.endsWith("s") &&
    !normalized.endsWith("ss") &&
    normalized.length > 3
  ) {
    normalized =
      normalized.slice(0, -1);
  }

  return normalized;
}

  function weekIngredientMatchesPantry(
    ingredient
  ) {
    const ingredientName =
      normalizePantryName(
        ingredient?.name
      );

    if (!ingredientName) {
      return false;
    }

    return pantryItems.some(
      (pantryItem) => {
        const pantryName =
          normalizePantryName(
            pantryItem.name
          );

        if (!pantryName) {
          return false;
        }

        return (
          ingredientName === pantryName ||
          ingredientName.includes(
            pantryName
          ) ||
          pantryName.includes(
            ingredientName
          )
        );
      }
    );
  }

  function handleWheelGroupChange(value) {
    setWheelGroup(value);
    setWheelResult(null);
    setWheelRotation(0);
  }

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    const controller = new AbortController();

    setWheelCustomRecipes([]);

    if (!wheelGroup.startsWith("custom:")) {
      setWheelCustomGroupLoading(false);
      return;
    }

    const groupId = wheelGroup.replace("custom:", "");

    setWheelCustomGroupLoading(true);

    async function loadSelectedWheelGroup() {
      if (cancelled || inFlight) return;

      inFlight = true;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/meal-wheel-groups/${groupId}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (cancelled) return;

        if (response.status === 404) {
          setWheelGroup("all");
          setWheelCustomRecipes([]);
          setWheelResult(null);
          setWheelRotation(0);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load wheel group"
          );
        }

        if (cancelled) return;

        setWheelCustomRecipes(data.group.recipes || []);
      } catch (error) {
        if (cancelled || error.name === "AbortError") return;

        console.error(
          "Selected wheel group refresh error:",
          error
        );
      } finally {
        inFlight = false;

        if (!cancelled) {
          setWheelCustomGroupLoading(false);
        }
      }
    }

    loadSelectedWheelGroup();

    const stopAutoRefresh = startAutoRefresh(
      loadSelectedWheelGroup
    );

    return () => {
      cancelled = true;
      stopAutoRefresh();
      controller.abort();
    };
  }, [wheelGroup]);

    async function renameWheelGroup(
    group
  ) {
    const newName =
      window.prompt(
        "Rename meal group:",
        group.name
      );

    if (newName === null) {
      return;
    }

    const name = newName.trim();

    if (
      !name ||
      name === group.name
    ) {
      return;
    }

    setWheelGroupError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/meal-wheel-groups/${group.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to rename group"
        );
      }

      setWheelGroups(
        (current) =>
          current
            .map((item) =>
              item.id === group.id
                ? {
                    ...item,
                    name:
                      data.group.name,
                  }
                : item
            )
            .sort((a, b) =>
              a.name.localeCompare(
                b.name
              )
            )
      );

      if (
        editingWheelGroup?.id ===
        group.id
      ) {
        setEditingWheelGroup(
          (current) => ({
            ...current,
            name: data.group.name,
          })
        );
      }
    } catch (error) {
      setWheelGroupError(
        error.message ||
          "Unable to rename group"
      );
    }
  }

    async function deleteWheelGroup(
    group
  ) {
    const confirmed =
      window.confirm(
        `Delete "${group.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setWheelGroupError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/meal-wheel-groups/${group.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete group"
        );
      }

      setWheelGroups(
        (current) =>
          current.filter(
            (item) =>
              item.id !== group.id
          )
      );

      if (
        wheelGroup ===
        `custom:${group.id}`
      ) {
        setWheelGroup("all");
        setWheelCustomRecipes([]);
        setWheelResult(null);
        setWheelRotation(0);
      }
    } catch (error) {
      setWheelGroupError(
        error.message ||
          "Unable to delete group"
      );
    }
  }

    async function openWheelGroupEditor(
    group
  ) {
    setWheelGroupError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/meal-wheel-groups/${group.id}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load group"
        );
      }

      setEditingWheelGroup(
        data.group
      );

      setSelectedWheelRecipeIds(
        (data.group.recipes || []).map(
          (recipe) =>
            Number(recipe.id)
        )
      );
    } catch (error) {
      setWheelGroupError(
        error.message ||
          "Unable to load group"
      );
    }
  }

    async function saveWheelGroupRecipes() {
    if (
      !editingWheelGroup ||
      wheelRecipesSaving
    ) {
      return;
    }

    setWheelRecipesSaving(true);
    setWheelGroupError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/meal-wheel-groups/${editingWheelGroup.id}/recipes`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            recipeIds:
              selectedWheelRecipeIds,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save group recipes"
        );
      }

      setWheelGroups(
        (current) =>
          current.map((group) =>
            group.id ===
            editingWheelGroup.id
              ? {
                  ...group,
                  recipe_count:
                    data.group.recipes
                      ?.length || 0,
                }
              : group
          )
      );

      setEditingWheelGroup(null);
      setSelectedWheelRecipeIds([]);

      if (
        wheelGroup ===
        `custom:${editingWheelGroup.id}`
      ) {
        setWheelCustomRecipes(
          data.group.recipes || []
        );

        setWheelResult(null);
        setWheelRotation(0);
      }
    } catch (error) {
      setWheelGroupError(
        error.message ||
          "Unable to save group recipes"
      );
    } finally {
      setWheelRecipesSaving(false);
    }
  }

    async function createWheelGroup() {
    const name =
      newWheelGroupName.trim();

    if (!name || wheelGroupSaving) {
      return;
    }

    setWheelGroupSaving(true);
    setWheelGroupError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/meal-wheel-groups`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create group"
        );
      }

      const newGroup = {
        ...data.group,
        recipe_count: 0,
      };

      setWheelGroups(
        (current) =>
          [...current, newGroup].sort(
            (a, b) =>
              a.name.localeCompare(
                b.name
              )
          )
      );

      setNewWheelGroupName("");

      setWheelGroup(
        `custom:${newGroup.id}`
      );

      setWheelCustomRecipes([]);
      setWheelResult(null);
      setWheelRotation(0);
    } catch (error) {
      setWheelGroupError(
        error.message ||
          "Unable to create group"
      );
    } finally {
      setWheelGroupSaving(false);
    }
  }

  function spinMealWheel() {
    if (
      wheelSpinning ||
      wheelRecipes.length === 0
    ) {
      return;
    }

    const sliceAngle =
      360 / wheelRecipes.length;

    const randomIndex =
      Math.floor(
        Math.random() * wheelRecipes.length
      );

    const targetSliceCentre =
      randomIndex * sliceAngle +
      sliceAngle / 2;

    const currentRotation =
      ((wheelRotation % 360) + 360) %
      360;

    const desiredRotation =
      (360 - targetSliceCentre) % 360;

    const rotationToTarget =
      (
        desiredRotation -
        currentRotation +
        360
      ) % 360;

    const extraSpins =
      5 +
      Math.floor(
        Math.random() * 3
      );

    const targetRotation =
      wheelRotation +
      extraSpins * 360 +
      rotationToTarget;

    setWheelSpinning(true);
    setWheelResult(null);
    setWheelRotation(
      targetRotation
    );

    window.setTimeout(() => {
      const finalRotation =
        ((targetRotation % 360) + 360) %
        360;

      const pointerAngle =
        (
          360 -
          finalRotation
        ) % 360;

      const landedIndex =
        Math.floor(
          pointerAngle /
            sliceAngle
        ) %
        wheelRecipes.length;

setWheelResult(
  wheelRecipes[landedIndex]
);



setWheelSpinning(false);
    }, 4200);
  }

  async function handleAddWeekToShopping() {
    setAddingWeekToShopping(true);
    setShoppingMessage("");

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/shopping/from-meal-plan/preview`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              start:
                toDateKey(weekStart),
              end:
                toDateKey(weekEnd),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load shopping ingredients"
        );
      }

      const ingredients =
        data.ingredients || [];

      const pantryResponse =
        await fetch(
          `${API_BASE_URL}/api/pantry`
        );

      const pantryData =
        await pantryResponse.json();

      if (!pantryResponse.ok) {
        throw new Error(
          pantryData.error ||
            "Unable to load pantry"
        );
      }

      const availablePantryItems =
        (pantryData.items || []).filter(
          (item) =>
            item.is_available !== 0
        );

      setPantryItems(
        availablePantryItems
      );

      setWeekShoppingIngredients(
        ingredients
      );

      const pantryHasIngredient = (
        ingredient
      ) => {
        const ingredientName =
          normalizePantryName(
            ingredient?.name
          );

        if (!ingredientName) {
          return false;
        }

        return availablePantryItems.some(
          (pantryItem) => {
            const pantryName =
              normalizePantryName(
                pantryItem.name
              );

            if (!pantryName) {
              return false;
            }

            return (
              ingredientName === pantryName ||
              ingredientName.includes(
                pantryName
              ) ||
              pantryName.includes(
                ingredientName
              )
            );
          }
        );
      };

      const ingredientsToBuy =
        ingredients
          .map((ingredient, index) => ({
            ingredient,
            index,
          }))
          .filter(
            ({ ingredient }) =>
              !pantryHasIngredient(
                ingredient
              )
          )
          .map(({ index }) => index);

      setSelectedWeekIngredients(
        ingredientsToBuy
      );

      setWeekShoppingPickerOpen(
        true
      );
    } catch (err) {
      console.error(err);

      setShoppingMessage(
        err.message ||
          "Unable to load shopping ingredients"
      );
    } finally {
      setAddingWeekToShopping(false);
    }
  }

  function toggleWeekShoppingIngredient(
    index
  ) {
    setSelectedWeekIngredients(
      (current) =>
        current.includes(index)
          ? current.filter(
              (item) =>
                item !== index
            )
          : [...current, index]
    );
  }

  async function addSelectedWeekIngredients() {
    const ingredientsToAdd =
      weekShoppingIngredients.filter(
        (_, index) =>
          selectedWeekIngredients.includes(
            index
          )
      );

    if (
      ingredientsToAdd.length === 0
    ) {
      return;
    }

    setAddingWeekToShopping(true);
    setShoppingMessage("");

    try {
      const memberIds =
        members.map(
          (member) =>
            Number(member.id)
        );

      let added = 0;
      let merged = 0;

      for (
        const ingredient
        of ingredientsToAdd
      ) {
        const response =
          await fetch(
            `${API_BASE_URL}/api/shopping`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
body: JSON.stringify({
  name: ingredient.name,
  quantity:
    ingredient.quantity || "1",
  category: "other",
  notes:
    `Meal plan: ${ingredient.recipeTitles.join(
      ", "
    )}`,
  memberIds,
}),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              `Unable to add "${ingredient.name}"`
          );
        }

        if (data.merged) {
          merged += 1;
        } else {
          added += 1;
        }
      }

      setWeekShoppingPickerOpen(
        false
      );

      setShoppingMessage(
        `Added ${added} new ingredient${
          added === 1 ? "" : "s"
        }${
          merged > 0
            ? ` and merged ${merged} existing ingredient${
                merged === 1
                  ? ""
                  : "s"
              }`
            : ""
        }.`
      );
    } catch (err) {
      console.error(err);

      setShoppingMessage(
        err.message ||
          "Unable to add shopping ingredients"
      );
    } finally {
      setAddingWeekToShopping(false);
    }
  }

    return (
    <div className="meals-page">


<section className="calendar-page-heading">
  <div>
    <p className="section-kicker">
      Meals
    </p>

    <h2>
      {view === "planner"
        ? "Dinner Planner"
        : "Recipe Library"}
    </h2>

    <p>
      {view === "planner"
        ? "Plan the family's dinners for the week and keep everything organised."
        : "Save your favourite family dinners, recipes and photos."}
    </p>


  </div>

  <button
    type="button"
    className="add-event-button"
          onClick={() => {
            if (
              view === "recipes"
            ) {
              onAddRecipe?.();
              return;
            }

            onAddMeal?.();
          }}
        >
          <Plus size={22} />

          <span>
            {view === "recipes"
              ? "Add Recipe"
              : "Add Dinner"}
          </span>
        </button>
      </section>


      {view === "planner" && (
        <section className="family-selector family-selector-section">

          

          
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
                  member.name.charAt(0).toUpperCase()
                )}
              </span>

              {member.name}
            </button>
          ))}
        </section>
      )}

<section className="meals-toolbar">
  <div className="meal-planner-toolbar-left">
    <div className="meal-view-switcher">
      <button
        type="button"
        className={
          view === "planner"
            ? "selected"
            : ""
        }
        onClick={() =>
          setView("planner")
        }
      >
Dinner Planner
      </button>

      <button
        type="button"
        className={
          view === "recipes"
            ? "selected"
            : ""
        }
        onClick={() =>
          setView("recipes")
        }
      >
        Recipe Library
      </button>
    </div>

{view === "planner" && (
  <>
<button
  type="button"
  className="meal-copy-last-week"
  onClick={
    handleOpenCopyLastWeek
  }
  disabled={
    loadingPreviousWeek
  }
>
  <Copy size={16} />

  {loadingPreviousWeek
    ? "Loading..."
    : "Copy Last Week"}
</button>

<button
  type="button"
  className="meal-clear-week"
  onClick={() =>
    setClearWeekOpen(true)
  }
>
  Clear Week
</button>

<button
  type="button"
  className="meal-week-templates"
  onClick={async () => {
    await loadWeekTemplates();

    setWeekTemplatesOpen(true);
  }}
  disabled={
    loadingWeekTemplates
  }
>
  <BookOpen size={16} />

  {loadingWeekTemplates
    ? "Loading..."
    : "Week Templates"}
</button>

<button
  type="button"
  className="meal-add-week-shopping"
      onClick={
        handleAddWeekToShopping
      }
      disabled={
        addingWeekToShopping
      }
    >
      <ShoppingCart size={16} />

      {addingWeekToShopping
        ? "Adding..."
        : "Add Week to Shopping"}
    </button>
  </>
)}
    <button
      type="button"
      className="meal-random-picker-button"
      onClick={() => {
        setWheelResult(null);
        setMealWheelOpen(true);
      }}
    >
      <Dices size={16} />
      Random Meal
    </button>

  </div>


</section>

{view === "recipes" && (
  <section className="recipe-library">
    <div className="recipe-library-filters">
            <input
              type="search"
              value={recipeSearch}
              onChange={(event) =>
                setRecipeSearch(
                  event.target.value
                )
              }
              placeholder="Search recipes or ingredients..."
              className="recipe-library-search"
            />

            <button
              type="button"
              className={
                recipeCategory === "all"
                  ? "recipe-filter-button active"
                  : "recipe-filter-button"
              }
              onClick={() =>
                setRecipeCategory(
                  "all"
                )
              }
            >
              All
            </button>

            {recipeCategories.map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    recipeCategory ===
                    category
                      ? "recipe-filter-button active"
                      : "recipe-filter-button"
                  }
                  onClick={() =>
                    setRecipeCategory(
                      category
                    )
                  }
                >
                  {category
                    .replace(
                      "-",
                      " "
                    )
                    .replace(
                      /\b\w/g,
                      (letter) =>
                        letter.toUpperCase()
                    )}
                </button>
              )
            )}

<span className="recipe-filter-divider" />

            <button
              type="button"
              className={
                recipeQuickFilter === "under30"
                  ? "recipe-filter-button active"
                  : "recipe-filter-button"
              }
              onClick={() =>
                setRecipeQuickFilter(
                  recipeQuickFilter === "under30"
                    ? "all"
                    : "under30"
                )
              }
            >
              Under 30 min
            </button>

            <button
              type="button"
              className={
                recipeQuickFilter === "serves4"
                  ? "recipe-filter-button active"
                  : "recipe-filter-button"
              }
              onClick={() =>
                setRecipeQuickFilter(
                  recipeQuickFilter === "serves4"
                    ? "all"
                    : "serves4"
                )
              }
            >
              Serves 4+
            </button>
          </div>

<div className="recipe-results-row">
  <div className="recipe-results-count">
    {filteredRecipes.length}{" "}
    {filteredRecipes.length === 1
      ? "recipe"
      : "recipes"}{" "}
    found
  </div>

  {(recipeSearch ||
    recipeCategory !== "all" ||
    recipeQuickFilter !== "all") && (
    <button
      type="button"
      className="recipe-clear-filters"
      onClick={() => {
        setRecipeSearch("");
        setRecipeCategory("all");
        setRecipeQuickFilter("all");
      }}
    >
      Clear Filters
    </button>
  )}
</div>

{recipesLoading ? (
  <div className="panel meal-status-panel">
    Loading recipes...
  </div>
) : recipesError ? (
  <div className="panel meal-status-panel meal-status-error">
    {recipesError}
  </div>
) : recipes.length === 0 ? (
  <div className="recipe-library-empty panel">
    <BookOpen size={34} />

    <strong>
      No saved recipes yet
    </strong>

    <span>
      Add your favourite meals
      and they'll appear here.
    </span>
  </div>
) : filteredRecipes.length === 0 ? (
  <div className="recipe-library-empty panel">
    <BookOpen size={34} />

    <strong>
      No recipes found
    </strong>

    <span>
      Try changing your search
      or filters.
    </span>
  </div>
) : (
  <div className="recipe-card-grid">
              {filteredRecipes.map((recipe) => (
                <article
  key={recipe.id}
  className="recipe-card"
  onClick={() =>
    onViewRecipe?.(recipe)
  }
>
                  <div className="recipe-card-photo">
                    {recipe.photo_url ? (
                      <img
                        src={`${API_BASE_URL}${recipe.photo_url}`}
                        alt={recipe.title}
                      />
                    ) : (
                      <div className="recipe-card-photo-empty">
                        <Image size={34} />
                        <span>
                          Add photo
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="recipe-card-content">
                    <div className="recipe-card-heading">
                      <div>
                        <span className="recipe-card-kicker">
                          Saved Recipe
                        </span>

                        <h3>
                          {recipe.title}
                        </h3>
                      </div>

                       <button
  type="button"
  className="recipe-card-edit"
  title="Edit recipe"
  onClick={(event) => {
    event.stopPropagation();
    onEditRecipe?.(
      recipe
    );
  }}
>
                        <Pencil size={17} />
                      </button>
                    </div>

                                       {recipe.description && (
                      <p>
                        {recipe.description}
                      </p>
                    )}

                    {(recipe.category ||
                      recipe.prep_time != null ||
                      recipe.cook_time != null ||
                      recipe.servings != null) && (
                      <div className="recipe-card-meta">
                        
                        {recipe.category && (
                          <span>
                            {recipe.category
                              .replace("-", " ")
                              .replace(
                                /\b\w/g,
                                (letter) =>
                                  letter.toUpperCase()
                              )}
                          </span>
                        )}

                        {(recipe.prep_time != null ||
                          recipe.cook_time != null) && (
                          <span>
                            {Number(
                              recipe.prep_time || 0
                            ) +
                              Number(
                                recipe.cook_time || 0
                              )}{" "}
                            min
                          </span>
                        )}

                        {recipe.servings != null && (
                          <span>
                            Serves {recipe.servings}
                          </span>
                        )}
                      </div>
                    )}

                    {recipe.ingredients && (
                      <span className="recipe-card-ingredient-count">
                        {
                          recipe.ingredients
                            .split(/\r?\n/)
                            .filter(
                              (item) =>
                                item.trim()
                            ).length
                        }{" "}
                        ingredients
                      </span>
                    )}

                    <button
  type="button"
  className="recipe-card-plan"
  onClick={(event) => {
    event.stopPropagation();
    onPlanRecipe?.(
      recipe
    );
  }}
>
                      <CalendarPlus
                        size={17}
                      />
                      Plan this meal
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}


      
{duplicateWeekTemplate && (
  <div
    className="event-modal-backdrop duplicate-template-backdrop"
    onMouseDown={(event) => {
      if (
        event.target ===
          event.currentTarget &&
        !savingWeekTemplate
      ) {
        setDuplicateWeekTemplate(null);
      }
    }}
  >
    <div
      className="duplicate-template-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-template-title"
    >
      <div className="duplicate-template-header">
        <div>
          <p className="section-kicker">
            Week Templates
          </p>

          <h2 id="duplicate-template-title">
            Template Already Exists
          </h2>

          <p>
            A template called “
            {duplicateWeekTemplate.name}”
            already exists.
          </p>
        </div>

        <button
          type="button"
          className="meal-wheel-close"
          onClick={() =>
            setDuplicateWeekTemplate(null)
          }
          disabled={
            savingWeekTemplate
          }
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="duplicate-template-body">
        {templateReplaceError && (
          <p role="alert">{templateReplaceError}</p>
        )}
        <div className="duplicate-template-info">
          <strong>
            Replace the existing template?
          </strong>

          <span>
            The saved “
            {duplicateWeekTemplate.name}”
            template will be replaced with
            the dinners currently shown in
            this week.
          </span>

          <span>
            Your recipes and dinners already
            on the planner will not be
            affected.
          </span>
        </div>
      </div>

      <div className="duplicate-template-footer">
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            setDuplicateWeekTemplate(null)
          }
          disabled={
            savingWeekTemplate
          }
        >
          Cancel
        </button>

<button
  type="button"
  className="duplicate-template-replace"
  onClick={
    handleReplaceWeekTemplate
  }
  disabled={
    savingWeekTemplate
  }
>
  {savingWeekTemplate
    ? "Replacing..."
    : "Replace Existing"}
</button>
      </div>
    </div>
  </div>
)}

{templateToDelete && (
  <div
    className="event-modal-backdrop delete-template-backdrop"
    onMouseDown={(event) => {
      if (
        event.target ===
          event.currentTarget &&
        !deletingWeekTemplate
      ) {
        setTemplateToDelete(null);
      }
    }}
  >
    <div
      className="delete-template-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-template-title"
    >
      <div className="delete-template-header">
        <div>
          <p className="section-kicker">
            Week Templates
          </p>

          <h2 id="delete-template-title">
            Delete “{templateToDelete.name}”?
          </h2>

          <p>
            This will permanently remove
            this saved week template.
          </p>
        </div>

        <button
          type="button"
          className="meal-wheel-close"
          onClick={() =>
            setTemplateToDelete(null)
          }
          disabled={
            deletingWeekTemplate
          }
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="delete-template-body">
        <div className="delete-template-warning">
          <strong>
            Your recipes and planned dinners
            will not be affected.
          </strong>

          <span>
            Only the saved “
            {templateToDelete.name}” week
            template will be deleted.
          </span>
        </div>
      </div>

      <div className="delete-template-footer">
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            setTemplateToDelete(null)
          }
          disabled={
            deletingWeekTemplate
          }
        >
          Cancel
        </button>

        <button
          type="button"
          className="delete-template-confirm"
          onClick={() =>
            handleDeleteWeekTemplate(
              templateToDelete
            )
          }
          disabled={
            deletingWeekTemplate
          }
        >
          {deletingWeekTemplate
            ? "Deleting..."
            : "Delete Template"}
        </button>
      </div>
    </div>
  </div>
)}

{saveTemplateOpen && (
  <div
    className="event-modal-backdrop save-template-backdrop"
    onMouseDown={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        setSaveTemplateOpen(false);
      }
    }}
  >
    <div
      className="save-template-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-template-title"
    >
      <div className="save-template-header">
        <div>
          <p className="section-kicker">
            Week Templates
          </p>

          <h2 id="save-template-title">
            Save Current Week
          </h2>

          <p>
            Give this dinner plan a name so
            you can use it again later.
          </p>
        </div>

        <button
          type="button"
          className="meal-wheel-close"
          onClick={() =>
            setSaveTemplateOpen(false)
          }
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="save-template-body">
        <label
          className="save-template-field"
        >
          <span>
            Template Name
          </span>

          <input
            type="text"
            value={templateName}
            onChange={(event) =>
              setTemplateName(
                event.target.value
              )
            }
            placeholder="e.g. Normal Week"
            autoFocus
            maxLength={50}
          />
        </label>

        <div className="save-template-summary">
          <BookOpen size={18} />

          <div>
            <strong>
              {meals.length}{" "}
              {meals.length === 1
                ? "dinner"
                : "dinners"}{" "}
              will be saved
            </strong>

            <span>
              Your recipes remain in the
              Recipe Library.
            </span>
          </div>
        </div>
      </div>

      <div className="save-template-footer">
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            setSaveTemplateOpen(false)
          }
        >
          Cancel
        </button>

<button
  type="button"
  className="save-template-confirm"
  onClick={
    handleSaveWeekTemplate
  }
  disabled={
    !templateName.trim() ||
    savingWeekTemplate
  }
>
  {savingWeekTemplate
    ? "Saving..."
    : "Save Template"}
</button>
      </div>
    </div>
  </div>
)}

{weekTemplatesOpen && (
  <div
    className="event-modal-backdrop"
    onMouseDown={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        setWeekTemplatesOpen(false);
      }
    }}
  >
    <div
      className="week-templates-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="week-templates-title"
    >
      <div className="week-templates-header">
        <div>
          <p className="section-kicker">
            Dinner Planner
          </p>

          <h2 id="week-templates-title">
            Week Templates
          </h2>

          <p>
            Save favourite dinner plans and
            reuse them on any week.
          </p>
        </div>

        <button
          type="button"
          className="meal-wheel-close"
          onClick={() =>
            setWeekTemplatesOpen(false)
          }
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="week-templates-toolbar">
        <div>
          <strong>
            Saved Templates
          </strong>

          <span>
            {weekTemplates.length}{" "}
            {weekTemplates.length === 1
              ? "template"
              : "templates"}
          </span>
        </div>

<button
  type="button"
  className="week-template-save-current"
  onClick={() => {
    setTemplateName("");
    setSaveTemplateOpen(true);
  }}
  disabled={
    meals.length === 0
  }
>
  <Plus size={16} />
  Save Current Week
</button>
      </div>

      {weekTemplates.length === 0 ? (
        <div className="week-templates-empty">
          <BookOpen size={38} />

          <strong>
            No week templates yet
          </strong>

          <span>
            Plan some dinners, then save the
            week so you can use it again later.
          </span>
        </div>
      ) : (
        <div className="week-templates-list">
          {weekTemplates.map(
            (template) => (
              <div
                key={template.id}
                className="week-template-card"
              >
                <div className="week-template-card-copy">
                  <strong>
                    {template.name}
                  </strong>

                  <span>
                    {template.meals?.length || 0}{" "}
                    dinners
                  </span>
                </div>

<div className="week-template-actions">

<button
  type="button"
  className="week-template-delete"
  onClick={() =>
    setTemplateToDelete(
      template
    )
  }
  disabled={
    loadingWeekTemplates ||
    deletingWeekTemplate
  }
>
  Delete
</button>

  <button
    type="button"
    className="week-template-use"
    onClick={() =>
      handleUseWeekTemplate(
        template
      )
    }
    disabled={
      loadingWeekTemplates
    }
  >
    {loadingWeekTemplates
      ? "Applying..."
      : "Use Template"}
  </button>
</div>
              </div>
            )
          )}
        </div>
      )}

      <div className="week-templates-footer">
        <span>
          Templates save the dinner plan,
          not copies of your recipes.
        </span>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            setWeekTemplatesOpen(false)
          }
        >
          Done
        </button>
      </div>
    </div>
  </div>
)}

{clearWeekOpen && (
  <div
    className="event-modal-backdrop"
    onMouseDown={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        setClearWeekOpen(false);
      }
    }}
  >
    <div
      className="clear-week-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-week-title"
    >
      <div className="clear-week-header">
        <div>
          <p className="section-kicker">
            Dinner Planner
          </p>

          <h2 id="clear-week-title">
            Clear This Week?
          </h2>

          <p>
            This will remove the planned
            dinners from{" "}
            <strong>
              {formatWeekStart(weekStart)}
              {" – "}
              {formatWeekEnd(weekEnd)}
            </strong>
            .
          </p>
        </div>

        <button
          type="button"
          className="meal-wheel-close"
          onClick={() =>
            setClearWeekOpen(false)
          }
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {meals.length === 0 ? (
        <div className="clear-week-empty">
          <Utensils size={32} />

          <strong>
            Nothing to clear
          </strong>

          <span>
            There are no dinners planned
            for this week.
          </span>
        </div>
      ) : (
        <div className="clear-week-list">
          {meals.map((meal) => {
            const mealDate =
              new Date(
                `${meal.meal_date}T12:00:00`
              );

            const dayName =
              new Intl.DateTimeFormat(
                "en-AU",
                {
                  weekday: "long",
                }
              ).format(mealDate);

            return (
              <div
                key={meal.id}
                className="clear-week-item"
              >
                <span className="clear-week-day">
                  {dayName}
                </span>

                <div className="clear-week-meal">
                  <strong>
                    {meal.title}
                  </strong>

                  <span>
                    {meal.recipe_id
                      ? "Linked recipe"
                      : "Manual dinner"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="clear-week-footer">
        <span className="clear-week-warning">
          Saved recipes will not be deleted.
        </span>

        <div>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setClearWeekOpen(false)
            }
          >
            Cancel
          </button>

<button
  type="button"
  className="clear-week-confirm"
  onClick={
    handleClearWeek
  }
  disabled={
    meals.length === 0 ||
    clearingWeek
  }
>
  {clearingWeek
    ? "Clearing..."
    : `Clear ${
        meals.length
      } ${
        meals.length === 1
          ? "Dinner"
          : "Dinners"
      }`}
</button>
        </div>
      </div>
    </div>
  </div>
)}

{copyLastWeekOpen && (
  <div
    className="event-modal-backdrop"
    onMouseDown={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        setCopyLastWeekOpen(false);
      }
    }}
  >
    <div
      className="copy-last-week-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="copy-last-week-title"
    >
      <div className="copy-last-week-header">
        <div>
          <p className="section-kicker">
            Dinner Planner
          </p>

          <h2 id="copy-last-week-title">
            Copy Last Week
          </h2>

          <p>
            Choose which dinners to copy
            into this week.
          </p>
        </div>

        <button
          type="button"
          className="meal-wheel-close"
          onClick={() =>
            setCopyLastWeekOpen(false)
          }
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {previousWeekMeals.length === 0 ? (
        <div className="copy-last-week-empty">
          <Utensils size={32} />

          <strong>
            No dinners last week
          </strong>

          <span>
            There are no dinners to copy
            from the previous week.
          </span>
        </div>
      ) : (
        <>
          <div className="copy-last-week-tools">
            <button
              type="button"
              onClick={() =>
                setSelectedPreviousMeals(
                  previousWeekMeals.map(
                    (meal) => meal.id
                  )
                )
              }
            >
              Select all
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedPreviousMeals([])
              }
            >
              Clear all
            </button>

            <span>
              {
                selectedPreviousMeals.length
              }{" "}
              selected
            </span>
          </div>

          <div className="copy-last-week-list">
            {previousWeekMeals.map(
              (meal) => {
                const selected =
                  selectedPreviousMeals.includes(
                    meal.id
                  );

                const mealDate =
                  new Date(
                    `${meal.meal_date}T12:00:00`
                  );

                const dayName =
                  new Intl.DateTimeFormat(
                    "en-AU",
                    {
                      weekday: "long",
                    }
                  ).format(mealDate);

                const linkedRecipe =
                  meal.recipe_id
                    ? recipes.find(
                        (recipe) =>
                          Number(
                            recipe.id
                          ) ===
                          Number(
                            meal.recipe_id
                          )
                      )
                    : null;

                return (
                  <button
                    type="button"
                    key={meal.id}
                    className={`copy-last-week-item ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedPreviousMeals(
                        (current) =>
                          current.includes(
                            meal.id
                          )
                            ? current.filter(
                                (id) =>
                                  id !==
                                  meal.id
                              )
                            : [
                                ...current,
                                meal.id,
                              ]
                      );
                    }}
                  >
                    <span className="copy-last-week-check">
                      {selected ? "✓" : ""}
                    </span>

                    <span className="copy-last-week-day">
                      {dayName}
                    </span>

                    <span className="copy-last-week-meal">
                      <strong>
                        {meal.title}
                      </strong>

                      <small>
                        {linkedRecipe
                          ? "Recipe"
                          : "Manual dinner"}
                      </small>
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </>
      )}

      <div className="copy-last-week-footer">
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            setCopyLastWeekOpen(false)
          }
        >
          Cancel
        </button>

<button
  type="button"
  className="add-event-button"
  onClick={
    handleCopySelectedPreviousMeals
  }
  disabled={
    selectedPreviousMeals.length === 0 ||
    loadingPreviousWeek
  }
>
  <Copy size={16} />

  {loadingPreviousWeek
    ? "Copying..."
    : `Copy ${
        selectedPreviousMeals.length
      } ${
        selectedPreviousMeals.length === 1
          ? "Dinner"
          : "Dinners"
      }`}
</button>
      </div>
    </div>
  </div>
)}


      {slotRecipePicker && (
  <div
    className="event-modal-backdrop"
    onMouseDown={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        setSlotRecipePicker(null);
      }
    }}
  >
    <div
      className="meal-slot-recipe-picker"
      role="dialog"
      aria-modal="true"
    >
      <div className="meal-slot-recipe-picker-header">
        <div>
          <p className="section-kicker">
            Meal Planner
          </p>

          <h2>
            Choose Recipe
          </h2>

          <p>
            Pick a saved recipe for{" "}
            {slotRecipePicker.mealType}.
          </p>
        </div>

        <button
          type="button"
          className="meal-wheel-close"
          onClick={() =>
            setSlotRecipePicker(null)
          }
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="meal-slot-recipe-picker-list">
        {recipes.map((recipe) => (
          <button
            type="button"
            key={recipe.id}
            className="meal-slot-recipe-picker-item"
            onClick={() => {
              setSlotRecipePicker(null);

              onPlanRecipe?.(
                recipe,
                {
                  mealDate:
                    slotRecipePicker.mealDate,
                  mealType:
                    slotRecipePicker.mealType,
                }
              );
            }}
          >
            <strong>
              {recipe.title}
            </strong>

{(
  Number(recipe.prep_time || 0) +
  Number(recipe.cook_time || 0)
) > 0 && (
  <span>
    {Number(recipe.prep_time || 0) +
      Number(recipe.cook_time || 0)}{" "}
    min
  </span>
)}
          </button>
        ))}
      </div>
    </div>
  </div>
)}

            {mealWheelOpen && (
        <div
          className="event-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget &&
              !wheelSpinning
            ) {
              setMealWheelOpen(false);
            }
          }}
        >
          <div
            className="meal-wheel-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="meal-wheel-heading">
              <div>
                <p className="section-kicker">
                  Random Meal
                </p>

                <h2>
                  Spin for Dinner
                </h2>

                <p>
                  Let FamilyHub choose from your saved recipes.
                </p>
              </div>

              <button
                type="button"
                className="meal-wheel-close"
                onClick={() =>
                  setMealWheelOpen(false)
                }
                disabled={wheelSpinning}
              >
                ×
              </button>
            </div>

            <div className="meal-wheel-group">
  <span>Choose meals</span>

  <select
    value={wheelGroup}
    onChange={(event) =>
      handleWheelGroupChange(
        event.target.value
      )
    }
    disabled={
      wheelSpinning ||
      wheelCustomGroupLoading
    }
  >
    <option value="all">
      All Recipes ({recipes.length})
    </option>

    {recipeCategories.length > 0 && (
      <optgroup label="Categories">
        {recipeCategories.map(
          (category) => {
            const count =
              recipes.filter(
                (recipe) =>
                  recipe.category ===
                  category
              ).length;

            const label =
              category
                .replace("-", " ")
                .replace(
                  /\b\w/g,
                  (letter) =>
                    letter.toUpperCase()
                );

            return (
              <option
                key={category}
                value={category}
              >
                {label} ({count})
              </option>
            );
          }
        )}
      </optgroup>
    )}

    {wheelGroups.length > 0 && (
      <optgroup label="My Groups">
        {wheelGroups.map(
          (group) => (
            <option
              key={`custom-${group.id}`}
              value={`custom:${group.id}`}
            >
              {group.name} (
              {group.recipe_count || 0})
            </option>
          )
        )}
      </optgroup>
    )}
  </select>

  <button
    type="button"
    className="meal-wheel-manage-groups"
    onClick={() =>
      setWheelGroupManagerOpen(true)
    }
    disabled={wheelSpinning}
  >
    Manage Groups
  </button>
</div>

            {wheelRecipes.length === 0 ? (
              <div className="meal-wheel-empty">
                <Dices size={34} />

<strong>
  {wheelGroup.startsWith("custom:")
    ? "This group has no recipes yet"
    : "No recipes to spin yet"}
</strong>

<span>
  {wheelGroup.startsWith("custom:")
    ? "Add some recipes using Manage Groups."
    : "Add recipes to your Recipe Library first."}
</span>
              </div>
            ) : (
              <>


<div className="meal-wheel-current-group">
  <span>Spinning from</span>
  <strong>{wheelGroupLabel}</strong>
  <small>
    {wheelRecipes.length}{" "}
    {wheelRecipes.length === 1
      ? "recipe"
      : "recipes"}
  </small>
</div>

<div className="meal-wheel-stage">
  <div className="meal-wheel-pointer" />

                  <div
                    className={`meal-wheel ${
                      wheelSpinning
                        ? "spinning"
                        : ""
                    }`}
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,
                      background:
                        `conic-gradient(${wheelRecipes
                          .map(
                            (
                              _recipe,
                              index
                            ) => {
                              const start =
                                (
                                  index /
                                  wheelRecipes.length
                                ) *
                                360;

                              const end =
                                (
                                  (index + 1) /
                                  wheelRecipes.length
                                ) *
                                360;

const gap = 0.8;

let colour;

const isLastSlice =
  index === wheelRecipes.length - 1;

const hasOddNumberOfSlices =
  wheelRecipes.length % 2 !== 0;

if (
  isLastSlice &&
  hasOddNumberOfSlices
) {
  colour = "#1f6f54";
} else {
  colour =
    index % 2 === 0
      ? "var(--familyhub-accent)"
      : "#24324a";
}

return `${colour} ${start}deg ${end}deg`;
                            }
                          )
                          .join(", ")})`,
                    }}
                  >
                    {wheelRecipes.map(
                      (
                        recipe,
                        index
                      ) => {
const angle =
  (
    index /
    wheelRecipes.length
  ) *
    360 +
  180 /
    wheelRecipes.length;

return (
  <div
    key={recipe.id}
    className="meal-wheel-label"
    style={{
      transform: `rotate(${angle}deg)`,
    }}
  >
    <span>
      {recipe.title}
    </span>
  </div>
);
                      }
                    )}

                    <div className="meal-wheel-centre">
                      <Dices size={24} />
                    </div>
                  </div>
                </div>

                {wheelResult && (
                  <div className="meal-wheel-result">
                    <span>
                      Tonight's meal
                    </span>

                    <strong>
                      {wheelResult.title}
                    </strong>

                    <button
                      type="button"
                      onClick={() => {
                        setMealWheelOpen(false);
                        onPlanRecipe?.(
                          wheelResult
                        );
                      }}
                    >
                      <CalendarPlus size={16} />
                      Plan this meal
                    </button>
                  </div>
                )}

                <div className="meal-wheel-actions">
                  <button
                    type="button"
                    className="meal-wheel-spin"
                    onClick={
                      spinMealWheel
                    }
                    disabled={
                      wheelSpinning
                    }
                  >
                    <Dices size={18} />

                    {wheelSpinning
                      ? "Spinning..."
                      : wheelResult
                        ? "Spin Again"
                        : "Spin Wheel"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {wheelGroupManagerOpen && (
        <div
          className="event-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setWheelGroupManagerOpen(
                false
              );
            }
          }}
        >
          <div className="meal-wheel-group-manager">
            <div className="meal-wheel-group-manager-header">
              <div>
                <span className="meal-wheel-group-manager-kicker">
                  Random Meal
                </span>

                <h2>Manage Groups</h2>

                <p>
                  Create your own groups for
                  the meal wheel.
                </p>
              </div>

              <button
                type="button"
                className="meal-wheel-close"
                onClick={() =>
                  setWheelGroupManagerOpen(
                    false
                  )
                }
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="meal-wheel-create-group">
              <input
                type="text"
                value={newWheelGroupName}
                placeholder="e.g. Family Favourites"
                onChange={(event) => {
                  setNewWheelGroupName(
                    event.target.value
                  );

                  setWheelGroupError("");
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    createWheelGroup();
                  }
                }}
              />

              <button
                type="button"
                onClick={createWheelGroup}
                disabled={
                  wheelGroupSaving ||
                  !newWheelGroupName.trim()
                }
              >
                {wheelGroupSaving
                  ? "Creating..."
                  : "Create Group"}
              </button>
            </div>

            {wheelGroupError && (
              <div className="meal-wheel-group-error">
                {wheelGroupError}
              </div>
            )}

            <div className="meal-wheel-group-list">
              {wheelGroupsLoading ? (
                <div className="meal-wheel-group-empty">
                  Loading groups...
                </div>
              ) : wheelGroups.length === 0 ? (
                <div className="meal-wheel-group-empty">
                  No custom groups yet.
                </div>
              ) : (
                wheelGroups.map((group) => (
                  <div
                    key={group.id}
                    className="meal-wheel-group-card"
                  >
                    <div>
                      <strong>
                        {group.name}
                      </strong>

                      <span>
                        {group.recipe_count || 0}{" "}
                        {(group.recipe_count || 0) === 1
                          ? "recipe"
                          : "recipes"}
                      </span>
                    </div>

<div className="meal-wheel-group-actions">
  <button
    type="button"
    onClick={() =>
      openWheelGroupEditor(
        group
      )
    }
  >
    Edit Recipes
  </button>

  <button
    type="button"
    className="meal-wheel-group-rename"
    onClick={() =>
      renameWheelGroup(
        group
      )
    }
  >
    Rename
  </button>

  <button
    type="button"
    className="meal-wheel-group-delete"
                        onClick={() =>
                          deleteWheelGroup(
                            group
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {editingWheelGroup && (
        <div
          className="event-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget &&
              !wheelRecipesSaving
            ) {
              setEditingWheelGroup(null);
              setSelectedWheelRecipeIds(
                []
              );
            }
          }}
        >
          <div className="meal-wheel-recipe-manager">
            <div className="meal-wheel-group-manager-header">
              <div>
                <span className="meal-wheel-group-manager-kicker">
                  Meal Wheel Group
                </span>

                <h2>
                  {editingWheelGroup.name}
                </h2>

                <p>
                  Choose the recipes you want
                  on this wheel.
                </p>
              </div>

              <button
                type="button"
                className="meal-wheel-close"
                disabled={wheelRecipesSaving}
                onClick={() => {
                  setEditingWheelGroup(null);
                  setSelectedWheelRecipeIds(
                    []
                  );
                }}
              >
                ×
              </button>
            </div>

            <div className="meal-wheel-recipe-tools">
              <button
                type="button"
                onClick={() =>
                  setSelectedWheelRecipeIds(
                    recipes.map((recipe) =>
                      Number(recipe.id)
                    )
                  )
                }
              >
                Select All
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedWheelRecipeIds(
                    []
                  )
                }
              >
                Clear All
              </button>

              <span>
                {
                  selectedWheelRecipeIds.length
                }{" "}
                selected
              </span>
            </div>

            <div className="meal-wheel-recipe-list">
              {recipes.map((recipe) => {
                const recipeId =
                  Number(recipe.id);

                const checked =
                  selectedWheelRecipeIds.includes(
                    recipeId
                  );

                return (
                  <label
                    key={recipe.id}
                    className={`meal-wheel-recipe-item ${
                      checked
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedWheelRecipeIds(
                          (current) =>
                            current.includes(
                              recipeId
                            )
                              ? current.filter(
                                  (id) =>
                                    id !==
                                    recipeId
                                )
                              : [
                                  ...current,
                                  recipeId,
                                ]
                        );
                      }}
                    />

                    {recipe.photo_url ? (
                      <img
                        src={`${API_BASE_URL}${recipe.photo_url}`}
                        alt=""
                      />
                    ) : (
                      <div className="meal-wheel-recipe-placeholder">
                        <Utensils
                          size={18}
                        />
                      </div>
                    )}

                    <div>
                      <strong>
                        {recipe.title}
                      </strong>

                      {recipe.category && (
                        <span>
                          {recipe.category
                            .replace(
                              "-",
                              " "
                            )
                            .replace(
                              /\b\w/g,
                              (letter) =>
                                letter.toUpperCase()
                            )}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="meal-wheel-recipe-footer">
              <button
                type="button"
                className="meal-wheel-recipe-cancel"
                disabled={wheelRecipesSaving}
                onClick={() => {
                  setEditingWheelGroup(null);
                  setSelectedWheelRecipeIds(
                    []
                  );
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="meal-wheel-recipe-save"
                disabled={wheelRecipesSaving}
                onClick={
                  saveWheelGroupRecipes
                }
              >
                {wheelRecipesSaving
                  ? "Saving..."
                  : `Save ${selectedWheelRecipeIds.length} Recipes`}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "planner" && (
        <>

{mealToCopy && (
  <div
    className="event-modal-backdrop"
    onClick={() => {
      setMealToCopy(null);
      setCopyMealDate("");
    }}
  >
    <div
      className="meal-copy-modal"
      role="dialog"
      aria-modal="true"
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <p className="section-kicker">
        Copy Meal
      </p>

      <h2>
        {mealToCopy.title}
      </h2>

      <p>
        Choose the date you want to
        copy this meal to.
      </p>

      <label className="meal-copy-field">
        <span>Date</span>

        <input
          type="date"
          value={copyMealDate}
          onChange={(event) =>
            setCopyMealDate(
              event.target.value
            )
          }
        />
      </label>

      <div className="meal-copy-actions">
        <button
          type="button"
          className="meal-copy-cancel"
          onClick={() => {
            setMealToCopy(null);
            setCopyMealDate("");
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className="meal-copy-confirm"
          onClick={handleCopyMeal}
          disabled={!copyMealDate}
        >
          <Copy size={16} />
          Copy Meal
        </button>
      </div>
    </div>
  </div>
)}

{weekShoppingPickerOpen && (
  <div className="event-modal-backdrop">
    <div
      className="recipe-details-modal weekly-shopping-modal"
      role="dialog"
      aria-modal="true"
    >
                <div className="recipe-details-content">
                  <div className="recipe-details-heading">
                    <div>
                      <p className="section-kicker">
                        Weekly Shopping
                      </p>

                      <h2>
                        Choose Ingredients
                      </h2>

                      <p>
                        Untick anything you already have at home.
                      </p>
                    </div>
                  </div>

                  <div className="recipe-shopping-picker">
                    <div className="recipe-shopping-picker-tools">

<button
  type="button"
  onClick={() =>
    setSelectedWeekIngredients(
      weekShoppingIngredients
        .map(
          (
            ingredient,
            index
          ) => ({
            ingredient,
            index,
          })
        )
        .filter(
          ({ ingredient }) =>
            !weekIngredientMatchesPantry(
              ingredient
            )
        )
        .map(
          ({ index }) =>
            index
        )
    )
  }
>
  Select all
</button>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedWeekIngredients(
                            []
                          )
                        }
                      >
                        Clear all
                      </button>

                      <span>
                        {
                          selectedWeekIngredients.length
                        } selected
                      </span>
                    </div>

                    <div className="recipe-shopping-picker-list">
                      {weekShoppingIngredients.map(
                        (
                          ingredient,
                          index
                        ) => {
                          const checked =
                            selectedWeekIngredients.includes(
                              index
                            );

                          const alreadyHave =
                            weekIngredientMatchesPantry(
                              ingredient
                            );

                          return (
                            <label
                              key={
                                ingredient.normalizedName ||
                                `${ingredient.name}-${index}`
                              }
                              className={`recipe-shopping-picker-item ${
                                alreadyHave
                                  ? "already-have"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  checked
                                }
                                onChange={() =>
                                  toggleWeekShoppingIngredient(
                                    index
                                  )
                                }
                              />

                              <span className="recipe-shopping-picker-text">
                                <strong>
                                  {ingredient.quantity
                                    ? `${ingredient.quantity} `
                                    : ""}
                                  {ingredient.name}
                                </strong>

                                {ingredient.recipeTitles?.length >
                                  0 && (
                                  <small>
                                    From{" "}
                                    {ingredient.recipeTitles.join(
                                      ", "
                                    )}
                                  </small>
                                )}
                              </span>

                              <span
                                className={`recipe-shopping-stock-badge ${
                                  alreadyHave
                                    ? "in-pantry"
                                    : "need-to-buy"
                                }`}
                              >
                                {alreadyHave
                                  ? "✓ In Pantry"
                                  : "Need to Buy"}
                              </span>
                            </label>
                          );
                        }
                      )}
                    </div>

                    <div className="recipe-shopping-picker-footer">
                      <button
                        type="button"
                        className="recipe-shopping-picker-cancel"
                        onClick={() =>
                          setWeekShoppingPickerOpen(
                            false
                          )
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="recipe-shopping-picker-add"
                        onClick={
                          addSelectedWeekIngredients
                        }
                        disabled={
                          addingWeekToShopping ||
                          selectedWeekIngredients.length ===
                            0
                        }
                      >
                        <ShoppingCart
                          size={17}
                        />

                        {addingWeekToShopping
                          ? "Adding..."
                          : `Add ${selectedWeekIngredients.length} Selected`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



{shoppingMessage && (
  <div
    className="meal-shopping-message meal-shopping-toast"
    role="status"
    aria-live="polite"
  >
    <div className="meal-shopping-toast-icon">
      ✓
    </div>

    <div className="meal-shopping-toast-copy">
      <strong>
        Shopping List Updated
      </strong>

      <span>
        {shoppingMessage}
      </span>
    </div>

    <button
      type="button"
      className="meal-shopping-toast-close"
      onClick={() =>
        setShoppingMessage("")
      }
      aria-label="Dismiss notification"
    >
      <X size={16} />
    </button>
  </div>
)}

{plannerMessage && (
  <div
    className="meal-planner-toast"
    role="status"
    aria-live="polite"
  >
    <div className="meal-planner-toast-icon">
      ✓
    </div>

    <div className="meal-planner-toast-copy">
      <strong>
        Dinner Plan Updated
      </strong>

      <span>
        {plannerMessage}
      </span>
    </div>

    <button
      type="button"
      className="meal-planner-toast-close"
      onClick={() =>
        setPlannerMessage("")
      }
      aria-label="Dismiss notification"
    >
      <X size={16} />
    </button>
  </div>
)}

      <section className="meal-week-toolbar">
        <div className="meal-week-range">
          <button
            type="button"
            className="meal-week-previous"
            aria-label="Previous week"
            title="Previous week"
            onClick={() =>
              setWeekStart(
                (current) =>
                  addDays(
                    current,
                    -7
                  )
              )
            }
          >
            Previous
          </button>

          <strong>
            {formatWeekStart(
              weekStart
            )}
            {" – "}
            {formatWeekEnd(
              weekEnd
            )}
          </strong>

          <button
            type="button"
            className="meal-week-current"
            onClick={() =>
              setWeekStart(
                startOfWeek(
                  new Date()
                )
              )
            }
          >
            This week
          </button>

          <button
            type="button"
            className="meal-week-next"
            aria-label="Next week"
            title="Next week"
            onClick={() =>
              setWeekStart(
                (current) =>
                  addDays(
                    current,
                    7
                  )
              )
            }
          >
            Next
          </button>
        </div>
      </section>

      {loading ? (
        <div className="panel meal-status-panel">
          Loading meals...
        </div>
      ) : error ? (
        <div className="panel meal-status-panel meal-status-error">
          {error}
        </div>
      ) : (
        <div className="meal-week-scroll">
          <div className="meal-week-grid">
            {weekDays.map(
              (date) => {
                const dateKey =
                  toDateKey(date);

                const isToday =
                  dateKey ===
                  toDateKey(
                    new Date()
                  );

                return (
                  <section
                    key={dateKey}
                    className={`meal-week-day ${
                      isToday
                        ? "today"
                        : ""
                    }`}
                  >
                    <div className="meal-week-day-heading">
                      <span>
                        {new Intl.DateTimeFormat(
                          "en-AU",
                          {
                            weekday:
                              "short",
                          }
                        ).format(
                          date
                        )}
                      </span>

                      <strong>
                        {date.getDate()}
                      </strong>
                    </div>

                    <div className="meal-week-slots">
                      {mealTypes
                        .filter(
                          (type) =>
                            mealTypeFilter ===
                              "all" ||
                            mealTypeFilter ===
                              type
                        )
                        .map(
                          (
                            mealType
                          ) => {
                            const slotMeals =
                              getMealsForSlot(
                                dateKey,
                                mealType
                              );

                            const Icon =
                              getMealIcon(
                                mealType
                              );

                            return (
<div
  key={mealType}
  className={`meal-week-slot ${
    dragOverSlot ===
    `${dateKey}-${mealType}`
      ? "drag-over"
      : ""
  }`}
  onDragOver={(event) => {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";

    setDragOverSlot(
      `${dateKey}-${mealType}`
    );
  }}
  onDragLeave={(event) => {
    if (
      !event.currentTarget.contains(
        event.relatedTarget
      )
    ) {
      setDragOverSlot(null);
    }
  }}
  onDrop={(event) => {
    event.preventDefault();

    handleDropMeal(
      draggedMeal,
      dateKey,
      mealType
    );
  }}
>
<div
  className={`meal-week-slot-heading ${
    slotMeals.length > 0
      ? "has-meal"
      : ""
  }`}
>
  <Icon
    size={
      15
    }
  />

  <span>
    {slotMeals.length > 0
      ? slotMeals
          .map(
            (meal) =>
              meal.title
          )
          .join(", ")
      : mealType
          .charAt(
            0
          )
          .toUpperCase() +
        mealType.slice(
          1
        )}
  </span>
</div>

                                {slotMeals.length >
                                0 ? (
                                  <div className="meal-week-slot-meals">
{slotMeals.map((meal) => (
<div
  key={meal.id}
className={`meal-week-meal ${
  draggedMeal?.id === meal.id
    ? "dragging"
    : ""
} ${
  Number(highlightedMealId) ===
  Number(meal.id)
    ? "just-planned"
    : ""
}`}
  role="button"
  tabIndex={0}
  draggable
  onDragStart={(event) => {
    setDraggedMeal(meal);

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      String(meal.id)
    );
  }}
  onDragEnd={() => {
    setDraggedMeal(null);
    setDragOverSlot(null);
  }}
onClick={() => {
  if (draggedMeal) {
    return;
  }

  onEditMeal?.(meal);
}}
  onKeyDown={(event) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      onEditMeal?.(meal);
    }
  }}
>
{meal.recipe_id && (() => {
  const recipe = recipes.find(
    (item) =>
      Number(item.id) ===
      Number(meal.recipe_id)
  );

  if (!recipe?.photo_url) {
    return null;
  }

  return (
    <button
      type="button"
      className="meal-week-meal-photo"
      title={`View ${meal.title} recipe`}
      onClick={(event) => {
        event.stopPropagation();
        onViewRecipe?.(recipe);
      }}
    >
      <img
        src={`${API_BASE_URL}${recipe.photo_url}`}
        alt={meal.title}
      />

      <span className="meal-week-photo-recipe-hint">
        <BookOpen size={14} />
        Recipe
      </span>
    </button>
  );
})()}

<div className="meal-week-meal-actions">
  <button
    type="button"
    className="meal-week-copy"
    title="Copy dinner to another day"
    aria-label="Copy dinner to another day"
    onClick={(event) => {
      event.stopPropagation();

      setMealToCopy(meal);
      setCopyMealDate(
        meal.meal_date || ""
      );
    }}
  >
    <Copy size={16} />
  </button>
</div>

    {meal.description && (
      <span>
        {meal.description}
      </span>
    )}

    <div className="meal-week-members">
      {(meal.members || []).map(
        (member) => (
          <span
            key={member.id}
            className="meal-week-member"
            title={member.name}
            style={{
              backgroundColor:
                member.colour,
            }}
          >
            {member.photo_url ? (
              <img
                src={`${API_BASE_URL}${member.photo_url}`}
                alt=""
              />
            ) : (
              member.initials ||
              member.name
                ?.charAt(0)
                .toUpperCase()
            )}
          </span>
        )
      )}
    </div>
  </div>
))}
                                  </div>
                                ) : (
<div className="meal-week-empty-actions">
  
  <button
    type="button"
    className="meal-week-add-slot"
    onClick={() =>
      onAddMeal?.({
        mealDate: dateKey,
        mealType,
      })
    }
  >
    <Plus size={20} />
    Add Dinner
  </button>

  <button
    type="button"
    className="meal-week-choose-recipe"
    onClick={() =>
      setSlotRecipePicker({
        mealDate: dateKey,
        mealType,
      })
    }
  >
    <BookOpen size={15} />
    Choose Recipe
  </button>
</div>
                                )}
                              </div>
                            );
                          }
                        )}
                                        </div>
                  </section>
                );
              }
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default MealsPage;

