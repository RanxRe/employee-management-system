// function to capitalize the first letter
export const toTitleCase = (val) => {
  if (typeof val !== "string") return val;
  return val
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
