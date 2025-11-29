"use client"
import React from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

interface Props { 
  value: number; 
  total: number; 
  height?: number; 
  colors?: [string, string];
  label?: string;
}

export default function DonutChart({ 
  value, 
  total, 
  height = 200, 
  colors = ['#10b981', '#e5e7eb'],
  label = 'Completion Rate'
}: Props) {
  const completed = Math.max(0, Math.min(total, value))
  const remaining = Math.max(0, total - completed)
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
        <p>Enroll in courses to track your progress</p>
      </div>
    )
  }

  const data = [
    { name: 'Completed', value: completed },
    { name: 'In Progress', value: remaining }
  ]

  const getMessage = () => {
    if (percent === 100) return "Amazing! All courses completed!"
    if (percent >= 75) return "Great progress! Keep it up!"
    if (percent >= 50) return "You're halfway there!"
    if (percent >= 25) return "Good start! Keep learning!"
    return "Start completing courses!"
  }

  return (
    <div style={{ width: '100%' }}>
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              dataKey="value" 
              nameKey="name" 
              innerRadius="65%" 
              outerRadius="85%" 
              startAngle={90} 
              endAngle={-270}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 0 ? colors[0] : colors[1]}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(v: any, name: string) => [v, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold" style={{ color: colors[0] }}>
            {percent}%
          </div>
          <div className="text-xs text-gray-500 mt-1">{label}</div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[0] }}></div>
            <span className="text-gray-600">Completed: <span className="font-semibold">{completed}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[1] }}></div>
            <span className="text-gray-600">Remaining: <span className="font-semibold">{remaining}</span></span>
          </div>
        </div>
        <p className="text-xs text-center text-gray-600 font-medium">{getMessage()}</p>
      </div>
    </div>
  )
}
