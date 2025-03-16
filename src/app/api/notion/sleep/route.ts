import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { fetchSleepDataNotion } from "./helpers";

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { startDate, endDate, requestNextCursor } = await request.json();
    const { results, hasMore, nextCursor, notionResponse } =
      await fetchSleepDataNotion(startDate, endDate, requestNextCursor);

    return NextResponse.json({
      data: results,
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
