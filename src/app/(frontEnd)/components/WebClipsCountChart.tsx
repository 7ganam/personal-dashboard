import { useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
import { useWebclipsCounts } from "../apiRequests/webclips-requests";

type Props = {
  target: number;
};

const WebClipsCountChart = (props: Props) => {
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

  // Add state for the popover
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const {
    data: webclipsCounts = [],
    isLoading,
    error: errorWebclipsCounts,
    refetch,
  } = useWebclipsCounts(startDate, endDate);

  const sortedWebclipsCounts = webclipsCounts.sort((a: any, b: any) => {
    const dateA = new Date(a.properties.Date.date.start);
    const dateB = new Date(b.properties.Date.date.start);
    return dateA.getTime() - dateB.getTime();
  });

  const { xAxis, yAxis } = calculateXandYAxis(sortedWebclipsCounts, startDate);

  const webclipsData = xAxis.map((date: any) => {
    return {
      name: new Date(date).getTime(), // Convert to timestamp for proper date scaling
      displayDate: date, // Keep original date for display
      uv: yAxis[xAxis.indexOf(date)],
      goal: props.target,
    };
  });

  // Custom tick formatter for x-axis
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
      {/* Loading indicator */}
      {isLoading && (
        <div className="h-5 w-5 absolute top-0 left-0 flex items-start justify-start z-10">
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

      {/* Date pickers + titles */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="mb-4 flex justify-between items-center px-0">
          <h2 className="text-sm font-semibold">Web Clips Count</h2>
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
              }}
            >
              <RotateLeftIcon sx={{ fontSize: 16 }} />
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
            data={webclipsData}
            margin={{
              top: 30,
              right: 10,
              bottom: 60,
              left: 0,
            }}
          >
            <CartesianGrid
              stroke="#f5f5f5"
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
              interval={1}
              width={30}
              allowDecimals={false}
              ticks={Array.from(
                {
                  length: Math.ceil(
                    Math.max(...webclipsData.map((d: any) => d.uv || 0)) / 2 + 1
                  ),
                },
                (_, i) => i * 2
              )}
            />
            <Tooltip
              labelFormatter={(timestamp) => formatXAxis(new Date(timestamp))}
            />
            {/* Add horizontal reference lines */}
            {Array.from(
              {
                length: Math.ceil(
                  Math.max(...webclipsData.map((d: any) => d.uv || 0)) / 2 + 1
                ),
              },
              (_, i) => i * 2
            ).map((value) => (
              <ReferenceLine
                key={value}
                y={value}
                stroke="#e5e7eb"
                strokeDasharray="none"
                label={{
                  value: value.toString(),
                  position: "right",
                  fill: "#666666",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              />
            ))}
            <Line
              type="monotone"
              dataKey="uv"
              stroke="blue"
              name="Web Clips Count"
              isAnimationActive={false}
              dot={{ r: 2, fill: "#2E7D32" }}
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

export default WebClipsCountChart;

//#region ======================= Helper Functions =========================

const calculateXandYAxis = (sortedWebclipsCounts: any, startDate: any) => {
  const formattedDates = sortedWebclipsCounts.map((item: any) =>
    formatDateFromIsoString(item.properties.Date.date.start)
  );

  const xAxis = formattedDates;
  const yAxis = sortedWebclipsCounts.map((item: any) => {
    return item?.properties?.count?.number;
  });

  //if the xAxis doesn't start with startDate add a point with xAxis value as startDate and yAxis value as 0
  if (!xAxis.includes(formatDateFromIsoString(startDate))) {
    xAxis.unshift(formatDateFromIsoString(startDate));
    yAxis.unshift(null);
  }

  return { xAxis, yAxis };
};
//#endregion
