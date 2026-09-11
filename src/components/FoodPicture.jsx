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
const normalizedName =
  String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ");

const matches = FOOD_PICTURES.filter(
  (food) =>
    food.words.some((word) =>
      normalizedName.includes(
        word.toLowerCase()
      )
    )
);

const match = matches.sort(
  (a, b) => {
    const longestA = Math.max(
      ...a.words.map(
        (word) => word.length
      )
    );

    const longestB = Math.max(
      ...b.words.map(
        (word) => word.length
      )
    );

    return longestB - longestA;
  }
)[0];

const picture =
  match?.picture ||
  CATEGORY_PICTURES[
    String(category).toLowerCase()
  ] ||
  "🛒";

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