import { formatDateFromIsoString } from "@/app/(frontEnd)/utils/utils";

export const workDurationInDate = (sortedWorkData: any, date: string) => {
  const workDataStartingInThisDay = sortedWorkData.filter(
    (item: any) =>
      formatDateFromIsoString(item?.properties?.Date?.date?.start) === date
  );

  const workDataStartingInPreviousDay = sortedWorkData.filter((item: any) => {
    const itemDate: any = new Date(item?.properties?.Date?.date?.start);
    const compareDate: any = new Date(date);
    compareDate.setDate(compareDate.getDate() - 1);
    return (
      formatDateFromIsoString(itemDate) === formatDateFromIsoString(compareDate)
    );
  });

  //can be multiple items
  const workDataStartingInThisDayAndEndedInThisDay =
    workDataStartingInThisDay.filter(
      (item: any) =>
        formatDateFromIsoString(item?.properties?.Date?.date?.end) === date
    );

  //should be only one item
  const workDataStartingInThisDayAndEndedInNextDay =
    workDataStartingInThisDay.find((item: any) => {
      const endDate: any = new Date(item?.properties?.Date?.date?.end);
      const compareDate: any = new Date(date);
      compareDate.setDate(compareDate.getDate() + 1);
      return (
        formatDateFromIsoString(endDate) ===
        formatDateFromIsoString(compareDate)
      );
    });

  //should be only one item
  const workDataStartingInPreviousDayAndEndedInThisDay =
    workDataStartingInPreviousDay.find(
      (item: any) =>
        formatDateFromIsoString(item?.properties?.Date?.date?.end) === date
    );

  //the part of work data that started yesterday and ended today that falls in today
  const overlapFromPreviousDay = workDataStartingInPreviousDayAndEndedInThisDay
    ? new Date(
        workDataStartingInPreviousDayAndEndedInThisDay.properties.Date.date.end
      ).getTime() - new Date(date).setHours(0, 0, 0, 0)
    : 0;

  const overlapFromNextDay = workDataStartingInThisDayAndEndedInNextDay
    ? new Date(date).setHours(23, 59, 59, 999) -
      new Date(
        workDataStartingInThisDayAndEndedInNextDay.properties.Date.date.start
      ).getTime()
    : 0;

  const sameDayWorkDuration = workDataStartingInThisDayAndEndedInThisDay.reduce(
    (acc: any, item: any) => {
      const startWorkDate = new Date(item?.properties?.Date?.date?.start);
      const endWorkDate = new Date(item?.properties?.Date?.date?.end);
      const workDuration = endWorkDate.getTime() - startWorkDate.getTime();
      return acc + workDuration;
    },
    0
  );

  const totalWorkDuration =
    sameDayWorkDuration + overlapFromPreviousDay + overlapFromNextDay;

  const workDurationInHours = totalWorkDuration / (1000 * 60 * 60);
  return workDurationInHours;
};
