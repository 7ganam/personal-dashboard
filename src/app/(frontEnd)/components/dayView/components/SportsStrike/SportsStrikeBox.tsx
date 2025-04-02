import { useSportsStrikeData } from "@/app/(frontEnd)/apiRequests/sports-requests";
import React, { useState } from "react";
import {
  formatDateFromDateObject,
  sportsStrikeStateInADay,
} from "@/app/(frontEnd)/utils/utils";

type Props = {};

function SportsStrikeBox({}: Props) {
  // Get todays date
  const today = new Date();
  const todayFormatted = formatDateFromDateObject(today);

  const [startDate] = useState(formatDateFromDateObject(today));
  const [endDate] = useState(formatDateFromDateObject(today));

  const { data: sportsStrikeData = [] } = useSportsStrikeData(
    startDate,
    endDate
  );

  const todayTStrikeState = sportsStrikeStateInADay(
    todayFormatted,
    sportsStrikeData
  );

  const strikeStateColor = {
    "full-success": "#22C55E",
    "sub-success": "#DCFCE7",
    failure: "red",
  };

  return (
    <div
      className={` min-h-10 min-w-10 bg-gray-200 rounded-md flex items-center justify-center w-full h-full p-4 text-center ${strikeStateColor[todayTStrikeState]}`}
      style={{ backgroundColor: strikeStateColor[todayTStrikeState] }}
    >
      <div className="flex items-center justify-center text-sm text-white font-bold">
        Sports strike
      </div>
    </div>
  );
}

export default SportsStrikeBox;
