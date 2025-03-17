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
import { fetchDietData } from "../apiRequests/diet-requests";

type Props = { caloriesLimit: number };

const DietChart = (props: Props) => {
  //#region ======================= fetch diet data =========================
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
  const [diet, setDiet] = useState<any>([]);
  const [errorDiet, setErrorDiet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  useEffect(() => {
    fetchDietData(startDate, endDate, setIsLoading, setDiet, setErrorDiet);
  }, [startDate, endDate, reloadCount]); // Re-fetch when dates change

  //#endregion

  //#region ======================= prepare data for chart =========================
  const sortedDietData = diet.sort((a: any, b: any) => {
    const dateA = new Date(a.properties.Date.date.start);
    const dateB = new Date(b.properties.Date.date.start);
    return dateA.getTime() - dateB.getTime();
  });

  const { xAxis, yAxis } = calculateXandYAxis(sortedDietData, startDate);

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

  // Get all dates in range and create data points
  const allDates = generateDateRange(startDate, endDate);
  const dietData = allDates.map((date: string) => {
    const dateIndex = xAxis.indexOf(date);
    const calories = dateIndex >= 0 ? yAxis[dateIndex] : 0;
    const isBufferDate = new Date(date) < new Date(startDate);
    const isToday = new Date(date).toDateString() === new Date().toDateString();
    const hasNoData = calories === 0;

    // Create date at start of day (midnight)
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Add 12 hours (noon) to center the bar
    const timestamp = dateObj.getTime() + 12 * 60 * 60 * 1000;

    return {
      name: timestamp,
      displayDate: date,
      calories: isBufferDate ? null : hasNoData && !isToday ? null : calories,
      target: isBufferDate ? null : props.caloriesLimit,
      remaining: isBufferDate
        ? null
        : hasNoData && !isToday
        ? null
        : calories >= props.caloriesLimit
        ? 0
        : props.caloriesLimit - calories,
      noData: isBufferDate
        ? null
        : hasNoData && !isToday
        ? props.caloriesLimit
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
    currentDate.setHours(12, 0, 0, 0); // Set to noon

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

      // Move to first day of next month (at noon)
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1,
        12 // Set to noon
      );
    }

    return referenceLines;
  };
  //#endregion

  //#region ======================= render =========================
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
            data={dietData}
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
              domain={["auto", "auto"]}
              tickFormatter={(timestamp) => formatXAxis(new Date(timestamp))}
              angle={-90}
              textAnchor="end"
              height={90}
              dy={10}
              dx={20}
              interval={0}
              tickMargin={0}
              tickSize={8}
            />
            <YAxis
              label={{ value: "Calories", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              labelFormatter={(timestamp) => formatXAxis(new Date(timestamp))}
            />
            <Bar
              dataKey="calories"
              stackId="diet"
              barSize={20}
              name="Daily Calories"
              isAnimationActive={false}
              xAxisId={0}
            >
              {dietData.map((entry: any, index: any) => (
                <Cell key={`cell-${entry?.name}`} fill={"#FF0A00"} />
              ))}
            </Bar>
            <Bar
              dataKey="remaining"
              stackId="diet"
              barSize={20}
              name="Remaining Calories"
              isAnimationActive={false}
              fill="#4CAF50"
              xAxisId={0}
              maxBarSize={20}
              offset={-10}
            />
            <Bar
              dataKey="noData"
              stackId="diet"
              barSize={20}
              name="No Data"
              isAnimationActive={false}
              fill="#808080"
              xAxisId={0}
              maxBarSize={20}
              offset={-10}
            />
            <Line
              type="monotone"
              dataKey="target"
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
  //#endregion
};

export default DietChart;

//#region ======================= Helper Functions =========================

const calculateXandYAxis = (sortedDietData: any, startDate: any) => {
  const uniqueFormattedDates = [
    ...new Set(
      sortedDietData.map((item: any) =>
        formatDateFromIsoString(item.properties.Date.date.start)
      )
    ),
  ];

  const groupedDietDataPerDay: { date: string; diets: number[] }[] = [];

  uniqueFormattedDates.forEach((date: any) => {
    const diets = sortedDietData.filter(
      (item: any) =>
        formatDateFromIsoString(item.properties.Date.date.start) === date
    );
    groupedDietDataPerDay.push({ date, diets });
  });

  const xAxis = groupedDietDataPerDay.map((item: any) => item.date);
  const yAxis = groupedDietDataPerDay.map((item: any) => {
    let totalCalories = 0;
    item.diets.forEach((diet: any) => {
      totalCalories += diet.properties.Calories.number;
    });
    return totalCalories;
  });

  //if the xAxis doesn't start with startDate add a point with xAxis value as startDate and yAxis value as 0
  if (!xAxis.includes(formatDateFromIsoString(startDate))) {
    xAxis.unshift(formatDateFromIsoString(startDate));
    yAxis.unshift(0);
  }

  return { xAxis, yAxis };
};
//#endregion
