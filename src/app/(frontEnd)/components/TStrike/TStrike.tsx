import { Box, Button, CircularProgress } from "@mui/material";
import { Calendar } from "./components/ui/calendar";
import React, { useEffect, useState } from "react";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { formatDate } from "../../utils/utils";
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

  const formattedFirstDayOfMonth = formatDate(firstDayOfMonth.toISOString());
  const formattedLastDayOfMonth = formatDate(lastDayOfMonth.toISOString());

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
      <div className="mb-4 flex gap-4  justify-end px-0 w-full">
        <div className="text-2xl font-bold grow">T strike</div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setReloadCount(reloadCount + 1);
          }}
        >
          <RotateLeftIcon />
        </Button>
      </div>
      <div className="w-full  relative ">
        {isLoading && (
          <div className="absolute inset-0 flex items-start justify-start z-10 -mt-20 -ml-5 ">
            <Box
              sx={{
                display: "flex",

                p: 1,
                borderRadius: 1,
                boxShadow: 3,
              }}
            >
              <CircularProgress size={20} />
            </Box>
          </div>
        )}
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
  console.log(t);
  const tDates: Date[] = [];
  const tvDates: Date[] = [];
  const freeDates: Date[] = [];

  t.forEach((t: any) => {
    if (
      t?.properties?.note?.title[0]?.plain_text
        .toLocaleLowerCase()
        .split(" ")[0] === "tv"
    ) {
      tvDates.push(new Date(t?.properties?.["Date"]?.date?.start));
      console.log(t?.properties?.note?.title[0]?.plain_text, "->", "TV");
    } else if (
      t?.properties?.note?.title[0]?.plain_text
        .toLocaleLowerCase()
        .split(" ")[0] === "t"
    ) {
      tDates.push(new Date(t?.properties?.["Date"]?.date?.start));
      console.log(t?.properties?.note?.title[0]?.plain_text, "->", "T");
    } else if (
      t?.properties?.note?.title[0]?.plain_text
        .toLocaleLowerCase()
        .split(" ")[0] === "gg"
    ) {
      freeDates.push(new Date(t?.properties?.["Date"]?.date?.start));
    }
  });

  console.log({ tDates });
  console.log({ tvDates });
  console.log({ freeDates });

  return { tDates, tvDates, freeDates };
};

//#endregion
