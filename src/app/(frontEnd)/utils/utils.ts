export const formatDate = (date: string) => {
  const date2 = new Date(date);
  return `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date2.getDate()).padStart(2, "0")}`;
};
