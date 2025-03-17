import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { Client } from "@notionhq/client";

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const getCaloriesForMeals = async (meals: any[]) => {
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({
      data: z.array(
        z.object({
          id: z.string(),
          calories: z.number(),
          explanation: z.string(),
        })
      ),
    }),
    prompt: `
      You are a nutritionist.
      You are given a list of meals in json format.
      You need to generate a recipe with the ingredients and their calories.
      you need to return the recipe in json format. as an array of objects. where each object is of the following format:
      {
        id: string, // this is the the meal id. it will be provided in the data provided to you 
        calories: number
        explanation: string // this is the explanation for the calories
      }
      here is the data:
      ${JSON.stringify(meals)}
      `,
  });

  return object.data;
};

export const fetchDietDataNotion = async (
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
    database_id: "12fd460a15cb8015a22ce60979c4a988",
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

export const fillMissingCaloriesForMeals = async (dietEntries: any[]) => {
  //find entries with missing calories
  const entriesWithMissingCalories = dietEntries.filter(
    (entry) => !entry?.properties?.Calories?.number
  );

  let notionResponse: any = [];

  if (entriesWithMissingCalories.length > 0) {
    //format into id and meal name
    const formattedEntriesWithMissingCalories = entriesWithMissingCalories.map(
      (entry) => ({
        id: entry.id,
        mealName: entry?.properties?.Note?.title[0]?.plain_text,
      })
    );

    const caloriesForMeals = await getCaloriesForMeals(
      formattedEntriesWithMissingCalories
    );

    //update notion with the new calories
    const updatePromises = entriesWithMissingCalories.map((entry, index) =>
      notionClient.pages.update({
        page_id: entry.id,
        properties: {
          Calories: { number: caloriesForMeals[index]?.calories },
        },
      })
    );

    notionResponse = await Promise.all(updatePromises);
  }

  return notionResponse;
};
