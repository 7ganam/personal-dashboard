import { Box, Button, CircularProgress } from "@mui/material";
import { Calendar } from "./components/ui/calendar";
import React, { useState } from "react";
import { formatDateFromIsoString } from "../../utils/utils";
import { useSportsStrikeData } from "../../apiRequests/sports-requests";

const SportsStrike = (props: any) => {
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

  const { data: sports = [], isLoading } = useSportsStrikeData(
    formattedFirstDayOfMonth,
    formattedLastDayOfMonth
  );

  const { sportsDates } = getDatesFromSports(sports);

  return (
    <div className="w-full h-full">
      {/* Header Section - Title and Reload Button */}
      <div className="mb-4 flex gap-2 justify-end px-0 w-full">
        <div className="text-sm font-semibold grow">Sports strike</div>
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
            sports: sportsDates,
            future: (date) => date > new Date(),
          }}
          modifiersClassNames={{
            sports: "!bg-green-500",
            future: "!bg-gray-200 text-gray-400",
          }}
          className="rounded-md border [&_.rdp-day_button.rdp-day_today]:bg-green-500"
        />
      </div>
    </div>
  );
};

//#region =============================helper functions =========================================

const getDatesFromSports = (sports: any): { sportsDates: Date[] } => {
  const sportsDates: Date[] = [];

  sports.forEach((sport: any) => {
    if (sport?.properties?.["Date"]?.date?.start) {
      sportsDates.push(new Date(sport.properties.Date.date.start));
    }
  });

  return { sportsDates };
};

//#endregion

export default SportsStrike;
