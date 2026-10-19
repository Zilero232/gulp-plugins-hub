import { highlightCurrentPage } from './modules/nav.js';
import { applyTheme } from './modules/theme.js';

applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
highlightCurrentPage();
