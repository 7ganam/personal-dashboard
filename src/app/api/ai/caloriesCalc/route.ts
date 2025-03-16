import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        data: z.array(
          z.object({
            id: z.string(),
            calories: z.number(),
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
      }
      here is the data:
      ${JSON.stringify(data)}
      `,
    });

    return NextResponse.json({
      object,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
