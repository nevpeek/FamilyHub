const fs = require('node:fs');
const assert = require('node:assert/strict');
const {createRequire} = require('node:module');
const apiRequire = createRequire('C:/Users/Nevpe/Documents/FamilyHub-API/package.json');
const env = apiRequire('dotenv').parse(fs.readFileSync('C:/Users/Nevpe/Documents/FamilyHub-API/.env'));
(async () => {
  const results = [];
  for (const name of ['potato', 'carrot', 'apple', 'banana', 'chicken breast']) {
    async function lookup(query, suffix = '') {
      const r = await fetch('http://127.0.0.1:' + (env.PORT || 3001) + '/api/food-images' + suffix + '?name=' + encodeURIComponent(query), {
        headers: {'X-FamilyHub-Key': env.FAMILYHUB_API_KEY || ''}, signal: AbortSignal.timeout(25000)});
      assert.equal(r.status, 200);
      return r.json();
    }
    const result = await lookup(name);
    assert(result.imageUrl, name + ' has an image');
    const plural = name === 'potato' ? 'potatoes' : name + 's';
    const alias = await lookup('2kg ' + plural);
    assert.equal(alias.imageUrl, result.imageUrl);
    assert.equal(alias.rotation, result.rotation);
    assert.equal(alias.cached, true);
    const options = await lookup(name, '/options');
    assert(options.options.some(o => o.preferred && o.imageUrl === result.imageUrl));
    console.log('PASS running API:', name, '| source:', result.source, '| match:', result.matchedProduct, '| alias shared, preferred gallery image present');
    results.push({name, ...result});
  }
  fs.writeFileSync('.food-image-fix/running-results.json', JSON.stringify(results, null, 2));
})().catch(e => { console.error(e.message); process.exitCode = 1; });
