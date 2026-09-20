const fs = require('fs');
(async()=>{
for (const term of ['"chicken breast" raw', '"chicken breasts" raw']) {
const u=new URL('https://commons.wikimedia.org/w/api.php');u.search=new URLSearchParams({action:'query',list:'search',srsearch:term,srnamespace:'6',srlimit:'40',format:'json'});
const d=await (await fetch(u)).json();console.log(term,JSON.stringify(d.query?.search?.map(p=>p.title)));
}
const u=new URL('https://commons.wikimedia.org/w/api.php');u.search=new URLSearchParams({action:'query',titles:'File:Carrot vegetable on white background.jpg|File:Chicken breast, Mainz.jpg',prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'500',format:'json'});
const d=await (await fetch(u)).json();
for(const [i,p] of Object.values(d.query.pages).entries()){console.log(i,p.title,p.imageinfo?.[0]?.extmetadata?.ImageDescription?.value);const url=p.imageinfo?.[0]?.thumburl;if(url){const r=await fetch(url);if(r.ok)fs.writeFileSync('.food-image-fix/extra-'+i+'.jpg',Buffer.from(await r.arrayBuffer()));}}
})();
