"use client"

import { Search, RefreshCw } from "lucide-react"

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  resetFilters: () => void
  isForFdp?: boolean
}

export function EmptyState({
  title = "No workshops found",
  message = "We couldn't find any workshops matching your filters.",
  icon = <Search className="h-10 w-10 text-gray-400" />,
  resetFilters,
  isForFdp = false
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white/50 rounded-xl border border-gray-100 shadow-sm">
      <div className={`p-4 rounded-full ${isForFdp ? 'bg-indigo-50' : 'bg-purple-50'} mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{message}</p>
      <button
        onClick={resetFilters}
        className={`px-4 py-2 rounded-full flex items-center gap-2 text-white shadow-sm transition-all ${
          isForFdp 
            ? 'bg-indigo-500 hover:bg-indigo-600' 
            : 'bg-purple-500 hover:bg-purple-600'
        }`}
      >
        <RefreshCw className="h-4 w-4" />
        <span>Reset Filters</span>
      </button>
    </div>
  );
}
