// a graph like github contribution graph that receives data in the format of {date:string (yyyy-mm-dd), state:boolean (success, failure)} and displays it in a graph where success days are in green and failure days are in red

import React from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

export type SuccessData = {
  date: string;
  state: "success" | "failure";
  workSuccess: boolean;
  dietSuccess: boolean;
  sleepSuccess: boolean;
  tStrikeSuccess: boolean;
  sportsStrikeSuccess: boolean;
  tStrikeState: "success" | "partial-success" | "failure";
};

export default function SuccessGraph({ data }: { data: SuccessData[] }) {
  // Group data by week
  const weeks: SuccessData[][] = [];
  let currentWeek: SuccessData[] = [];

  data.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => {
              const tooltipId = `day-${weekIndex}-${dayIndex}`;
              return (
                <React.Fragment key={tooltipId}>
                  <div
                    data-tooltip-id={tooltipId}
                    className={`w-3 h-3 rounded-sm cursor-pointer ${
                      day.state === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <Tooltip
                    id={tooltipId}
                    place="top"
                    className="!bg-white !text-gray-800 !border !border-gray-200 !p-2 !rounded-md !shadow-lg"
                  >
                    <div className="flex flex-col gap-2 min-w-[150px]">
                      <p className="font-semibold border-b pb-1">{day.date}</p>
                      <div className="flex flex-col gap-1">
                        <div
                          className={
                            day.workSuccess ? "text-green-500" : "text-red-500"
                          }
                        >
                          Work: {day.workSuccess ? "✓" : "✗"}
                        </div>
                        <div
                          className={
                            day.dietSuccess ? "text-green-500" : "text-red-500"
                          }
                        >
                          Diet: {day.dietSuccess ? "✓" : "✗"}
                        </div>
                        <div
                          className={
                            day.sleepSuccess ? "text-green-500" : "text-red-500"
                          }
                        >
                          Sleep: {day.sleepSuccess ? "✓" : "✗"}
                        </div>
                        <div
                          className={
                            day.tStrikeSuccess
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          T: {day.tStrikeState}
                        </div>
                        <div
                          className={
                            day.sportsStrikeSuccess
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          Sports: {day.sportsStrikeSuccess ? "✓" : "✗"}
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
