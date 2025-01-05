import type { ChartConfig } from '@seller-kanrikun/ui/components/chart';
import { BarChart } from '~/components/bar-chart';
import { LineChart } from '~/components/line-chart';

interface Props {
	selectData: string;
	chartData: Record<string, string | number>[];
	items: Record<string, string>;
}

export function Chart({ selectData, chartData, items }: Props) {
	return (
		<>
			{selectData === 'sales' || selectData === 'units' ? (
				<BarChart
					data={chartData}
					config={Object.entries(items).reduce(
						(acc, [key, label], i) => {
							acc[key] = {
								label,
								color: `hsl(var(--chart-${i + 1}))`,
							};
							return acc;
						},
						{} as ChartConfig,
					)}
				/>
			) : (
				<LineChart
					data={chartData}
					config={Object.entries(items).reduce(
						(acc, [key, label], i) => {
							acc[key] = {
								label,
								color: `hsl(var(--chart-${i + 1}))`,
							};
							return acc;
						},
						{} as ChartConfig,
					)}
				/>
			)}
		</>
	);
}
