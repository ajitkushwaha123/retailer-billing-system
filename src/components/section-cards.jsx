"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatToINR } from "@/helper/transform";
import { useDashboard } from "@/store/hooks/useDashboard";

export function SectionCards() {
  // Fetch dashboard stats
  const { summary, growth, loading, error } = useDashboard({
    startDate: "2025-01-01",
    endDate: "2025-01-31",
  });

  // Helper to display badge with growth value and icon
  const renderGrowthBadge = (value) => {
    const isPositive = value >= 0;
    const Icon = isPositive ? IconTrendingUp : IconTrendingDown;
    const displayValue = `${isPositive ? "+" : ""}${value.toFixed(2)}%`;
    return (
      <Badge variant="outline">
        <Icon />
        {displayValue}
      </Badge>
    );
  };

  if (error) {
    return <div className="text-red-500">Failed to load dashboard data</div>;
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : formatToINR(summary?.totalSales || 0)}
          </CardTitle>
          <CardAction>{renderGrowthBadge(growth?.totalSales || 0)}</CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Revenue trend this period{" "}
            {growth?.totalSales >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Sales for selected period</div>
        </CardFooter>
      </Card>

      {/* Total Orders */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : summary?.totalOrders || 0}
          </CardTitle>
          <CardAction>{renderGrowthBadge(growth?.totalOrders || 0)}</CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Order trend this period{" "}
            {growth?.totalOrders >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Orders for selected period
          </div>
        </CardFooter>
      </Card>

      {/* New Customers */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : summary?.newCustomers || 0}
          </CardTitle>
          <CardAction>
            {renderGrowthBadge(growth?.newCustomers || 0)}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            New customer trend{" "}
            {growth?.newCustomers >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">New customer acquisition</div>
        </CardFooter>
      </Card>

      {/* Recurring Customers */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Recurring Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "..." : summary?.recurringCustomers || 0}
          </CardTitle>
          <CardAction>
            {/* Optionally, you could calculate recurring customer growth too */}
            {renderGrowthBadge(
              summary?.recurringCustomers
                ? (summary?.recurringCustomers / summary?.totalOrders) * 100
                : 0
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Recurring customers in period
          </div>
          <div className="text-muted-foreground">Repeat purchase rate</div>
        </CardFooter>
      </Card>
    </div>
  );
}
