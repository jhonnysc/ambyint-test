export const getUrlId = (url: string) => {
  const result = url.match(/\d+/g);
  if (result) return result[0];
  return null;
};
