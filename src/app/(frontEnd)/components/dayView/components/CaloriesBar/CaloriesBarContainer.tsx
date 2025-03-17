import { fetchDietData } from "@/app/(frontEnd)/apiRequests/diet-requests";
import React, { useEffect, useState } from "react";
import CaloriesBar from "./CaloriesBar";
import { formatDateFromDateObject } from "@/app/(frontEnd)/utils/utils";

type Props = {};

function CaloriesBarContainer({}: Props) {
  //#region ======================= fetch diet data =========================
  // Get todays date
  const todayDate = new Date();

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState(
    formatDateFromDateObject(todayDate)
  );

  const [endDate, setEndDate] = useState(formatDateFromDateObject(tomorrow));
  const [dietData, setDietData] = useState<any>([]);
  const [errorDietData, setErrorDietData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  console.log({ startDate, endDate });
  useEffect(() => {
    fetchDietData(
      startDate,
      endDate,
      setIsLoading,
      setDietData,
      setErrorDietData
    );
  }, [startDate, endDate, reloadCount]); // Re-fetch when dates change

  //#endregion

  return (
    <div>
      <CaloriesBar
        targetCalories={1800}
        currentCalories={dietData.reduce(
          (acc: number, item: any) => acc + item.properties.Calories.number,
          0
        )}
      />
    </div>
  );
}

export default CaloriesBarContainer;
