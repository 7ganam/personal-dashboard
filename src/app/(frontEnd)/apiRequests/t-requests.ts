import { useQuery } from "@tanstack/react-query";

export const fetchTStrikeData = async (
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
      const response: any = await fetch("/api/notion/t", {
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

//#region ======================= [request function] =========================
export const fetchTStrikeDataNew = async (
  startDate: string,
  endDate: string
) => {
  let hasMore = true;
  let nextCursor = undefined;
  let allResults: any[] = [];
  while (hasMore) {
    const response: any = await fetch("/api/notion/t", {
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
  }
  return allResults;
};

//#endregion ======================================================================

//#region ======================= [react query ] =============================

export const useTStrikeData = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["t", startDate, endDate],
    queryFn: () => fetchTStrikeDataNew(startDate, endDate),
  });
};

//#endregion =================================================================
