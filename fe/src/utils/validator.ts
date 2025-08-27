export const isValidUrlPath = (url: string) => {
  const regex = /^(http|https):\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
  return regex.test(url.trim());
};
