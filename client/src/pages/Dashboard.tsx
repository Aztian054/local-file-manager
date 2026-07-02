import React, { useState } from "react";
import { Search, Filter, X, LayoutGrid, LayoutList } from "lucide-react";
import { FileUploadArea } from "@/components/FileUploadArea";
import { FileTable } from "@/components/FileTable";
import { FileGridView } from "@/components/FileGridView";
import { FileBrowser } from "@/components/FileBrowser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<{
    category: string;
    year: number;
    month: number;
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Fetch files with filters
  const { data: files = [], isLoading, refetch } = trpc.files.list.useQuery({
    category: selectedCategory || undefined,
    year: selectedMonth?.year,
    month: selectedMonth?.month,
    search: searchQuery || undefined,
  });

  // Fetch statistics
  const { data: stats } = trpc.files.getStats.useQuery();

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedMonth(null);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCategory || selectedMonth || searchQuery.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                File Manager
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Organize and manage your files with automatic categorization
              </p>
            </div>
            {stats && (
              <div className="hidden sm:flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalFiles}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Files
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(stats.totalSize / (1024 * 1024 * 1024)).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    GB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - File Browser */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Browse Files
                </h2>
              </div>
              <FileBrowser
                onSelectCategory={setSelectedCategory}
                onSelectMonth={(category, year, month) => {
                  setSelectedMonth({ category, year, month });
                  setSelectedCategory(null);
                }}
                selectedCategory={selectedCategory || undefined}
                selectedMonth={selectedMonth || undefined}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Upload Area */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Files
              </h2>
              <FileUploadArea
                onUploadComplete={() => {
                  refetch();
                }}
              />
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <div className="flex gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="h-8 w-8 p-0"
                    title="Table view"
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                    title="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedCategory && `Category: ${selectedCategory}`}
                    {selectedMonth &&
                      ` • ${selectedMonth.category} / ${selectedMonth.year}`}
                    {searchQuery && ` • Search: "${searchQuery}"`}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Files View */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Files
              </h2>
              {viewMode === "table" ? (
                <FileTable
                  files={files}
                  isLoading={isLoading}
                  onFileDeleted={() => refetch()}
                />
              ) : (
                <FileGridView
                  files={files}
                  isLoading={isLoading}
                  onFileDeleted={() => refetch()}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
