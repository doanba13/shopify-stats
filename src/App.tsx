import { useState } from 'react';
import { DatePickerInput } from '@mantine/dates';
import { Container, Title, Loader, Select, Group, SimpleGrid, Card, Text, Button } from '@mantine/core';
import dayjs from 'dayjs';
import { useContributionMargin } from './api/useContributionMargin';
import { calculateMetrics } from './utils/calcMetrics';
import { MetricsChart } from './components/MetricsChart';
import { DetailCharts } from './components/DetailCharts';
import { DailyStatsAccordionTable } from './components/DailyStatsAccordionTable';
import utc from 'dayjs/plugin/utc';
import { useSyncOrders } from './api/useSyncOrders';
import { notifications } from '@mantine/notifications';
import { IconRefresh } from '@tabler/icons-react';
dayjs.extend(utc);

export default function App() {
  const [value, setValue] = useState<[string | null, string | null]>([null, null]);
  const [app, setApp] = useState<string | null>(null);

  const startDate = value[0] ? dayjs.utc(value[0]).unix() : 0;
  const endDate = value[1] ? dayjs.utc(value[1]).unix() : undefined;

  const { data, isLoading } = useContributionMargin(startDate, endDate, app || undefined);

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
        <DatePickerInput type="range" allowSingleDateInRange value={value} onChange={setValue} />
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

      {isLoading && <Loader mt="lg" />}

      {data && (
        <>
          {/* KPI Cards */}
          {(() => {
            const metrics = calculateMetrics(data.result, data.newCustomer || [], data.orders || []);
            return (
              <>
                <SimpleGrid cols={4} mt="lg">
                  <MetricCard label="Contribution Margin" value={`$${metrics.contributionMargin.toFixed(2)} (${metrics.contributionMarginRatio.toFixed(1)}%)`} />
                  <MetricCard label="Gross Profit" value={`$${metrics.grossProfit.toFixed(2)} (${metrics.grossProfitRatio.toFixed(1)}%)`} />
                  <MetricCard label="MER" value={metrics.mer.toFixed(2)} />
                  <MetricCard label="AOV" value={`$${metrics.aov.toFixed(2)}`} />
                  
                </SimpleGrid>
                <SimpleGrid cols={4} mt="lg">
                  <MetricCard label="ADS" value={`$${metrics.ads.toFixed(2)}`} />
                 <MetricCard label="CAC" value={`$${metrics.cac.toFixed(2)}`} />
                </SimpleGrid>
              </>
            );
          })()}

          {/* View toggle */}
          <Group mt="md">
            <Button variant={view === 'chart' ? 'filled' : 'light'} onClick={() => setView('chart')}>Chart</Button>
            <Button variant={view === 'table' ? 'filled' : 'light'} onClick={() => setView('table')}>Table</Button>
            <Button variant={view === 'detail' ? 'filled' : 'light'} onClick={() => setView('detail')}>Detail</Button>
          </Group>

          {/* Conditional view */}
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card shadow="sm" padding="lg">
      <Text size="sm" c="dimmed">{label}</Text>
      <Title order={3}>{value}</Title>
    </Card>
  );
}