import { Client } from "@notionhq/client";

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const fetchWorkDataNotion = async (
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
    database_id: "16cd460a15cb80678881e701dac929f4",
    filter: {
      and: [
        {
          property: "Date",
          date: {
            on_or_after: startDate + "T00:00:00.000+02:00",
          },
        },
        {
          property: "Date",
          date: {
            on_or_before: endDate + "T23:59:59.999+02:00",
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
