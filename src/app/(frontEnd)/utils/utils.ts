export const formatDateFromIsoString = (date: string) => {
  const date2 = new Date(date);
  return `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date2.getDate()).padStart(2, "0")}`;
};

export const durationInDate = (sortedData: any, date: string) => {
  const dataStartingInThisDay = sortedData.filter(
    (item: any) =>
      formatDateFromIsoString(item?.properties?.Date?.date?.start) === date
  );

  const dataStartingInPreviousDay = sortedData.filter((item: any) => {
    const itemDate: any = new Date(item?.properties?.Date?.date?.start);
    const compareDate: any = new Date(date);
    compareDate.setDate(compareDate.getDate() - 1);
    return (
      formatDateFromIsoString(itemDate) === formatDateFromIsoString(compareDate)
    );
  });

  //can be multiple items
  const dataStartingInThisDayAndEndedInThisDay = dataStartingInThisDay.filter(
    (item: any) =>
      formatDateFromIsoString(item?.properties?.Date?.date?.end) === date
  );

  //should be only one item
  const dataStartingInThisDayAndEndedInNextDay = dataStartingInThisDay.find(
    (item: any) => {
      const endDate: any = new Date(item?.properties?.Date?.date?.end);
      const compareDate: any = new Date(date);
      compareDate.setDate(compareDate.getDate() + 1);
      return (
        formatDateFromIsoString(endDate) ===
        formatDateFromIsoString(compareDate)
      );
    }
  );

  //should be only one item
  const dataStartingInPreviousDayAndEndedInThisDay =
    dataStartingInPreviousDay.find(
      (item: any) =>
        formatDateFromIsoString(item?.properties?.Date?.date?.end) === date
    );

  //the part of work data that started yesterday and ended today that falls in today
  const overlapFromPreviousDay = dataStartingInPreviousDayAndEndedInThisDay
    ? new Date(
        dataStartingInPreviousDayAndEndedInThisDay.properties.Date.date.end
      ).getTime() - new Date(date).setHours(0, 0, 0, 0)
    : 0;

  const overlapFromNextDay = dataStartingInThisDayAndEndedInNextDay
    ? new Date(date).setHours(23, 59, 59, 999) -
      new Date(
        dataStartingInThisDayAndEndedInNextDay.properties.Date.date.start
      ).getTime()
    : 0;

  const sameDayDataDuration = dataStartingInThisDayAndEndedInThisDay.reduce(
    (acc: any, item: any) => {
      const startDataDate = new Date(item?.properties?.Date?.date?.start);
      const endDataDate = new Date(item?.properties?.Date?.date?.end);
      const dataDuration = endDataDate.getTime() - startDataDate.getTime();
      return acc + dataDuration;
    },
    0
  );

  const totalDataDuration =
    sameDayDataDuration + overlapFromPreviousDay + overlapFromNextDay;

  const dataDurationInHours = totalDataDuration / (1000 * 60 * 60);
  return dataDurationInHours;
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

export const getOneMonthAgoDate = () => {
  // Get todays date
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneMonthAgoFormatted = formatDateFromDateObject(oneMonthAgo);
  return oneMonthAgoFormatted;
};

//a function that takes startData and endDate in yyyy-mm-dd format and returns an array of dates between them
export const generateDateRange = (startDate: string, endDate: string) => {
  const dateRange = [];
  const currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);
  while (currentDate <= endDateObj) {
    dateRange.push(formatDateFromDateObject(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateRange;
};

export const caloriesInADay = (date: string, dietData: any) => {
  const dayDietData = dietData.filter((item: any) => {
    const itemDate = formatDateFromIsoString(item.properties.Date.date.start);
    return itemDate === date;
  });
  const dayDietCalories = dayDietData.reduce((acc: number, item: any) => {
    return acc + item.properties.Calories.number;
  }, 0);
  return dayDietCalories;
};

export const sportsStrikeStateInADay = (
  date: string,
  sportsStrikeData: any
) => {
  const daySportsStrikeData = sportsStrikeData.filter((item: any) => {
    const itemDate = formatDateFromIsoString(item.properties.Date.date.start);
    return itemDate === date;
  });

  let strikeState = "failure" as "success" | "failure";

  if (daySportsStrikeData.length > 0) {
    strikeState = "success";
  }

  return strikeState;
};

export const tStrikeStateInADay = (
  date: string,
  tStrikeData: any
): "success" | "partial-success" | "failure" => {
  const dayTStrikeData = tStrikeData.filter((item: any) => {
    const itemDate = formatDateFromIsoString(item.properties.Date.date.start);
    return itemDate === date;
  });

  const isToday = () => {
    const today = getTodayDate();
    return today === date;
  };

  for (const t of dayTStrikeData) {
    const note = t?.properties?.note?.title[0]?.plain_text
      ?.toLocaleLowerCase()
      ?.split(" ")[0];
    if (note === "tv") {
      return "failure";
    } else if (note === "t") {
      return "partial-success";
    } else if (note === "gg") {
      return "success";
    }
  }

  if (isToday()) {
    return "success";
  }

  return "failure";
};
