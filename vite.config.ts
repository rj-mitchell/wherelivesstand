import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

// The Where They Stand family kit, synced into public/family/ by the charity's kit/sync.mjs (see
// docs/DESIGN.md). Its head.html goes into every page's <head>; the endorsement and the footer shelf are
// handed to the app as strings by the virtual module "virtual:family".
const family = (name: string) => readFileSync(new URL(`./public/family/${name}`, import.meta.url), 'utf8');

function familyKit(): Plugin {
  const id = 'virtual:family';
  return {
    name: 'family-kit',
    resolveId: source => (source === id ? `\0${id}` : null),
    load(source) {
      if (source !== `\0${id}`) return null;
      return `export const endorsement = ${JSON.stringify(family('endorsement.html'))};\nexport const shelf = ${JSON.stringify(family('shelf.html'))};`;
    },
    transformIndexHtml: html => html.replace('<!-- family:head -->', family('head.html').trim()),
  };
}

export default defineConfig({
  // Absolute asset paths: pages such as /country/NOR must still find /assets/.
  base: '/',
  plugins: [react(), familyKit()],
  server: { port: 3000 },
});
