import { useSleepData } from "@/app/(frontEnd)/apiRequests/sleep-requests";
import { durationInDate } from "@/app/(frontEnd)/utils/utils";
import React, { useState } from "react";

import { formatDateFromDateObject } from "@/app/(frontEnd)/utils/utils";
import SleepBar from "./SleepBar";

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

  const { data: sleepData = [] } = useSleepData(startDate, endDate);

  const sleepHours = durationInDate(sleepData, startDate);

  return (
    <div>
      <SleepBar
        targetSleepHours={8}
        currentSleepHours={durationInDate(sleepData, todayFormatted)}
      />
    </div>
  );
}

export default SleepBarContainer;
