import { useDietData } from "@/app/(frontEnd)/apiRequests/diet-requests";
import React, { useState } from "react";
import CaloriesBar from "./CaloriesBar";
import {
  getYesterdayDate,
  getTomorrowDate,
  getTodayDate,
  caloriesInADay,
} from "@/app/(frontEnd)/utils/utils";
import { CircularProgress } from "@mui/material";

type Props = {};

function CaloriesBarContainer({}: Props) {
  //#region ======================= fetch diet data =========================

  const [startDate] = useState(getTodayDate());
  const [endDate] = useState(getTomorrowDate());

  const { data: dietData = [], isLoading } = useDietData(startDate, endDate);

  //#endregion

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute top-1 left-2 w-full h-full flex ">
          <CircularProgress size={10} sx={{ color: "blue" }} />
        </div>
      )}

      <CaloriesBar
        targetCalories={1800}
        currentCalories={caloriesInADay(startDate, dietData)}
      />
    </div>
  );
}

export default CaloriesBarContainer;
