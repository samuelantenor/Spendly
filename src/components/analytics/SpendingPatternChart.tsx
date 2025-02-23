import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface TimeData {
  hour: number;
  count: number;
  amount: number;
}

interface DayData {
  day: string;
  count: number;
  amount: number;
}

interface SpendingPatternChartProps {
  timeData: TimeData[];
  dayData: DayData[];
}

export default function SpendingPatternChart({ timeData, dayData }: SpendingPatternChartProps) {
  const [view, setView] = useState<'daily' | 'hourly'>('daily');

  const maxDayAmount = Math.max(...dayData.map(d => d.amount));
  const maxHourAmount = Math.max(...timeData.map(t => t.amount));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
          Spending Patterns
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('daily')}
            className={`px-3 py-1 rounded-md text-sm ${
              view === 'daily'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView('hourly')}
            className={`px-3 py-1 rounded-md text-sm ${
              view === 'hourly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Hourly
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {view === 'daily' ? (
          dayData.map((day) => (
            <div key={day.day} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{day.day}</span>
                <span className="text-gray-600">
                  ${day.amount.toFixed(2)} ({day.count} purchases)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${(day.amount / maxDayAmount) * 100}%`
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="relative h-48">
            {timeData.map((hour) => {
              const height = (hour.amount / maxHourAmount) * 100;
              const left = (hour.hour / 24) * 100;
              
              return (
                <div
                  key={hour.hour}
                  className="absolute bottom-0 w-2 bg-indigo-600 rounded-t transform -translate-x-1/2 transition-all duration-300 hover:bg-indigo-500"
                  style={{
                    height: `${height}%`,
                    left: `${left}%`,
                  }}
                  title={`${hour.hour}:00 - ${hour.count} orders, $${hour.amount.toFixed(2)}`}
                />
              );
            })}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
            {[0, 6, 12, 18, 23].map((hour) => (
              <div
                key={hour}
                className="absolute bottom-0 text-xs text-gray-500"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
                {hour}:00
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <h4 className="text-sm font-medium text-indigo-900 mb-2">Pattern Insights</h4>
        <p className="text-sm text-indigo-700">
          {view === 'daily'
            ? "Your spending tends to be highest on weekends. Consider setting shopping-free days to manage impulse purchases."
            : "You tend to shop more during evening hours. Try to plan your shopping during off-peak times when you're less likely to make impulse purchases."}
        </p>
      </div>
    </div>
  );
}