"use client"
import React from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface Props { value: number; total: number; height?: number; colors?: [string,string] }

export default function DonutChart({ value, total, height = 180, colors = ['#06b6d4','#e6eef0'] }: Props) {
  const completed = Math.max(0, Math.min(total, value))
  const remaining = Math.max(0, total - completed)
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  const data = [
    { name: 'Completed', value: completed },
    { name: 'Remaining', value: remaining }
  ]

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="80%" startAngle={90} endAngle={-270}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? colors[0] : colors[1]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: any) => [v, 'Count']} />
          <Legend verticalAlign="bottom" height={24} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 text-sm font-medium text-gray-700 text-center">{percent}% completed ({completed} of {total})</div>
    </div>
  )
}
