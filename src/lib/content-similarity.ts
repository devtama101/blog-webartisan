/**
 * Content similarity utilities for finding related posts
 * Uses token-based similarity (simpler than full TF-IDF)
 */

export interface PostWithSimilarity {
  id: string
  slug: string
  title: string
  excerpt: string | null
  similarity: number
}

/**
 * Tokenize text into lowercase words, removing common stop words
 */
function tokenize(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 'just', 'this', 'that', 'these', 'those', 'i', 'you', 'your',
    'my', 'we', 'our', 'their', 'it', 'its', 'he', 'she', 'they', 'them',
  ])

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
}

/**
 * Calculate cosine similarity between two text samples
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1)
  const tokens2 = tokenize(text2)

  if (tokens1.length === 0 || tokens2.length === 0) return 0

  // Create term frequency maps
  const tf1 = new Map<string, number>()
  const tf2 = new Map<string, number>()

  for (const token of tokens1) {
    tf1.set(token, (tf1.get(token) || 0) + 1)
  }

  for (const token of tokens2) {
    tf2.set(token, (tf2.get(token) || 0) + 1)
  }

  // Get unique terms
  const allTerms = new Set([...tf1.keys(), ...tf2.keys()])

  // Calculate dot product and magnitudes
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  for (const term of allTerms) {
    const f1 = tf1.get(term) || 0
    const f2 = tf2.get(term) || 0
    dotProduct += f1 * f2
    magnitude1 += f1 * f1
    magnitude2 += f2 * f2
  }

  magnitude1 = Math.sqrt(magnitude1)
  magnitude2 = Math.sqrt(magnitude2)

  if (magnitude1 === 0 || magnitude2 === 0) return 0

  return dotProduct / (magnitude1 * magnitude2)
}

/**
 * Find similar posts based on content
 * Returns posts sorted by similarity score
 */
export function findSimilarPosts(
  currentPost: { title: string; content: string; id?: string },
  allPosts: Array<{ id: string; title: string; content: string; excerpt: string | null; slug: string }>,
  limit = 5
): PostWithSimilarity[] {
  const currentText = `${currentPost.title} ${currentPost.content}`

  const similarities = allPosts
    .filter(post => post.id !== currentPost.id) // Exclude current post
    .map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      similarity: calculateSimilarity(currentText, `${post.title} ${post.content}`),
    }))
    .filter(post => post.similarity > 0.05) // Only include posts with meaningful similarity
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)

  return similarities
}

/**
 * Find posts that might be relevant to link to based on keywords
 * Extracts key phrases from content and finds matching posts
 */
export function findLinkingSuggestions(
  content: string,
  allPosts: Array<{ id: string; title: string; slug: string }>,
  limit = 5
): Array<{ id: string; title: string; slug: string; matchScore: number }> {
  const contentLower = content.toLowerCase()
  const contentTokens = new Set(tokenize(content))

  return allPosts
    .map(post => {
      const titleLower = post.title.toLowerCase()
      const titleTokens = tokenize(post.title)

      // Count how many title tokens appear in content
      let matchCount = 0
      for (const token of titleTokens) {
        if (contentTokens.has(token)) {
          matchCount++
        }
      }

      // Also check if title appears as a phrase in content
      const phraseMatch = contentLower.includes(titleLower) ? 2 : 0

      const matchScore = matchCount + phraseMatch

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        matchScore,
      }
    })
    .filter(post => post.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
}
