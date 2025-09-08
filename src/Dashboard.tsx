import { useState } from 'react';
import { DatePickerInput } from '@mantine/dates';
import { Container, Title, Loader, Select, Group, SimpleGrid, Button } from '@mantine/core';
import dayjs from 'dayjs';
import { useContributionMargin, type OrdersStatsResponse } from './api/useContributionMargin';
import { calculateMetrics } from './utils/calcMetrics';
import { MetricsChart } from './components/MetricsChart';
import { DetailCharts } from './components/DetailCharts';
import { DailyStatsAccordionTable } from './components/DailyStatsAccordionTable';
import utc from 'dayjs/plugin/utc';
import { useSyncOrders } from './api/useSyncOrders';
import { notifications } from '@mantine/notifications';
import { IconRefresh } from '@tabler/icons-react';
import { usePreviousContributionMargin } from './api/usePreviousContributionMargin';
import { MetricCard } from './components/MetricCard';
dayjs.extend(utc);

export default function Dashboard() {
  const [value, setValue] = useState<[string | null, string | null]>([null, null]);
  const [app, setApp] = useState<string | null>(null);

  const startDate = value[0] ? dayjs.utc(value[0]).unix() : 0;
  const endDate = value[1] ? dayjs.utc(value[1]).unix() : undefined;

  const { data, isLoading } = useContributionMargin(startDate, endDate, app || undefined);
  const { data: previousData, isLoading: preLoading } = usePreviousContributionMargin(startDate, endDate, app || undefined);

  const [view, setView] = useState<'chart' | 'table' | 'detail'>('chart');

  const { mutate: syncOrders, isPending } = useSyncOrders();

  function handleSync() {
    syncOrders(undefined, {
      onSuccess: () => {
        notifications.show({
          color: 'teal',
          title: 'Sync complete',
          message: 'Orders were synced and the dashboard was refreshed.',
        });
      },
      onError: (err: any) => {
        notifications.show({
          color: 'red',
          title: 'Sync failed',
          message: err?.message || 'Server did not accept the sync request.',
        });
      },
    });
  }

  return (
    <Container size="lg" className="mb-8 pb-8">
      <Group justify="space-between" align="center" my="md">
        <Title order={2}>Shopify Orders Stats</Title>
        <Button
          onClick={handleSync}
          loading={isPending}
          leftSection={<IconRefresh size={16} />}
        >
          Sync data
        </Button>
      </Group>

      <Group grow>
        <DatePickerInput type="range" allowSingleDateInRange value={value} onChange={setValue} maxDate={new Date()} />
      </Group>

      <Select
        label="Select App"
        placeholder="All Apps"
        data={[
          { value: 'Paradis', label: 'Paradis' },
          { value: 'Persoliebe', label: 'Persoliebe' },
        ]}
        value={app}
        onChange={setApp}
        clearable
        mt="sm"
      />

      {isLoading || preLoading && <div className='loading-container'><Loader mt="lg" /></div>}

      {data && previousData && (
        <>
          <KPICards data={data} prev={previousData} />

          <Group mt="md">
            <Button variant={view === 'chart' ? 'filled' : 'light'} onClick={() => setView('chart')}>Chart</Button>
            <Button variant={view === 'table' ? 'filled' : 'light'} onClick={() => setView('table')}>Table</Button>
            <Button variant={view === 'detail' ? 'filled' : 'light'} onClick={() => setView('detail')}>Detail</Button>
          </Group>

          {view === 'chart' && <MetricsChart data={data.result} />}
          {view === 'table' && (
            <DailyStatsAccordionTable
              data={data.result}
              orders={data.orders}
            />
          )}
          {view === 'detail' && <DetailCharts data={data.result} />}
        </>
      )}
    </Container>
  );
}


const KPICards = ({ data, prev }: { data: OrdersStatsResponse, prev: OrdersStatsResponse }) => {
  const metrics = calculateMetrics(data.result, data.newCustomer || []);
  const prevMetrics = calculateMetrics(prev.result, prev.newCustomer || []);

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 1, md: 4 }} mt="lg" spacing="lg">
        <MetricCard
          label="Contr. Margin"
          value={metrics.contributionMargin}
          previous={prevMetrics.contributionMargin}
          percent={metrics.contributionMarginRatio}
          prePercent={prevMetrics.contributionMarginRatio}
          format={(v) => `$${v.toFixed(2)} (${metrics.contributionMarginRatio.toFixed(1)}%)`}
        />
        <MetricCard
          label="Gross Profit"
          value={metrics.grossProfit}
          previous={prevMetrics.grossProfit}
          percent={metrics.grossProfitRatio}
          prePercent={prevMetrics.grossProfitRatio}
          format={(v) => `$${v.toFixed(2)} (${metrics.grossProfitRatio.toFixed(1)}%)`}
        />
        <MetricCard
          label="MER"
          value={metrics.mer}
          previous={prevMetrics.mer}
          format={(v) => v.toFixed(2)}
        />
        <MetricCard
          label="AOV"
          value={metrics.aov}
          previous={prevMetrics.aov}
          format={(v) => `$${v.toFixed(2)}`}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 1, md: 4 }} mt="lg" spacing="lg">
        <MetricCard
          label="ADS"
          value={metrics.ads}
          previous={prevMetrics.ads}
          format={(v) => `$${v.toFixed(2)}`}
        />
        <MetricCard
          reverse
          label="CAC"
          value={metrics.cac}
          previous={prevMetrics.cac}
          format={(v) => `$${v.toFixed(2)}`}
        />
      </SimpleGrid>
    </>
  );
}