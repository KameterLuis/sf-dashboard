"use client";

import { Input } from "@/components/ui/input";
import UploadDATEV from "@/components/ui/upload-datev";
import UploadKontoauszug from "@/components/ui/upload-kontoauszug";
import Link from "next/link";
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
      <div className="flex px-4 md:px-8 xl:px-20 py-10 gap-4">
        <div className="w-full">
          <UploadDATEV />
        </div>
        <div className="w-full">
          <UploadKontoauszug />
        </div>
      </div>
    </div>
  );
}
