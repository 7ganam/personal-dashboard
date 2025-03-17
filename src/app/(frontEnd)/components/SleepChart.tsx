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
import { formatDateFromIsoString } from "../utils/utils";
type Props = { sleepLimit: number };

const SleepChart = (props: Props) => {
  // Get first day of current month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);

  const today = new Date();

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState(
    firstDayOfMonth.toISOString().split("T")[0]
  ); // Default to first day of current month

  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]); // Default to tomorrow
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

  // Generate array of all dates between start and end date
  const generateDateRange = (start: string, end: string) => {
    const dates = [];

    // WORKAROUND: Adding a buffer date one day before the start date.
    // This is needed because Recharts centers bars on their x-axis ticks by default.
    // which was causing it to intersect with the y-axis labels.
    const bufferDate = new Date(start);
    bufferDate.setDate(bufferDate.getDate() - 1);
    dates.push(formatDateFromIsoString(bufferDate.toISOString()));

    const currentDate = new Date(start);
    const endDate = new Date(end);

    while (currentDate <= endDate) {
      dates.push(formatDateFromIsoString(currentDate.toISOString()));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const { xAxis, yAxis } = calculateXandYAxis(sortedSleepData, startDate);

  // Get all dates in range and create data points
  const allDates = generateDateRange(startDate, endDate);
  const sleepData = allDates.map((date: string) => {
    const dateIndex = xAxis.indexOf(date);
    const hours = dateIndex >= 0 ? yAxis[dateIndex] : 0;
    const isBufferDate = new Date(date) < new Date(startDate);
    const isToday = new Date(date).toDateString() === new Date().toDateString();
    const hasNoData = hours === 0;

    return {
      name: new Date(date).getTime(), // Convert to timestamp for proper date scaling
      displayDate: date, // Keep original date for display
      sleep: isBufferDate ? null : hasNoData && !isToday ? null : hours,
      target: isBufferDate ? null : props.sleepLimit,
      remaining: isBufferDate
        ? null
        : hasNoData && !isToday
        ? null
        : hours >= props.sleepLimit
        ? 0
        : props.sleepLimit - hours,
      noData: isBufferDate
        ? null
        : hasNoData && !isToday
        ? props.sleepLimit
        : null,
    };
  });

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
              dx={-4}
              interval={0}
              tickMargin={0}
              tickSize={8}
              tickLine={{ transform: "translate(20, 0)" }}
              tick={(props) => {
                const { x, y, payload } = props;
                const date = new Date(payload.value);
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <g transform={`translate(${x + 20},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={16}
                      textAnchor="end"
                      fill={isToday ? "#4CAF50" : "#666666"}
                      transform="rotate(-90) translate(-5, -28)"
                      className={"text-sm" + isToday ? " font-bold" : ""}
                      fontFamily="monospace"
                    >
                      {formatXAxis(date)}
                    </text>
                  </g>
                );
              }}
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

            {generateMonthReferenceLines()}
            {/* Actual sleep hours - shown in red */}
            <Bar
              dataKey="sleep"
              stackId="sleep"
              barSize={20}
              name="Daily Sleep"
              isAnimationActive={false}
              xAxisId={0}
              offset={20}
            >
              {sleepData.map((entry: any, index: any) => (
                <Cell key={`cell-${entry?.name}`} fill={"#FF0A00"} />
              ))}
            </Bar>
            {/* Green bar showing remaining hours to target when below target */}
            <Bar
              dataKey="remaining"
              stackId="sleep"
              barSize={20}
              name="Remaining Sleep"
              isAnimationActive={false}
              fill="#4CAF50"
              xAxisId={0}
              offset={20}
            />
            {/* Grey bar for days with no data (except today) */}
            <Bar
              dataKey="noData"
              stackId="sleep"
              barSize={20}
              name="No Data"
              isAnimationActive={false}
              fill="#F5F5F5"
              xAxisId={0}
              offset={20}
            />
            {/* Target line showing sleep goal */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="#2E7D32"
              name="Target Line"
              isAnimationActive={false}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SleepChart;

//#region ======================= Helper Functions =========================

const calculateXandYAxis = (sortedSleepData: any, startDate: string) => {
  const uniqueFormattedDates: string[] = [
    ...new Set(
      sortedSleepData.map((item: any) =>
        formatDateFromIsoString(item?.properties?.Date?.date?.start)
      )
    ),
  ] as string[];

  const x = sortedSleepData.map(
    (item: any) => item?.properties?.Date?.date?.start
  );

  const y = sortedSleepData.map((item: any) =>
    formatDateFromIsoString(item?.properties?.Date?.date?.start)
  );

  const xAxis = uniqueFormattedDates;

  const yAxis = xAxis.map((date: string) => {
    const sleepDataStartingInThisDay = sortedSleepData.filter(
      (item: any) =>
        formatDateFromIsoString(item?.properties?.Date?.date?.start) === date
    );

    const sleepDataStartingInPreviousDay = sortedSleepData.filter(
      (item: any) => {
        const itemDate: any = new Date(item?.properties?.Date?.date?.start);
        const compareDate: any = new Date(date);
        compareDate.setDate(compareDate.getDate() - 1);
        return (
          formatDateFromIsoString(itemDate) ===
          formatDateFromIsoString(compareDate)
        );
      }
    );

    //can be multiple items
    const sleepDataStartingInThisDayAndEndedInThisDay =
      sleepDataStartingInThisDay.filter(
        (item: any) =>
          formatDateFromIsoString(item?.properties?.Date?.date?.end) === date
      );

    //should be only one item
    const sleepDataStartingInThisDayAndEndedInNextDay =
      sleepDataStartingInThisDay.find((item: any) => {
        const endDate: any = new Date(item?.properties?.Date?.date?.end);
        const compareDate: any = new Date(date);
        compareDate.setDate(compareDate.getDate() + 1);
        return (
          formatDateFromIsoString(endDate) ===
          formatDateFromIsoString(compareDate)
        );
      });

    //should be only one item
    const sleepDataStartingInPreviousDayAndEndedInThisDay =
      sleepDataStartingInPreviousDay.find(
        (item: any) =>
          formatDateFromIsoString(item?.properties?.Date?.date?.end) === date
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
  if (!xAxis.includes(formatDateFromIsoString(startDate))) {
    xAxis.unshift(formatDateFromIsoString(startDate));
    yAxis.unshift(0);
  }

  return { xAxis, yAxis };
};
//#endregion
