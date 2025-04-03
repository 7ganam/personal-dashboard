import { useSleepData } from "@/app/(frontEnd)/apiRequests/sleep-requests";
import { durationInDate } from "@/app/(frontEnd)/utils/utils";
import React, { useState } from "react";

import { formatDateFromDateObject } from "@/app/(frontEnd)/utils/utils";
import SleepBar from "./SleepBar";
import { CircularProgress } from "@mui/material";

type Props = {};

function SleepBarContainer({}: Props) {
  // Get todays date
  const today = new Date();
  const todayFormatted = formatDateFromDateObject(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate] = useState(formatDateFromDateObject(yesterday));
  const [endDate] = useState(formatDateFromDateObject(tomorrow));

  const { data: sleepData = [], isLoading } = useSleepData(startDate, endDate);

  const sleepHours = durationInDate(sleepData, startDate);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute top-1 left-2 w-full h-full flex ">
          <CircularProgress size={10} sx={{ color: "blue" }} />
        </div>
      )}
      <SleepBar
        targetSleepHours={8}
        currentSleepHours={durationInDate(sleepData, todayFormatted)}
      />
    </div>
  );
}

export default SleepBarContainer;
