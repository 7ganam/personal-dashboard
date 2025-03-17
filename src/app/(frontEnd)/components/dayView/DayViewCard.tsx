import React from "react";
import CaloriesBarContainer from "./components/CaloriesBar/CaloriesBarContainer";
import WorkBarContainer from "./components/WorkBar/WorkBarContainer";
import SleepBarContainer from "./components/SleepBar/SleepBarContainer";
type Props = {};

function DayViewCard({}: Props) {
  return (
    <div className="w-full h-full bg-gray-100 rounded-md flex flex-col gap-4">
      <CaloriesBarContainer />
      <WorkBarContainer />
      <SleepBarContainer />
    </div>
  );
}

export default DayViewCard;
