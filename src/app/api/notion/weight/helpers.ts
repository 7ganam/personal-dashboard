import { Client } from "@notionhq/client";

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const fetchWeightDataNotion = async (
  startDate: string,
  endDate: string,
  requestNextCursor: string | undefined
) => {
  let results: any[] = [];
  let hasMore = true;
  let nextCursor = requestNextCursor ?? undefined;
  let notionResponse: any = [];

  console.time("Notion API Request"); // Start timing
  const response = await notionClient.databases.query({
    database_id: "1b7d460a15cb8018aaf8f5a6587827c6",
    filter: {
      and: [
        {
          property: "Date",
          date: {
            on_or_after: startDate,
          },
        },
        {
          property: "Date",
          date: {
            on_or_before: endDate,
          },
        },
      ],
    },
    page_size: 200,
    start_cursor: nextCursor,
  });
  console.timeEnd("Notion API Request"); // End timing and print duration

  results = response.results;
  hasMore = response.has_more;
  nextCursor = response.next_cursor ?? undefined;

  return { results, hasMore, nextCursor, notionResponse };
};
