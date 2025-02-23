import React from 'react';
import { Brain, AlertTriangle } from 'lucide-react';

export const EMOTIONAL_TRIGGERS = [
  { id: 'stress', label: 'Stress', description: 'Feeling overwhelmed or anxious' },
  { id: 'boredom', label: 'Boredom', description: 'Looking for entertainment or distraction' },
  { id: 'celebration', label: 'Celebration', description: 'Rewarding yourself or feeling happy' },
  { id: 'social', label: 'Social Pressure', description: 'Influenced by others or social media' },
  { id: 'sadness', label: 'Sadness', description: 'Seeking comfort or mood improvement' },
  { id: 'impulse', label: 'Impulse', description: 'Sudden urge to buy' },
  { id: 'fomo', label: 'FOMO', description: 'Fear of missing out on a deal or trend' },
  { id: 'planned', label: 'Planned Purchase', description: 'Thoughtful, pre-planned decision' }
];

interface EmotionalTriggerSelectorProps {
  selectedTrigger: string | null;
  onSelect: (triggerId: string) => void;
}

export default function EmotionalTriggerSelector({ selectedTrigger, onSelect }: EmotionalTriggerSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-medium text-gray-900">How are you feeling?</h3>
        </div>
        <div className="flex items-center text-amber-600">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span className="text-sm">Mindful Moment</span>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Take a moment to reflect on your emotional state before completing this purchase.
        This helps you make more mindful shopping decisions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EMOTIONAL_TRIGGERS.map((trigger) => (
          <button
            key={trigger.id}
            onClick={() => onSelect(trigger.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedTrigger === trigger.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-gray-900">{trigger.label}</div>
            <div className="text-sm text-gray-500">{trigger.description}</div>
          </button>
        ))}
      </div>

      {selectedTrigger && selectedTrigger !== 'planned' && (
        <div className="p-4 bg-amber-50 rounded-lg mt-4">
          <h4 className="text-sm font-medium text-amber-900 mb-2">Shopping Mindfulness Tip</h4>
          <p className="text-sm text-amber-700">
            {selectedTrigger === 'stress' && "Consider taking a few deep breaths and waiting 24 hours before making this purchase. Stress shopping often leads to regret."}
            {selectedTrigger === 'boredom' && "Try making a wishlist instead of buying right away. Come back when you have a specific need rather than seeking entertainment."}
            {selectedTrigger === 'sadness' && "Shopping might provide temporary relief, but consider if there are other activities that could help improve your mood."}
            {selectedTrigger === 'social' && "Remember that your financial well-being is more important than keeping up with trends or others' expectations."}
            {selectedTrigger === 'impulse' && "Take a moment to evaluate if this purchase aligns with your budget and values. The urge to buy often passes with time."}
            {selectedTrigger === 'fomo' && "Ask yourself if you really need this item or if you're just afraid of missing out. There will always be more deals."}
            {selectedTrigger === 'celebration' && "While it's okay to treat yourself, make sure this purchase fits within your budget and brings lasting joy."}
          </p>
        </div>
      )}
    </div>
  );
}