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
import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
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
  const [percentageChangeString, setPercentageChangeString] =
    useState<string>("");
  const [percentageChange, setPercentageChange] = useState<number>(0);

  useEffect(() => {
    if (!values || values.length < 2) return;
    let first = values[0][ykey];
    let last = values[values.length - 1][ykey];
    let difference = Math.round(((last - first) / first) * 10000) / 100;
    let diffString = `${difference >= 0 ? "+" : ""} ${difference}%`;
    setPercentageChange(difference);
    setPercentageChangeString(diffString);
  }, [values]);

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
                tickFormatter={(ms) =>
                  new Intl.DateTimeFormat("de-DE", {
                    day: "2-digit",
                    month: "short",
                  }).format(new Date(ms))
                }
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
          <div className="text-center flex w-full justify-center">
            <div className="text-muted-foreground leading-none flex space-x-2">
              <p>{percentageChangeString}</p>
              {percentageChange >= 0 ? (
                <TrendingUp size={16} color="#737373" />
              ) : (
                <TrendingDown size={16} color="#737373" />
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </FadeIn>
  );
};

export default DashLineChart;
