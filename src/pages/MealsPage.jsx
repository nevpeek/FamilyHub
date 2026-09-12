import { API_BASE_URL } from "../config/api";
import { useEffect, useMemo, useState } from "react";
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

  const [
    mealTypeFilter,
    setMealTypeFilter,
  ] = useState("all");

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
  async function loadMeals() {
      setLoading(true);
      setError("");

      try {
        const params =
          new URLSearchParams({
            start:
              toDateKey(weekStart),
            end:
              toDateKey(weekEnd),
          });

        if (
          selectedMemberId !== "all"
        ) {
          params.set(
            "memberId",
            String(selectedMemberId)
          );
        }

        if (
          mealTypeFilter !== "all"
        ) {
          params.set(
            "mealType",
            mealTypeFilter
          );
        }

        const response =
          await fetch(
            `${API_BASE_URL}/api/meals?${params.toString()}`
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load meals"
          );
        }

        const data =
          await response.json();

        setMeals(
          data.meals || []
        );
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load meals"
        );
      } finally {
        setLoading(false);
      }
    }

    loadMeals();
  }, [
    selectedMemberId,
    mealTypeFilter,
    mealRefreshKey,
    weekStart,
  ]);

  useEffect(() => {
    async function loadRecipes() {
      setRecipesLoading(true);
      setRecipesError("");

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/recipes`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load recipes"
          );
        }

        setRecipes(
          data.recipes || []
        );
      } catch (err) {
        console.error(err);

        setRecipesError(
          err.message ||
            "Unable to load recipes"
        );
      } finally {
        setRecipesLoading(false);
      }
    }

    loadRecipes();
  }, [
    recipeRefreshKey,
  ]);

    useEffect(() => {
    async function loadWheelGroups() {
      setWheelGroupsLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/meal-wheel-groups`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load wheel groups"
          );
        }

        setWheelGroups(
          data.groups || []
        );
      } catch (error) {
        console.error(
          "Unable to load wheel groups:",
          error
        );

        setWheelGroups([]);
      } finally {
        setWheelGroupsLoading(false);
      }
    }

    loadWheelGroups();
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
    "breakfast",
    "lunch",
    "dinner",
    "snack",
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
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ");

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

    async function handleWheelGroupChange(
    value
  ) {
    setWheelGroup(value);
    setWheelResult(null);
    setWheelRotation(0);

    if (
      !value.startsWith("custom:")
    ) {
      setWheelCustomRecipes([]);
      return;
    }

    const groupId =
      value.replace("custom:", "");

    setWheelCustomGroupLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/meal-wheel-groups/${groupId}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load wheel group"
        );
      }

      setWheelCustomRecipes(
        data.group.recipes || []
      );
    } catch (error) {
      console.error(
        "Unable to load custom wheel group:",
        error
      );

      setWheelCustomRecipes([]);
    } finally {
      setWheelCustomGroupLoading(false);
    }
  }

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

      const ingredientsToBuy =
        ingredients
          .map((ingredient, index) => ({
            ingredient,
            index,
          }))
          .filter(({ ingredient }) => {
            const ingredientName =
              ingredient?.name
                ?.trim()
                .toLowerCase();

            if (!ingredientName) {
              return true;
            }

            return !availablePantryItems.some(
              (pantryItem) => {
                const pantryName =
                  pantryItem.name
                    ?.trim()
                    .toLowerCase();

                if (!pantryName) {
                  return false;
                }

                return (
                  ingredientName.includes(
                    pantryName
                  ) ||
                  pantryName.includes(
                    ingredientName
                  )
                );
              }
            );
          })
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
    ingredient.quantity ||
    (
      ingredient.occurrences > 1
        ? String(
            ingredient.occurrences
          )
        : null
    ),
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
        ? "Meal Planner"
        : "Recipe Library"}
    </h2>

    <p>
      {view === "planner"
        ? "Plan meals for the family and keep dinner organised."
        : "Save your favourite family meals, recipes and photos."}
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
              : "Add Meal"}
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
        Meal Planner
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

  {view === "planner" && (
    <div className="meal-type-filters">
      {[
        "all",
        "breakfast",
        "lunch",
        "dinner",
        "snack",
      ].map((type) => (
        <button
          type="button"
          key={type}
          className={
            mealTypeFilter === type
              ? "selected"
              : ""
          }
          onClick={() =>
            setMealTypeFilter(type)
          }
        >
          {type === "all"
            ? "All"
            : type
                .charAt(0)
                .toUpperCase() +
              type.slice(1)}
        </button>
      ))}
    </div>
  )}
</section>

{view === "recipes" && (
        <section className="recipe-library">
          <div className="recipe-library-toolbar">
            <div>
              <strong>
                {recipes.length} saved{" "}
                {recipes.length === 1
                  ? "recipe"
                  : "recipes"}
              </strong>

              <span>
                Your family's saved meals
                and favourites.
              </span>
            </div>

        
                   </div>

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

            <div className="recipe-quick-filter-divider" />

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
                className="recipe-details-modal"
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
                            weekShoppingIngredients.map(
                              (_, index) => index
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

                              {alreadyHave && (
                                <span className="recipe-shopping-pantry-badge">
                                  Already Have
                                </span>
                              )}
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
        <div className="meal-shopping-message">
          {shoppingMessage}
        </div>
      )}

      <section className="meal-week-navigation">
        <button
          type="button"
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
          ← Previous
        </button>

        <div className="meal-week-title">
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
        </div>

        <button
          type="button"
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
          Next →
        </button>
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
                                <div className="meal-week-slot-heading">
                                  <Icon
                                    size={
                                      15
                                    }
                                  />

                                  <span>
                                    {mealType
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
<div className="meal-week-meal-heading">
  <strong>
    {meal.title}
  </strong>

  <div className="meal-week-meal-actions">
    {meal.recipe_id && (
      <button
        type="button"
        className="meal-week-recipe"
        title="View recipe"
        onClick={(event) => {
          event.stopPropagation();

          const recipe =
            recipes.find(
              (item) =>
                Number(item.id) ===
                Number(meal.recipe_id)
            );

          if (recipe) {
            onViewRecipe?.(recipe);
          }
        }}
      >
        <BookOpen size={14} />
      </button>
    )}

    <button
      type="button"
      className="meal-week-copy"
      title="Copy meal"
      onClick={(event) => {
        event.stopPropagation();

        setMealToCopy(meal);
        setCopyMealDate(
          meal.meal_date || ""
        );
      }}
    >
      <Copy size={14} />
    </button>
  </div>
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
    <Plus size={16} />
    Add
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
