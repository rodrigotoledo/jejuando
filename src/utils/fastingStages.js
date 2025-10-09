// Mapeamento de estágios do jejum baseado nas horas transcorridas
export function getFastingStage(elapsedHours) {
  if (elapsedHours < 4) {
    return { key: 'fed', title: 'Estado alimentado', subtitle: 'Digestão/absorção em andamento', color: '#9E9E9E' };
  }
  if (elapsedHours < 12) {
    return { key: 'post_absorptive', title: 'Pós-absortivo', subtitle: 'Insulina descendo, usa glicogênio', color: '#8D6E63' };
  }
  if (elapsedHours < 16) {
    return { key: 'early_fast', title: 'Jejum', subtitle: 'Glicogênio ↓, gordura começando a subir', color: '#6D4C41' };
  }
  if (elapsedHours < 24) {
    return { key: 'mild_ketosis', title: 'Cetose leve', subtitle: 'Queima de gordura alta', color: '#5D4037' };
  }
  if (elapsedHours < 36) {
    return { key: 'deepening_ketosis', title: 'Cetose moderada', subtitle: 'Autofagia subindo', color: '#4E342E' };
  }
  if (elapsedHours < 48) {
    return { key: 'advanced_fast', title: 'Jejum avançado', subtitle: 'GH ↑, insulina baixa, lipólise alta', color: '#3E2723' };
  }
  return { key: 'prolonged', title: 'Jejum prolongado', subtitle: 'Autofagia/cetose alta - cautela', color: '#2E1E1A' };
}