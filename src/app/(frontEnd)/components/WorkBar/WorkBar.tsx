import React from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp"; // Encouraging progress

function WorkBar({ targetWorkHours, currentWorkHours }: Props) {
  // ... existing code ...
  return (
    <div className="w-full flex gap-2">
      <div className="grow p-2 bg-slate-100 rounded-md border border-gray-300">
        // ... existing code ...
      </div>
      <div
        className="w-[40px] aspect-square rounded-md flex items-center justify-center"
        style={{
          backgroundColor: remainingWorkHours > 0 ? "red" : "#4CAF50",
        }}
      >
        <TrendingUpIcon className="text-white" />
      </div>
    </div>
  );
}
