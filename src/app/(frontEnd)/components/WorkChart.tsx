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

const WorkChart = (props: Props) => {
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
  const [work, setWork] = useState<any>([]);
  const [errorWork, setErrorWork] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    async function fetchWorkPages(startDate: string, endDate: string) {
      setIsLoading(true);
      let hasMore = true;
      let nextCursor = undefined;
      let allResults: any[] = [];
      while (hasMore) {
        try {
          const response: any = await fetch("/api/notion/work", {
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
          setWork(allResults);
        } catch (error) {
          console.error("Error fetching data:", error);
          setErrorWork(
            error instanceof Error ? error.message : "An error occurred"
          );
          setWork([]);
        } finally {
        }
      }
      setIsLoading(false);
    }

    fetchWorkPages(startDate, endDate);
  }, [startDate, endDate, reloadCount]); // Re-fetch when dates change

  const sortedWorkData = work.sort((a: any, b: any) => {
    const dateA = new Date(a.properties.Date.date.start);
    const dateB = new Date(b.properties.Date.date.start);
    return dateA.getTime() - dateB.getTime();
  });

  const { xAxis, yAxis } = calculateXandYAxis(sortedWorkData, startDate);

  const workData = xAxis.map((date: any) => {
    return {
      name: new Date(date).getTime(), // Convert to timestamp for proper date scaling
      displayDate: date, // Keep original date for display
      uv: yAxis[xAxis.indexOf(date)],
      goal: 8,
    };
  });

  console.log(workData);
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
            data={workData}
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
                value: "Work Duration (Hours)",
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
              name="Daily Work"
              isAnimationActive={false}
            >
              {workData.map((entry: any, index: any) => (
                <Cell
                  key={`cell-${entry?.name}`}
                  fill={entry.uv < 8 ? "#FF0000" : "#4CAF50"}
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

export default WorkChart;

//#region ======================= Helper Functions =========================
const formatDate = (date: string) => {
  const date2 = new Date(date);
  return `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date2.getDate()).padStart(2, "0")}`;
};

const calculateXandYAxis = (sortedWorkData: any, startDate: string) => {
  console.log("--------------------------------");
  const uniqueFormattedDates: string[] = [
    ...new Set(
      sortedWorkData.map((item: any) =>
        formatDate(item?.properties?.Date?.date?.start)
      )
    ),
  ] as string[];

  const x = sortedWorkData.map(
    (item: any) => item?.properties?.Date?.date?.start
  );

  const y = sortedWorkData.map((item: any) =>
    formatDate(item?.properties?.Date?.date?.start)
  );

  console.log({ x });
  console.log({ y });
  const xAxis = uniqueFormattedDates;

  console.log({
    sortedWorkData: sortedWorkData,
  });
  console.log({
    uniqueFormattedDates: uniqueFormattedDates,
  });

  const yAxis = xAxis.map((date: string) => {
    const workDataStartingInThisDay = sortedWorkData.filter(
      (item: any) => formatDate(item?.properties?.Date?.date?.start) === date
    );

    const workDataStartingInPreviousDay = sortedWorkData.filter((item: any) => {
      const itemDate: any = new Date(item?.properties?.Date?.date?.start);
      const compareDate: any = new Date(date);
      compareDate.setDate(compareDate.getDate() - 1);
      return formatDate(itemDate) === formatDate(compareDate);
    });

    //can be multiple items
    const workDataStartingInThisDayAndEndedInThisDay =
      workDataStartingInThisDay.filter(
        (item: any) => formatDate(item?.properties?.Date?.date?.end) === date
      );

    //should be only one item
    const workDataStartingInThisDayAndEndedInNextDay =
      workDataStartingInThisDay.find((item: any) => {
        const endDate: any = new Date(item?.properties?.Date?.date?.end);
        const compareDate: any = new Date(date);
        compareDate.setDate(compareDate.getDate() + 1);
        return formatDate(endDate) === formatDate(compareDate);
      });

    //should be only one item
    const workDataStartingInPreviousDayAndEndedInThisDay =
      workDataStartingInPreviousDay.find(
        (item: any) => formatDate(item?.properties?.Date?.date?.end) === date
      );

    //the part of work data that started yesterday and ended today that falls in today
    const overlapFromPreviousDay =
      workDataStartingInPreviousDayAndEndedInThisDay
        ? new Date(
            workDataStartingInPreviousDayAndEndedInThisDay.properties.Date.date.end
          ).getTime() - new Date(date).setHours(0, 0, 0, 0)
        : 0;

    const overlapFromNextDay = workDataStartingInThisDayAndEndedInNextDay
      ? new Date(date).setHours(23, 59, 59, 999) -
        new Date(
          workDataStartingInThisDayAndEndedInNextDay.properties.Date.date.start
        ).getTime()
      : 0;

    const sameDayWorkDuration =
      workDataStartingInThisDayAndEndedInThisDay.reduce(
        (acc: any, item: any) => {
          const startWorkDate = new Date(item?.properties?.Date?.date?.start);
          const endWorkDate = new Date(item?.properties?.Date?.date?.end);
          const workDuration = endWorkDate.getTime() - startWorkDate.getTime();
          return acc + workDuration;
        },
        0
      );

    const totalWorkDuration =
      sameDayWorkDuration + overlapFromPreviousDay + overlapFromNextDay;

    const workDurationInHours = totalWorkDuration / (1000 * 60 * 60);
    return workDurationInHours;
  });

  //if the xAxis doesn't start with startDate add a point with xAxis value as startDate and yAxis value as 0
  if (!xAxis.includes(formatDate(startDate))) {
    xAxis.unshift(formatDate(startDate));
    yAxis.unshift(0);
  }

  return { xAxis, yAxis };
};
//#endregion
