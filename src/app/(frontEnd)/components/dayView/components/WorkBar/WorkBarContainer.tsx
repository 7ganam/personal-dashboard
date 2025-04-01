import { useWorkData } from "@/app/(frontEnd)/apiRequests/work-requests";
import { workDurationInDate } from "./helpers";
import React, { useState } from "react";
import WorkBar from "./WorkBar";
import { getTomorrowDate, getTodayDate } from "@/app/(frontEnd)/utils/utils";

type Props = {};

function WorkBarContainer({}: Props) {
  // Get todays date
  const [startDate] = useState(getTodayDate());
  const [endDate] = useState(getTomorrowDate());

  const {
    data: workData = [],
    isLoading,
    isFetching,
    error: errorWorkData,
    refetch,
  } = useWorkData(startDate, endDate);

  const workHours = workDurationInDate(workData, startDate);
  console.log({ workData, workHours });

  return (
    <div>
      <WorkBar targetWorkHours={8} currentWorkHours={workHours} />
    </div>
  );
}

export default WorkBarContainer;
