"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import DateRangePicker from "@/components/dashboard/date-range-picker";
import { PaymentChart } from "@/components/dashboard/payment-chart";
import ProductStats from "@/components/dashboard/product-stats";
import { SectionCards } from "@/components/section-cards";

export default function Page() {
  const range = {
    startDate: "2025-12-01",
    endDate: "2025-12-31",
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />

          <div className="px-4 flex gap-4 lg:px-6">
            <div className="w-[40%]">
              <PaymentChart />
            </div>
            <div className="w-[60%]">
              <ChartAreaInteractive range={range} />
            </div>
          </div>

          <div className="px-4 lg:px-6">
            <ProductStats range={range} />
          </div>
        </div>
      </div>
    </div>
  );
}
