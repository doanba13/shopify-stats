import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);


export type DailyStats = {
  date: string;        // "DD-MM-YYYY"
  revenue: number;     // already USD if you transformed in the hook
  spend: number;
  orders: number;
  ads: number;
};

export type OrderItem = {
  id: string;
  orderId: string;
  itemId: string;
  sku: string;
  quantity: number;
  price: string;
  cost: number;
  name: string;
  title: string;
  giftCard: boolean;
  totalDiscount: string;
  vendorName: string;
};

export type Order = {
  id: string;
  orderId: string;
  customerId: string;
  shipCountry: string;
  shipDiscount: number;
  revenue: string;        // EUR from API
  revenueUSD?: string;    // sometimes present
  paygateName: string;
  createdAt: string;      // ISO
  cost?: string;          // COGS
  shipped?: string;       // shipping cost
  discount?: string;
  tax?: string;
  subTotal?: string;
  app?: 'Paradis' | 'Persoliebe' | string;
  orderLineItems?: OrderItem[];
  base: number;
};

// ---- helpers ----
export const fmtMoney = (v: number) => `$${v.toFixed(2)}`;
export const orderRevenueUSD = (o: Order, eurToUsd = 1.15) =>
  o.revenueUSD && !isNaN(Number(o.revenueUSD))
    ? Number(o.revenueUSD)
    : Number(o.revenue || 0) * eurToUsd;

export const orderSpend = (o: Order) => Number(o.base || 0);

const ddmmyyyy = (iso: string, app?: string) => {
  const zones: Record<string, string> = {
    Paradis: "Europe/Amsterdam",   // +1/+2 DST
    Persoliebe: "Etc/GMT+8",       // UTC-8
  };

  const zone = zones[app || ''] || "UTC";

  return dayjs(iso).tz(zone).format("DD-MM-YYYY");
};


export function groupByDay(
  days: Record<string, DailyStats>,
  orders: Order[]
): Array<{ stats: DailyStats; orders: Order[] }> {
  const map: Record<string, { stats: DailyStats; orders: Order[] }> = {};
  for (const [k, stats] of Object.entries(days)) map[k] = { stats, orders: [] };
  for (const o of orders) {
    const d = ddmmyyyy(o.createdAt, o.app);
    if (!map[d]) map[d] = { stats: { date: d, revenue: 0, spend: 0, orders: 0, ads: 0 }, orders: [] };
    map[d].orders.push(o);
  }
  return Object.values(map).sort(
    (a, b) =>
      dayjs.utc(a.stats.date, 'DD-MM-YYYY').valueOf() -
      dayjs.utc(b.stats.date, 'DD-MM-YYYY').valueOf()
  );
}


export const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;