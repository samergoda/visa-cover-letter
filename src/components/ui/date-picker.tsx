"use client";

import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  id?: string;
  value?: string; // ISO date string "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
}: DatePickerProps) {
  const selected =
    value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  const displayDate =
    selected && isValid(selected)
      ? format(selected, "PPP") // e.g. "June 5, 2025"
      : null;

  function handleSelect(day: Date | undefined) {
    if (!day) {
      onChange("");
      return;
    }
    onChange(format(day, "yyyy-MM-dd"));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {displayDate ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected && isValid(selected) ? selected : undefined}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
