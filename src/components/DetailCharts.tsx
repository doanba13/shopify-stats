import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import type { DailyStats } from '../utils/calcMetrics';
import { SimpleGrid, Card, Title } from '@mantine/core';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function createBarData(data: Record<string, DailyStats>, field: keyof DailyStats, label: string, color: string) {
  const sorted = Object.values(data).sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return da - db;
  });

  return {
    labels: sorted.map(d => d.date),
    datasets: [
      {
        label,
        data: sorted.map(d => Number(d[field])),
        backgroundColor: color
      }
    ]
  };
}

export function DetailCharts({ data }: { data: Record<string, DailyStats> }) {
  return (
    <SimpleGrid cols={2} mt="lg">
      <Card padding="md">
        <Title order={5}>Revenue</Title>
        <Bar data={createBarData(data, 'revenue', 'Revenue', 'rgba(75, 192, 192, 0.6)')} />
      </Card>
      <Card padding="md">
        <Title order={5}>Spend</Title>
        <Bar data={createBarData(data, 'spend', 'Spend', 'rgba(255, 99, 132, 0.6)')} />
      </Card>
      <Card padding="md">
        <Title order={5}>Ads</Title>
        <Bar data={createBarData(data, 'ads', 'Ads', 'rgba(255, 206, 86, 0.6)')} />
      </Card>
      <Card padding="md">
        <Title order={5}>Orders</Title>
        <Bar data={createBarData(data, 'orders', 'Orders', 'rgba(54, 162, 235, 0.6)')} />
      </Card>
    </SimpleGrid>
  );
}
