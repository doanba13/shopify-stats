import { Card, Group, Text, Title, ThemeIcon } from "@mantine/core";
import { IconArrowUpRight, IconArrowDownRight } from "@tabler/icons-react";

interface MetricCardProps {
    label: string;
    value: number;
    percent?: number;
    prePercent?: number;
    previous: number;
    format?: (v: number) => string;
    reverse?: boolean
}

export function MetricCard({ label, value, previous, format, percent, prePercent, reverse = false }: MetricCardProps) {
    let diff = 0;
    let percentChange = 0;

    diff = value - previous;
    percentChange = previous !== 0 ? (diff / Math.abs(previous)) * 100 : 0;

    if (percent !== undefined && prePercent !== undefined) {
        diff = percent - prePercent;
        percentChange = prePercent !== 0 ? (diff / Math.abs(prePercent)) * 100 : 0;
        console.log(label, percent, prePercent, diff, percentChange)
    }

    const isIncrease = reverse ? diff < 0 : diff > 0;
    const isDecrease = reverse ? diff > 0 : diff < 0;

    return (
        <Card shadow="sm" padding="lg" radius="lg" withBorder>
            <Group justify="space-between" align="flex-end">
                <Text size="sm" c="dimmed">
                    {label}
                </Text>
                {previous !== undefined && (
                    <Group gap="xs">
                        <ThemeIcon
                            variant="light"
                            color={isIncrease ? "green" : isDecrease ? "red" : "gray"}
                            radius="xl"
                            size="sm"
                        >
                            {isIncrease ? (
                                <IconArrowUpRight size={16} />
                            ) : isDecrease ? (
                                <IconArrowDownRight size={16} />
                            ) : null}
                        </ThemeIcon>
                        <Text
                            size="sm"
                            fw={500}
                            c={isIncrease ? "green" : isDecrease ? "red" : "dimmed"}
                        >
                            {percentChange.toFixed(1)}%
                        </Text>
                    </Group>
                )}
            </Group>
            <Title order={3}>
                {format ? format(value) : value.toFixed(2)}
            </Title>
        </Card>
    );
}
