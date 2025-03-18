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
import { Button, Popover } from "@mui/material";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { formatDateFromIsoString, formatDateToYYYYMMDD } from "../utils/utils";

type Props = {
  weightTarget: number;
};

const WeightChart = (props: Props) => {
  // Get first day of current month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState(
    formatDateToYYYYMMDD(firstDayOfMonth)
  ); // Default to first day of current month

  const [endDate, setEndDate] = useState(formatDateToYYYYMMDD(tomorrow)); // Default to tomorrow
  console.log({ endDate });
  const [weight, setWeight] = useState<any>([]);
  const [errorWeight, setErrorWeight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  // Add state for the popover
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    async function fetchWeightPages(startDate: string, endDate: string) {
      setIsLoading(true);
      let hasMore = true;
      let nextCursor = undefined;
      let allResults: any[] = [];
      while (hasMore) {
        try {
          const response: any = await fetch("/api/notion/weight", {
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
          setWeight(allResults);
        } catch (error) {
          console.error("Error fetching data:", error);
          setErrorWeight(
            error instanceof Error ? error.message : "An error occurred"
          );
          setWeight([]);
        } finally {
        }
      }
      setIsLoading(false);
    }

    fetchWeightPages(startDate, endDate);
  }, [startDate, endDate, reloadCount]); // Re-fetch when dates change

  const sortedWeightData = weight.sort((a: any, b: any) => {
    const dateA = new Date(a.properties.Date.date.start);
    const dateB = new Date(b.properties.Date.date.start);
    return dateA.getTime() - dateB.getTime();
  });

  const { xAxis, yAxis } = calculateXandYAxis(sortedWeightData, startDate);

  const weightData = xAxis.map((date: any) => {
    return {
      name: new Date(date).getTime(), // Convert to timestamp for proper date scaling
      displayDate: date, // Keep original date for display
      uv: yAxis[xAxis.indexOf(date)],
      goal: 75,
    };
  });

  // Custom tick formatter for x-axis
  const formatXAxis = timeFormat("%d-%m");

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
        <div className="mb-4 flex justify-between items-center px-10">
          <h2 className="text-xl font-semibold">Weight Tracking</h2>
          <div className="flex gap-4">
            <Button
              variant="contained"
              onClick={handleClick}
              size="small"
              className="min-w-[40px]"
            >
              <CalendarMonthIcon />
            </Button>
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <div className="p-4 flex flex-col gap-4">
                <DatePicker
                  className="w-[200px]"
                  slotProps={{ textField: { size: "small" } }}
                  label="Start Date"
                  value={dayjs(startDate)}
                  onChange={(newValue: Dayjs | null) =>
                    setStartDate(newValue?.format("YYYY-MM-DD") || startDate)
                  }
                />
                <DatePicker
                  className="w-[200px]"
                  slotProps={{ textField: { size: "small" } }}
                  label="End Date"
                  value={dayjs(endDate)}
                  onChange={(newValue: Dayjs | null) =>
                    setEndDate(newValue?.format("YYYY-MM-DD") || endDate)
                  }
                />
              </div>
            </Popover>
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
            data={weightData}
            margin={{
              top: 30,
              right: 40,
              bottom: 90,
              left: 10,
            }}
          >
            <CartesianGrid
              stroke="#e5e7eb"
              horizontal={true}
              vertical={false}
              strokeDasharray="none"
            />
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
              domain={[73, "auto"]}
              dx={-10}
              // Calculate number of grid lines needed:
              // 1. Get max weight value from data (d.uv || 0 handles null values)
              // 2. Subtract 73 (min weight) to get the range
              // 3. Add 1 to include both start and end values
              // 4. Round up to ensure we cover the full range
              // 5. Create array of integers from 73 up to max value
              ticks={Array.from(
                {
                  length: Math.ceil(
                    Math.max(...weightData.map((d: any) => d.uv || 0)) - 73 + 1
                  ),
                },
                (_, i) => 73 + i
              )}
            />
            <Tooltip
              labelFormatter={(timestamp) => formatXAxis(new Date(timestamp))}
            />
            <Line
              type="monotone"
              dataKey="uv"
              stroke="blue"
              name="Target Line"
              isAnimationActive={false}
              dot={{ r: 4, fill: "#2E7D32" }}
            />
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

export default WeightChart;

//#region ======================= Helper Functions =========================

const calculateXandYAxis = (sortedWeightData: any, startDate: any) => {
  const formattedDates = sortedWeightData.map((item: any) =>
    formatDateFromIsoString(item.properties.Date.date.start)
  );

  const xAxis = formattedDates;
  const yAxis = sortedWeightData.map((item: any) => {
    return item?.properties?.weight?.title[0]?.plain_text;
  });

  //if the xAxis doesn't start with startDate add a point with xAxis value as startDate and yAxis value as 0
  if (!xAxis.includes(formatDateFromIsoString(startDate))) {
    xAxis.unshift(formatDateFromIsoString(startDate));
    yAxis.unshift(null);
  }

  return { xAxis, yAxis };
};
//#endregion
