"use client";
import { useState, useEffect } from "react";

const databases = {
  thoughts: "98180a95daa943efba244291cebf6547",
  clips: "2544ef9a027d42568da42018d5216390",
};

export default function NotionPage() {
  // const [data, setData] = useState<string>("");
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       const response = await fetch("/api/notion");
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch data");
  //       }
  //       const result = await response.json();
  //       setData(result.data);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       setError(error instanceof Error ? error.message : "An error occurred");
  //       setData("");
  //     }
  //   }

  //   fetchData();
  // }, []); // Empty dependency array means this runs once on mount

  //--------------------------------fetch the thoughts
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

  return (
    <div>
      <h1>Notion Database Entries</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md">
          <div>Number of ongoing thoughts</div>
          <div className="text-8xl font-bold w-full text-center">
            {ongoingThoughts.length}
          </div>
        </div>
        <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md">
          <div>Placeholder 2</div>
          <div className="text-8xl font-bold">0</div>
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
      {/* <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-md w-1/2">
        {ongoingThoughts.map((item) => (
          <li key={item.id}>{item.properties.Name?.title[0]?.plain_text}</li>
        ))}
      </div> */}
    </div>
  );
}
