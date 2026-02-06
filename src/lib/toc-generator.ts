export interface TocItem {
  id: string
  text: string
  level: number
  children?: TocItem[]
}

/**
 * Generate a table of contents from markdown content
 * Extracts headings (## and ###) and creates a hierarchical structure
 */
export function generateToc(markdown: string): TocItem[] {
  const lines = markdown.split('\n')
  const toc: TocItem[] = []
  const stack: { level: number; items: TocItem[] }[] = [{ level: 0, items: toc }]

  for (const line of lines) {
    // Match ## or ### headings
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (!match) continue

    const level = match[1].length // 2 for ##, 3 for ###
    const text = match[2].trim()
    const id = generateSlug(text)

    const item: TocItem = { id, text, level }

    // Find the right parent level
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop()
    }

    // Add to current parent's children
    const parent = stack[stack.length - 1]
    if (level === 2) {
      parent.items.push(item)
    } else if (level === 3 && parent.items.length > 0) {
      const lastItem = parent.items[parent.items.length - 1]
      if (!lastItem.children) {
        lastItem.children = []
      }
      lastItem.children.push(item)
    }

    // Push to stack for potential nested items
    stack.push({ level, items: level === 2 ? [item] : item.children || [] })
  }

  return toc
}

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

/**
 * Add anchor IDs to markdown headings for smooth scrolling
 * This processes the markdown to add id attributes to headings
 */
export function addHeadingAnchors(markdown: string): string {
  return markdown.replace(/^(#{2,3})\s+(.+)$/gm, (match, hashes, text) => {
    const level = hashes.length
    const id = generateSlug(text)
    return `${hashes} ${text} {#${id}}`
  })
}
