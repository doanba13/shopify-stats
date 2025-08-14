export interface DailyStats {
  date: string;
  revenue: number;
  spend: number;
  orders: number;
  ads: number;
}

export function calculateMetrics(data: Record<string, DailyStats>) {
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

  console.log(totals)

  const contributionMargin = totals.revenue - totals.spend - totals.ads;
  const grossProfit = totals.revenue - totals.spend;
  const mer = totals.spend > 0 ? totals.revenue / totals.ads : 0;
  const aov = totals.orders > 0 ? totals.revenue / totals.orders : 0;

  return {
    contributionMargin,
    contributionMarginRatio: totals.revenue > 0 ? (contributionMargin / totals.revenue) * 100 : 0,
    grossProfit,
    grossProfitRatio: totals.revenue > 0 ? (grossProfit / totals.revenue) * 100 : 0,
    mer,
    aov
  };
}
