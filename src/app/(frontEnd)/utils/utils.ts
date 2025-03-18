export const formatDateFromIsoString = (date: string) => {
  const date2 = new Date(date);
  return `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date2.getDate()).padStart(2, "0")}`;
};

export const formatDateFromDateObject = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

export const formatDateToYYYYMMDD = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};
