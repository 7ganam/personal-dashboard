import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import {
  getCaloriesForMeals,
  fetchDietDataNotion,
  fillMissingCaloriesForMeals,
} from "./helpers";

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { startDate, endDate, requestNextCursor } = await request.json();
    const { results, hasMore, nextCursor, notionResponse } =
      await fetchDietDataNotion(startDate, endDate, requestNextCursor);

    const updatedEntriesWithMissingCalories = await fillMissingCaloriesForMeals(
      results
    );

    //merge the results with updatedEntries based on id. remove enityes from resual and place entities from updatedEntries in their place
    const mergedResults = results.map((result) => {
      const updatedEntry = updatedEntriesWithMissingCalories.find(
        (entry: any) => entry.id === result.id
      );
      return updatedEntry || result;
    });

    return NextResponse.json({
      data: mergedResults,
      // entriesWithMissingCalories: entriesWithMissingCalories,
      // formattedEntriesWithMissingCalories: formattedEntriesWithMissingCalories,
      // caloriesForMeals: caloriesForMeals,
      // updatedEntriesWithMissingCalories: updatedEntriesWithMissingCalories,
      // notionResponse: notionResponse,

      nextCursor: nextCursor,
      hasMore: hasMore,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
