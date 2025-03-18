import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { fetchWebclipsAndUpdateCountScreenShot } from "./helpers";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function GET() {
  try {
    const webclipsCountScreenShot =
      await fetchWebclipsAndUpdateCountScreenShot();
    return NextResponse.json({ webclipsCountScreenShot });
  } catch (error) {
    console.error("Error fetching Notion webclips count:", error);
    return NextResponse.json(
      { error: "Failed to fetch webclips count" },
      { status: 500 }
    );
  }
}
