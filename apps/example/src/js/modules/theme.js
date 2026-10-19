/** Follows the system theme, so the CSS can style `[data-theme='dark']`. */
export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
};
