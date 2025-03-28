import { useDietData } from "@/app/(frontEnd)/apiRequests/diet-requests";
import React, { useState } from "react";
import CaloriesBar from "./CaloriesBar";
import { formatDateFromDateObject } from "@/app/(frontEnd)/utils/utils";

type Props = {};

function CaloriesBarContainer({}: Props) {
  //#region ======================= fetch diet data =========================
  // Get todays date
  const todayDate = new Date();

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate] = useState(formatDateFromDateObject(todayDate));
  const [endDate] = useState(formatDateFromDateObject(tomorrow));

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
