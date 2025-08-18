"use client";

import {
  getCashChartValues,
  getNetworkHoldings,
  getPortfolioValue,
  getRevenueByNetwork,
  getRevenueByType,
  getTaxEstimate,
} from "@/app/db/finance/data-provider";
import { AssetBalancePie } from "@/components/charts/asset-balance-pie";
import { DashBarChart } from "@/components/charts/dash-bar-chart";
import DashLineChart from "@/components/charts/dash-line-chart";
import { DashNegativeBar } from "@/components/charts/dash-negative-bar";
import { DashStackedBar } from "@/components/charts/dash-stacked-bar";
import RevenuePie from "@/components/charts/revenue-pie";
import DatePicker from "@/components/date-picker";
import { FadeIn } from "@/components/fade-in";
import NetworkPicker from "@/components/network-picker";
import NumberCard from "@/components/number-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDateRangeStore } from "@/lib/date-range-store";
import { useNetworkStore } from "@/lib/network-store";
import { formatMoney, formatNumber } from "@/lib/string-formatter";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  const dateRange = useDateRangeStore((s) => s.range);
  const network = useNetworkStore((s) => s.network);

  const [taxEstimate, setTaxEstimate] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [networkHoldings, setNetworkHoldings] = useState(0);

  const [cashChartValues, setCashChartValues] = useState<any>([]);
  const [revenueByNetwork, setRevenueByNetwork] = useState<any>([]);

  const [revenueByType, setRevenueByType] = useState<any>([]);

  const updateData = async () => {
    if (!dateRange?.to) return;

    const taxEstimateData = await getTaxEstimate(dateRange);
    setTaxEstimate(taxEstimateData);

    const portfolioValueData = await getPortfolioValue(dateRange);
    setPortfolioValue(portfolioValueData);

    const networkHoldingsData = await getNetworkHoldings(dateRange, network);
    setNetworkHoldings(networkHoldingsData);

    const cashChartValuesData = await getCashChartValues(dateRange);
    setCashChartValues(cashChartValuesData);
    console.log(cashChartValuesData);

    const revenueByNetworkData = await getRevenueByNetwork(dateRange);
    setRevenueByNetwork(revenueByNetworkData);

    const revenueByTypeData = await getRevenueByType(dateRange);
    setRevenueByType(revenueByTypeData);
  };

  useEffect(() => {
    updateData();
  }, [dateRange, network]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="font-sans min-h-screen w-full bg-white">
      <div className="sticky top-0 bg-white z-50">
        <div
          className={`${
            scrolled ? "py-4" : "py-4 md:py-10"
          } px-4 md:px-8 xl:px-20 flex justify-between items-center duration-300`}
        >
          <h1 className="text-xl md:text-2xl cursor-pointer">SF Dashboard</h1>
          <div className="flex items-center space-x-8">
            <Link className="font-semibold" href="/finance">
              Finance
            </Link>
            <Link href="/finance">Ops</Link>
            <Link href="/finance">ISMS</Link>
          </div>
          <div className="flex w-36 lg:w-52 xl:w-96">
            <Input
              className="hover:border-gray-900 duration-300 transition-all"
              type="text"
              placeholder="Ask AI ✦"
            />
          </div>
        </div>
        <hr />
      </div>
      <div className="flex flex-col px-4 md:px-8 xl:px-20 py-10 gap-4">
        <div className="md:flex justify-between">
          <NetworkPicker />
          <div className="md:flex gap-x-4 mt-2 md:mt-0 space-y-2 md:space-y-0">
            <DatePicker />
          </div>
        </div>
        <div className="md:flex gap-4 space-y-4 md:space-y-0">
          <NumberCard
            title="Tax burden estimate"
            value={`${formatNumber(taxEstimate)}€`}
            info="+20% month over month"
          />
          <NumberCard
            title="Value of all coins"
            value={`${formatMoney(portfolioValue)}`}
            info="+33% month over month"
          />
          <NumberCard
            title={`${
              String(network).charAt(0).toUpperCase() + String(network).slice(1)
            } holdings`}
            value={`${formatMoney(networkHoldings)}`}
            info="-8% month over month"
          />
        </div>
        <div className="md:flex gap-x-4 space-y-4 md:space-y-0">
          <DashLineChart
            xkey="date"
            ykey="cash"
            title="Cash"
            values={cashChartValues ?? []}
          />
          <DashBarChart
            xkey="network"
            ykey="eur"
            title="Revenue"
            values={revenueByNetwork ?? []}
          />
        </div>
        <FadeIn>
          <Card className="pb-20">
            <CardHeader>
              <CardTitle>Revenue Deep Dive</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="flex items-start w-full">
                <div className="flex w-full h-full">
                  <RevenuePie />
                  <RevenuePie />
                </div>
                <div className="w-full">
                  <DashStackedBar
                    xkey="bucket"
                    ykeys={[
                      "DELEGATION_FEES",
                      "MEV",
                      "PRIORITY_FEES",
                      "RESTAKE_REWARDS",
                      "VALIDATOR_COMMISSION",
                      "OTHER_OPERATING_INCOME",
                    ]}
                    title="Revenue"
                    values={revenueByType ?? []}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
        <div className="md:flex gap-x-4 space-y-4 md:space-y-0">
          <FadeIn className="w-full">
            <AssetBalancePie />
          </FadeIn>
          <FadeIn className="w-full object-fill min-h-full">
            <DashNegativeBar />
          </FadeIn>
        </div>
        <div>
          <Button className="cursor-pointer" variant="outline">
            <Link href="/upload">Upload</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
