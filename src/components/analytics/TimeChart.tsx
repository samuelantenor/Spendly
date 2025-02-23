import React from 'react';
import { Clock } from 'lucide-react';

interface TimeData {
  hour: number;
  count: number;
  amount: number;
}

interface TimeChartProps {
  data: TimeData[];
}

export default function TimeChart({ data }: TimeChartProps) {
  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-6">
        <Clock className="h-5 w-5 text-indigo-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Shopping Times</h3>
      </div>
      <div className="relative h-48">
        {data.map((item) => {
          const height = (item.count / maxCount) * 100;
          const left = (item.hour / 24) * 100;
          
          return (
            <div
              key={`hour-${item.hour}`}
              className="absolute bottom-0 w-2 bg-indigo-600 rounded-t transform -translate-x-1/2 transition-all duration-300 hover:bg-indigo-500"
              style={{
                height: `${height}%`,
                left: `${left}%`,
              }}
              title={`${item.hour}:00 - ${item.count} orders, $${item.amount.toFixed(2)}`}
            />
          );
        })}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
        {[0, 6, 12, 18, 23].map((hour) => (
          <div
            key={`label-${hour}`}
            className="absolute bottom-0 text-xs text-gray-500"
            style={{ left: `${(hour / 24) * 100}%` }}
          >
            {hour}:00
          </div>
        ))}
      </div>
    </div>
  );
}