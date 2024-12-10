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
import {
	CartesianGrid,
	Line,
	LineChart as LineChartIcon,
	XAxis,
} from 'recharts';

interface LineChartProps extends React.HTMLAttributes<HTMLElement> {
	data: ChartDataBase[] | undefined;
	config: ChartConfig;
}

export default function LineChart({ className, data, config }: LineChartProps) {
	return (
		<Card className={cn(className)}>
			<CardHeader>
				<CardTitle>Line Chart - Linear</CardTitle>
				<CardDescription>January - June 2024</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={config}>
					<LineChartIcon
						accessibilityLayer
						data={data}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey='date'
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={value => new Date(value).toLocaleDateString()}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						{data &&
							data.length > 0 &&
							Object.keys(data[0]).map(key => {
								console.log(key);
								if (key === 'date') return null;

								const fill = `var(--color-${key})`;
								return (
									<Line
										key={key}
										dataKey={key}
										type='linear'
										stroke={fill}
										strokeWidth={2}
										dot={false}
									/>
								);
							})}
						<ChartLegend content={<ChartLegendContent />} />
					</LineChartIcon>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
