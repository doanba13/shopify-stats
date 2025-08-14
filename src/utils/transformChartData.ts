import type { DailyStats } from './calcMetrics';

export function transformChartData(data: Record<string, DailyStats>) {
  const sorted = Object.values(data).sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return da - db;
  });

  const labels = sorted.map(d => d.date);
  const revenue = sorted.map(d => d.revenue);
  const contributionMargin = sorted.map(d => d.revenue - d.spend - d.ads);
  const grossProfit = sorted.map(d => d.revenue - d.spend);

  return { labels, revenue, contributionMargin, grossProfit };
}
