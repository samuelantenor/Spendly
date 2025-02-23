import React from 'react';
import { Brain, AlertTriangle } from 'lucide-react';

interface EmotionalTrigger {
  trigger: string;
  frequency: number;
  totalSpent: number;
}

interface EmotionalTriggerListProps {
  triggers: EmotionalTrigger[];
}

export default function EmotionalTriggerList({ triggers }: EmotionalTriggerListProps) {
  if (!triggers || triggers.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-6">
          <Brain className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Emotional Triggers</h3>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-500">
            No emotional trigger data available yet. Start making purchases to track your emotional spending patterns.
          </p>
        </div>

        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-900 mb-2">Getting Started</h4>
          <ul className="text-sm text-indigo-700 space-y-2">
            <li>• Track your emotional state during purchases</li>
            <li>• Identify patterns in your shopping behavior</li>
            <li>• Develop mindful spending habits</li>
          </ul>
        </div>
      </div>
    );
  }

  const totalFrequency = triggers.reduce((sum, t) => sum + t.frequency, 0);
  const totalSpent = triggers.reduce((sum, t) => sum + t.totalSpent, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-6">
        <Brain className="h-5 w-5 text-indigo-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Emotional Triggers</h3>
      </div>

      <div className="space-y-4">
        {triggers.map((trigger) => (
          <div key={trigger.trigger} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-medium text-gray-700">{trigger.trigger}</span>
                {trigger.frequency / totalFrequency > 0.3 && (
                  <AlertTriangle className="h-4 w-4 text-amber-500 ml-2" />
                )}
              </div>
              <span className="text-sm text-gray-500">
                ${trigger.totalSpent.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${(trigger.frequency / totalFrequency) * 100}%`
                  }}
                />
              </div>
              <span className="text-sm text-gray-500">
                {((trigger.frequency / totalFrequency) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {triggers.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-lg">
            <h4 className="text-sm font-medium text-amber-900 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Primary Trigger Alert
            </h4>
            <p className="text-sm text-amber-700">
              {triggers[0].trigger} appears to be your main shopping trigger. Consider alternative stress-relief activities when you feel the urge to shop.
            </p>
          </div>
        )}

        <div className="p-4 bg-indigo-50 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-900 mb-2">Coping Strategies</h4>
          <ul className="text-sm text-indigo-700 space-y-2">
            <li>• Take a 24-hour pause before making purchases when stressed</li>
            <li>• Create a shopping wishlist and review it when calm</li>
            <li>• Find alternative activities for emotional relief</li>
          </ul>
        </div>
      </div>
    </div>
  );
}