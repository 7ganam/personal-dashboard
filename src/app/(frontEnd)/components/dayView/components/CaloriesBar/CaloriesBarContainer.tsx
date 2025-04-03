import { useDietData } from "@/app/(frontEnd)/apiRequests/diet-requests";
import React, { useState } from "react";
import CaloriesBar from "./CaloriesBar";
import {
  getYesterdayDate,
  getTomorrowDate,
  getTodayDate,
  caloriesInADay,
} from "@/app/(frontEnd)/utils/utils";

type Props = {};

function CaloriesBarContainer({}: Props) {
  //#region ======================= fetch diet data =========================

  const [startDate] = useState(getTodayDate());
  const [endDate] = useState(getTomorrowDate());

  const { data: dietData = [] } = useDietData(startDate, endDate);

  //#endregion

  return (
    <div>
      <CaloriesBar
        targetCalories={1800}
        currentCalories={caloriesInADay(startDate, dietData)}
      />
    </div>
  );
}

export default CaloriesBarContainer;
