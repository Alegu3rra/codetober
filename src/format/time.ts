export function elapsedLabel(seconds: number) {
  return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m ${Math.floor(seconds % 60)}s`;
}

