import { Accordion, Badge, Card, Group, Text, Table, Stack, Divider, Popover } from '@mantine/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { fmtMoney, fmtPct, groupByDay, orderSpend, type DailyStats, type Order } from '../utils/individualOrderStats';
import { AFTER_VAR_FEE } from '../utils/calcMetrics';
dayjs.extend(utc);



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
                          <Table.Th>Created (UTC)</Table.Th>
                          <Table.Th>App</Table.Th>
                          <Table.Th>Revenue</Table.Th>
                          <Table.Th>Spend</Table.Th>
                          <Table.Th>Ship deduction</Table.Th>
                          <Table.Th>Gross Profit</Table.Th>
                          <Table.Th>GP Ratio</Table.Th>
                          <Table.Th>Paygate</Table.Th>
                          <Table.Th>Country</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {orders.map((o) => {
                          const usd = Number(o.revenue);
                          const sp = orderSpend(o);
                          const gp = usd * AFTER_VAR_FEE - sp;
                          const gpr = usd > 0 ? gp / usd : 0;

                          return (
                            <Popover width={1200} position="bottom" withArrow shadow="md">
                              <Popover.Target>
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
                                  <Table.Td>{fmtMoney(o.shipDiscount)}</Table.Td>
                                  <Table.Td>{fmtMoney(gp)}</Table.Td>
                                  <Table.Td>{fmtPct(gpr)}</Table.Td>
                                  <Table.Td>{o.paygateName}</Table.Td>
                                  <Table.Td>{o.shipCountry}</Table.Td>
                                </Table.Tr>
                              </Popover.Target>
                              <Popover.Dropdown>
                                <Table striped highlightOnHover withTableBorder>
                                  <Table.Thead>
                                    <Table.Tr>
                                      <Table.Th>SKU</Table.Th>
                                      <Table.Th>Title</Table.Th>
                                      <Table.Th>Quantity</Table.Th>
                                      <Table.Th>Cost</Table.Th>
                                      <Table.Th>Price</Table.Th>
                                    </Table.Tr>
                                  </Table.Thead>
                                  <Table.Tbody>
                                    {(o.orderLineItems?.length || 0) > 0 && o.orderLineItems!.map((l) => {
                                      return (
                                        <Table.Tr key={l.sku}>
                                          <Table.Td>{l.sku}</Table.Td>
                                          <Table.Td>{l.title}</Table.Td>
                                          <Table.Td>{l.quantity}</Table.Td>
                                          <Table.Td>{fmtMoney(l.cost)}</Table.Td>
                                          <Table.Td>{fmtMoney(+l.price)}</Table.Td>
                                        </Table.Tr>
                                      );
                                    })}
                                  </Table.Tbody>
                                </Table>
                              </Popover.Dropdown>
                            </Popover>

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
