"use client";

import { AssetBalancePie } from "@/components/charts/asset-balance-pie";
import { AssetFlowBar } from "@/components/charts/asset-flow-bar";
import CashChart from "@/components/charts/cash-chart";
import { RevenueBar } from "@/components/charts/revenue-bar";
import RevenuePie from "@/components/charts/revenue-pie";
import { FadeIn } from "@/components/fade-in";
import NetworkPicker from "@/components/network-picker";
import NumberCard from "@/components/number-card";
import TimePicker from "@/components/time-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

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
          <h1 className="text-xl md:text-2xl cursor-pointer">Dashboard</h1>
          <div className="w-36 lg:w-52 xl:w-96">
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
            <TimePicker />
            <TimePicker />
          </div>
        </div>
        <div className="md:flex gap-4 space-y-4 md:space-y-0">
          <NumberCard
            title="Tax burden estimate"
            value="$45,678.90"
            info="+20% month over month"
          />
          <NumberCard
            title="Value of all coins"
            value="$1,265mm"
            info="+33% month over month"
          />
          <NumberCard
            title="Solana holdings"
            value="10,353"
            info="-8% month over month"
          />
        </div>
        <div className="md:flex gap-x-4 space-y-4 md:space-y-0">
          <CashChart />
          <CashChart />
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
                  <RevenueBar />
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
        <div className="md:flex gap-x-4 space-y-4 md:space-y-0">
          <FadeIn className="w-full object-fill">
            <AssetBalancePie />
          </FadeIn>
          <FadeIn className="w-full">
            <AssetFlowBar />
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
