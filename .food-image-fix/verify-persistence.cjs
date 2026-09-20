const fs = require('fs');
const assert = require('assert/strict');
const {createRequire} = require('module');
const apiRequire = createRequire('C:/Users/Nevpe/Documents/FamilyHub-API/package.json');
const db = new (apiRequire('better-sqlite3'))('C:/Users/Nevpe/Documents/FamilyHub-API/data/familyhub.db', {readonly: true, fileMustExist: true});
const results = JSON.parse(fs.readFileSync('.food-image-fix/running-results.json'));
for (const r of results) {
 const saved = db.prepare('SELECT image_url, rotation FROM fresh_food_image_library WHERE canonical_name = ?').get(r.name);
 assert.equal(saved.image_url, r.imageUrl);
 assert.equal(Number(saved.rotation), r.rotation);
 console.log('PASS persistent library:', r.name);
}
db.close();
fs.appendFileSync('FOOD-IMAGE-EDITS.md', '\n## Verification\n\nApplied to the two exact paths above. All replacement blocks were replayed against the saved pre-edit files and matched the installed files exactly.\n\n- Production build passed.\n- Backend syntax check passed.\n- Frontend lint reported only two existing effect warnings.\n- Potato, carrot, apple, banana and chicken breast passed isolated route tests and running-API checks.\n- Visually checked the five preferred raw-food photographs.\n- Confirmed each running result is saved in fresh_food_image_library and reused for 2kg/plural aliases.\n- Existing selected banana image was preserved. New automatic banana searches prefer the verified raw banana photograph.\n- Tested packaged-product routing for Weet-Bix, Coca-Cola, Nutella and Heinz with controlled Search-a-licious responses.\n- Tested stale automatic cache repair, explicit-image preservation, gallery, rotation, selection, reset, failed lookup retries, concurrent requests and user changes during lookup using an isolated SQLite database.\n- The running API automatically reloaded. One live chicken-breast lookup initially failed; retry succeeded and persisted the image.\n\nProvider API reference: [MediaWiki Imageinfo](https://www.mediawiki.org/wiki/API:Imageinfo).\n');
