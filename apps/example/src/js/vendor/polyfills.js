// Loaded before the other vendor scripts (the order is set in the scripts task).
if (!('structuredClone' in window)) {
  window.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}
