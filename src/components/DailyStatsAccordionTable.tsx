import { Accordion, Badge, Card, Group, Text, Table, Stack, Divider } from '@mantine/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

type DailyStats = {
  date: string;        // "DD-MM-YYYY"
  revenue: number;     // already USD if you transformed in the hook
  spend: number;
  orders: number;
  ads: number;
};

type OrderItem = {
  id: string;
  orderId: string;
  itemId: string;
  sku: string;
  quantity: number;
  price: string;
  name: string;
  title: string;
  giftCard: boolean;
  totalDiscount: string;
  vendorName: string;
};

type Order = {
  id: string;
  orderId: string;
  customerId: string;
  shipCountry: string;
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
};

// ---- helpers ----
const fmtMoney = (v: number) => `$${v.toFixed(2)}`;
const orderRevenueUSD = (o: Order, eurToUsd = 1.15) =>
  o.revenueUSD && !isNaN(Number(o.revenueUSD))
    ? Number(o.revenueUSD)
    : Number(o.revenue || 0) * eurToUsd;

const orderSpend = (o: Order) => Number(o.cost || 0) + Number(o.shipped || 0);

const ddmmyyyy = (iso: string, app?: string) => {
    const base = dayjs.utc(iso).unix();

    let date = base;
    switch (app) {
        case 'Paradis':
            date += 60 * 60;
            break;
        case 'Persoliebe':
            date -= 8 * 60 * 60
            break;
    }

    return dayjs.unix(date).utc().format('DD-MM-YYYY')
};

function groupByDay(
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


const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

export function DailyStatsAccordionTable({
  data,
  orders,
}: {
  data: Record<string, DailyStats>;
  orders: Order[];
}) {
  const grouped = groupByDay(data, orders);

  return (
    <Accordion multiple chevronPosition="right" variant="separated" mt="lg">
      {grouped.map(({ stats, orders }) => {
        const header = (
          <Group justify="space-between" wrap="nowrap" style={{ width: '100%' }}>
            <Group gap="md">
              <Text fw={600}>{stats.date}</Text>
              <Badge color="gray" variant="light">Orders: {stats.orders}</Badge>
            </Group>
            <Group gap="lg">
              <Text size="sm">Revenue: <Text span fw={600}>{fmtMoney(stats.revenue)}</Text></Text>
              <Text size="sm">Spend: <Text span fw={600}>{fmtMoney(stats.spend)}</Text></Text>
              <Text size="sm">Ads: <Text span fw={600}>{fmtMoney(stats.ads)}</Text></Text>
            </Group>
          </Group>
        );

        return (
          <Accordion.Item key={stats.date} value={stats.date}>
            <Accordion.Control>{header}</Accordion.Control>
            <Accordion.Panel>
              <Card withBorder radius="md" p="md">
                {orders.length === 0 ? (
                  <Text c="dimmed">No orders for this day.</Text>
                ) : (
                  <Stack gap="sm">
                    <Text fw={600} size="sm">Orders ({orders.length})</Text>
                    <Divider />
                    <Table striped highlightOnHover withTableBorder>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ minWidth: 110 }}>Order</Table.Th>
                          <Table.Th>Created</Table.Th>
                          <Table.Th>App</Table.Th>
                          <Table.Th>Revenue (USD)</Table.Th>
                          <Table.Th>Spend</Table.Th>
                          <Table.Th>Gross Profit</Table.Th>
                          <Table.Th>GP Ratio</Table.Th> 
                          <Table.Th>Paygate</Table.Th>
                          <Table.Th>Country</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {orders.map((o) => {
                          const usd = orderRevenueUSD(o);
                          const sp = orderSpend(o);
                          const gp = usd - sp;                         
                          const gpr = usd > 0 ? gp / usd : 0;

                          return (
                            <Table.Tr key={o.id}>
                              <Table.Td>#{o.orderId}</Table.Td>
                              <Table.Td>{new Date(o.createdAt).toLocaleString()}</Table.Td>
                              <Table.Td>
                                <Badge
                                  color={
                                    o.app === 'Paradis' ? 'grape' :
                                    o.app === 'Persoliebe' ? 'teal' : 'gray'
                                  }
                                  variant="light"
                                >
                                  {o.app || 'Unknown'}
                                </Badge>
                              </Table.Td>
                              <Table.Td>{fmtMoney(usd)}</Table.Td>
                              <Table.Td>{fmtMoney(sp)}</Table.Td>
                              <Table.Td>{fmtMoney(gp)}</Table.Td>
                              <Table.Td>{fmtPct(gpr)}</Table.Td>
                              <Table.Td>{o.paygateName}</Table.Td>
                              <Table.Td>{o.shipCountry}</Table.Td>
                            </Table.Tr>
                          );
                        })}
                      </Table.Tbody>
                    </Table>
                  </Stack>
                )}
              </Card>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}
