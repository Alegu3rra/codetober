export function LearningNotice({ compact = false }: { compact?: boolean }) {
  return <aside className="learning-notice">
    <strong>Try it first.</strong>{' '}
    {compact ? 'Getting help is okay. The real victory is understanding the solution and being able to explain it in your own words.'
      : 'Getting help from other people, an editorial, or AI is okay. The real victory is trying to build your own solution and understanding why it works. If you need a hint, use it, then try solving the problem again on your own.'}
  </aside>;
}
