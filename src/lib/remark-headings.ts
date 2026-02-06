/**
 * Remark plugin to add IDs to headings
 * This works with the Table of Contents generator
 * Simple slugify function that works without external dependencies
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

export function remarkHeadings() {
  return function transformer(tree: any) {
    // Simple recursive visitor
    function visit(node: any, visitor: (node: any) => void) {
      if (!node) return
      visitor(node)
      if (node.children) {
        node.children.forEach((child: any) => visit(child, visitor))
      }
    }

    visit(tree, (node) => {
      if (node.type === 'heading') {
        // Extract text content from children
        const text = node.children
          .map((child: any) => {
            if (child.type === 'text') return child.value
            if (child.type === 'link') return child.children?.map((c: any) => c.value || '').join('') || ''
            return ''
          })
          .join('')

        node.data = node.data || {}
        node.data.hProperties = node.data.hProperties || {}
        node.data.hProperties.id = slugify(text)
      }
    })
  }
}

export default remarkHeadings
