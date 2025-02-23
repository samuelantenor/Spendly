import React from 'react';
import { BarChart, DollarSign } from 'lucide-react';

interface SpendingData {
  category: string;
  amount: number;
  percentage: number;
}

interface SpendingChartProps {
  data: SpendingData[];
  title: string;
}

export default function SpendingChart({ data, title }: SpendingChartProps) {
  const maxPercentage = Math.max(...data.map(item => item.percentage));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart className="h-5 w-5 text-indigo-600 mr-2" />
          {title}
        </h3>
        <div className="text-sm text-gray-500">
          Total: ${data.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
        </div>
      </div>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={`category-${item.category}`} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.category}</span>
              <span className="text-gray-600">
                ${item.amount.toFixed(2)} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{
                  width: `${(item.percentage / maxPercentage) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}