const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const changes = [];
let api = fs.readFileSync('.food-image-fix/foodImageRoutes.before.cjs', 'utf8').replace(/\r\n/g, '\n');
let ui = fs.readFileSync('.food-image-fix/PantryItemModal.before.jsx', 'utf8').replace(/\r\n/g, '\n');
function edit(target, before, after) {
  const text = target === 'api' ? api : ui;
  if (text.split(before).length !== 2) throw new Error('Non-unique block: ' + before);
  if (target === 'api') api = text.replace(before, after);
  else ui = text.replace(before, after);
  changes.push({ file: target === 'api' ? 'C:/Users/Nevpe/Documents/FamilyHub-API/src/routes/foodImageRoutes.js' : 'C:/Users/Nevpe/Documents/FamilyHub/src/components/PantryItemModal.jsx', before, after });
}
edit('api', 'async function searchWikimediaFreshFoodOptions(\n  name\n) {', `// Explicit choices remain authoritative; old automatic product matches do not.
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
) {`);
edit('api', '  const rawSearchTerms =\n    new Map([', `  // These Commons photographs have been visually verified as raw ingredients.
  const preferredFile = new Map([
    ["potato", "File:Potato and cross section.jpg"],
    ["carrot", "File:Carrots.jpg"],
    ["apple", "File:Red Apple.jpg"],
    ["banana", "File:Banana-Single.jpg"],
    ["chicken breast", "File:Raw chicken slices.jpg"],
  ]).get(canonicalName);

  const rawSearchTerms =
    new Map([`);
const fetchStart = api.indexOf('    const response =', api.indexOf('async function searchWikimediaFreshFoodOptions'));
const fetchEnd = api.indexOf('    const options = [];', fetchStart);
edit('api', api.slice(fetchStart, fetchEnd), `    const urls = [url];
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

`);
edit('api', '    "gsrlimit",\n    "12"', '    "gsrlimit",\n    "40"');
edit('api', '    "iiprop",\n    "url|mime"', '    "iiprop",\n    "url|mime|extmetadata"');
edit('api', '        !mime.startsWith(\n          "image/"\n        ) ||\n        mime ===\n          "image/svg+xml" ||', '        !["image/jpeg", "image/png", "image/webp"].includes(mime) ||');
edit('api', '          "cake",\n          "cakes",', '          "bread", "muffin", "muffins", "cookie", "cookies",\n          "jam", "sauce", "puree", "flour", "powder", "dried",\n          "boiled", "mashed", "roast", "curry", "stew", "pizza",\n          "nugget", "nuggets", "breaded", "marinated", "seasoned",\n          "packet", "bottle", "logo", "drawing", "illustration",\n          "orchard", "garden", "gardens", "blossom", "blossoms", "seedling",\n          "leaves", "foliage", "growing", "harvest", "truck",\n          "fry", "tempura", "cobbler", "quesadilla", "udon", "spicy",\n          "art", "poster", "painting", "handbook", "book", "diseases",\n          "fungus", "wild", "plantain", "overexposed", "compressed",\n          "cake",\n          "cakes",');
edit('api', '          "sprout",\n          "sprouts",\n          "sprouting",', '          "sprouting",');
edit('api', `      const unwanted =
        unwantedWords.some(
          (word) =>
            titleWords.has(
              word
            )
        );`, `      const description = normalizeFreshFoodName(
        String(imageInfo?.extmetadata?.ImageDescription?.value || "")
          .replace(/<[^>]*>/g, " ")
      );
      const verified = page.title === preferredFile;
      const descriptionWords = new Set(description.split(/\\s+/));
      const unwanted = unwantedWords.some((word) =>
        titleWords.has(word) || descriptionWords.has(word)
      );`);
edit('api', '      if (unwanted) {', '      if (unwanted && !verified) {');
const start = api.indexOf('      const canonicalWords =', api.indexOf('async function searchWikimediaFreshFoodOptions'));
const end = api.indexOf('      if (!matchesFood)', start);
edit('api', api.slice(start, end), `      // Match whole aliases, not substrings (apple must not match pineapple).
      const aliases = [...FRESH_FOOD_ALIASES]
        .filter(([, canonical]) => canonical === canonicalName)
        .map(([alias]) => alias);
      const matchesFood = aliases.some((alias) =>
        (" " + normalizedTitle + " ").includes(" " + alias + " ")
      );
      const meat = /\\b(chicken|beef|pork|lamb|fish|salmon|tuna|prawns|sausages)\\b/.test(canonicalName);
      if (!verified && meat && !/\\b(raw|uncooked)\\b/.test(normalizedTitle + " " + description)) continue;
      if (canonicalName === "potato" && /\\bsweet\\b/.test(normalizedTitle)) continue;
      if (!verified && normalizedTitle.split(/\\s+/).length > 8) continue;
      if (!verified && !aliases.includes(normalizedTitle) &&
          !/\\b(raw|uncooked|fresh|whole|isolated)\\b|white background/.test(normalizedTitle)) continue;

`);
edit('api', '      if (!matchesFood) {', '      if (!matchesFood && !verified) {');
edit('api', '      let score =\n        2000;', '      let score = verified ? 10000 : 2000;\n      if (/\\b(raw|uncooked|isolated)\\b/.test(normalizedTitle)) score += 400;');
edit('api', '        matchedProduct:\n          title ||\n          canonicalName,', '        matchedProduct:\n          verified ? canonicalName : (title || canonicalName),');
edit('api', '        source:\n          "wikimedia-commons",', '        source: FRESH_IMAGE_SOURCE,');
edit('api', 'async function searchOpenFoodFacts(\n  name\n) {', 'async function searchOpenFoodFacts(\n  name\n) {\n  if (getCanonicalFreshFoodName(name)) {\n    return resolveFreshFoodImage(name);\n  }');
edit('api', `  const productOptions =
    await searchSearchALiciousOptions(
      automaticSearchName
    );`, `  const productOptions = canonicalFreshFood
    ? []
    : await searchSearchALiciousOptions(automaticSearchName);`);
edit('api', '      libraryImage?.image_url\n    ) {', '      isPreferredFreshImage(libraryImage)\n    ) {');
edit('api', `let cached =
  getCachedImage.get(
    cacheKey
  );`, `// Fresh lookup bypasses stale automatic product-cache entries.
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
  );`);
// Two independent callers (lookup and reset) must retain the provider's source.
for (const marker of ['router.get(\n  "/",', 'router.post(\n  "/reset",']) {
  const offset = api.indexOf(marker);
  const from = api.indexOf('      const result = {', offset);
  const to = api.indexOf('\n      };', from) + '\n      };'.length;
  const block = api.slice(from, to);
  edit('api', block, block.replace('? "open-food-facts"', '? (product.source || "open-food-facts")'));
}
// Refresh all aliases after each successful image mutation.
for (const fn of ['handleCustomImageUrl', 'handleRotateImage', 'handleResetImage']) {
  const from = ui.indexOf('async function ' + fn + '(');
  const to = ui.indexOf('\nasync function ', from + 1);
  const block = ui.slice(from, to);
  const needle = '    setCustomImageVersion(\n      (current) =>\n        current + 1\n    );';
  edit('ui', block, block.replace(needle, needle + '\n\n    notifyFoodImageChanged(cleanName);'));
}
edit('ui', `notifyFoodImageChanged(
  cleanName
);

/*
 * Tell every FoodPicture currently
 * on screen that this food's image
 * has changed.
 */

notifyFoodImageChanged(
  cleanName
);`, 'notifyFoodImageChanged(cleanName);');
edit('ui', '      option.imageUrl\n    }\n    alt={', '      option.imageUrl.startsWith("/uploads/")\n        ? `${API_BASE_URL}${option.imageUrl}`\n        : option.imageUrl\n    }\n    alt={');
fs.writeFileSync('.food-image-fix/foodImageRoutes.after.cjs', api);
fs.writeFileSync('src/components/PantryItemModal.jsx', ui);
fs.writeFileSync('.food-image-fix/changes.json', JSON.stringify(changes, null, 2));
fs.writeFileSync('FOOD-IMAGE-EDITS.md', '# Pantry food image edits\n\nEach block is complete. Apply in order. These edits build on the existing code.\n\n' + changes.map((c,i) => `## Edit ${i+1}\n\nExact file path: \`${c.file}\`\n\nComplete existing block to find:\n\n\`\`\`javascript\n${c.before}\n\`\`\`\n\nComplete replacement block:\n\n\`\`\`javascript\n${c.after}\n\`\`\`\n`).join('\n'));
console.log('Prepared', changes.length, 'complete replacement blocks.');
