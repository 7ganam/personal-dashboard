// import { Client } from "@notionhq/client";
// import { NextResponse } from "next/server";
// import { updateWebClipsCountScreenShotTable } from "./count/helpers";
// const notion = new Client({
//   auth: process.env.NOTION_API_KEY,
// });

// export async function GET() {
//   try {
//     const response = await notion.databases.query({
//       database_id: "2544ef9a027d42568da42018d5216390",
//     });

//     //update the webclips unprocessed count
//     await updateWebClipsCountScreenShotTable();

//     return NextResponse.json({ data: response.results });
//   } catch (error) {
//     console.error("Error fetching Notion data:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch data" },
//       { status: 500 }
//     );
//   }
// }
