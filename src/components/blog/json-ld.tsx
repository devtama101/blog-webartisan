interface JsonLdProps {
  data: Record<string, unknown>
}

/**
 * JSON-LD component for injecting structured data into the page head
 * This helps search engines understand content and display rich snippets
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}
