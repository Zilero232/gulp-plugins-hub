/** Marks the link of the current page for assistive technology. */
export const highlightCurrentPage = () => {
  for (const link of document.querySelectorAll('.nav-list a.active')) {
    link.setAttribute('aria-current', 'page');
  }
};
