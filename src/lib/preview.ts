const A4_PORTRAIT = { width: 210 * 96 / 25.4, height: 297 * 96 / 25.4 }

export function getPreviewScale(viewport: { width: number; height: number }): number {
  return Math.max(0, Math.min(1, viewport.width / A4_PORTRAIT.width, viewport.height / A4_PORTRAIT.height))
}
