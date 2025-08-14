import { Table } from '@mantine/core';
import type { DailyStats } from '../utils/calcMetrics';

interface Props {
  data: Record<string, DailyStats>;
}

export function DailyStatsTable({ data }: Props) {
  const rows = Object.values(data).map((day) => (
    <Table.Tr key={day.date}>
      <Table.Td>{day.date}</Table.Td>
      <Table.Td>${day.revenue.toFixed(2)}</Table.Td>
      <Table.Td>${day.spend.toFixed(2)}</Table.Td>
      <Table.Td>${day.ads.toFixed(2)}</Table.Td>
      <Table.Td>{day.orders}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table highlightOnHover withColumnBorders mt="lg">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Revenue</Table.Th>
          <Table.Th>Spend</Table.Th>
          <Table.Th>Ads</Table.Th>
          <Table.Th>Orders</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
