import browserSync from 'browser-sync';

/** The dev server: serves dist/, reloads pages and scripts, injects CSS. */
export const server = browserSync.create();
