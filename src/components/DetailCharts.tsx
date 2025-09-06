import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { AFTER_VAR_FEE, type DailyStats } from '../utils/calcMetrics';
import { SimpleGrid, Card, Title } from '@mantine/core';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function createOption(unit: string) {
  return {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const v = context.dataset.label.split('(').reverse().pop();
            return `${v}: ${value.toFixed(2)}${unit}`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `${Number(value).toFixed(2)}${unit}`
        }
      }
    }
  };
}

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

  // Tổng cho toàn kỳ
  const totalRevenue = sorted.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalOrders = sorted.reduce((s, d) => s + (d.orders || 0), 0);

  const totalNewRevenue = sorted.reduce((s, d) => s + (d.newRevenue || 0), 0);
  const totalNewOrders = sorted.reduce((s, d) => s + (d.newOrder || 0), 0);

  const totalOldRevenue = totalRevenue - totalNewRevenue;
  const totalOldOrders = totalOrders - totalNewOrders;

  // AOV tổng kỳ
  const aovTotal = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";
  const aovNew = totalNewOrders > 0 ? (totalNewRevenue / totalNewOrders).toFixed(2) : "0.00";
  const aovOld = totalOldOrders > 0 ? (totalOldRevenue / totalOldOrders).toFixed(2) : "0.00";

  return {
    labels: sorted.map(d => d.date),
    datasets: [
      {
        label: `AOV (${aovTotal}$)`,
        data: sorted.map(d => d.orders > 0 ? Number(d.revenue / d.orders) : 0),
        backgroundColor: '#A7C7E7'
      },
      {
        label: `New Customer AOV (${aovNew}$)`,
        data: sorted.map(d => d.newOrder > 0 ? Number(d.newRevenue / d.newOrder) : 0),
        backgroundColor: '#B5EAD7'
      },
      {
        label: `Old Customer AOV (${aovOld}$)`,
        data: sorted.map(d => {
          const rv = (d.revenue || 0) - (d.newRevenue || 0);
          const od = (d.orders || 0) - (d.newOrder || 0);
          return od > 0 ? rv / od : 0;
        }),
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

  const newOd = sorted.reduce((n, s) => n += s.newOrder || 0, 0);
  const total = sorted.reduce((t, s) => t += s.orders || 0, 0);
  const newPercent = total > 0 ? (newOd / total * 100).toFixed(2) : 0;
  const oldPercent = (100 - Number(newPercent)).toFixed(2)

  return {
    labels: sorted.map(d => d.date),
    datasets: [
      {
        label: `New Customer orders (${newPercent}%)`,
        data: sorted.map(d => Number(d.newOrder / d.orders) * 100),
        backgroundColor: '#FFB5A7'
      },
      {
        label: `Old Customer orders (${oldPercent}%)`,
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

  console.log(sorted)

  // Tổng cho toàn kỳ
  const totalRevenue = sorted.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalSpend = sorted.reduce((s, d) => s + (d.spend || 0), 0);

  const totalNewRevenue = sorted.reduce((s, d) => s + (d.newRevenue || 0), 0);
  const totalNewSpend = sorted.reduce((s, d) => s + (d.newSpend || 0), 0);

  const totalOldRevenue = totalRevenue - totalNewRevenue;
  const totalOldSpend = totalSpend - totalNewSpend;

  // % GP tổng kỳ theo revenue-weighted
  const gpTotalPct = totalRevenue > 0
    ? ((totalRevenue * AFTER_VAR_FEE - totalSpend)/ totalRevenue * 100).toFixed(2)
    : "0.00";

  const gpNewPct = totalNewRevenue > 0
    ? ((totalNewRevenue * AFTER_VAR_FEE - totalNewSpend)/ totalNewRevenue * 100).toFixed(2)
    : "0.00";

  const gpOldPct = totalOldRevenue > 0
    ? (((totalOldRevenue * AFTER_VAR_FEE) - (totalOldSpend))/ totalOldRevenue * 100).toFixed(2)
    : "0.00";

  return {
    labels: sorted.map(d => d.date),
    datasets: [
      {
        label: `GP (${gpTotalPct}%)`,
        data: sorted.map(d =>
          Number(d.revenue ? ((d.revenue * AFTER_VAR_FEE - d.spend) / d.revenue) * 100 : 0)
        ),
        backgroundColor: '#D7BDE2'
      },
      {
        label: `New Customer GP (${gpNewPct}%)`,
        data: sorted.map(d =>
          Number(d.newRevenue ? ((d.newRevenue * AFTER_VAR_FEE - d.newSpend) / d.newRevenue) * 100 : 0)
        ),
        backgroundColor: '#A3E4D7'
      },
      {
        label: `Old Customer GP (${gpOldPct}%)`,
        data: sorted.map(d => {
          const rv = Number((d.revenue || 0) - (d.newRevenue || 0));
          const sp = Number((d.spend || 0) - (d.newSpend || 0));
          const gp = rv * AFTER_VAR_FEE - sp;
          return rv > 0 ? (gp / rv) * 100 : 0;
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
          <Bar data={createAOVBarData(data)} options={createOption('$')}/>
        </Card>
        <Card padding="md">
          <Title order={5}>Orders (%)</Title>
          <Bar data={createOrdersBarData(data)} options={createOption('%')}/>
        </Card>
        <Card padding="md">
          <Title order={5}>Gross Profit Margin Ratio (%)</Title>
          <Bar data={createGrossProfitMgBarData(data)} options={createOption('%')}/>
        </Card>
      </SimpleGrid>
    </>
  );
}
