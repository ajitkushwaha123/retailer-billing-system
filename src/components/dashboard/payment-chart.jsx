"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDashboard } from "@/store/hooks/useDashboard";

export const description = "Payment methods distribution";

export function PaymentChart() {
  const { paymentMethods, loading } = useDashboard();

  // Map paymentMethods array to chart data
  const chartData = React.useMemo(() => {
    if (!paymentMethods || paymentMethods.length === 0) return [];

    return paymentMethods.map((pm, i) => ({
      method: pm.paymentMethod,
      value: pm.totalOrders, // or pm.totalSales if you want sales
      fill: `var(--chart-${i + 1})`,
    }));
  }, [paymentMethods]);

  const totalPayments = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.value, 0),
    [chartData]
  );

  const chartConfig = {
    visitors: { label: "Payments" },
    ...chartData.reduce((acc, curr) => {
      acc[curr.method] = { label: curr.method, color: curr.fill };
      return acc;
    }, {}),
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Payments by Method</CardTitle>
        <CardDescription>
          {loading ? "Loading..." : "Selected Period"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="text-center py-10">Loading chart...</div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="method"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalPayments.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Orders
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {loading ? "..." : "Trending up by 5.2% this month"}{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing payment method distribution
        </div>
      </CardFooter>
    </Card>
  );
}
