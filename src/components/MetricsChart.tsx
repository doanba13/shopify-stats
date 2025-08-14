import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { transformChartData } from '../utils/transformChartData';
import type { DailyStats } from '../utils/calcMetrics';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  data: Record<string, DailyStats>;
}

export function MetricsChart({ data }: Props) {
  const { labels, revenue, contributionMargin, grossProfit } = transformChartData(data);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: revenue,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
      {
        label: 'Contribution Margin',
        data: contributionMargin,
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
      },
      {
        label: 'Gross Profit',
        data: grossProfit,
        borderColor: 'rgba(255, 206, 86, 1)',
        fill: false,
      },
    ],
  };

  return <Line data={chartData} />;
}
