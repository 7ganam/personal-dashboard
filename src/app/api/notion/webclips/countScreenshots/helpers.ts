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
  console.time("Notion API Request"); // Start timing
  const response = await notionClient.databases.query({
    database_id: "1bad460a15cb8077869ff70ec94191fe",
    page_size: 500,
    filter: {
      property: "Date",
      date: {
        equals: new Date().toISOString().split("T")[0],
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

  //fetch the todays screenshot of count
  const { count: todaysCountScreenShot, pageIds } =
    await fetchTodaysCountScreenShot();

  //if they are not equal update the webclips unprocessed count
  if (currentCount !== todaysCountScreenShot && pageIds.length > 0) {
    await notionClient.pages.update({
      page_id: pageIds[0],
      properties: {
        count: currentCount,
      },
    });
  }

  //if the screenshot doesnt' have a page. create a new page
  if (pageIds.length === 0) {
    await notionClient.pages.create({
      parent: { database_id: "1bad460a15cb8077869ff70ec94191fe" },
      properties: {
        count: {
          number: currentCount,
        },
        Date: {
          date: {
            start: new Date().toISOString().split("T")[0],
          },
        },
      },
    });
  }

  return {
    currentCount,
  };
};

export const fetchAllScreenShots = async () => {
  console.time("Notion API Request"); // Start timing
  const response = await notionClient.databases.query({
    database_id: "1bad460a15cb8077869ff70ec94191fe",
    page_size: 500,
  });
  console.timeEnd("Notion API Request"); // End timing and print duration

  return response?.results ?? [];
};

export const fetchWebclipsAndUpdateCountScreenShot = async () => {
  //fetch all screen shots
  const allScreenShots = await fetchAllScreenShots();

  //upsert todays count screenshot for future requests
  upsertTodaysCountScreenShot();

  //then return the webclips
  return allScreenShots;
};
