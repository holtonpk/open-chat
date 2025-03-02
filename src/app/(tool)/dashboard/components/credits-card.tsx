"use client";
import {DollarSignIcon, RefreshCw} from "lucide-react";
import {useEffect, useState} from "react";
import {AnimatedNumber} from "@/components/animated-number";

import {LinkButton} from "@/components/ui/link";
export const CreditsCard = () => {
  const [credits, setCredits] = useState<number>(0.0);
  useEffect(() => {
    const fetchCredits = async () => {
      await getCredits();
    };
    setTimeout(() => {
      fetchCredits();
    }, 200);
  }, []);

  const getCredits = async () => {
    const response = await fetch("/api/credits");
    const data = await response.json();

    setCredits(data.data.total_credits - data.data.total_usage);
  };

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshCredits = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      getCredits();
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="  border rounded-md bg-background  py-6 shadow-md items-center flex flex-col gap-4 w-fit px-20 ">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold">Credits</h2>
        <button onClick={refreshCredits} className="ml-2 text-muted-foreground">
          <RefreshCw
            className={`w-4 h-4 ${
              isRefreshing ? "animate-spin duration-800" : ""
            }`}
          />
        </button>
      </div>
      <div className="flex  items-center gap-1 ">
        <DollarSignIcon className="w-6 h-6 text-muted-foreground" />

        <AnimatedNumber
          springOptions={{
            bounce: 0,
            duration: 1000,
          }}
          value={credits}
          className="text-5xl w-[140px]"
        />
      </div>
      <LinkButton
        href="https://openrouter.ai/credits"
        target="_blank"
        className="mt-2"
      >
        Add Credits
      </LinkButton>
    </div>
  );
};
