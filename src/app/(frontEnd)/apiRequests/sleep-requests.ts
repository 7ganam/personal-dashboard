export const fetchSleepData = async (
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
      const response: any = await fetch("/api/notion/sleep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          requestNextCursor: nextCursor,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      allResults = [...allResults, ...result.data];
      hasMore = result.hasMore;
      nextCursor = result.nextCursor;
      setData(allResults);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setData([]);
    } finally {
    }
  }
  setIsLoading(false);
};
