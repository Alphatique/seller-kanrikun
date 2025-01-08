import {
	Bar,
	BarChart as BarChartIcon,
	CartesianGrid,
	XAxis,
	YAxis,
} from 'recharts';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@seller-kanrikun/ui/components/card';
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@seller-kanrikun/ui/components/chart';
import { cn } from '@seller-kanrikun/ui/lib/utils';

interface BarChartProps extends React.HTMLAttributes<HTMLElement> {
	data: Record<string, number | string>[] | undefined;
	config: ChartConfig;
}

export function BarChart({ className, data, config }: BarChartProps) {
	return (
		<Card className={cn(className)}>
			<CardHeader>
				<CardTitle>Bar Chart - Stacked + Legend</CardTitle>
				<CardDescription>January - June 2024</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={config}
					style={{ width: '100%', height: '40vh' }}
				>
					<BarChartIcon accessibilityLayer data={data}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey='date'
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							tickFormatter={value =>
								new Date(value).toLocaleDateString()
							}
						/>
						<YAxis
							yAxisId='right'
							orientation='right' // 右側に配置
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={value => `${value}`}
						/>
						<ChartTooltip
							content={<ChartTooltipContent hideLabel />}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						{data &&
							data.length > 0 &&
							Object.keys(data[0]).map(key => {
								console.log(key);
								if (key === 'date') return null;

								const fill = `var(--color-${key})`;
								return (
									<Bar
										key={key}
										dataKey={key}
										stackId='a'
										fill={fill}
										radius={[0, 0, 4, 4]}
										yAxisId='right'
									/>
								);
							})}
					</BarChartIcon>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
