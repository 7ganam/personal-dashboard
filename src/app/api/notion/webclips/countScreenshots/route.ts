import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { fetchWebclipsAndUpdateCountScreenShot } from "./helpers";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { startDate, endDate, requestNextCursor } = await request.json();
    const { results, hasMore, nextCursor, notionResponse } =
      await fetchWebclipsAndUpdateCountScreenShot(
        startDate,
        endDate,
        requestNextCursor
      );

    return NextResponse.json({ results, hasMore, nextCursor, notionResponse });
  } catch (error) {
    console.error("Error fetching Notion webclips count:", error);
    return NextResponse.json(
      { error: "Failed to fetch webclips count" },
      { status: 500 }
    );
  }
}
