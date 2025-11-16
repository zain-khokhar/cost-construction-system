'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCurrencySymbol } from '@/lib/utils/currencies';

export default function TopItemsBarChart({ data = [], currency = 'USD' }) {
  const chartData = data.map((item) => ({
    name: item._id,
    cost: item.totalCost,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip formatter={(value) => `${getCurrencySymbol(currency)}${value.toLocaleString()}`} />
        <Bar dataKey="cost" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}
