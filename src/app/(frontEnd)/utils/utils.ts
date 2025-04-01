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

export const getYesterdayDate = () => {
  // Get todays date
  const todayDate = new Date();

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = formatDateFromDateObject(yesterday);
  return yesterdayFormatted;
};

export const getTomorrowDate = () => {
  // Get todays date
  const todayDate = new Date();

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = formatDateFromDateObject(tomorrow);
  return tomorrowFormatted;
};

export const getTodayDate = () => {
  // Get todays date
  const todayDate = new Date();
  const todayFormatted = formatDateFromDateObject(todayDate);
  return todayFormatted;
};
