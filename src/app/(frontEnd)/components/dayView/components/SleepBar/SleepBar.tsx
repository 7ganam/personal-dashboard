import React from "react";
import WorkBar from "../WorkBar/WorkBar";

type Props = { targetSleepHours: number; currentSleepHours: number };

function SleepBar({ targetSleepHours, currentSleepHours }: Props) {
  const sleepPercentage = (currentSleepHours / targetSleepHours) * 100;

  const remainingSleepHours = targetSleepHours - currentSleepHours;

  const progressBarStyle = {
    width: remainingSleepHours > 0 ? `${sleepPercentage}%` : "100%",
    backgroundColor: "red",
  };

  const remainingProgressBarStyle = {
    width: remainingSleepHours > 0 ? `${100 - sleepPercentage}%` : "0%",
    backgroundColor: "#4CAF50",
  };

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between">
        <div className="">sleep</div>
        <div
          className="ml-auto font-bold text-sm border border-gray-300 rounded-md px-2"
          style={{ color: remainingSleepHours > 0 ? "green" : "red" }}
        >
          {remainingSleepHours}
        </div>
      </div>
      <div className="w-full h-full bg-gray-100 rounded-md flex">
        <div style={progressBarStyle} className={`h-4 `}></div>
        <div style={remainingProgressBarStyle} className="bg-white h-4 "></div>
      </div>
    </div>
  );
}

export default SleepBar;
