"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { format } from "date-fns";
import {
  fetchDashboardStats,
  fetchPaymentMethods,
  fetchProductStats,
  setDateRange,
} from "@/store/slices/dashboardSlice";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export default function DateRangePicker() {
  const dispatch = useDispatch();
  const today = new Date();

  const [range, setRangeUI] = useState({
    from: today,
    to: today,
  });

  const applyRange = (r) => {
    const start = format(r.from, "yyyy-MM-dd");
    const end = format(r.to ?? r.from, "yyyy-MM-dd");

    dispatch(setDateRange({ start, end }));
    dispatch(fetchDashboardStats({ startDate: start, endDate: end }));
    dispatch(fetchProductStats({ startDate: start, endDate: end }));
    dispatch(fetchPaymentMethods({ startDate: start, endDate: end }));
  };

  useEffect(() => {
    applyRange(range);
  }, []);

  return (
    <div className="flex justify-end px-4 mb-4 max-w-full relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="
      w-[260px] justify-between text-sm font-medium rounded-xl 
      border border-gray-300 px-4 py-2
      bg-white/70 backdrop-blur 
      hover:bg-white hover:shadow-md hover:border-gray-400
      transition-all duration-200
      flex items-center gap-3
    "
          >
            <span className="flex items-center gap-2 text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>

              {range?.from && range?.to ? (
                <span className="font-semibold">
                  {format(range?.from, "dd MMM")} →{" "}
                  {format(range?.to, "dd MMM")}
                </span>
              ) : (
                <span className="text-gray-500">Select Date Range</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="p-3 shadow-xl bg-white rounded-md border animate-in fade-in zoom-in-95 
                     w-[350px] md:w-auto"
        >
          <Calendar
            mode="range"
            numberOfMonths={2}
            defaultMonth={range?.from}
            selected={range}
            onSelect={(selected) => {
              setRangeUI(selected);
              if (selected?.from && selected?.to) applyRange(selected);
            }}
            className="mx-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
