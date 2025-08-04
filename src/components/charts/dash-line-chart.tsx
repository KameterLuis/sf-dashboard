"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { compactNumber } from "@/lib/string-formatter";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { FadeIn } from "../fade-in";
export const description = "A line chart";

const chartConfig = {
  cash: {
    label: "Cash",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type chartTypes = {
  xkey: string;
  ykey: string;
  title: string;
  values: any;
};

const DashLineChart = ({ xkey, ykey, title, values }: chartTypes) => {
  return (
    <FadeIn className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={values}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={xkey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={42}
                tickFormatter={(value) => compactNumber(value)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey={ykey}
                type="natural"
                stroke="var(--color-blue-2)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="text-muted-foreground leading-none">
            +11% month over month
          </div>
        </CardFooter>
      </Card>
    </FadeIn>
  );
};

export default DashLineChart;
