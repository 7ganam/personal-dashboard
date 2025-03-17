import { formatDateFromIsoString } from "@/app/(frontEnd)/utils/utils";

export const sleepDurationInDate = (sortedSleepData: any, date: string) => {
  const sleepDataStartingInThisDay = sortedSleepData.filter(
    (item: any) =>
      formatDateFromIsoString(item?.properties?.Date?.date?.start) === date
  );

  const sleepDataStartingInPreviousDay = sortedSleepData.filter((item: any) => {
    const itemDate: any = new Date(item?.properties?.Date?.date?.start);
    const compareDate: any = new Date(date);
    compareDate.setDate(compareDate.getDate() - 1);
    return (
      formatDateFromIsoString(itemDate) === formatDateFromIsoString(compareDate)
    );
  });

  //can be multiple items
  const sleepDataStartingInThisDayAndEndedInThisDay =
    sleepDataStartingInThisDay.filter(
      (item: any) =>
        formatDateFromIsoString(item?.properties?.Date?.date?.end) === date
    );

  //should be only one item
  const sleepDataStartingInThisDayAndEndedInNextDay =
    sleepDataStartingInThisDay.find((item: any) => {
      const endDate: any = new Date(item?.properties?.Date?.date?.end);
      const compareDate: any = new Date(date);
      compareDate.setDate(compareDate.getDate() + 1);
      return (
        formatDateFromIsoString(endDate) ===
        formatDateFromIsoString(compareDate)
      );
    });

  //should be only one item
  const sleepDataStartingInPreviousDayAndEndedInThisDay =
    sleepDataStartingInPreviousDay.find(
      (item: any) =>
        formatDateFromIsoString(item?.properties?.Date?.date?.end) === date
    );

  //the part of work data that started yesterday and ended today that falls in today
  const overlapFromPreviousDay = sleepDataStartingInPreviousDayAndEndedInThisDay
    ? new Date(
        sleepDataStartingInPreviousDayAndEndedInThisDay.properties.Date.date.end
      ).getTime() - new Date(date).setHours(0, 0, 0, 0)
    : 0;

  const overlapFromNextDay = sleepDataStartingInThisDayAndEndedInNextDay
    ? new Date(date).setHours(23, 59, 59, 999) -
      new Date(
        sleepDataStartingInThisDayAndEndedInNextDay.properties.Date.date.start
      ).getTime()
    : 0;

  const sameDaySleepDuration =
    sleepDataStartingInThisDayAndEndedInThisDay.reduce(
      (acc: any, item: any) => {
        const startSleepDate = new Date(item?.properties?.Date?.date?.start);
        const endSleepDate = new Date(item?.properties?.Date?.date?.end);
        const sleepDuration = endSleepDate.getTime() - startSleepDate.getTime();
        return acc + sleepDuration;
      },
      0
    );

  const totalSleepDuration =
    sameDaySleepDuration + overlapFromPreviousDay + overlapFromNextDay;

  const sleepDurationInHours = totalSleepDuration / (1000 * 60 * 60);
  return sleepDurationInHours;
};
