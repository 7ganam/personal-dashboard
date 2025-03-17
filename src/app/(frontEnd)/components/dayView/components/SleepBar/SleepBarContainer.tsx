import { fetchSleepData } from "@/app/(frontEnd)/apiRequests/sleep-requests";
import { sleepDurationInDate } from "./helpers";
import React, { useEffect, useState } from "react";

import { formatDateFromDateObject } from "@/app/(frontEnd)/utils/utils";
import SleepBar from "./SleepBar";

type Props = {};

function SleepBarContainer({}: Props) {
  //#region ======================= fetch diet data =========================
  // Get todays date
  const today = new Date();
  const todayFormatted = formatDateFromDateObject(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState(
    formatDateFromDateObject(yesterday)
  );

  const [endDate, setEndDate] = useState(formatDateFromDateObject(tomorrow));
  const [sleepData, setSleepData] = useState<any>([]);
  const [errorSleepData, setErrorSleepData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  useEffect(() => {
    fetchSleepData(
      startDate,
      endDate,
      setIsLoading,
      setSleepData,
      setErrorSleepData
    );
  }, [startDate, endDate, reloadCount]); // Re-fetch when dates change

  //#endregion

  const sleepHours = sleepDurationInDate(sleepData, startDate);

  return (
    <div>
      <SleepBar
        targetSleepHours={8}
        currentSleepHours={sleepDurationInDate(sleepData, todayFormatted)}
      />
    </div>
  );
}

export default SleepBarContainer;
