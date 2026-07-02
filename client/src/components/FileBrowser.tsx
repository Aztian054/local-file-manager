import React, { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

interface FileBrowserProps {
  onSelectCategory?: (category: string) => void;
  onSelectMonth?: (category: string, year: number, month: number) => void;
  selectedCategory?: string;
  selectedMonth?: { category: string; year: number; month: number } | null;
}

const categoryEmoji: Record<string, string> = {
  Dokumen: "📄",
  Foto: "🖼",
  Video: "🎥",
  Audio: "🎵",
  Arsip: "📦",
  Aplikasi: "💻",
  ISO: "💿",
  Lainnya: "📁",
};

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function FileBrowser({
  onSelectCategory,
  onSelectMonth,
  selectedCategory,
  selectedMonth,
}: FileBrowserProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

  const { data: folderStructure, isLoading } =
    trpc.files.getFolderStructure.useQuery();

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleYear = (key: string) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedYears(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!folderStructure || Object.keys(folderStructure).length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">No files yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {Object.entries(folderStructure).map(([category, years]) => {
        const isExpanded = expandedCategories.has(category);
        const isSelected = selectedCategory === category;

        return (
          <div key={category}>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                isSelected
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => {
                toggleCategory(category);
                onSelectCategory?.(category);
              }}
            >
              <button
                className="p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              <span className="text-lg">{categoryEmoji[category] || "📁"}</span>
              <span className="font-medium text-sm flex-1">{category}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                {Object.values(years).reduce(
                  (sum, months) =>
                    sum +
                    Object.values(months).reduce(
                      (monthSum, data) => monthSum + data.count,
                      0
                    ),
                  0
                )}
              </span>
            </div>

            {isExpanded && (
              <div className="ml-6 space-y-1">
                {Object.entries(years)
                  .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                  .map(([year, months]) => {
                    const yearKey = `${category}-${year}`;
                    const yearExpanded = expandedYears.has(yearKey);

                    return (
                      <div key={year}>
                        <button
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left text-gray-600 dark:text-gray-400 text-sm"
                          onClick={() => toggleYear(yearKey)}
                        >
                          {yearExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span className="font-medium">{year}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                            {Object.values(months).reduce(
                              (sum, data) => sum + data.count,
                              0
                            )}
                          </span>
                        </button>

                        {yearExpanded && (
                          <div className="ml-6 space-y-1">
                            {Object.entries(months)
                              .sort(([monthA], [monthB]) => Number(monthB) - Number(monthA))
                              .map(([month, data]) => {
                                const monthNum = Number(month);
                                const monthName = monthNames[monthNum - 1] || "Unknown";
                                const isSelectedMonth =
                                  selectedMonth?.category === category &&
                                  selectedMonth?.year === Number(year) &&
                                  selectedMonth?.month === monthNum;

                                return (
                                  <button
                                    key={month}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md w-full text-left text-sm transition-colors ${
                                      isSelectedMonth
                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                                    }`}
                                    onClick={() =>
                                      onSelectMonth?.(
                                        category,
                                        Number(year),
                                        monthNum
                                      )
                                    }
                                  >
                                    <Folder className="h-4 w-4 flex-shrink-0" />
                                    <span className="flex-1">{monthName}</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                                      {data.count}
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
