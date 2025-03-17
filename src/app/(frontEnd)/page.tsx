"use client";
import { useState, useEffect } from "react";
import * as React from "react";

import DietChart from "./components/DietChart";
import { Paper } from "@mui/material";
import WeightChart from "./components/WeightChart";
import SleepChart from "./components/SleepChart";
import WorkChart from "./components/WorkChart";
import TStrike from "./components/TStrike/TStrike";
import DayViewCard from "./components/dayView/DayViewCard";
import SportsStrike from "./components/SportsStrike/SportsStrike";

export default function NotionPage() {
  //#region =======================fetch the thoughts==========================
  const [thoughts, setThoughts] = useState<
    {
      properties: { state: { multi_select: { name: string }[] } };
    }[]
  >([]);

  const [errorThoughts, setErrorThoughts] = useState<string | null>(null);

  useEffect(() => {
    async function fetchThoughts() {
      try {
        const response = await fetch("/api/notion/thoughts");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setThoughts(result.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorThoughts(
          error instanceof Error ? error.message : "An error occurred"
        );
        setThoughts([]);
      }
    }
    fetchThoughts();
  }, []);

  const ongoingThoughts = thoughts?.filter(
    (item) => !item.properties.state?.multi_select[0]?.name
  );

  const staleThoughts = thoughts?.filter(
    (item) => item.properties.state?.multi_select[0]?.name === "stale"
  );
  //#endregion

  //#region =======================fetch the clips=============================
  const [clips, setClips] = useState<any>([]);

  const [errorClips, setErrorClips] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClips() {
      try {
        const response = await fetch("/api/notion/webclips");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setClips(result.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorClips(
          error instanceof Error ? error.message : "An error occurred"
        );
        setClips([]);
      }
    }

    fetchClips();
  }, []);

  const unprocessedClips = clips?.filter(
    (item: any) => !item.properties.state?.select?.name
  );

  //#endregion

  //#region =======================Render======================================
  return (
    <div>
      <h1>Notion Database Entries</h1>
      <div className=" p-10 flex flex-row gap-10 w-[700px] bg-gray-100 rounded-md m-10">
        <DayViewCard />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <a
          href="https://www.notion.so/2544ef9a027d42568da42018d5216390?v=7c39fd3a04d24d94adcb015d306d3519"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer"
        >
          <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md">
            <div>Number of ongoing thoughts</div>
            <div className="text-8xl font-bold w-full text-center">
              {ongoingThoughts.length}
            </div>
          </div>
        </a>
        <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md">
          <div>webclips</div>
          <div className="text-8xl font-bold">{unprocessedClips.length}</div>
        </div>
        <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md">
          <div>Placeholder 3</div>
          <div className="text-8xl font-bold">0</div>
        </div>
        <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md">
          <div>Placeholder 4</div>
          <div className="text-8xl font-bold">0</div>
        </div>
      </div>
      <div className="w-full p-10 flex flex-row gap-10">
        <Paper className=" h-[600px] mt-10 p-10 border-2 border-gray-300 rounded-md">
          <DietChart caloriesLimit={1800} />
        </Paper>
        <Paper className=" h-[600px] mt-10 p-10 border-2 border-gray-300 rounded-md">
          <WeightChart weightTarget={75} />
        </Paper>
      </div>
      <div className="w-full p-10 flex flex-row gap-10">
        <Paper className=" h-[600px] mt-10 p-10 border-2 border-gray-300 rounded-md">
          <SleepChart sleepLimit={9} />
        </Paper>
        <Paper className=" h-[600px] mt-10 p-10 border-2 border-gray-300 rounded-md">
          <WorkChart workTarget={8} />
        </Paper>
      </div>

      <div className="w-full p-10 flex flex-row gap-10 bg-gray-100">
        <Paper className="  mt-10 p-10 border-2 border-gray-300 rounded-md w-[700px]">
          <TStrike />
        </Paper>
        <Paper className="  mt-10 p-10 border-2 border-gray-300 rounded-md w-[700px]">
          <SportsStrike />
        </Paper>
      </div>
    </div>
  );
  //#endregion
}
