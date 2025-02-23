import React from 'react';
import type { Achievement } from '../types';

interface AchievementsListProps {
  achievements: Achievement[];
}

export default function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{achievement.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-500">{achievement.description}</p>
              <p className="text-sm font-medium text-indigo-600 mt-1">
                +{achievement.points} points
              </p>
              {achievement.earned_at && (
                <p className="text-xs text-gray-400 mt-1">
                  Earned {new Date(achievement.earned_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}