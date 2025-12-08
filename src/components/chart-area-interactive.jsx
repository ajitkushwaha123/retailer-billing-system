"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDashboard } from "@/store/hooks/useDashboard";

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  const { salesChartData, range } = useDashboard();

  const isHourlyView = Array.isArray(salesChartData) && salesChartData[0]?.hour;

  const chartConfig = {
    sales: {
      label: isHourlyView ? "Hourly Sales" : "Daily Sales",
      color: "var(--primary)",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isHourlyView ? "Hourly Sales" : "Sales Trend"}</CardTitle>
        <CardDescription>
          Showing summary for selected date range
        </CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {Array.isArray(salesChartData) && salesChartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[288px] w-full"
          >
            <AreaChart data={salesChartData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="10%"
                    stopColor="var(--primary)"
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />

              <XAxis
                dataKey={isHourlyView ? "hour" : "date"}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => value}
                    indicator="dot"
                  />
                }
              />

              <Area
                dataKey="totalSales"
                type="monotone"
                fill="url(#salesGradient)"
                stroke="var(--primary)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[288px] items-center justify-center text-muted-foreground text-sm">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
