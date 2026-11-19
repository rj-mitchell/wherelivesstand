// Whether the app is being rendered to static HTML at build time (src/prerender.tsx) rather than running in a
// browser. The few controls that need the app to work, such as a dialog's close button, are then drawn as plain
// links, so that the page still works without JavaScript.
import { createContext } from 'react';

export const Prerendering = createContext(false);
