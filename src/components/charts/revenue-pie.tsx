"use client";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
export const description = "A pie chart with a label list";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-blue-1)" },
  { browser: "safari", visitors: 200, fill: "var(--color-blue-2)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-blue-3)" },
  { browser: "edge", visitors: 173, fill: "var(--color-blue-4)" },
  { browser: "other", visitors: 90, fill: "var(--color-blue-5)" },
];
const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const RevenuePie = () => {
  return (
    <div className="w-full flex items-center">
      <div className="w-full">
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-text]:fill-background mx-auto aspect-square"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="browser" hideLabel />}
              />
              <Pie data={chartData} dataKey="visitors"></Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="browser" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm"></CardFooter>
      </div>
    </div>
  );
};

export default RevenuePie;
