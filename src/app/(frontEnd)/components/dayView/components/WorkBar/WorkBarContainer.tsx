import { fetchWorkData } from "@/app/(frontEnd)/apiRequests/work-requests";
import { workDurationInDate } from "./helpers";
import React, { useEffect, useState } from "react";
import WorkBar from "./WorkBar";
import { formatDateFromDateObject } from "@/app/(frontEnd)/utils/utils";

type Props = {};

function WorkBarContainer({}: Props) {
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
  const [workData, setWorkData] = useState<any>([]);
  const [errorWorkData, setErrorWorkData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  useEffect(() => {
    fetchWorkData(
      startDate,
      endDate,
      setIsLoading,
      setWorkData,
      setErrorWorkData
    );
  }, [startDate, endDate, reloadCount]); // Re-fetch when dates change

  //#endregion

  const workHours = workDurationInDate(workData, startDate);

  return (
    <div>
      <WorkBar
        targetWorkHours={8}
        currentWorkHours={workDurationInDate(workData, todayFormatted)}
      />
    </div>
  );
}

export default WorkBarContainer;
