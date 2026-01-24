"use client";
import React from "react";
import ChartTab from "../common/ChartTab";
import { AreaChart } from "@/components/charts/AreaChart";

export default function StatisticsChart() {
  const series = [
    {
      name: "Sales",
      data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
    },
    {
      name: "Revenue",
      data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
    },
  ];

  const categories = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="relative">
      {/* ChartTab positioned absolutely */}
      <div className="absolute right-5 top-5 z-10">
        <ChartTab />
      </div>

      <AreaChart
        title="Statistics"
        subtitle="Target you've set for each month"
        series={series}
        categories={categories}
        colors={["#465FFF", "#9CB9FF"]}
        height={310}
      />
    </div>
  );
}
