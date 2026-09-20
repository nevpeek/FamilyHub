const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const apiRequire = createRequire('C:/Users/Nevpe/Documents/FamilyHub-API/package.json');
const Database = apiRequire('better-sqlite3');
const source = fs.readFileSync('.food-image-fix/foodImageRoutes.after.cjs', 'utf8');
function harness(fetchImpl) {
  const db = new Database(':memory:');
  db.exec(`CREATE TABLE food_image_cache (search_name TEXT, cache_key TEXT UNIQUE, image_url TEXT, source TEXT, matched_product TEXT, barcode TEXT, rotation INTEGER, updated_at TEXT);
    CREATE TABLE fresh_food_image_library (canonical_name TEXT UNIQUE, image_url TEXT, source TEXT, matched_product TEXT, rotation INTEGER, updated_at TEXT);`);
  const routes = {};
  const router = { use() {}, get: (p, f) => routes['GET ' + p] = f, post: (p, ...f) => routes['POST ' + p] = f.at(-1) };
  const context = vm.createContext({require: (name) => name === '../database/db' ? db : name === 'express' ? {Router: () => router} : apiRequire(name),
    __dirname: 'C:/Users/Nevpe/Documents/FamilyHub-API/src/routes', module: { exports: {} },
    console, URL, AbortSignal,
    fetch: fetchImpl === fetch ? fetch : (url, options) => new URL(url).searchParams.has('titles')
      ? Promise.resolve({ok: true, json: async () => ({query: {pages: {}}})})
      : fetchImpl(url, options), Buffer, setTimeout, clearTimeout});
  vm.runInContext(source + '\nmodule.exports = { getCanonicalFreshFoodName, searchWikimediaFreshFoodOptions, resolveFreshFoodImage };', context);
  const call = async (method, route, name, body = {}) => {
    let result;
    const res = {json: (data) => {result = data; return data;}, status: () => res};
    await routes[method + ' ' + route]({query: {name}, body: {name, ...body}}, res);
    return result;
  };
  return { db, call, functions: context.module.exports };
}
const foods = ['potato', 'carrot', 'apple', 'banana', 'chicken breast'];
function page(title, description = title) {
  return {title: 'File:' + title + '.jpg', imageinfo: [{mime: 'image/jpeg',
    thumburl: 'https://images.example/' + encodeURIComponent(title) + '.jpg',
    extmetadata: {ImageDescription: {value: description}}}]};
}
async function tests() {
  let calls = 0;
  const h = harness(async (url) => {
    assert.equal(new URL(url).hostname, 'commons.wikimedia.org');
    calls++;
    const food = new URL(url).searchParams.get('gsrsearch').replace(/\braw\b/g, '').trim();
    return {ok: true, json: async () => ({query: {pages: Object.fromEntries([
      page(food + ' cake'), page(food + ' chips'), page(food + ' juice'),
      page(food + ' flowers'), page(food + ' plant'), page('Cooked ' + food),
      page('Pineapple'), page('Chicken breast'),
      page(food, 'A cooked meal'), page('Raw ' + food + ' isolated on white background'),
    ].map((p, i) => [i, p]))}})};
  });
  for (const food of foods) {
    const first = await h.call('GET', '/', food);
    assert.match(first.matchedProduct, /^Raw /);
    assert.equal(first.source, 'wikimedia-fresh-v2');
    const count = calls;
    const plural = food === 'potato' ? 'potatoes' : food + 's';
    for (const alias of [plural, '2kg ' + plural, 'Fresh ' + plural, '1.5kg ' + plural]) {
      const next = await h.call('GET', '/', alias);
      assert.equal(next.imageUrl, first.imageUrl, alias);
      assert.equal(next.cached, true);
    }
    assert.equal(calls, count, 'Aliases must not search again');
    const options = await h.call('GET', '/options', food);
    assert.equal(options.options[0].preferred, true);
    assert(options.options.every(o => o.preferred || o.matchedProduct.startsWith('Raw ')));
    await h.call('POST', '/rotation', plural, {rotation: 90});
    assert.equal((await h.call('GET', '/', food)).rotation, 90);
    console.log('PASS fresh lookup, library reuse, aliases, gallery and rotation:', food);
  }
  for (const name of ['Weet-Bix', 'Coca-Cola', 'Nutella', 'Heinz', 'potato chips', 'carrot cake', 'apple juice', 'banana bread', 'cooked chicken breast', 'Heinz carrots']) {
    assert.equal(h.functions.getCanonicalFreshFoodName(name), null, name);
  }
  h.db.prepare("UPDATE fresh_food_image_library SET image_url = '/uploads/food-images/custom.jpg', source = 'custom-upload', rotation = 270 WHERE canonical_name = 'potato'").run();
  const custom = await h.call('GET', '/', 'potatoes');
  assert.equal(custom.imageUrl, '/uploads/food-images/custom.jpg');
  assert.equal(custom.rotation, 270);
  await h.call('POST', '/select', 'apples', {imageUrl: 'https://images.example/chosen.jpg', matchedProduct: 'My apple'});
  assert.equal((await h.call('GET', '/', '2kg apples')).imageUrl, 'https://images.example/chosen.jpg');
  // Reset a selected remote image; no real uploaded files are touched.
  const reset = await h.call('POST', '/reset', 'apples');
  assert.equal(reset.source, 'wikimedia-fresh-v2');
  assert.match(reset.matchedProduct, /^Raw apple/);
  console.log('PASS branded/processed classification, custom preservation, manual selection and reset');
  for (const brand of ['Weet-Bix', 'Coca-Cola', 'Nutella', 'Heinz']) {
    const packaged = harness(async (url, options) => {
      assert.equal(new URL(url).hostname, 'search.openfoodfacts.org');
      assert.equal(JSON.parse(options.body).q, brand);
      return {ok: true, json: async () => ({hits: [{product_name: brand,
        code: '123456', image_front_url: 'https://images.example/product.jpg'}]})};
    });
    const result = await packaged.call('GET', '/', brand);
    assert.equal(result.source, 'open-food-facts');
    assert.equal(result.imageUrl, 'https://images.example/product.jpg');
    console.log('PASS Search-a-licious routing:', brand);
  }
  const stale = harness(async () => ({ok: true, json: async () => ({query: {pages: {1: page('Raw potato')}}})}));
  stale.db.prepare('INSERT INTO food_image_cache(cache_key, image_url, source) VALUES (?, ?, ?)').run('potato', 'https://images.example/chips.jpg', 'open-food-facts');
  assert.match((await stale.call('GET', '/', 'potato')).matchedProduct, /^Raw potato/);
  let count = 0;
  const failed = harness(async () => {count++; return {ok: false, status: 503};});
  assert.equal((await failed.call('GET', '/', 'banana')).imageUrl, null);
  assert.equal((await failed.call('GET', '/', 'banana')).imageUrl, null);
  assert.equal(count, 2);
  assert.equal(failed.db.prepare('SELECT COUNT(*) AS n FROM fresh_food_image_library').get().n, 0);
  let resolve;
  let concurrentCalls = 0;
  const concurrent = harness(async () => {concurrentCalls++; await new Promise(r => {resolve = r;}); return {ok: true, json: async () => ({query: {pages: {1: page('Raw potato')}}})};});
  const one = concurrent.call('GET', '/', 'potato');
  const two = concurrent.call('GET', '/', 'potatoes');
  await concurrent.call('POST', '/select', 'potato', {imageUrl: 'https://images.example/manual.jpg'});
  resolve();
  assert.equal((await one).imageUrl, 'https://images.example/manual.jpg');
  assert.equal((await two).imageUrl, 'https://images.example/manual.jpg');
  assert.equal(concurrentCalls, 1);
  console.log('PASS stale-cache repair, retry after failure, concurrent lookup and user-choice preservation');
}
async function live() {
  const h = harness(fetch);
  const results = [];
  for (const food of foods) {
    const options = await h.functions.searchWikimediaFreshFoodOptions(food);
    console.log(food, JSON.stringify(options.map(o => ({title: o.matchedProduct, url: o.imageUrl}))));
    results.push({food, options});
  }
  fs.writeFileSync('.food-image-fix/live-results.json', JSON.stringify(results, null, 2));
  assert(results.every(r => r.options.length), 'All five foods need actual image results');
}
(process.argv.includes('--live') ? live() : tests()).catch(e => { console.error(e); process.exitCode = 1; });
