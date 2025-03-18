import { Client } from "@notionhq/client";

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const fetchWebclips = async () => {
  console.time("Notion API Request"); // Start timing
  const response = await notionClient.databases.query({
    database_id: "2544ef9a027d42568da42018d5216390",
    page_size: 500,
    filter: {
      property: "state",
      select: {
        does_not_equal: "Processed",
      },
    },
  });
  console.timeEnd("Notion API Request"); // End timing and print duration

  return response?.results ?? [];
};

export const fetchTodaysCountScreenShot = async () => {
  const today = new Date();
  today.setHours(today.getHours() + 2); // Add 2 hours to adjust for GMT+2
  const todayString = today.toISOString().split("T")[0] + "T00:00:00.000+02:00";

  console.log("Fetching today's count with date:", todayString);
  console.time("Notion API Request"); // Start timing
  const response = await notionClient.databases.query({
    database_id: "1bad460a15cb8077869ff70ec94191fe",
    page_size: 500,
    filter: {
      property: "Date",
      date: {
        equals: todayString,
      },
    },
  });
  console.timeEnd("Notion API Request"); // End timing and print duration

  return {
    count: response?.results?.length ?? 0,
    pageIds: response?.results?.map((page: any) => page.id) ?? [],
  };
};

export const upsertTodaysCountScreenShot = async () => {
  //first fetch all webclips from notion
  const allWebclips = await fetchWebclips();

  const currentCount = allWebclips.length;
  console.log("Current webclips count:", currentCount);

  //fetch the todays screenshot of count
  const { count: todaysCountScreenShot, pageIds } =
    await fetchTodaysCountScreenShot();

  console.log("Today's existing count:", todaysCountScreenShot);
  console.log("Existing page IDs:", pageIds);

  //if they are not equal update the webclips unprocessed count
  if (currentCount !== todaysCountScreenShot && pageIds.length > 0) {
    console.log("Updating existing count screenshot");
    await notionClient.pages.update({
      page_id: pageIds[0],
      properties: {
        count: currentCount,
      },
    });
  }

  //if the screenshot doesnt' have a page. create a new page
  if (pageIds.length === 0) {
    // Adjust the date to be the correct day in GMT+2
    const today = new Date();
    today.setHours(today.getHours() + 2); // Add 2 hours to adjust for GMT+2
    const dateString =
      today.toISOString().split("T")[0] + "T00:00:00.000+02:00";
    console.log("Creating new page with date:", dateString);

    await notionClient.pages.create({
      parent: { database_id: "1bad460a15cb8077869ff70ec94191fe" },
      properties: {
        count: {
          number: currentCount,
        },
        Date: {
          date: {
            start: dateString,
          },
        },
      },
    });
  }

  return {
    currentCount,
  };
};

export const fetchAllScreenShots = async (
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
    database_id: "1bad460a15cb8077869ff70ec94191fe",
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

export const fetchWebclipsAndUpdateCountScreenShot = async (
  startDate: string,
  endDate: string,
  requestNextCursor: string | undefined
) => {
  //fetch all screen shots
  const allScreenShots = await fetchAllScreenShots(
    startDate,
    endDate,
    requestNextCursor
  );

  //syncronously upsert todays count screenshot for future requests
  upsertTodaysCountScreenShot();

  //then return the webclips
  return allScreenShots;
};
