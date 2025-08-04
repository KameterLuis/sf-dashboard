import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useDateRangeStore } from "@/lib/date-range-store";
import type { DateRange } from "react-day-picker";

function formatRange(r: DateRange | undefined) {
  if (!r?.from) return "";
  const optsY = { day: "2-digit", month: "short", year: "numeric" } as const;
  const opts = { day: "2-digit", month: "short" } as const;

  if (!r.to) return r.from.toLocaleDateString("en-US", optsY);

  return `${r.from.toLocaleDateString("en-US", opts)} - \
${r.to.toLocaleDateString("en-US", optsY)}`;
}

export default function DateRangePicker() {
  const [open, setOpen] = useState(false);

  const range = useDateRangeStore((s) => s.range);
  const setRange = useDateRangeStore((s) => s.setRange);

  const [draft, setDraft] = useState<DateRange | undefined>(undefined);

  const displayText = formatRange(range);

  const handleSelect = (nextRange: DateRange | undefined, clickedDay: Date) => {
    if (draft?.from && draft?.to && clickedDay) {
      setDraft({ from: clickedDay, to: undefined });
      return;
    }

    setDraft(nextRange ?? undefined);

    if (nextRange?.from && nextRange?.to && draft) {
      setRange(nextRange);
    }

    //if (nextRange?.from && nextRange?.to) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-[240px]">
          <Input
            readOnly
            placeholder="Pick a range"
            value={displayText}
            className="pr-10 cursor-pointer"
          />
          <Button
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select dates</span>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end" sideOffset={8}>
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={draft?.from}
          selected={draft}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
