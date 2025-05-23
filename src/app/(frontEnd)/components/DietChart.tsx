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
import { useDietData } from "../apiRequests/diet-requests";

type Props = { caloriesLimit: number };

const DietChart = (props: Props) => {
  //#region ======================= fetch diet data =========================
  // Get date from one month ago
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const today = new Date();

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState(formatDateToYYYYMMDD(oneMonthAgo)); // Default to one month ago

  const [endDate, setEndDate] = useState(formatDateToYYYYMMDD(today)); // Default to today
  const [reloadCount, setReloadCount] = useState(0);

  const {
    data: diet = [],
    isLoading,
    isFetching,
    error: errorDiet,
    refetch,
  } = useDietData(startDate, endDate);

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
    dates.push(formatDateToYYYYMMDD(bufferDate));

    const currentDate = new Date(start);
    const endDate = new Date(end);

    while (currentDate <= endDate) {
      dates.push(formatDateToYYYYMMDD(currentDate));
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

    return {
      name: new Date(date).getTime(),
      displayDate: date,
      calories: isBufferDate ? null : hasNoData && !isToday ? null : calories,
      caloriesBelowLimit: isBufferDate
        ? null
        : hasNoData && !isToday
        ? null
        : Math.min(calories, props.caloriesLimit),
      caloriesAboveLimit: isBufferDate
        ? null
        : hasNoData && !isToday
        ? null
        : Math.max(0, calories - props.caloriesLimit),
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
  const formatXAxis = timeFormat("%d");

  // Add number formatter for Y-axis
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}k`;
    }
    return `${(value / 1000).toFixed(1)}k`;
  };

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
            value: timeFormat("%b")(currentDate),
            position: "top",
            style: { fontSize: "12px", fontFamily: "monospace" },
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
  //#endregion

  //#region ======================= render =========================
  // Add state for the popover
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="w-full h-full relative ">
      {/* Date pickers + titles */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="mb-4 flex justify-between items-center px-0 ">
          <h2 className="text-sm font-semibold">Calories Intake</h2>
          <div className="flex gap-2">
            <Button
              variant="contained"
              onClick={handleClick}
              size="small"
              sx={{
                minWidth: "24px",
                width: "24px",
                height: "24px",
                padding: 0,
              }}
            >
              <CalendarMonthIcon sx={{ fontSize: 16 }} />
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
              onClick={() => refetch()}
              sx={{
                minWidth: "24px",
                width: "24px",
                height: "24px",
                padding: 0,
                position: "relative",
              }}
            >
              {isLoading || isFetching ? (
                <CircularProgress size={10} sx={{ color: "white" }} />
              ) : (
                <RotateLeftIcon sx={{ fontSize: 16 }} />
              )}
            </Button>
          </div>
        </div>
      </LocalizationProvider>

      {/* Chart */}
      <div className="w-full h-full relative">
        <ResponsiveContainer width="100%" height="125%">
          <ComposedChart
            width={500}
            height={400}
            data={dietData}
            margin={{
              top: 30,
              right: 10,
              bottom: 60,
              left: 0,
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
              interval={4}
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
                      className="text-xs"
                      fontFamily="monospace"
                    >
                      {formatXAxis(date)}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis
              domain={[0, "auto"]}
              dx={-5}
              tick={{ fontSize: 12, fontFamily: "monospace" }}
              interval={0}
              width={30}
              tickFormatter={formatYAxis}
              allowDecimals={false}
            />
            <Tooltip
              labelFormatter={(timestamp) => formatXAxis(new Date(timestamp))}
            />
            <Bar
              dataKey="noData"
              stackId="diet"
              barSize={20}
              name="No Data"
              isAnimationActive={false}
              fill="#F5F5F5"
              xAxisId={0}
              offset={20}
            />
            {generateMonthReferenceLines()}
            {/* Calories below limit - shown in grey */}
            <Bar
              dataKey="caloriesBelowLimit"
              stackId="diet"
              barSize={20}
              name="Calories Below Limit"
              isAnimationActive={false}
              xAxisId={0}
              offset={20}
            >
              {dietData.map((entry: any, index: any) => {
                if (entry.caloriesBelowLimit === null)
                  return <Cell key={`cell-${entry?.name}`} fill="#F5F5F5" />;
                return <Cell key={`cell-${entry?.name}`} fill="#808080" />;
              })}
            </Bar>
            {/* Calories above limit - shown in red */}
            <Bar
              dataKey="caloriesAboveLimit"
              stackId="diet"
              barSize={20}
              name="Calories Above Limit"
              isAnimationActive={false}
              xAxisId={0}
              offset={20}
            >
              {dietData.map((entry: any, index: any) => {
                if (entry.caloriesAboveLimit === null)
                  return <Cell key={`cell-${entry?.name}`} fill="#F5F5F5" />;
                return <Cell key={`cell-${entry?.name}`} fill="#FF0A00" />;
              })}
            </Bar>
            <Bar
              dataKey="remaining"
              stackId="diet"
              barSize={20}
              name="Remaining Calories"
              isAnimationActive={false}
              fill="#4CAF50"
              xAxisId={0}
              offset={20}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#FF0A00"
              name="Limit Line"
              isAnimationActive={false}
              dot={false}
            />
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
