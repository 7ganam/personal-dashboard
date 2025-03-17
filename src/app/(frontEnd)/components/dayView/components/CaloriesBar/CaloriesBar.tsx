import React from "react";

type Props = { targetCalories: number; currentCalories: number };

function CaloriesBar({ targetCalories, currentCalories }: Props) {
  const caloriesPercentage = (currentCalories / targetCalories) * 100;
  const remainingCalories = targetCalories - currentCalories;

  const progressBarStyle = {
    width: remainingCalories > 0 ? `${caloriesPercentage}%` : "100%",
    backgroundColor: "red",
  };

  const remainingProgressBarStyle = {
    width: remainingCalories > 0 ? `${100 - caloriesPercentage}%` : "0%",
    backgroundColor: "#4CAF50",
  };

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between">
        <div className="">calories</div>
        <div
          className="ml-auto font-bold text-sm border border-gray-300 rounded-md px-2"
          style={{ color: remainingCalories > 0 ? "green" : "red" }}
        >
          {remainingCalories}
        </div>
      </div>
      <div className="w-full h-full bg-gray-100 rounded-md flex">
        <div style={progressBarStyle} className={`h-4 `}></div>
        <div style={remainingProgressBarStyle} className="bg-white h-4 "></div>
      </div>
    </div>
  );
}

export default CaloriesBar;
