// src/utils/activity.js
export const getActivityLevelText = (level) => {
  const levels = {
    sedentary: 'Sedentário',
    moderate: 'Moderadamente ativo',
    active: 'Muito ativo',
  };
  return levels[level] || level;
};
