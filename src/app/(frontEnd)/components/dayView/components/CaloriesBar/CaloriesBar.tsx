import image from "next/image";
import React from "react";
import ShieldIcon from "@mui/icons-material/Shield";

type Props = { targetCalories: number; currentCalories: number };

function CaloriesBar({ targetCalories, currentCalories }: Props) {
  const caloriesPercentage = (currentCalories / targetCalories) * 100;
  const remainingCalories = targetCalories - currentCalories;

  const progressBarStyle = {
    width: remainingCalories > 0 ? `${caloriesPercentage}%` : "100%",
    backgroundColor: currentCalories > targetCalories ? "red" : "#808080",
  };

  const remainingProgressBarStyle = {
    width: remainingCalories > 0 ? `${100 - caloriesPercentage}%` : "0%",
    backgroundColor: "#4CAF50",
  };

  return (
    <div className="w-full flex gap-2 ">
      <div className="grow  p-2 bg-slate-100 rounded-md border border-gray-300">
        <div className="mb-1 flex justify-between">
          <div className="">calories</div>
          <div
            className="ml-auto font-bold text-sm border border-gray-300 rounded-md px-2"
            style={{ color: remainingCalories > 0 ? "green" : "red" }}
          >
            {remainingCalories}
          </div>
        </div>
        <div className="w-full  bg-gray-100 rounded-md flex">
          <div style={progressBarStyle} className={`h-4`}></div>
          <div
            style={remainingProgressBarStyle}
            className="bg-white h-4 "
          ></div>
        </div>
      </div>
      {/* right state bar */}
      <div
        className="w-[40px] aspect-square rounded-md flex items-center justify-center"
        style={{
          backgroundColor: remainingCalories > 0 ? "#4CAF50" : "red",
        }}
      >
        <ShieldIcon className="text-white" />
      </div>
    </div>
  );
}

export default CaloriesBar;
