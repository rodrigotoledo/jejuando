// Mapeamento de estágios do jejum baseado nas horas transcorridas
export function getFastingStage(elapsedHours) {
  if (elapsedHours < 4) {
    return { key: 'fed', title: 'Fed state', subtitle: 'Digestion/absorption ongoing', color: '#9E9E9E' };
  }
  if (elapsedHours < 12) {
    return { key: 'post_absorptive', title: 'Post-absortive', subtitle: 'Insulin descending, uses glycogen', color: '#8D6E63' };
  }
  if (elapsedHours < 16) {
    return { key: 'early_fast', title: 'Fasting', subtitle: 'Glycogen ↓, fat starting to rise', color: '#6D4C41' };
  }
  if (elapsedHours < 24) {
    return { key: 'mild_ketosis', title: 'Light ketosis', subtitle: 'High fat burning', color: '#5D4037' };
  }
  if (elapsedHours < 36) {
    return { key: 'deepening_ketosis', title: 'Moderate ketosis', subtitle: 'Autophagia rising', color: '#4E342E' };
  }
  if (elapsedHours < 48) {
    return { key: 'advanced_fast', title: 'Advanced fasting', subtitle: 'GH ↑, low insulin, high lipolysis', color: '#3E2723' };
  }
  return { key: 'prolonged', title: 'Prolonged fasting', subtitle: 'High autophagy/ketosis - caution', color: '#2E1E1A' };
}
