import React, { useState } from "react";
import { useDietData } from "../../apiRequests/diet-requests";
import {
  getOneMonthAgoDate,
  getTodayDate,
  getTomorrowDate,
  durationInDate,
  generateDateRange,
  caloriesInADay,
  tStrikeStateInADay,
  sportsStrikeStateInADay,
} from "../../utils/utils";
import { useSleepData } from "../../apiRequests/sleep-requests";
import { useTStrikeData } from "../../apiRequests/t-requests";
import { useWorkData } from "../../apiRequests/work-requests";
import { useSportsStrikeData } from "../../apiRequests/sports-requests";
import SuccessGraph, { SuccessData } from "./SuccessGraph";

type Props = {};

function DaySuccessContainer({}: Props) {
  const oneMonthAgo = getOneMonthAgoDate();
  const today = getTodayDate();

  const [startDate, setStartDate] = useState(oneMonthAgo); // Default to one month ago
  const [endDate, setEndDate] = useState(today); // Default to today

  const { data: dietData = [] } = useDietData(startDate, endDate);
  const { data: trainingData = [] } = useTStrikeData(startDate, endDate);
  const { data: sleepData = [] } = useSleepData(startDate, endDate);
  const { data: workData = [] } = useWorkData(startDate, endDate);
  const { data: sportData = [] } = useSportsStrikeData(startDate, endDate);

  const isDayWorkSuccess = (date: string, workData: any) => {
    const workHours = durationInDate(workData, date);
    const workSuccess = workHours >= 8;
    return workSuccess;
  };

  const isDaySleepSuccess = (date: string, sleepData: any) => {
    const sleepHours = durationInDate(sleepData, date);
    const sleepSuccess = sleepHours <= 8;
    return sleepSuccess;
  };

  const isDayDietSuccess = (date: string, dietData: any) => {
    const dayDietCalories = caloriesInADay(date, dietData);
    const dietSuccess = dayDietCalories <= 1800;
    return dietSuccess;
  };

  const dateRange = generateDateRange(startDate, endDate);

  const successData: SuccessData[] = dateRange.map((date) => {
    const workSuccess = isDayWorkSuccess(date, workData);
    const dietSuccess = isDayDietSuccess(date, dietData);
    const sleepSuccess = isDaySleepSuccess(date, sleepData);
    const tStrikeState = tStrikeStateInADay(date, trainingData);
    const tStrikeSuccess =
      tStrikeState === "success" || tStrikeState === "partial-success";
    const sportsStrikeSuccess =
      sportsStrikeStateInADay(date, sportData) === "success";
    return {
      workSuccess,
      dietSuccess,
      sleepSuccess,
      tStrikeSuccess,
      sportsStrikeSuccess,
      tStrikeState,
      date: date,
      state:
        workSuccess &&
        dietSuccess &&
        sleepSuccess &&
        tStrikeSuccess &&
        sportsStrikeSuccess
          ? "success"
          : "failure",
    };
  });

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Daily Success Overview</h2>
      <SuccessGraph data={successData} />
    </div>
  );
}

export default DaySuccessContainer;
