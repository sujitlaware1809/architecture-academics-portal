"use client"
import React from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface Props { labels: string[]; values: number[]; height?: number; color?: string }

export default function BarChartSimple({ labels, values, height = 220, color = '#6366f1' }: Props) {
  const data = labels.map((l, i) => ({ name: l, value: values[i] ?? 0 }))

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 24 }}>
          <CartesianGrid stroke="#f8fafc" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="value" fill={color} radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-gray-500">Weekly counts — hover bars for exact numbers.</div>
    </div>
  )
}
