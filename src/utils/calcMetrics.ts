import type { Order } from "./individualOrderStats";

export interface DailyStats {
  date: string;
  revenue: number;
  spend: number;
  orders: number;
  newOrder: number;
  newRevenue: number;
  newSpend: number;
  ads: number;
}

export const AFTER_VAR_FEE = 0.945;
export const USD_RATE = 1.15;

export function calculateMetrics(data: Record<string, DailyStats>, customer: Record<string, any>[], _orders: Order[]) {
  const days = Object.values(data);

  const totals = days.reduce(
    (acc, day) => {
      acc.revenue += day.revenue;
      acc.spend += day.spend;
      acc.orders += day.orders;
      acc.ads += day.ads;
      return acc;
    },
    { revenue: 0, spend: 0, orders: 0, ads: 0 }
  );

  // const shipDeduction = orders.reduce((pr, c) => pr += (c.shipDiscount || 0), 0)

  const contributionMargin = totals.revenue * AFTER_VAR_FEE - totals.spend - totals.ads;
  const grossProfit = totals.revenue * AFTER_VAR_FEE - totals.spend;
  const mer = totals.spend > 0 ? totals.revenue / totals.ads : 0;
  const aov = totals.orders > 0 ? totals.revenue / totals.orders : 0;
  const cac = totals.ads > 0 && customer.length > 0 ? totals.ads / customer.length : 0;

  return {
    contributionMargin,
    contributionMarginRatio: totals.revenue > 0 ? (contributionMargin / totals.revenue) * 100 : 0,
    grossProfit,
    grossProfitRatio: totals.revenue > 0 ? (grossProfit / totals.revenue) * 100 : 0,
    mer,
    aov,
    cac,
    ads: totals.ads || 0
  };
}
