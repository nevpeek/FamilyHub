# Pantry food image edits

Each block is complete. Apply in order. These edits build on the existing code.

## Edit 1

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
async function searchWikimediaFreshFoodOptions(
  name
) {
```

Complete replacement block:

```javascript
// Explicit choices remain authoritative; old automatic product matches do not.
const FRESH_IMAGE_SOURCE = "wikimedia-fresh-v2";
const freshImageRequests = new Map();

function isPreferredFreshImage(image) {
  return Boolean(image?.image_url && [
    "custom-upload", "open-food-facts-selected",
    "familyhub-fresh-library", FRESH_IMAGE_SOURCE,
  ].includes(image.source));
}

function savedFreshImage(canonicalName, originalName) {
  const library = getFreshFoodLibraryImage.get(canonicalName);
  if (isPreferredFreshImage(library)) {
    // Older uploads were saved with a generic library source. Keep Reset visible.
    const cached = getCachedImage.get(canonicalName);
    if (cached?.source === "custom-upload" && cached.image_url === library.image_url) {
      return { ...library, source: "custom-upload" };
    }
    return library;
  }
  for (const key of new Set([canonicalName, originalName.toLowerCase()])) {
    const cached = getCachedImage.get(key);
    if (isPreferredFreshImage(cached)) {
      saveFreshFoodLibraryImage.run(canonicalName, cached.image_url,
        cached.source, cached.matched_product || canonicalName,
        Number(cached.rotation || 0));
      return getFreshFoodLibraryImage.get(canonicalName);
    }
  }
  return null;
}

async function resolveFreshFoodImage(name) {
  const canonicalName = getCanonicalFreshFoodName(name);
  let saved = savedFreshImage(canonicalName, name);
  if (!saved) {
    if (!freshImageRequests.has(canonicalName)) {
      const request = (async () => {
        const options = await searchWikimediaFreshFoodOptions(canonicalName);
        // A user may have uploaded or selected an image during the search.
        const current = savedFreshImage(canonicalName, name);
        if (current || !options.length) return current;
        const best = options[0];
        saveFreshFoodLibraryImage.run(canonicalName, best.imageUrl,
          FRESH_IMAGE_SOURCE, best.matchedProduct, 0);
        return getFreshFoodLibraryImage.get(canonicalName);
      })().finally(() => freshImageRequests.delete(canonicalName));
      freshImageRequests.set(canonicalName, request);
    }
    saved = await freshImageRequests.get(canonicalName);
  }
  if (!saved) return null; // Retry later; never substitute a packaged product.
  saveCachedImage.run(canonicalName, canonicalName, saved.image_url,
    saved.source, saved.matched_product, null, Number(saved.rotation || 0));
  return { imageUrl: saved.image_url, source: saved.source,
    matchedProduct: saved.matched_product, barcode: null,
    rotation: Number(saved.rotation || 0), canonicalName };
}

async function searchWikimediaFreshFoodOptions(
  name
) {
```

## Edit 2

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
  const rawSearchTerms =
    new Map([
```

Complete replacement block:

```javascript
  // These Commons photographs have been visually verified as raw ingredients.
  const preferredFile = new Map([
    ["potato", "File:Potato and cross section.jpg"],
    ["carrot", "File:Carrots.jpg"],
    ["apple", "File:Red Apple.jpg"],
    ["banana", "File:Banana-Single.jpg"],
    ["chicken breast", "File:Raw chicken slices.jpg"],
  ]).get(canonicalName);

  const rawSearchTerms =
    new Map([
```

## Edit 3

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
    const response =
      await fetch(
        url,
        {
          headers: {
            "User-Agent":
              "FamilyHub/0.1 (personal family dashboard)",

            Accept:
              "application/json",
          },

          signal:
            AbortSignal.timeout(
              8000
            ),
        }
      );

    if (!response.ok) {
      throw new Error(
        `Wikimedia Commons returned ${response.status}`
      );
    }

    const data =
      await response.json();

    const pages =
      Object.values(
        data?.query?.pages ||
          {}
      );


```

Complete replacement block:

```javascript
    const urls = [url];
    if (preferredFile) {
      const preferredUrl = new URL(url);
      for (const key of ["generator", "gsrsearch", "gsrnamespace", "gsrlimit"]) {
        preferredUrl.searchParams.delete(key);
      }
      preferredUrl.searchParams.set("titles", preferredFile);
      urls.unshift(preferredUrl);
    }
    const responses = await Promise.allSettled(urls.map(async (requestUrl) => {
      const response = await fetch(requestUrl, {
        headers: { "User-Agent": "FamilyHub/0.1 (personal family dashboard)",
          Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error("Wikimedia returned " + response.status);
      const data = await response.json();
      if (data.error) throw new Error(data.error.info || "Wikimedia search failed");
      return Object.values(data?.query?.pages || {});
    }));
    const pages = [];
    for (const result of responses) {
      if (result.status === "fulfilled") pages.push(...result.value);
      else console.error("Fresh-food source unavailable:", result.reason.message);
    }


```

## Edit 4

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
    "gsrlimit",
    "12"
```

Complete replacement block:

```javascript
    "gsrlimit",
    "40"
```

## Edit 5

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
    "iiprop",
    "url|mime"
```

Complete replacement block:

```javascript
    "iiprop",
    "url|mime|extmetadata"
```

## Edit 6

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
        !mime.startsWith(
          "image/"
        ) ||
        mime ===
          "image/svg+xml" ||
```

Complete replacement block:

```javascript
        !["image/jpeg", "image/png", "image/webp"].includes(mime) ||
```

## Edit 7

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
          "cake",
          "cakes",
```

Complete replacement block:

```javascript
          "bread", "muffin", "muffins", "cookie", "cookies",
          "jam", "sauce", "puree", "flour", "powder", "dried",
          "boiled", "mashed", "roast", "curry", "stew", "pizza",
          "nugget", "nuggets", "breaded", "marinated", "seasoned",
          "packet", "bottle", "logo", "drawing", "illustration",
          "orchard", "garden", "gardens", "blossom", "blossoms", "seedling",
          "leaves", "foliage", "growing", "harvest", "truck",
          "fry", "tempura", "cobbler", "quesadilla", "udon", "spicy",
          "art", "poster", "painting", "handbook", "book", "diseases",
          "fungus", "wild", "plantain", "overexposed", "compressed",
          "cake",
          "cakes",
```

## Edit 8

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
          "sprout",
          "sprouts",
          "sprouting",
```

Complete replacement block:

```javascript
          "sprouting",
```

## Edit 9

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
      const unwanted =
        unwantedWords.some(
          (word) =>
            titleWords.has(
              word
            )
        );
```

Complete replacement block:

```javascript
      const description = normalizeFreshFoodName(
        String(imageInfo?.extmetadata?.ImageDescription?.value || "")
          .replace(/<[^>]*>/g, " ")
      );
      const verified = page.title === preferredFile;
      const descriptionWords = new Set(description.split(/\s+/));
      const unwanted = unwantedWords.some((word) =>
        titleWords.has(word) || descriptionWords.has(word)
      );
```

## Edit 10

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
      if (unwanted) {
```

Complete replacement block:

```javascript
      if (unwanted && !verified) {
```

## Edit 11

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
      const canonicalWords =
        canonicalName
          .split(/\s+/)
          .filter(Boolean);

      const matchesFood =
        canonicalWords.every(
          (word) =>
            normalizedTitle.includes(
              word
            )
        );


```

Complete replacement block:

```javascript
      // Match whole aliases, not substrings (apple must not match pineapple).
      const aliases = [...FRESH_FOOD_ALIASES]
        .filter(([, canonical]) => canonical === canonicalName)
        .map(([alias]) => alias);
      const matchesFood = aliases.some((alias) =>
        (" " + normalizedTitle + " ").includes(" " + alias + " ")
      );
      const meat = /\b(chicken|beef|pork|lamb|fish|salmon|tuna|prawns|sausages)\b/.test(canonicalName);
      if (!verified && meat && !/\b(raw|uncooked)\b/.test(normalizedTitle + " " + description)) continue;
      if (canonicalName === "potato" && /\bsweet\b/.test(normalizedTitle)) continue;
      if (!verified && normalizedTitle.split(/\s+/).length > 8) continue;
      if (!verified && !aliases.includes(normalizedTitle) &&
          !/\b(raw|uncooked|fresh|whole|isolated)\b|white background/.test(normalizedTitle)) continue;


```

## Edit 12

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
      if (!matchesFood) {
```

Complete replacement block:

```javascript
      if (!matchesFood && !verified) {
```

## Edit 13

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
      let score =
        2000;
```

Complete replacement block:

```javascript
      let score = verified ? 10000 : 2000;
      if (/\b(raw|uncooked|isolated)\b/.test(normalizedTitle)) score += 400;
```

## Edit 14

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
        matchedProduct:
          title ||
          canonicalName,
```

Complete replacement block:

```javascript
        matchedProduct:
          verified ? canonicalName : (title || canonicalName),
```

## Edit 15

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
        source:
          "wikimedia-commons",
```

Complete replacement block:

```javascript
        source: FRESH_IMAGE_SOURCE,
```

## Edit 16

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
async function searchOpenFoodFacts(
  name
) {
```

Complete replacement block:

```javascript
async function searchOpenFoodFacts(
  name
) {
  if (getCanonicalFreshFoodName(name)) {
    return resolveFreshFoodImage(name);
  }
```

## Edit 17

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
  const productOptions =
    await searchSearchALiciousOptions(
      automaticSearchName
    );
```

Complete replacement block:

```javascript
  const productOptions = canonicalFreshFood
    ? []
    : await searchSearchALiciousOptions(automaticSearchName);
```

## Edit 18

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
      libraryImage?.image_url
    ) {
```

Complete replacement block:

```javascript
      isPreferredFreshImage(libraryImage)
    ) {
```

## Edit 19

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
let cached =
  getCachedImage.get(
    cacheKey
  );
```

Complete replacement block:

```javascript
// Fresh lookup bypasses stale automatic product-cache entries.
if (canonicalFreshFood) {
  try {
    const wasSaved = Boolean(savedFreshImage(canonicalFreshFood, name));
    const image = await resolveFreshFoodImage(name);
    return res.json({ success: true, name, canonicalName: canonicalFreshFood,
      imageUrl: null, source: null, matchedProduct: null, barcode: null,
      rotation: 0, ...image, cached: wasSaved });
  } catch (error) {
    console.error("Fresh food image lookup failed:", error.message);
    return res.json({ success: true, name, canonicalName: canonicalFreshFood,
      imageUrl: null, source: null, matchedProduct: null, barcode: null,
      rotation: 0, cached: false });
  }
}

let cached =
  getCachedImage.get(
    cacheKey
  );
```

## Edit 20

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
      const result = {
        success: true,
        name,
        imageUrl:
          product?.imageUrl ||
          null,
        source:
          product
            ? "open-food-facts"
            : null,
        matchedProduct:
          product?.matchedProduct ||
          null,
        barcode:
          product?.barcode ||
          null,
      };
```

Complete replacement block:

```javascript
      const result = {
        success: true,
        name,
        imageUrl:
          product?.imageUrl ||
          null,
        source:
          product
            ? (product.source || "open-food-facts")
            : null,
        matchedProduct:
          product?.matchedProduct ||
          null,
        barcode:
          product?.barcode ||
          null,
      };
```

## Edit 21

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js`

Complete existing block to find:

```javascript
      const result = {
        success: true,
        name,

        imageUrl:
          product?.imageUrl ||
          null,

        source:
          product
            ? "open-food-facts"
            : null,

        matchedProduct:
          product?.matchedProduct ||
          null,

        barcode:
          product?.barcode ||
          null,
      };
```

Complete replacement block:

```javascript
      const result = {
        success: true,
        name,

        imageUrl:
          product?.imageUrl ||
          null,

        source:
          product
            ? (product.source || "open-food-facts")
            : null,

        matchedProduct:
          product?.matchedProduct ||
          null,

        barcode:
          product?.barcode ||
          null,
      };
```

## Edit 22

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub/src/components/PantryItemModal.jsx`

Complete existing block to find:

```javascript
async function handleCustomImageUrl() {
  const cleanName =
    name.trim();

  const cleanUrl =
    customImageUrl.trim();

  if (!cleanName) {
    setError(
      "Enter the item name before choosing an image."
    );
    return;
  }

  if (!cleanUrl) {
    setError(
      "Paste an image URL first."
    );
    return;
  }

  setImageActionLoading(true);
  setError("");

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/custom-url`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },

          body: JSON.stringify({
            name: cleanName,
            imageUrl: cleanUrl,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to use image URL"
      );
    }

    setImageLookupName(
      cleanName
    );

    setImageSource(
      "custom-upload"
    );

    setCustomImageVersion(
      (current) =>
        current + 1
    );

    setCustomImageUrl("");
    setImageUrlMode(false);
    setChangeImageOpen(false);
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to use image URL"
    );
  } finally {
    setImageActionLoading(false);
  }
}

```

Complete replacement block:

```javascript
async function handleCustomImageUrl() {
  const cleanName =
    name.trim();

  const cleanUrl =
    customImageUrl.trim();

  if (!cleanName) {
    setError(
      "Enter the item name before choosing an image."
    );
    return;
  }

  if (!cleanUrl) {
    setError(
      "Paste an image URL first."
    );
    return;
  }

  setImageActionLoading(true);
  setError("");

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/custom-url`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },

          body: JSON.stringify({
            name: cleanName,
            imageUrl: cleanUrl,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to use image URL"
      );
    }

    setImageLookupName(
      cleanName
    );

    setImageSource(
      "custom-upload"
    );

    setCustomImageVersion(
      (current) =>
        current + 1
    );

    notifyFoodImageChanged(cleanName);

    setCustomImageUrl("");
    setImageUrlMode(false);
    setChangeImageOpen(false);
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to use image URL"
    );
  } finally {
    setImageActionLoading(false);
  }
}

```

## Edit 23

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub/src/components/PantryItemModal.jsx`

Complete existing block to find:

```javascript
async function handleRotateImage(
  direction
) {
  const cleanName =
    name.trim();

  if (!cleanName) {
    setError(
      "Enter the item name before rotating the image."
    );
    return;
  }

  setImageActionLoading(true);
  setError("");

  try {
    const currentResponse =
      await fetch(
        `${API_BASE_URL}/api/food-images?name=${encodeURIComponent(
          cleanName
        )}`,
        {
          headers: {
            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },
        }
      );

    const currentData =
      await currentResponse.json();

    if (!currentResponse.ok) {
      throw new Error(
        currentData.error ||
          "Unable to read image rotation"
      );
    }

    const currentRotation =
      Number(
        currentData.rotation || 0
      );

    const nextRotation =
      direction === "left"
        ? (currentRotation + 270) %
          360
        : (currentRotation + 90) %
          360;

    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/rotation`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },

          body: JSON.stringify({
            name: cleanName,
            rotation:
              nextRotation,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to rotate image"
      );
    }

    setCustomImageVersion(
      (current) =>
        current + 1
    );
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to rotate image"
    );
  } finally {
    setImageActionLoading(false);
  }
}

```

Complete replacement block:

```javascript
async function handleRotateImage(
  direction
) {
  const cleanName =
    name.trim();

  if (!cleanName) {
    setError(
      "Enter the item name before rotating the image."
    );
    return;
  }

  setImageActionLoading(true);
  setError("");

  try {
    const currentResponse =
      await fetch(
        `${API_BASE_URL}/api/food-images?name=${encodeURIComponent(
          cleanName
        )}`,
        {
          headers: {
            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },
        }
      );

    const currentData =
      await currentResponse.json();

    if (!currentResponse.ok) {
      throw new Error(
        currentData.error ||
          "Unable to read image rotation"
      );
    }

    const currentRotation =
      Number(
        currentData.rotation || 0
      );

    const nextRotation =
      direction === "left"
        ? (currentRotation + 270) %
          360
        : (currentRotation + 90) %
          360;

    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/rotation`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },

          body: JSON.stringify({
            name: cleanName,
            rotation:
              nextRotation,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to rotate image"
      );
    }

    setCustomImageVersion(
      (current) =>
        current + 1
    );

    notifyFoodImageChanged(cleanName);
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to rotate image"
    );
  } finally {
    setImageActionLoading(false);
  }
}

```

## Edit 24

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub/src/components/PantryItemModal.jsx`

Complete existing block to find:

```javascript
async function handleResetImage() {
  
  const cleanName =
    name.trim();

  if (!cleanName) {
    return;
  }

  setImageActionLoading(true);
  setError("");

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/reset`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },

          body: JSON.stringify({
            name: cleanName,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to reset image"
      );
    }

    setImageLookupName(
      cleanName
    );

    setImageSource(
      data.source || null
    );

    setCustomImageVersion(
      (current) =>
        current + 1
    );

    setCustomImageUrl("");
    setImageUrlMode(false);
    setChangeImageOpen(false);
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to reset image"
    );
  } finally {
    setImageActionLoading(false);
  }
}

```

Complete replacement block:

```javascript
async function handleResetImage() {
  
  const cleanName =
    name.trim();

  if (!cleanName) {
    return;
  }

  setImageActionLoading(true);
  setError("");

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/food-images/reset`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "X-FamilyHub-Key":
              FAMILYHUB_API_KEY,
          },

          body: JSON.stringify({
            name: cleanName,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to reset image"
      );
    }

    setImageLookupName(
      cleanName
    );

    setImageSource(
      data.source || null
    );

    setCustomImageVersion(
      (current) =>
        current + 1
    );

    notifyFoodImageChanged(cleanName);

    setCustomImageUrl("");
    setImageUrlMode(false);
    setChangeImageOpen(false);
  } catch (err) {
    console.error(err);

    setError(
      err.message ||
        "Unable to reset image"
    );
  } finally {
    setImageActionLoading(false);
  }
}

```

## Edit 25

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub/src/components/PantryItemModal.jsx`

Complete existing block to find:

```javascript
notifyFoodImageChanged(
  cleanName
);

/*
 * Tell every FoodPicture currently
 * on screen that this food's image
 * has changed.
 */

notifyFoodImageChanged(
  cleanName
);
```

Complete replacement block:

```javascript
notifyFoodImageChanged(cleanName);
```

## Edit 26

Exact file path: `C:/Users/Nevpe/Documents/FamilyHub/src/components/PantryItemModal.jsx`

Complete existing block to find:

```javascript
      option.imageUrl
    }
    alt={
```

Complete replacement block:

```javascript
      option.imageUrl.startsWith("/uploads/")
        ? `${API_BASE_URL}${option.imageUrl}`
        : option.imageUrl
    }
    alt={
```

## Verification

Applied to the two exact paths above. All replacement blocks were replayed against the saved pre-edit files and matched the installed files exactly.

- Production build passed.
- Backend syntax check passed.
- Frontend lint reported only two existing effect warnings.
- Potato, carrot, apple, banana and chicken breast passed isolated route tests and running-API checks.
- Visually checked the five preferred raw-food photographs.
- Confirmed each running result is saved in fresh_food_image_library and reused for 2kg/plural aliases.
- Existing selected banana image was preserved. New automatic banana searches prefer the verified raw banana photograph.
- Tested packaged-product routing for Weet-Bix, Coca-Cola, Nutella and Heinz with controlled Search-a-licious responses.
- Tested stale automatic cache repair, explicit-image preservation, gallery, rotation, selection, reset, failed lookup retries, concurrent requests and user changes during lookup using an isolated SQLite database.
- The running API automatically reloaded. One live chicken-breast lookup initially failed; retry succeeded and persisted the image.

Provider API reference: [MediaWiki Imageinfo](https://www.mediawiki.org/wiki/API:Imageinfo).
