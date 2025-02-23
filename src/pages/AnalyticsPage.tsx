import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SpendingChart from '../components/analytics/SpendingChart';
import TimeChart from '../components/analytics/TimeChart';
import SpendingPatternChart from '../components/analytics/SpendingPatternChart';
import EmotionalTriggerList from '../components/analytics/EmotionalTriggerList';
import { EMOTIONAL_TRIGGERS } from '../components/EmotionalTriggerSelector';

interface AnalyticsData {
  categorySpending: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  timeDistribution: {
    hour: number;
    count: number;
    amount: number;
  }[];
  dayDistribution: {
    day: string;
    count: number;
    amount: number;
  }[];
  emotionalTriggers: {
    trigger: string;
    frequency: number;
    totalSpent: number;
  }[];
  impulseMetrics: {
    totalImpulsePurchases: number;
    averageImpulseAmount: number;
    mostCommonTrigger: string | null;
    peakSpendingTime: string;
  };
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchAnalytics();
  }, [user, navigate, selectedTimeframe]);

  const fetchAnalytics = async () => {
    try {
      // Get date range based on selected timeframe
      const now = new Date();
      let startDate = new Date();
      switch (selectedTimeframe) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch orders for analysis
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Process category spending
      const categoryMap = new Map();
      let totalSpent = 0;

      orders?.forEach(order => {
        order.items.forEach((item: any) => {
          const currentAmount = categoryMap.get(item.category) || 0;
          categoryMap.set(item.category, currentAmount + (item.price * item.quantity));
          totalSpent += item.price * item.quantity;
        });
      });

      const categorySpending = Array.from(categoryMap.entries()).map(([category, amount]) => ({
        category,
        amount: amount as number,
        percentage: ((amount as number) / totalSpent) * 100
      }));

      // Process time distribution
      const timeMap = new Map();
      const dayMap = new Map();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      orders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const hour = orderDate.getHours();
        const day = daysOfWeek[orderDate.getDay()];

        // Update hourly distribution
        const currentHour = timeMap.get(hour) || { count: 0, amount: 0 };
        timeMap.set(hour, {
          count: currentHour.count + 1,
          amount: currentHour.amount + order.total_amount
        });

        // Update daily distribution
        const currentDay = dayMap.get(day) || { count: 0, amount: 0 };
        dayMap.set(day, {
          count: currentDay.count + 1,
          amount: currentDay.amount + order.total_amount
        });
      });

      const timeDistribution = Array.from(timeMap.entries()).map(([hour, data]) => ({
        hour: Number(hour),
        count: data.count,
        amount: data.amount
      }));

      const dayDistribution = daysOfWeek.map(day => ({
        day,
        ...dayMap.get(day) || { count: 0, amount: 0 }
      }));

      // Get emotional trigger data from orders that have it recorded
      const triggerMap = new Map();
      orders?.forEach(order => {
        if (order.emotional_trigger) {
          const current = triggerMap.get(order.emotional_trigger) || { frequency: 0, totalSpent: 0 };
          triggerMap.set(order.emotional_trigger, {
            frequency: current.frequency + 1,
            totalSpent: current.totalSpent + order.total_amount
          });
        }
      });

      // Convert trigger map to array and sort by frequency
      const emotionalTriggers = Array.from(triggerMap.entries())
        .map(([trigger, data]) => ({
          trigger,
          frequency: data.frequency,
          totalSpent: data.totalSpent
        }))
        .sort((a, b) => b.frequency - a.frequency);

      // Find peak spending time
      const peakHour = timeDistribution.reduce((max, current) => 
        current.amount > max.amount ? current : max,
        { hour: 0, amount: 0, count: 0 }
      );

      setAnalyticsData({
        categorySpending,
        timeDistribution,
        dayDistribution,
        emotionalTriggers,
        impulseMetrics: {
          totalImpulsePurchases: orders?.length || 0,
          averageImpulseAmount: orders?.length ? totalSpent / orders.length : 0,
          mostCommonTrigger: emotionalTriggers.length > 0 ? emotionalTriggers[0].trigger : null,
          peakSpendingTime: `${peakHour.hour}:00`
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available yet. Start shopping to see your patterns!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Analytics</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as 'week' | 'month' | 'year')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Impulse Shopping Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Impulse Shopping Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Impulse Purchases</p>
            <p className="text-2xl font-bold text-indigo-600">
              {analyticsData.impulseMetrics.totalImpulsePurchases}
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-600">Average Purchase Amount</p>
            <p className="text-2xl font-bold text-indigo-600">
              ${analyticsData.impulseMetrics.averageImpulseAmount.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-600">Most Common Trigger</p>
            <p className="text-2xl font-bold text-indigo-600">
              {analyticsData.impulseMetrics.mostCommonTrigger || 'Not enough data'}
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-600">Peak Shopping Time</p>
            <p className="text-2xl font-bold text-indigo-600">
              {analyticsData.impulseMetrics.peakSpendingTime}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SpendingChart
          data={analyticsData.categorySpending}
          title="Spending by Category"
        />
        <TimeChart data={analyticsData.timeDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingPatternChart
          timeData={analyticsData.timeDistribution}
          dayData={analyticsData.dayDistribution}
        />
        <EmotionalTriggerList triggers={analyticsData.emotionalTriggers} />
      </div>
    </div>
  );
}