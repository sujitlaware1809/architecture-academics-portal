"use client"
import React from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts'

interface Props { 
  labels: string[]; 
  values: number[]; 
  height?: number; 
  colors?: string[];
  title?: string;
}

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#10b981']

export default function BarChartSimple({ 
  labels, 
  values, 
  height = 220, 
  colors = DEFAULT_COLORS,
  title = 'Activity Overview'
}: Props) {
  const data = labels.map((l, i) => ({ 
    name: l, 
    value: values[i] ?? 0,
    color: colors[i % colors.length]
  }))

  const total = values.reduce((sum, v) => sum + v, 0)
  const maxValue = Math.max(...values, 1)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No activity recorded yet. Start engaging to see your stats!
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 12, left: -20, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            formatter={(value: any) => [value, 'Count']}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fill: '#374151', fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Total Activity: <span className="font-semibold text-gray-700">{total}</span></span>
          <span className="text-gray-500">Most Active: <span className="font-semibold text-gray-700">{data.find(d => d.value === maxValue)?.name || 'N/A'}</span></span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Tip: Diversify your activities for a well-rounded experience</p>
      </div>
    </div>
  )
}
