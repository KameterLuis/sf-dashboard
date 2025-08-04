import { startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { create } from "zustand";

type State = {
  range: DateRange | undefined;
  setRange: (r: DateRange | undefined) => void;
};

export const useDateRangeStore = create<State>((set) => {
  const today = startOfDay(new Date());
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  return {
    range: { from: thirtyDaysAgo, to: today },
    setRange: (r) => set({ range: r }),
  };
});
