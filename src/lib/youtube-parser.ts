/**
 * Regular expression to match YouTube URLs
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 */
const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/

/**
 * Extracts the YouTube video ID from various YouTube URL formats
 * @param url - The YouTube URL to parse
 * @returns The video ID if found, null otherwise
 */
export function parseYouTubeUrl(url: string): string | null {
  if (!url) return null

  const match = url.match(YOUTUBE_REGEX)
  return match ? match[1] : null
}

/**
 * Checks if a string is a valid YouTube URL
 * @param url - The URL to check
 * @returns true if the URL is a valid YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return parseYouTubeUrl(url) !== null
}

/**
 * Converts a YouTube URL to the storage placeholder format
 * @param url - The YouTube URL
 * @returns The placeholder string for storage
 */
export function youtubeToPlaceholder(url: string): string {
  const videoId = parseYouTubeUrl(url)
  return videoId ? `{{youtube:${videoId}}}` : url
}

/**
 * Extracts the video ID from a YouTube placeholder
 * @param placeholder - The placeholder string (e.g., "{{youtube:abc123}}")
 * @returns The video ID if found, null otherwise
 */
export function parseYouTubePlaceholder(placeholder: string): string | null {
  const match = placeholder.match(/\{\{youtube:([^}]+)\}\}/)
  return match ? match[1] : null
}

/**
 * Replaces YouTube placeholders with actual URLs
 * @param content - Content containing YouTube placeholders
 * @returns Content with placeholders replaced by YouTube URLs
 */
export function placeholdersToUrls(content: string): string {
  return content.replace(/\{\{youtube:([^}]+)\}\}/g, (_match, videoId) => {
    return `https://www.youtube.com/watch?v=${videoId}`
  })
}

/**
 * Replaces YouTube URLs with storage placeholders
 * @param content - Content containing YouTube URLs
 * @returns Content with URLs replaced by placeholders
 */
export function urlsToPlaceholders(content: string): string {
  return content.replace(YOUTUBE_REGEX, (_match, videoId) => {
    return `{{youtube:${videoId}}}`
  })
}
