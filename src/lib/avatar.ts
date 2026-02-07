/**
 * Generate avatar URL with initials fallback using Dicebear API
 *
 * @param name - User's full name
 * @param image - User's custom image URL (if any)
 * @returns Avatar URL (either custom image or generated initials)
 */
export function getAvatarUrl(
  name: string | null | undefined,
  image: string | null | undefined
): string {
  if (image) return image

  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=3b82f6&textColor=ffffff`
}
