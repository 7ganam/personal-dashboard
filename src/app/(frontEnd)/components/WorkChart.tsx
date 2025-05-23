import { useState } from "react";
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
import { useWorkData } from "../apiRequests/work-requests";

type Props = { workTarget: number };

const WorkChart = (props: Props) => {
  // Get date from one month ago
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const today = new Date();

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState(formatDateToYYYYMMDD(oneMonthAgo)); // Default to one month ago

  const [endDate, setEndDate] = useState(formatDateToYYYYMMDD(today)); // Default to tomorrow

  // Add state for the popover
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Use React Query hook
  const {
    data: work = [],
    isLoading,
    isFetching,
    error: errorWork,
    refetch,
  } = useWorkData(startDate, endDate);

  const sortedWorkData = work.sort((a: any, b: any) => {
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

  const { xAxis: workDates, yAxis: workHoursArray } = calculateXandYAxis(
    sortedWorkData,
    startDate
  );

  // Get all dates in range and create data points
  const allDates = generateDateRange(startDate, endDate);
  const workData = allDates.map((date: string) => {
    const workIndex = workDates.indexOf(date);
    const hours = workIndex >= 0 ? workHoursArray[workIndex] : 0;
    const isBufferDate = new Date(date) < new Date(startDate);
    const isToday = new Date(date).toDateString() === new Date().toDateString();
    const hasNoData = hours === 0;

    return {
      name: new Date(date).getTime(),
      displayDate: date,
      uv: isBufferDate ? null : hasNoData && !isToday ? null : hours,
      goal: isBufferDate ? null : props.workTarget,
      remaining: isBufferDate
        ? null
        : hasNoData && !isToday
        ? null
        : hours >= props.workTarget
        ? 0
        : props.workTarget - hours,
      noData: isBufferDate
        ? null
        : hasNoData && !isToday
        ? props.workTarget
        : null,
    };
  });

  const formatXAxis = timeFormat("%d");

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
            fill: "#666666",
            fontSize: 10,
            fontFamily: "monospace",
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
    <div className="w-full h-full relative">
      {/* Date pickers + titles */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="mb-4 flex justify-between items-center px-0">
          <h2 className="text-sm font-semibold">Work Duration</h2>
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
              {isFetching ? (
                <CircularProgress size={10} sx={{ color: "white" }} />
              ) : (
                <RotateLeftIcon sx={{ fontSize: 16 }} />
              )}
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
          </div>
        </div>
      </LocalizationProvider>

      {/* Chart */}
      <div className="w-full h-full relative">
        <ResponsiveContainer width="100%" height="125%">
          <ComposedChart
            width={500}
            height={400}
            data={workData}
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
              allowDecimals={false}
            />
            <Tooltip
              labelFormatter={(timestamp) => formatXAxis(new Date(timestamp))}
            />
            <Bar
              dataKey="uv"
              stackId="work"
              barSize={20}
              name="Daily Work"
              isAnimationActive={false}
              xAxisId={0}
              offset={20}
            >
              {workData.map((entry: any, index: any) => (
                <Cell key={`cell-${entry?.name}`} fill={"#4CAF50"} />
              ))}
            </Bar>
            <Bar
              dataKey="remaining"
              stackId="work"
              barSize={20}
              name="Remaining Hours"
              isAnimationActive={false}
              fill="#FF0A00"
              xAxisId={0}
              offset={20}
            />
            <Bar
              dataKey="noData"
              stackId="work"
              barSize={20}
              name="No Data"
              isAnimationActive={false}
              fill="#F5F5F5"
              xAxisId={0}
              offset={20}
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

//#region ===============================Helper Functions===============================

const calculateXandYAxis = (sortedWorkData: any, startDate: string) => {
  const uniqueFormattedDates: string[] = [
    ...new Set(
      sortedWorkData.map((item: any) =>
        formatDateFromIsoString(item?.properties?.Date?.date?.start)
      )
    ),
  ] as string[];

  const x = sortedWorkData.map(
    (item: any) => item?.properties?.Date?.date?.start
  );

  const y = sortedWorkData.map((item: any) =>
    formatDateFromIsoString(item?.properties?.Date?.date?.start)
  );

  const xAxis = uniqueFormattedDates;

  const yAxis = xAxis.map((date: string) => {
    const workDurationInHours = workDurationInDate(sortedWorkData, date);
    return workDurationInHours;
  });

  //if the xAxis doesn't start with startDate add a point with xAxis value as startDate and yAxis value as 0
  if (!xAxis.includes(formatDateFromIsoString(startDate))) {
    xAxis.unshift(formatDateFromIsoString(startDate));
    yAxis.unshift(0);
  }

  return { xAxis, yAxis };
};

const workDurationInDate = (sortedWorkData: any, date: string) => {
  const workDataStartingInThisDay = sortedWorkData.filter(
    (item: any) =>
      formatDateFromIsoString(item?.properties?.Date?.date?.start) === date
  );

  const workDataStartingInPreviousDay = sortedWorkData.filter((item: any) => {
    const itemDate: any = new Date(item?.properties?.Date?.date?.start);
    const compareDate: any = new Date(date);
    compareDate.setDate(compareDate.getDate() - 1);
    return (
      formatDateFromIsoString(itemDate) === formatDateFromIsoString(compareDate)
    );
  });

  //can be multiple items
  const workDataStartingInThisDayAndEndedInThisDay =
    workDataStartingInThisDay.filter(
      (item: any) =>
        formatDateFromIsoString(item?.properties?.Date?.date?.end) === date
    );

  //should be only one item
  const workDataStartingInThisDayAndEndedInNextDay =
    workDataStartingInThisDay.find((item: any) => {
      const endDate: any = new Date(item?.properties?.Date?.date?.end);
      const compareDate: any = new Date(date);
      compareDate.setDate(compareDate.getDate() + 1);
      return (
        formatDateFromIsoString(endDate) ===
        formatDateFromIsoString(compareDate)
      );
    });

  //should be only one item
  const workDataStartingInPreviousDayAndEndedInThisDay =
    workDataStartingInPreviousDay.find(
      (item: any) =>
        formatDateFromIsoString(item?.properties?.Date?.date?.end) === date
    );

  //the part of work data that started yesterday and ended today that falls in today
  const overlapFromPreviousDay = workDataStartingInPreviousDayAndEndedInThisDay
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

  const sameDayWorkDuration = workDataStartingInThisDayAndEndedInThisDay.reduce(
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
};

//#endregion

export default WorkChart;
