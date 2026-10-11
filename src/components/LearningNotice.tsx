export function LearningNotice({ compact = false }: { compact?: boolean }) {
  return <aside className="learning-notice">
    <strong>Inténtalo primero.</strong>{' '}
    {compact ? 'Recibir ayuda está bien. La verdadera victoria es entender la solución y poder explicarla con tus propias palabras.'
      : 'Recibir ayuda de otras personas, una editorial o una IA está bien. La verdadera victoria es intentar construir tu solución y entender por qué funciona. Si necesitas una pista, úsala y después intenta resolverlo de nuevo por tu cuenta.'}
  </aside>;
}
