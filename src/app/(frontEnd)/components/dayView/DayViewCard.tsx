import React from "react";
import CaloriesBar from "./components/CaloriesBar";
type Props = {};

function DayViewCard({}: Props) {
  return (
    <div className="w-full h-full bg-gray-100 rounded-md">
      <CaloriesBar />
    </div>
  );
}

export default DayViewCard;
