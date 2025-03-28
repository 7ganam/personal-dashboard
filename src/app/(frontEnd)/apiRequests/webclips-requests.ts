import { useQuery } from "@tanstack/react-query";

//#region ======================= [request function] =========================
export const fetchWebclipsCounts = async (
  startDate: string,
  endDate: string
) => {
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
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const result = await response.json();
      allResults = [...allResults, ...result.results];
      hasMore = result.hasMore;
      nextCursor = result.nextCursor;
    } catch (error) {
      console.error("Error fetching webclips counts:", error);
      throw error;
    }
  }
  return allResults;
};
//#endregion ======================================================================

//#region ======================= [react query ] =============================
export const useWebclipsCounts = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["webclips-counts", startDate, endDate],
    queryFn: () => fetchWebclipsCounts(startDate, endDate),
    staleTime: Infinity, // Data will never become stale automatically
    gcTime: 24 * 60 * 60 * 1000, // Keep data in cache for 24 hours
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retrying
  });
};
//#endregion ======================================================================
