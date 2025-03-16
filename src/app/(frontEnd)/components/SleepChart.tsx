import { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { timeFormat } from "d3-time-format";

import dayjs, { Dayjs } from "dayjs";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Button } from "@mui/material";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
type Props = {};

const SleepChart = (props: Props) => {
  // Get first day of current month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState(
    firstDayOfMonth.toISOString().split("T")[0]
  ); // Default to first day of current month

  const [endDate, setEndDate] = useState(tomorrow.toISOString().split("T")[0]); // Default to tomorrow
  const [sleep, setSleep] = useState<any>([]);
  const [errorSleep, setErrorSleep] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    async function fetchSleepPages(startDate: string, endDate: string) {
      setIsLoading(true);
      let hasMore = true;
      let nextCursor = undefined;
      let allResults: any[] = [];
      while (hasMore) {
        try {
          const response: any = await fetch("/api/notion/sleep", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              startDate,
              endDate,
              requestNextCursor: nextCursor,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          const result = await response.json();
          allResults = [...allResults, ...result.data];
          hasMore = result.hasMore;
          nextCursor = result.nextCursor;
          setSleep(allResults);
        } catch (error) {
          console.error("Error fetching data:", error);
          setErrorSleep(
            error instanceof Error ? error.message : "An error occurred"
          );
          setSleep([]);
        } finally {
        }
      }
      setIsLoading(false);
    }

    fetchSleepPages(startDate, endDate);
  }, [startDate, endDate, reloadCount]); // Re-fetch when dates change

  const sortedSleepData = sleep.sort((a: any, b: any) => {
    const dateA = new Date(a.properties.Date.date.start);
    const dateB = new Date(b.properties.Date.date.start);
    return dateA.getTime() - dateB.getTime();
  });

  const { xAxis, yAxis } = calculateXandYAxis(sortedSleepData, startDate);

  const sleepData = xAxis.map((date: any) => {
    return {
      name: new Date(date).getTime(), // Convert to timestamp for proper date scaling
      displayDate: date, // Keep original date for display
      uv: yAxis[xAxis.indexOf(date)],
      goal: 8,
    };
  });

  console.log(sleepData);
  // Custom tick formatter for x-axis
  const formatXAxis = timeFormat("%d-%m-%y");

  // Add this function to generate month reference lines
  const generateMonthReferenceLines = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const referenceLines = [];

    let currentDate = new Date(start.getFullYear(), start.getMonth(), 1);

    while (currentDate <= end) {
      referenceLines.push(
        <ReferenceLine
          key={currentDate.getTime()}
          x={currentDate.getTime()}
          stroke="#666"
          strokeDasharray="3 3"
          label={{
            value: timeFormat("%b %Y")(currentDate),
            position: "top",
          }}
        />
      );

      // Move to first day of next month
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
    }

    return referenceLines;
  };

  return (
    <div className="w-full h-full ">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="mb-4 flex gap-4 ml-[80px] justify-end px-10">
          <DatePicker
            className="w-[150px]"
            slotProps={{ textField: { size: "small" } }}
            label="Start Date"
            value={dayjs(startDate)}
            onChange={(newValue: Dayjs | null) =>
              setStartDate(newValue?.format("YYYY-MM-DD") || startDate)
            }
          />
          <DatePicker
            className="w-[150px]"
            slotProps={{ textField: { size: "small" } }}
            label="End Date"
            value={dayjs(endDate)}
            onChange={(newValue: Dayjs | null) =>
              setEndDate(newValue?.format("YYYY-MM-DD") || endDate)
            }
          />
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
      </LocalizationProvider>
      <div className="w-full h-[600px] relative">
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

        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart
            width={500}
            height={400}
            data={sleepData}
            margin={{
              top: 30,
              right: 40,
              bottom: 90,
              left: 20,
            }}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis
              dataKey="name"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(timestamp) => formatXAxis(new Date(timestamp))}
              angle={-90}
              textAnchor="end"
              height={90}
              dy={10}
            />
            <YAxis
              label={{
                value: "Sleep Duration (Hours)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              labelFormatter={(timestamp) => formatXAxis(new Date(timestamp))}
            />

            <Bar
              dataKey="uv"
              barSize={20}
              name="Daily Sleep"
              isAnimationActive={false}
            >
              {sleepData.map((entry: any, index: any) => (
                <Cell
                  key={`cell-${entry?.name}`}
                  fill={entry.uv > 8 ? "#FF0000" : "#4CAF50"}
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="goal"
              stroke="#2E7D32"
              name="Target Line"
              isAnimationActive={false}
              dot={false}
            />
            {generateMonthReferenceLines()}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SleepChart;

//#region ======================= Helper Functions =========================
const formatDate = (date: string) => {
  const date2 = new Date(date);
  return `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date2.getDate()).padStart(2, "0")}`;
};

const calculateXandYAxis = (sortedSleepData: any, startDate: string) => {
  console.log("--------------------------------");
  const uniqueFormattedDates: string[] = [
    ...new Set(
      sortedSleepData.map((item: any) =>
        formatDate(item?.properties?.Date?.date?.start)
      )
    ),
  ] as string[];

  const x = sortedSleepData.map(
    (item: any) => item?.properties?.Date?.date?.start
  );

  const y = sortedSleepData.map((item: any) =>
    formatDate(item?.properties?.Date?.date?.start)
  );

  console.log({ x });
  console.log({ y });
  const xAxis = uniqueFormattedDates;

  console.log({
    sortedSleepData: sortedSleepData,
  });
  console.log({
    uniqueFormattedDates: uniqueFormattedDates,
  });

  const yAxis = xAxis.map((date: string) => {
    const sleepDataStartingInThisDay = sortedSleepData.filter(
      (item: any) => formatDate(item?.properties?.Date?.date?.start) === date
    );

    const sleepDataStartingInPreviousDay = sortedSleepData.filter(
      (item: any) => {
        const itemDate: any = new Date(item?.properties?.Date?.date?.start);
        const compareDate: any = new Date(date);
        compareDate.setDate(compareDate.getDate() - 1);
        return formatDate(itemDate) === formatDate(compareDate);
      }
    );

    //can be multiple items
    const sleepDataStartingInThisDayAndEndedInThisDay =
      sleepDataStartingInThisDay.filter(
        (item: any) => formatDate(item?.properties?.Date?.date?.end) === date
      );

    //should be only one item
    const sleepDataStartingInThisDayAndEndedInNextDay =
      sleepDataStartingInThisDay.find((item: any) => {
        const endDate: any = new Date(item?.properties?.Date?.date?.end);
        const compareDate: any = new Date(date);
        compareDate.setDate(compareDate.getDate() + 1);
        return formatDate(endDate) === formatDate(compareDate);
      });

    //should be only one item
    const sleepDataStartingInPreviousDayAndEndedInThisDay =
      sleepDataStartingInPreviousDay.find(
        (item: any) => formatDate(item?.properties?.Date?.date?.end) === date
      );

    //the part of sleep data that started yesterday and ended today that falls in today
    const overlapFromPreviousDay =
      sleepDataStartingInPreviousDayAndEndedInThisDay
        ? new Date(
            sleepDataStartingInPreviousDayAndEndedInThisDay.properties.Date.date.end
          ).getTime() - new Date(date).setHours(0, 0, 0, 0)
        : 0;

    const overlapFromNextDay = sleepDataStartingInThisDayAndEndedInNextDay
      ? new Date(date).setHours(23, 59, 59, 999) -
        new Date(
          sleepDataStartingInThisDayAndEndedInNextDay.properties.Date.date.start
        ).getTime()
      : 0;

    const sameDaySleepDuration =
      sleepDataStartingInThisDayAndEndedInThisDay.reduce(
        (acc: any, item: any) => {
          const startSleepDate = new Date(item?.properties?.Date?.date?.start);
          const endSleepDate = new Date(item?.properties?.Date?.date?.end);
          const sleepDuration =
            endSleepDate.getTime() - startSleepDate.getTime();
          return acc + sleepDuration;
        },
        0
      );

    const totalSleepDuration =
      sameDaySleepDuration + overlapFromPreviousDay + overlapFromNextDay;

    const sleepDurationInHours = totalSleepDuration / (1000 * 60 * 60);
    return sleepDurationInHours;
  });

  //if the xAxis doesn't start with startDate add a point with xAxis value as startDate and yAxis value as 0
  if (!xAxis.includes(formatDate(startDate))) {
    xAxis.unshift(formatDate(startDate));
    yAxis.unshift(0);
  }

  return { xAxis, yAxis };
};
//#endregion
