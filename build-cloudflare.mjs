import { mkdir, readdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
// Keep GitHub Pages source files unchanged as a fallback. Publish only public files.
const out = 'dist';
const origin = 'https://artlibrary.ai';
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
async function copy(src, dest) {
  const text = /\.(html|css|js|xml)$/.test(src);
  if (text) {
    let body = await readFile(src, 'utf8');
    body = body.replaceAll('https://belalabuzekry1.github.io/Artlibrary', origin);
    await writeFile(dest, body);
  } else await copyFile(src, dest);
}
for (const item of await readdir('.')) {
  if (/^(index\.html|artwork\.html|data\.js|script\.js|style\.css|sitemap\.xml|favicon.*\.(png|ico)|icon\.(png|svg)|logo.*\.(png|svg)|ArtLibrary Gradient Spark Logo\.png)$/.test(item)) await copy(item, path.join(out, item));
}
for (const folder of ['art', 'images/web']) {
  await mkdir(path.join(out, folder), { recursive: true });
  for (const item of await readdir(folder)) await copy(path.join(folder, item), path.join(out, folder, item));
}
await writeFile(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(path.join(out, '404.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | ArtLibrary</title><body style="font:18px system-ui;max-width:40rem;margin:12vh auto;padding:24px"><h1>Page not found</h1><p>This page could not be found.</p><a href="/">Back to ArtLibrary</a></body></html>');
console.log('Prepared public ArtLibrary files for ' + origin);
