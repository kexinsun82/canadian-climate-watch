export const LEVEL_LABELS = ['Nice', 'Low', 'Medium', 'High', 'Extreme'];

export const getLevelText = (level) => {
  if (typeof level === 'string') {
    return level;
  }
  if (typeof level === 'number' && level >= 0 && level <= 4) {
    return LEVEL_LABELS[level];
  }
  return 'Undefined';
};

export const getLevelColor = (level) => {
  const colors = {
    0: 'bg-green-100 text-green-800',
    1: 'bg-blue-100 text-blue-800', 
    2: 'bg-yellow-100 text-yellow-800',
    3: 'bg-orange-100 text-orange-800',
    4: 'bg-red-100 text-red-800'
  };
  
  if (typeof level === 'number' && level >= 0 && level <= 4) {
    return colors[level];
  }
  return 'bg-gray-100 text-gray-800';
}; 