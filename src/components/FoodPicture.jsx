import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  API_BASE_URL,
} from "../config/api";

const FAMILYHUB_API_KEY =
  import.meta.env
    .VITE_FAMILYHUB_API_KEY;

const FOOD_PICTURES = [
  {
    words: ["milk"],
    picture: "🥛",
  },
  {
    words: ["bread", "toast", "roll"],
    picture: "🍞",
  },
  {
    words: ["egg", "eggs"],
    picture: "🥚",
  },
  {
    words: ["cheese"],
    picture: "🧀",
  },
  {
    words: ["butter"],
    picture: "🧈",
  },
  {
    words: ["banana", "bananas"],
    picture: "🍌",
  },
  {
    words: ["apple", "apples"],
    picture: "🍎",
  },
  {
    words: ["orange", "oranges"],
    picture: "🍊",
  },
  {
    words: ["lemon", "lemons"],
    picture: "🍋",
  },
  {
    words: ["grape", "grapes"],
    picture: "🍇",
  },
  {
    words: ["strawberry", "strawberries"],
    picture: "🍓",
  },
  {
    words: ["watermelon"],
    picture: "🍉",
  },
  {
    words: ["avocado"],
    picture: "🥑",
  },
  {
    words: ["tomato", "tomatoes"],
    picture: "🍅",
  },
  {
    words: ["potato", "potatoes"],
    picture: "🥔",
  },
  {
    words: ["carrot", "carrots"],
    picture: "🥕",
  },
  {
    words: ["corn"],
    picture: "🌽",
  },
  {
    words: ["broccoli"],
    picture: "🥦",
  },
  {
    words: ["lettuce", "salad"],
    picture: "🥬",
  },
  {
    words: ["onion", "onions"],
    picture: "🧅",
  },
  {
    words: ["garlic"],
    picture: "🧄",
  },
  {
    words: ["mushroom", "mushrooms"],
    picture: "🍄",
  },
  {
    words: [
      "chicken",
      "chicken breast",
      "chicken thigh",
    ],
    picture: "🍗",
  },
  {
    words: [
      "beef",
      "steak",
      "mince",
      "meat",
    ],
    picture: "🥩",
  },
  {
    words: ["bacon"],
    picture: "🥓",
  },
  {
    words: ["fish", "salmon", "tuna"],
    picture: "🐟",
  },
  {
    words: ["rice"],
    picture: "🍚",
  },
  {
    words: ["pasta", "spaghetti"],
    picture: "🍝",
  },
  {
    words: ["pizza"],
    picture: "🍕",
  },
  {
    words: ["coffee"],
    picture: "☕",
  },
  {
    words: ["juice"],
    picture: "🧃",
  },
{
  words: [
    "soft drink",
    "softdrink",
    "coke",
    "cola",
    "pepsi",
    "lemonade",
  ],
  picture: "🥤",
},
{
  words: [
    "water",
    "mineral water",
    "sparkling water",
  ],
  picture: "💧",
},
{
  words: [
    "cereal",
    "corn flakes",
    "cornflakes",
    "weet-bix",
    "weetbix",
    "muesli",
    "granola",
  ],
  picture: "🥣",
},
{
  words: [
    "flour",
    "plain flour",
    "self raising flour",
    "self-raising flour",
  ],
  picture: "🌾",
},
{
  words: [
    "sugar",
    "brown sugar",
    "icing sugar",
  ],
  picture: "🧂",
},
{
  words: ["salt"],
  picture: "🧂",
},
{
  words: [
    "chips",
    "crisps",
    "potato chips",
  ],
  picture: "🍟",
},
{
  words: [
    "biscuits",
    "biscuit",
    "cookies",
    "cookie",
  ],
  picture: "🍪",
},
{
  words: [
    "chocolate",
    "choc",
  ],
  picture: "🍫",
},
{
  words: [
    "ice cream",
    "icecream",
  ],
  picture: "🍨",
},
{
  words: [
    "yoghurt",
    "yogurt",
  ],
  picture: "🥛",
},
{
  words: [
    "sausages",
    "sausage",
    "hot dogs",
    "hot dog",
  ],
  picture: "🌭",
},
{
  words: [
    "burger",
    "burgers",
    "hamburger",
  ],
  picture: "🍔",
},
{
  words: [
    "taco",
    "tacos",
  ],
  picture: "🌮",
},
{
  words: [
    "beans",
    "kidney beans",
    "black beans",
  ],
  picture: "🫘",
},
{
  words: [
    "peanuts",
    "peanut",
    "nuts",
  ],
  picture: "🥜",
},
{
  words: [
    "honey",
  ],
  picture: "🍯",
},
{
  words: [
    "jam",
    "strawberry jam",
  ],
  picture: "🍓",
},
{
  words: [
    "butter chicken sauce",
    "curry sauce",
    "pasta sauce",
    "sauce",
    "tomato sauce",
    "bbq sauce",
    "barbecue sauce",
    "ketchup",
  ],
    picture: "🥫",
},
{
  words: [
    "tin",
    "tinned",
    "canned",
  ],
  picture: "🥫",
},

];

const CATEGORY_PICTURES = {
  fruit: "🍎",
  vegetables: "🥕",
  vegetable: "🥕",
  dairy: "🥛",
  meat: "🥩",
  bakery: "🍞",
  frozen: "❄️",
  drinks: "🧃",
  pantry: "🥫",
  other: "🛒",
};

function FoodPicture({
  name = "",
  category = "other",
  size = "normal",
}) {

const [imageUrl, setImageUrl] =
  useState(null);

const [imageFailed, setImageFailed] =
  useState(false);

const [imageRotation, setImageRotation] =
  useState(0);

  const normalizedName =
    String(name)
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9\s-]/g,
        " "
      )
      .replace(/\s+/g, " ");

  const matches =
    FOOD_PICTURES.filter(
      (food) =>
        food.words.some(
          (word) =>
            normalizedName.includes(
              word.toLowerCase()
            )
        )
    );

  const match =
    matches.sort(
      (a, b) => {
        const longestA =
          Math.max(
            ...a.words.map(
              (word) =>
                word.length
            )
          );

        const longestB =
          Math.max(
            ...b.words.map(
              (word) =>
                word.length
            )
          );

        return (
          longestB -
          longestA
        );
      }
    )[0];

  const picture =
    match?.picture ||
    CATEGORY_PICTURES[
      String(
        category
      ).toLowerCase()
    ] ||
    "🛒";

const loadImage =
  useCallback(
    async () => {
      const cleanName =
        String(name).trim();

      if (!cleanName) {
        setImageUrl(null);
        setImageFailed(false);
        setImageRotation(0);
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/food-images?name=${encodeURIComponent(
              cleanName
            )}`,
            {
              headers: {
                "X-FamilyHub-Key":
                  FAMILYHUB_API_KEY,
              },

              cache:
                "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (data?.imageUrl) {
          const resolvedImageUrl =
            data.imageUrl.startsWith(
              "/uploads/"
            )
              ? `${API_BASE_URL}${data.imageUrl}`
              : data.imageUrl;

          setImageUrl(
            resolvedImageUrl
          );

          const savedRotation =
            Number(
              data.rotation || 0
            );

          setImageRotation(
            [0, 90, 180, 270].includes(
              savedRotation
            )
              ? savedRotation
              : 0
          );

          setImageFailed(false);
        } else {
          setImageUrl(null);
          setImageRotation(0);
          setImageFailed(false);
        }
      } catch (error) {
        console.error(
          "Food image lookup failed:",
          error
        );
      }
    },
    [name]
  );

useEffect(() => {
  loadImage();
}, [loadImage]);

useEffect(() => {
  function handleFoodImageChanged(
    event
  ) {
    const changedName =
      String(
        event.detail?.name || ""
      )
        .trim()
        .toLowerCase();

    const currentName =
      String(name)
        .trim()
        .toLowerCase();

    /*
     * Reload all FoodPicture
     * components when an image
     * changes.
     *
     * This deliberately also
     * handles aliases such as:
     *
     * Banana
     * Bananas
     * Fresh Bananas
     *
     * because those can share one
     * canonical master image.
     */

    if (
      !changedName ||
      !currentName
    ) {
      return;
    }

    loadImage();
  }

  window.addEventListener(
    "familyhub-food-image-changed",
    handleFoodImageChanged
  );

  return () => {
    window.removeEventListener(
      "familyhub-food-image-changed",
      handleFoodImageChanged
    );
  };
}, [name, loadImage]);

  if (
    imageUrl &&
    !imageFailed
  ) {

return (
  <span
    className={`food-picture food-picture-${size} food-picture-real`}
  >
    <img
      src={imageUrl}
      alt=""
      loading="lazy"
      onError={() =>
        setImageFailed(true)
      }
      className={
        imageRotation === 90 ||
        imageRotation === 270
          ? "food-picture-image food-picture-image-sideways"
          : "food-picture-image"
      }
      style={{
        transform:
          imageRotation === 90
            ? "rotate(90deg)"
            : imageRotation === 180
              ? "rotate(180deg)"
              : imageRotation === 270
                ? "rotate(270deg)"
                : "none",
      }}
    />
  </span>
);
  }

  return (
    <span
      className={`food-picture food-picture-${size}`}
      aria-hidden="true"
    >
      {picture}
    </span>
  );
}

export default FoodPicture;