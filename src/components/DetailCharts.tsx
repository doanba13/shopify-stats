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

function createAOVBarData(data: Record<string, DailyStats>) {
  const sorted = Object.values(data).sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return da - db;
  });

  return {
    labels: sorted.map(d => d.date),
    datasets: [
      {
        label: 'AOV',
        data: sorted.map(d => Number(d.revenue / d.orders)),
        backgroundColor: '#A7C7E7'
      },
      {
        label: 'New Customer AOV',
        data: sorted.map(d => Number(d.newRevenue / d.newOrder)),
        backgroundColor: '#B5EAD7'
      },
      {
        label: 'Old Customer AOV',
        data: sorted.map(d => Number((d.revenue - d.newRevenue) / (d.orders - d.newOrder))),
        backgroundColor: '#FFD6A5'
      }
    ]
  };
}

function createOrdersBarData(data: Record<string, DailyStats>) {
  const sorted = Object.values(data).sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return da - db;
  });

  return {
    labels: sorted.map(d => d.date),
    datasets: [
      {
        label: 'New Customer orders (%)',
        data: sorted.map(d => Number(d.newOrder / d.orders) * 100),
        backgroundColor: '#FFB5A7'
      },
      {
        label: 'Old Customer orders (%)',
        data: sorted.map(d => {
          const or = Number((d.orders - d.newOrder));
          return d.orders > 0 ? or / d.orders * 100 : 0
        }),
        backgroundColor: '#FFF3B0'
      }
    ]
  };
}

function createGrossProfitMgBarData(data: Record<string, DailyStats>) {
  const sorted = Object.values(data).sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return da - db;
  });

  return {
    labels: sorted.map(d => d.date),
    datasets: [
      {
        label: 'GP (%)',
        data: sorted.map(d => Number(d.revenue ? (d.revenue - d.spend) / d.revenue * 100 : 0)),
        backgroundColor: '#D7BDE2'
      },
      {
        label: 'New Customer GP (%)',
        data: sorted.map(d => Number(d.newRevenue ? (d.newRevenue - d.newSpend) / d.newRevenue * 100 : 0)),
        backgroundColor: '#A3E4D7'
      },
      {
        label: 'Old Customer GP (%)',
        data: sorted.map(d => {
          const gp = Number((d.revenue - d.newRevenue) - (d.spend - d.newSpend));
          return d.revenue - d.newRevenue > 0 ? gp / (d.revenue - d.newRevenue) * 100 : 0;
        }),
        backgroundColor: '#F5B7B1'
      }
    ]
  };
}



export function DetailCharts({ data }: { data: Record<string, DailyStats> }) {
  return (
    <>
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
      <SimpleGrid cols={1} mt="lg">
        <Card padding="md">
          <Title order={5}>AOV</Title>
          <Bar data={createAOVBarData(data)} />
        </Card>
        <Card padding="md">
          <Title order={5}>Orders (%)</Title>
          <Bar data={createOrdersBarData(data)} />
        </Card>
        <Card padding="md">
          <Title order={5}>Gross Profit Margin Ratio (%)</Title>
          <Bar data={createGrossProfitMgBarData(data)} />
        </Card>
      </SimpleGrid>
    </>
  );
}
