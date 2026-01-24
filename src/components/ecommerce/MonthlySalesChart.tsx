"use client";
import { BarChart } from "@/components/charts/BarChart";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function MonthlySalesChart() {
  const series = [
    {
      name: "Sales",
      data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
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

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      {/* Dropdown positioned absolutely */}
      <div className="absolute right-5 top-5 z-10">
        <button onClick={toggleDropdown} className="dropdown-toggle">
          <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
        </button>
        <Dropdown
          isOpen={isOpen}
          onClose={closeDropdown}
          className="w-40 p-2"
        >
          <DropdownItem
            onItemClick={closeDropdown}
            className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            View More
          </DropdownItem>
          <DropdownItem
            onItemClick={closeDropdown}
            className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            Delete
          </DropdownItem>
        </Dropdown>
      </div>

      <BarChart
        title="Monthly Sales"
        series={series}
        categories={categories}
        colors={["#465fff"]}
        height={180}
        columnWidth="39%"
      />
    </div>
  );
}
