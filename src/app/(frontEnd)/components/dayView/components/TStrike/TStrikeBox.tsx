import { fetchTStrikeData } from "@/app/(frontEnd)/apiRequests/t-requests";
import React, { useEffect, useState } from "react";
import WorkBar from "./TStrikeBox";
import { formatDateFromDateObject } from "@/app/(frontEnd)/utils/utils";
import { workDurationInDate } from "../WorkBar/helpers";

type Props = {};

function TStrikeBox({}: Props) {
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
    fetchTStrikeData(
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
      <div className="flex items-center justify-center text-sm text-white font-bold">
        T strike
      </div>
    </div>
  );
}

const strikeState = (t: any): "full-success" | "sub-success" | "failure" => {
  let strikeState = "full-success" as
    | "full-success"
    | "sub-success"
    | "failure";
  t.forEach((t: any) => {
    if (
      t?.properties?.note?.title[0]?.plain_text
        .toLocaleLowerCase()
        .split(" ")[0] === "tv"
    ) {
      strikeState = "failure";
    } else if (
      t?.properties?.note?.title[0]?.plain_text
        .toLocaleLowerCase()
        .split(" ")[0] === "t"
    ) {
      strikeState = "sub-success";
    } else if (
      t?.properties?.note?.title[0]?.plain_text
        .toLocaleLowerCase()
        .split(" ")[0] === "gg"
    ) {
      strikeState = "full-success";
    }
  });

  return strikeState;
};

export default TStrikeBox;
