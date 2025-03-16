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

const DietChart = (props: Props) => {
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
  const [diet, setDiet] = useState<any>([]);
  const [errorDiet, setErrorDiet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    async function fetchDietPages(startDate: string, endDate: string) {
      setIsLoading(true);
      let hasMore = true;
      let nextCursor = undefined;
      let allResults: any[] = [];
      while (hasMore) {
        try {
          const response: any = await fetch("/api/notion/diet", {
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
          setDiet(allResults);
        } catch (error) {
          console.error("Error fetching data:", error);
          setErrorDiet(
            error instanceof Error ? error.message : "An error occurred"
          );
          setDiet([]);
        } finally {
        }
      }
      setIsLoading(false);
    }

    fetchDietPages(startDate, endDate);
  }, [startDate, endDate, reloadCount]); // Re-fetch when dates change

  const sortedDietData = diet.sort((a: any, b: any) => {
    const dateA = new Date(a.properties.Date.date.start);
    const dateB = new Date(b.properties.Date.date.start);
    return dateA.getTime() - dateB.getTime();
  });

  const { xAxis, yAxis } = calculateXandYAxis(sortedDietData, startDate);

  const dietData = xAxis.map((date: any) => {
    return {
      name: new Date(date).getTime(), // Convert to timestamp for proper date scaling
      displayDate: date, // Keep original date for display
      amt: 1800,
      uv: 1800,
      pv: yAxis[xAxis.indexOf(date)],
      cnt: 490,
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
              domain={["dataMin", "dataMax"]}
              tickFormatter={(timestamp) => formatXAxis(new Date(timestamp))}
              angle={-90}
              textAnchor="end"
              height={90}
              dy={10}
            />
            <YAxis
              label={{ value: "Calories", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              labelFormatter={(timestamp) => formatXAxis(new Date(timestamp))}
            />
            <Bar
              dataKey="pv"
              barSize={20}
              name="Daily Calories"
              isAnimationActive={false}
            >
              {dietData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pv > 1800 ? "#FF0000" : "#4CAF50"}
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="uv"
              stroke="#2E7D32"
              name="Target Line"
              dot={false}
              isAnimationActive={false}
            />
            {generateMonthReferenceLines()}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DietChart;

//#region ======================= Helper Functions =========================
const formatDate = (date: any) => {
  // Convert to ISO string format for proper date handling
  const date2 = new Date(date);
  return date2.toISOString().split("T")[0];
};

const calculateXandYAxis = (sortedDietData: any, startDate: any) => {
  const uniqueFormattedDates = [
    ...new Set(
      sortedDietData.map((item: any) =>
        formatDate(item.properties.Date.date.start)
      )
    ),
  ];

  const groupedDietDataPerDay: { date: string; diets: number[] }[] = [];

  uniqueFormattedDates.forEach((date: any) => {
    const diets = sortedDietData.filter(
      (item: any) => formatDate(item.properties.Date.date.start) === date
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
  if (!xAxis.includes(formatDate(startDate))) {
    xAxis.unshift(formatDate(startDate));
    yAxis.unshift(0);
  }

  return { xAxis, yAxis };
};
//#endregion
