import { Box, Button, CircularProgress } from "@mui/material";
import { Calendar } from "./components/ui/calendar";
import React, { useEffect, useState } from "react";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { formatDateFromIsoString } from "../../utils/utils";
import { fetchTStrikeData } from "../../apiRequests/t-requests";

const TStrike = (props: any) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  //get the first day of the
  const firstDayOfMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0
  );

  const formattedFirstDayOfMonth = formatDateFromIsoString(
    firstDayOfMonth.toISOString()
  );
  const formattedLastDayOfMonth = formatDateFromIsoString(
    lastDayOfMonth.toISOString()
  );

  //#region =============================fetching data =========================================

  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [t, setT] = useState<any>([]);
  const [errorT, setErrorT] = useState<string | null>(null);

  const { tDates, tvDates, freeDates } = getDatesFromT(t);

  useEffect(() => {
    fetchTStrikeData(
      formattedFirstDayOfMonth,
      formattedLastDayOfMonth,
      setIsLoading,
      setT,
      setErrorT
    );
  }, [formattedFirstDayOfMonth, formattedLastDayOfMonth, reloadCount]); // Re-fetch when dates change
  //#endregion

  //#region =============================render =========================================
  return (
    <div className="w-full h-full">
      {/* Header Section - Title and Reload Button */}
      <div className="mb-4 flex gap-2 justify-end px-0 w-full">
        <div className="text-sm font-semibold grow">T strike</div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setReloadCount(reloadCount + 1);
          }}
          sx={{
            minWidth: "24px",
            width: "24px",
            height: "24px",
            padding: 0,
          }}
        >
          <RotateLeftIcon sx={{ fontSize: 16 }} />
        </Button>
      </div>

      {/* Calendar Container */}
      <div className="w-full relative max-[375px]:px-1 min-[375px]:px-8 max-[777px]:px-8 min-[777px]:px-0 min-[1457px]:px-4 min-[1577px]:px-8">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-start justify-start z-10">
            <Box
              sx={{
                display: "flex",
                p: 1,
                borderRadius: 1,
                boxShadow: 3,
                bgcolor: "white",
              }}
            >
              <CircularProgress size={10} />
            </Box>
          </div>
        )}

        {/* Calendar Component */}
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          onMonthChange={setSelectedMonth}
          modifiers={{
            tv: tvDates,
            t: tDates,
            gg: freeDates,
          }}
          modifiersClassNames={{
            tv: "bg-red-500",
            t: "bg-green-100",
            gg: "bg-green-500",
          }}
          className="rounded-md border"
        />
      </div>
    </div>
  );
  //#endregion
};

export default TStrike;

//#region =============================helper functions =========================================

const getDatesFromT = (
  t: any
): { tDates: Date[]; tvDates: Date[]; freeDates: Date[] } => {
  const tDates: Date[] = [];
  const tvDates: Date[] = [];
  const freeDates: Date[] = [];

  const isToday = (t: any) => {
    const today = new Date();
    const todayFormatted = formatDateFromIsoString(today.toISOString());
    const dateFormatted = formatDateFromIsoString(
      t?.properties?.["Date"]?.date?.start
    );
    return todayFormatted === dateFormatted;
  };

  //only today is considered success if it has no data. other days will considered to have no data
  const todayHasT = t.some((t: any) => isToday(t));
  if (!todayHasT) {
    freeDates.push(new Date());
  }

  t.forEach((t: any) => {
    if (
      t?.properties?.note?.title[0]?.plain_text
        .toLocaleLowerCase()
        .split(" ")[0] === "tv"
    ) {
      tvDates.push(new Date(t?.properties?.["Date"]?.date?.start));
    } else if (
      t?.properties?.note?.title[0]?.plain_text
        .toLocaleLowerCase()
        .split(" ")[0] === "t"
    ) {
      tDates.push(new Date(t?.properties?.["Date"]?.date?.start));
    } else if (
      t?.properties?.note?.title[0]?.plain_text
        .toLocaleLowerCase()
        .split(" ")[0] === "gg"
    ) {
      freeDates.push(new Date(t?.properties?.["Date"]?.date?.start));
    }
  });

  return { tDates, tvDates, freeDates };
};

//#endregion
