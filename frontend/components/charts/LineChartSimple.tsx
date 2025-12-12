"use client"
import React from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface Props { 
  data: number[]; 
  height?: number; 
  color?: string;
  labels?: string[];
  dataLabel?: string;
  compact?: boolean;
}

export default function LineChartSimple({ 
  data, 
  height = 200, 
  color = '#10b981',
  labels,
  dataLabel = 'Progress Score',
  compact = false
}: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No data available yet. Start learning to see your progress!
      </div>
    )
  }

  const chartData = data.map((v, i) => ({ 
    name: labels && labels[i] ? labels[i] : `Day ${i + 1}`, 
    value: v 
  }))

  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const improvement = data.length > 1 ? ((data[data.length - 1] - data[0]) / Math.max(data[0], 1) * 100).toFixed(0) : 0

  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any) => [value, dataLabel]}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2.5} 
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: 'white' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      {!compact && (
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Peak: <span className="font-semibold text-gray-700">{maxValue}</span></span>
            <span className="text-gray-500">Lowest: <span className="font-semibold text-gray-700">{minValue}</span></span>
            <span className={`font-semibold ${Number(improvement) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Number(improvement) >= 0 ? '+' : ''}{improvement}% change
            </span>
          </div>
          <p className="text-xs text-gray-500">Tip: Consistent daily learning leads to better outcomes</p>
        </div>
      )}
    </div>
  )
}
