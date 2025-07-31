// Get format from file path.
export const getFormatFromPath = (path: string): string => {
  return path.split('.').pop()?.toLowerCase() || '';
};
