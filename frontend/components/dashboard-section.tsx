"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardSectionProps<T> {
  title: string
  icon: React.ReactNode
  description?: string
  viewAllLink: string
  viewAllText?: string
  items: T[]
  renderItem: (item: T) => React.ReactNode
  tabs?: {
    label: string
    value: string
    filter: (item: T) => boolean
  }[]
  emptyMessage?: string
  stat?: string | number
  statLabel?: string
  accentColor?: string
}

export function DashboardSection<T extends { id: number | string }>({
  title,
  icon,
  description,
  viewAllLink,
  viewAllText = "View All",
  items,
  renderItem,
  tabs,
  emptyMessage = "No items found",
  stat,
  statLabel,
  accentColor = "border-blue-500"
}: DashboardSectionProps<T>) {
  const [activeTab, setActiveTab] = useState(tabs ? tabs[0].value : "all")

  const displayedItems = tabs 
    ? items.filter(tabs.find(t => t.value === activeTab)?.filter || (() => true))
    : items

  return (
    <Card className={`shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-200 overflow-hidden group border-t-4 ${accentColor}`}>
      <CardHeader className="p-5 pb-4 space-y-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-50 rounded-lg shadow-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                  {icon}
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">{title}</CardTitle>
            </div>
            {description && <CardDescription className="text-sm font-medium pl-1">{description}</CardDescription>}
          </div>
          <Link href={viewAllLink}>
            <Button className="bg-gray-900 text-white hover:bg-gray-800 font-medium shadow-sm h-8 px-4 text-xs">
              {viewAllText}
            </Button>
          </Link>
        </div>
        
        {stat !== undefined && (
            <div className="flex items-baseline gap-2 mt-2 pl-1">
                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{stat}</span>
                {statLabel && <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">{statLabel}</span>}
            </div>
        )}

        {tabs && (
          <Tabs defaultValue={tabs[0].value} value={activeTab} onValueChange={setActiveTab} className="w-full pt-2">
            <TabsList className="grid w-full grid-cols-2 h-9 bg-white border border-gray-200 shadow-sm">
              {tabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-sm data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">{tab.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-5 pt-4 bg-white">
        {displayedItems.length > 0 ? (
          <div className="space-y-3">
            {displayedItems.slice(0, 3).map(item => (
              <div key={item.id}>
                {renderItem(item)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed text-sm">
            <p>{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
