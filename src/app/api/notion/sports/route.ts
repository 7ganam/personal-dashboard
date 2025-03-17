import { NextResponse } from "next/server";
import { fetchSportsDataNotion } from "./helpers";

export async function POST(request: Request) {
  try {
    const { startDate, endDate, requestNextCursor } = await request.json();
    const { results, hasMore, nextCursor } = await fetchSportsDataNotion(
      startDate,
      endDate,
      requestNextCursor
    );

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
