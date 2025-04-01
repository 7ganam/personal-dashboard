import { useDietData } from "@/app/(frontEnd)/apiRequests/diet-requests";
import React, { useState } from "react";
import CaloriesBar from "./CaloriesBar";
import {
  getYesterdayDate,
  getTomorrowDate,
} from "@/app/(frontEnd)/utils/utils";

type Props = {};

function CaloriesBarContainer({}: Props) {
  //#region ======================= fetch diet data =========================

  const [startDate] = useState(getYesterdayDate());
  const [endDate] = useState(getTomorrowDate());

  const { data: dietData = [] } = useDietData(startDate, endDate);

  //#endregion

  return (
    <div>
      <CaloriesBar
        targetCalories={1800}
        currentCalories={dietData.reduce(
          (acc: number, item: any) => acc + item.properties.Calories.number,
          0
        )}
      />
    </div>
  );
}

export default CaloriesBarContainer;
