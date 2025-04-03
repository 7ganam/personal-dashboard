import { useWorkData } from "@/app/(frontEnd)/apiRequests/work-requests";
import React, { useState } from "react";
import WorkBar from "./WorkBar";
import {
  getTomorrowDate,
  getTodayDate,
  durationInDate,
} from "@/app/(frontEnd)/utils/utils";
import { CircularProgress } from "@mui/material";

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

  const workHours = durationInDate(workData, startDate);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute top-1 left-2 w-full h-full flex ">
          <CircularProgress size={10} sx={{ color: "blue" }} />
        </div>
      )}
      <WorkBar targetWorkHours={8} currentWorkHours={workHours} />
    </div>
  );
}

export default WorkBarContainer;
