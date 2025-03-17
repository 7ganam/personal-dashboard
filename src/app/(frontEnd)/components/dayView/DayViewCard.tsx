import React from "react";
import CaloriesBarContainer from "./components/CaloriesBar/CaloriesBarContainer";
import WorkBarContainer from "./components/WorkBar/WorkBarContainer";
import SleepBarContainer from "./components/SleepBar/SleepBarContainer";
import TStrikeBox from "./components/TStrike/TStrikeBox";
import SportsStrikeBox from "./components/SportsStrike/SportsStrikeBox";
type Props = {};

function DayViewCard({}: Props) {
  return (
    <div className="w-full h-full bg-gray-100 rounded-md flex flex-col gap-4">
      <div className="w-full flex justify-start items-center gap-4 p-4 bg-slate-200 border border-slate-300 rounded-md mb-10">
        <div className="w-full text-center font-bold text-2xl">TODAY</div>
      </div>
      <CaloriesBarContainer />
      <WorkBarContainer />
      <SleepBarContainer />
      <div className="mt-4 w-full flex justify-start items-center gap-4 p-4 bg-slate-200 border border-slate-300 rounded-md ">
        <div className="w-[100px] aspect-square">
          <TStrikeBox />
        </div>
        <div className="w-[100px] aspect-square">
          <SportsStrikeBox />
        </div>
      </div>
    </div>
  );
}

export default DayViewCard;
