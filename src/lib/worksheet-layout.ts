interface WorksheetLayoutSettings {
  title: string
  instructions: string
  showHeader: boolean
  margin: number
}

// Use an em-wide slot per character, including Latin text, so line breaks and
// page capacity are deterministic even when the system substitutes a font.
function wrapLines(text: string, charactersPerLine: number): string[] {
  const characters = Array.from(text)
  const lines: string[] = []
  for (let start = 0; start < characters.length; start += charactersPerLine) {
    lines.push(characters.slice(start, start + charactersPerLine).join(''))
  }
  return lines
}

export function getWorksheetLayout({ title, instructions, showHeader, margin }: WorksheetLayoutSettings) {
  const width = 210 - margin * 2
  // Keep 2 mm of horizontal tolerance in addition to the title's 1 px tracking.
  const titleCapacity = Math.floor((width - 2) / (21 * 25.4 / 72 + 25.4 / 96))
  const instructionCapacity = Math.floor((width - 2) / (10 * 25.4 / 72))
  const titleLines = wrapLines(title, titleCapacity)
  const instructionLines = wrapLines(instructions.trim(), instructionCapacity)
  const headerHeight = (showHeader ? 27 : 18) + Math.max(0, titleLines.length - 1) * 12
  const instructionsHeight = instructionLines.length ? Math.max(10, instructionLines.length * 4 + 2) : 0

  return {
    titleLines,
    instructionLines,
    headerHeight,
    instructionsHeight,
    contentHeight: 297 - margin * 2 - headerHeight - instructionsHeight,
  }
}
