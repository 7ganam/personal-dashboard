export const fetchWebclipsCounts = async (
  startDate: string,
  endDate: string,
  setIsLoading: (isLoading: boolean) => void,
  setData: (data: any[]) => void,
  setError: (error: string) => void
) => {
  setIsLoading(true);
  let hasMore = true;
  let nextCursor = undefined;
  let allResults: any[] = [];
  while (hasMore) {
    try {
      const response: any = await fetch(
        "/api/notion/webclips/countScreenshots",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate,
            endDate,
            requestNextCursor: nextCursor,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      console.log("result", result);
      allResults = [...allResults, ...result.results];
      hasMore = result.hasMore;
      nextCursor = result.nextCursor;
      setData(allResults);
    } catch (error) {
      console.log("error---", error);
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      hasMore = false;
      setData([]);
    } finally {
    }
  }
  setIsLoading(false);
};
