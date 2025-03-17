import { fetchSportsStrikeData } from "@/app/(frontEnd)/apiRequests/sports-requests";
import React, { useEffect, useState } from "react";
import { formatDateFromDateObject } from "@/app/(frontEnd)/utils/utils";

type Props = {};

function SportsStrikeBox({}: Props) {
  //#region ======================= fetch diet data =========================
  // Get todays date
  const today = new Date();
  const todayFormatted = formatDateFromDateObject(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState(formatDateFromDateObject(today));

  const [endDate, setEndDate] = useState(formatDateFromDateObject(today));
  const [workData, setWorkData] = useState<any>([]);
  const [errorWorkData, setErrorWorkData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  useEffect(() => {
    fetchSportsStrikeData(
      startDate,
      endDate,
      setIsLoading,
      setWorkData,
      setErrorWorkData
    );
  }, [startDate, endDate, reloadCount]); // Re-fetch when dates change

  //#endregion

  const todayTStrikeState = strikeState(workData);

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
      Sports strike
    </div>
  );
}

const strikeState = (sportsData: any): "full-success" | "failure" => {
  let strikeState = "failure" as "full-success" | "failure";

  if (sportsData.length > 0) {
    strikeState = "full-success";
  }

  return strikeState;
};

export default SportsStrikeBox;
