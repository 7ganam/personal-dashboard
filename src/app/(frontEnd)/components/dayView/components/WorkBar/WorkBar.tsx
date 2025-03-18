import React from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

type Props = { targetWorkHours: number; currentWorkHours: number };

function WorkBar({ targetWorkHours, currentWorkHours }: Props) {
  const workPercentage = (currentWorkHours / targetWorkHours) * 100;

  const remainingWorkHours = targetWorkHours - currentWorkHours;

  const progressBarStyle = {
    width: remainingWorkHours > 0 ? `${workPercentage}%` : "100%",
    backgroundColor: "#4CAF50",
  };

  const remainingProgressBarStyle = {
    width: remainingWorkHours > 0 ? `${100 - workPercentage}%` : "0%",
    backgroundColor: "red",
  };

  return (
    <div className="w-full flex gap-2">
      <div className="grow p-2 bg-slate-100 rounded-md border border-gray-300">
        <div className="mb-1 flex justify-between">
          <div className="">work</div>
          <div
            className="ml-auto font-bold text-sm border border-gray-300 rounded-md px-2"
            style={{ color: remainingWorkHours > 0 ? "red" : "green" }}
          >
            {remainingWorkHours > 0
              ? remainingWorkHours * -1
              : `+${Math.abs(remainingWorkHours)}`}
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-md flex">
          <div style={progressBarStyle} className={`h-4 `}></div>
          <div
            style={remainingProgressBarStyle}
            className="bg-white h-4 "
          ></div>
        </div>
      </div>
      <div
        className="w-[40px] aspect-square rounded-md flex items-center justify-center"
        style={{
          backgroundColor:
            currentWorkHours > targetWorkHours ? "#4CAF50" : "red",
        }}
      >
        <TrendingUpIcon className="text-white" />
      </div>
    </div>
  );
}

export default WorkBar;
