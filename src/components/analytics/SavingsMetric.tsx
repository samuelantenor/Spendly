import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

interface SavingsMetricProps {
  title: string;
  amount: number;
  trend: number;
  icon: 'dollar' | 'trending';
}

export default function SavingsMetric({ title, amount, trend, icon }: SavingsMetricProps) {
  const Icon = icon === 'dollar' ? DollarSign : TrendingUp;
  const trendColor = trend >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${icon === 'dollar' ? 'bg-green-100' : 'bg-indigo-100'}`}>
            <Icon className={`h-5 w-5 ${icon === 'dollar' ? 'text-green-600' : 'text-indigo-600'}`} />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <div className={`flex items-center ${trendColor}`}>
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">{trend}%</span>
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">${amount.toFixed(2)}</p>
    </div>
  );
}