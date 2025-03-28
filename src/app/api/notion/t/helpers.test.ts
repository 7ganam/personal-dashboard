import { fetchTDataNotion } from "./helpers";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

describe("fetchTDataNotion", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Set up environment variables
    // process.env.NOTION_API_KEY = "test-api-key";
    if (!process.env.NOTION_API_KEY) {
      throw new Error("NOTION_API_KEY is not set in environment variables");
    }
    console.log("NOTION_API_KEY:", process.env.NOTION_API_KEY);
  });

  it("should fetch data from Notion", async () => {
    const startDate = "2025-03-21";
    const endDate = "2025-03-27";

    const result = await fetchTDataNotion(startDate, endDate, undefined);

    const resultDates = result.results.map(
      (result) => result.properties.Date.date.start
    );
    console.log("resultDates:", resultDates);

    expect(result).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
  });
});
