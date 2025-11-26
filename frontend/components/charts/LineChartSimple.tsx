"use client"
import React from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface Props { data: number[]; height?: number; color?: string }

export default function LineChartSimple({ data, height = 180, color = '#0ea5a4' }: Props) {
  if (!data || data.length === 0) return null

  const chartData = data.map((v, i) => ({ name: `Day ${i + 1}`, value: v }))

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
          <CartesianGrid stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value: any) => [value, 'Score']} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-gray-500">Last 7 days — hover points to see exact values.</div>
    </div>
  )
}
