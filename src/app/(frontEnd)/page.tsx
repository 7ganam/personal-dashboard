"use client";
import { useState, useEffect } from "react";
import * as React from "react";

import DietChart from "./components/DietChart";
import WeightChart from "./components/WeightChart";
import SleepChart from "./components/SleepChart";
import WorkChart from "./components/WorkChart";
import TStrike from "./components/TStrike/TStrike";
import DayViewCard from "./components/dayView/DayViewCard";
import SportsStrike from "./components/SportsStrike/SportsStrike";
import RunningChart from "./components/RunningChart";

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
    <div className="flex w-full min-h-screen flex-col min-[1200px]:flex-row">
      {/* Left Column - 1/4 width */}
      <div className="w-full min-[1200px]:w-1/4 p-4">
        <div className="w-full p-10 bg-gray-100 rounded-lg shadow-md border-2 border-gray-200">
          <DayViewCard />
        </div>
      </div>

      {/* Right Column - 3/4 width */}
      <div className="w-full min-[1200px]:w-3/4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Cell 1 - Diet Chart */}
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]">
              <DietChart caloriesLimit={1800} />
            </div>
          </div>

          {/* Cell 2 - Weight Chart */}
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]">
              <WeightChart weightTarget={75} />
            </div>
          </div>

          {/* Cell 3 - Sleep Chart */}
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]">
              <SleepChart sleepLimit={9} />
            </div>
          </div>

          {/* Cell 4 - Work Chart */}
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]">
              <WorkChart workTarget={8} />
            </div>
          </div>

          {/* Cell 5 - T Strike */}
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]">
              <TStrike />
            </div>
          </div>

          {/* Cell 6 - Sports Strike */}
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]">
              <SportsStrike />
            </div>
          </div>

          {/* Cells 7-9 - Empty */}
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]">
              <RunningChart runningTarget={4} />
            </div>
          </div>
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]"></div>
          </div>
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]"></div>
          </div>
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]"></div>
          </div>
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]"></div>
          </div>
          <div className="aspect-square">
            <div className="w-full h-full p-4 bg-gray-100 min-h-[300px] pt-4 max-w-[400px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
  //#endregion
}
