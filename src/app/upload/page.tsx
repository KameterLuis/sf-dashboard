"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Upload from "@/components/ui/upload";
import { getWeekNumber } from "@/lib/date-helper";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const changeKW = (amount: number) => {
    if (selectedWeek > 1 && amount < 0) {
      setSelectedWeek(selectedWeek - 1);
    } else if (selectedWeek < 53 && amount > 0) {
      setSelectedWeek(selectedWeek + 1);
    }
  };

  useEffect(() => {
    const week = getWeekNumber();
    setSelectedWeek(week);

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
      <div className="px-20 py-10 space-y-4">
        <div className="w-full justify-end flex space-x-2">
          <Button
            onClick={() => changeKW(-1)}
            variant="outline"
            className="cursor-pointer"
          >
            <ArrowLeft color="#000000" />
          </Button>
          <Button variant="outline" className="cursor-pointer">
            <span className="text-black">KW {selectedWeek}</span>
          </Button>
          <Button
            onClick={() => changeKW(1)}
            variant="outline"
            className="cursor-pointer"
          >
            <ArrowRight color="#000000" />
          </Button>
        </div>
        <Upload
          title="DATEV Dateiupload"
          fileType=".xls,.XLS"
          fileTypeName="XLS"
          apiRoute="datev"
          selectedWeek={selectedWeek}
        />
        <Upload
          title="Bankkonto Dateiupload"
          fileType=".csv,text/csv,application/vnd.ms-excel,.CSV"
          fileTypeName="CSV"
          apiRoute="bank"
          selectedWeek={selectedWeek}
        />
        <Upload
          title="Fremdwährungskonto Dateiupload"
          fileType=".csv,text/csv,application/vnd.ms-excel,.CSV"
          fileTypeName="CSV"
          apiRoute="foreign"
          selectedWeek={selectedWeek}
        />
        <Upload
          title="TRES Transaktionen Dateiupload"
          fileType=".xlsx,.XLSX"
          fileTypeName="XLSX"
          apiRoute="tres-transaction"
          selectedWeek={selectedWeek}
        />
        <Upload
          title="TRES Balance Dateiupload"
          fileType=".xlsx,.XLSX"
          fileTypeName="XLSX"
          apiRoute="tres-balance"
          selectedWeek={selectedWeek}
        />
        <Upload
          title="Finway Dateiupload"
          fileType=".csv,text/csv,application/vnd.ms-excel,.CSV"
          fileTypeName="CSV"
          apiRoute="finway"
          selectedWeek={selectedWeek}
        />
      </div>
    </div>
  );
}
