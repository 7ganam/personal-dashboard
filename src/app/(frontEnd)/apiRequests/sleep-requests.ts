import { useQuery } from "@tanstack/react-query";

//#region ======================= [request function] =========================

export const fetchSleepData = async (startDate: string, endDate: string) => {
  let hasMore = true;
  let nextCursor = undefined;
  let allResults: any[] = [];
  while (hasMore) {
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
    return allResults;
  }
};

//#endregion ======================================================================

//#region ======================= [react query ] =============================

export const useSleepData = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["sleep", startDate, endDate],
    queryFn: () => fetchSleepData(startDate, endDate),
    staleTime: Infinity, // Data will never become stale automatically
    gcTime: 24 * 60 * 60 * 1000, // Keep data in cache for 24 hours
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
};

//#endregion =================================================================
