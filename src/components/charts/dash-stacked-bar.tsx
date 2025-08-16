"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { CardContent, CardFooter } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A stacked bar chart with a legend";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
  { month: "July", desktop: 222, mobile: 141 },
  { month: "August", desktop: 248, mobile: 120 },
  { month: "September", desktop: 208, mobile: 200 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--color-blue-2)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--color-blue-4)",
  },
} satisfies ChartConfig;

type chartTypes = {
  xkey: string;
  ykeys: string[];
  title: string;
  values: any;
};

export function DashStackedBar({ xkey, ykeys, title, values }: chartTypes) {
  return (
    <div>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={values}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="bucket"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            {ykeys.map((key, index) => {
              return (
                <Bar
                  dataKey={key}
                  stackId="a"
                  fill={`var(--color-blue-${index + 1})`}
                  radius={[0, 0, 4, 4]}
                />
              );
            })}
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </div>
  );
}
