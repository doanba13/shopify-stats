import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface DailyStats {
  date: string;
  revenue: number;
  spend: number;
  orders: number;
  newRevenue: number;
  newOrder: number;
  newSpend: number;
  ads: number;
}

export interface OrdersStatsResponse {
  result: Record<string, DailyStats>;
  orders: any[];
  newCustomer: any[];
}

export const useContributionMargin = (startDate: number, endDate?: number, app?: string) => {
  return useQuery({
    queryKey: ['contribution-margin', startDate, endDate, app],
    queryFn: async () => {
      const url = new URL('http://localhost:3838/api/orders/contribute-margin');
      url.searchParams.set('startDate', String(startDate));
      if (endDate) url.searchParams.set('endDate', String(endDate));
      if (app) url.searchParams.set('app', app);

      const { data } = await axios.get<OrdersStatsResponse>(url.toString());

      // Transform revenue EUR → USD
      const transformedResult: Record<string, DailyStats> = {};
      for (const [date, stats] of Object.entries(data.result)) {
        transformedResult[date] = {
          ...stats,
          revenue: stats.revenue * 1.15, // convert to USD
          newRevenue: stats.newRevenue * 1.15,
          newSpend: stats.newSpend == null ? 0 : stats.revenue === stats.newRevenue ? stats.spend : stats.newSpend
        };
      }

      return { ...data, result: transformedResult };
    },
    enabled: !!startDate && !!endDate,
  });
};
