'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MarkdownEditor } from '@/components/admin/markdown-editor'

interface AiUsageData {
  today: {
    requests: number
    tokens: number
  }
  limits: {
    requestsPerDay: number
    tokensPerDay: number
  }
  usageByEndpoint: Record<string, { count: number; tokens: number }>
  endpoints: Array<{ id: string; name: string; icon: string }>
}

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [unsplashQuery, setUnsplashQuery] = useState('')
  const [unsplashResults, setUnsplashResults] = useState<any[]>([])
  const [isSearchingUnsplash, setIsSearchingUnsplash] = useState(false)
  const [aiUsage, setAiUsage] = useState<AiUsageData | null>(null)

  // Fetch AI usage on mount and after AI operations
  const fetchAiUsage = () => {
    fetch('/api/admin/ai-usage')
      .then(res => res.json())
      .then(setAiUsage)
      .catch(console.error)
  }

  useEffect(() => {
    fetchAiUsage()
  }, [])

  // SEO State
  const [excerpt, setExcerpt] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [canonicalUrl, setCanonicalUrl] = useState('')

  // Internal Links State
  const [linkSuggestions, setLinkSuggestions] = useState<Array<{ id: string; title: string; slug: string; matchScore: number }>>([])

  // Fetch internal link suggestions when content changes
  useEffect(() => {
    if (content.length > 100) {
      fetch('/api/admin/internal-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
        .then(res => res.json())
        .then(data => setLinkSuggestions(data.suggestions || []))
        .catch(() => setLinkSuggestions([]))
    } else {
      setLinkSuggestions([])
    }
  }, [content])

  // AI Functions
  const handleGenerateExcerpt = async () => {
    if (!content) return
    setIsAiLoading(true)
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })
      const data = await response.json()
      if (data.excerpt) setExcerpt(data.excerpt)
      fetchAiUsage() // Refresh usage after AI call
    } catch (error) {
      console.error('AI error:', error)
    } finally {
      setIsAiLoading(false)
    }
  }
  const handleContinueWriting = async () => {
    setIsAiLoading(true)
    try {
      const response = await fetch('/api/ai/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      const data = await response.json()
      setContent(content + '\n\n' + data.result.content)
      fetchAiUsage() // Refresh usage after AI call
    } catch (error) {
      console.error('AI error:', error)
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleFixGrammar = async () => {
    setIsAiLoading(true)
    try {
      const response = await fetch('/api/ai/fix-grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      const data = await response.json()
      setContent(data.result.content)
      fetchAiUsage() // Refresh usage after AI call
    } catch (error) {
      console.error('AI error:', error)
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleRewrite = async (tone: 'casual' | 'professional' | 'concise') => {
    setIsAiLoading(true)
    try {
      const response = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tone })
      })
      const data = await response.json()
      setContent(data.result.content)
      fetchAiUsage() // Refresh usage after AI call
    } catch (error) {
      console.error('AI error:', error)
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleGenerateSEO = async () => {
    if (!title) return
    setIsAiLoading(true)
    try {
      const response = await fetch('/api/ai/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })
      const data = await response.json()
      // Populate SEO fields with generated values
      if (data.result?.metaTitle) setMetaTitle(data.result.metaTitle)
      if (data.result?.metaDescription) setMetaDescription(data.result.metaDescription)
      if (data.result?.ogImage) setOgImage(data.result.ogImage)
      fetchAiUsage() // Refresh usage after AI call
    } catch (error) {
      console.error('AI error:', error)
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleSearchUnsplash = async (query: string) => {
    if (!query.trim()) return
    setIsSearchingUnsplash(true)
    try {
      const response = await fetch(`/api/images/unsplash?query=${encodeURIComponent(query)}`)
      const data = await response.json()
      setUnsplashResults(data.results || [])
    } catch (error) {
      console.error('Unsplash error:', error)
      setUnsplashResults([])
    } finally {
      setIsSearchingUnsplash(false)
    }
  }

  const handleSave = async (isPublish = false) => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }
    if (!content.trim()) {
      alert('Please enter some content')
      return
    }

    try {
      const response = await fetch('/api/admin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          coverImage: selectedImage,
          published: isPublish,
          metaTitle,
          metaDescription,
          ogImage,
          canonicalUrl,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save post')
      }

      const post = await response.json()
      console.log('Post saved:', post)
      router.push('/')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save post. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/posts')}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSave(false)}>
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)}>
              Publish
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Input */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <input
                type="text"
                placeholder="Post title..."
                className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-0 bg-transparent placeholder:text-gray-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Markdown Editor */}
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Write your post content in Markdown..."
              disabled={isAiLoading}
              height={500}
            />

            {/* AI Writing Tools */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900">✨ AI Writing Tools</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleContinueWriting}
                  disabled={isAiLoading || !content}
                >
                  Continue Writing
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRewrite('professional')}
                  disabled={isAiLoading || !content}
                >
                  Make Professional
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRewrite('casual')}
                  disabled={isAiLoading || !content}
                >
                  Make Casual
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRewrite('concise')}
                  disabled={isAiLoading || !content}
                >
                  Make Concise
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFixGrammar}
                  disabled={isAiLoading || !content}
                >
                  Fix Grammar
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Usage */}
            {aiUsage && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>🤖</span>
                  <span>AI Usage Today</span>
                </h3>
                <div className="space-y-3">
                  {/* Requests */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Requests</span>
                      <span className="font-medium">{aiUsage.today.requests}/{aiUsage.limits.requestsPerDay}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${Math.min((aiUsage.today.requests / aiUsage.limits.requestsPerDay) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  {/* Tokens */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Tokens</span>
                      <span className="font-medium">{((aiUsage.today.tokens / 1000).toFixed(1))}k/{(aiUsage.limits.tokensPerDay / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${Math.min((aiUsage.today.tokens / aiUsage.limits.tokensPerDay) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  {/* Usage by endpoint */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">By feature:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {aiUsage.endpoints.map((ep) => {
                        const usage = aiUsage.usageByEndpoint[ep.id] || { count: 0, tokens: 0 }
                        return (
                          <div key={ep.id} className="flex items-center gap-1 text-gray-600">
                            <span>{ep.icon}</span>
                            <span className="truncate">{usage.count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cover Image */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900">Cover Image</h3>

              {selectedImage ? (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Cover"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setSelectedImage(null)}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Unsplash Search */}
                  <div>
                    <label className="text-sm text-gray-600">🔍 Search Unsplash</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        placeholder="coding, technology..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={unsplashQuery}
                        onChange={(e) => setUnsplashQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchUnsplash(unsplashQuery)
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSearchUnsplash(unsplashQuery)}
                        disabled={isSearchingUnsplash}
                      >
                        {isSearchingUnsplash ? '...' : 'Search'}
                      </Button>
                    </div>

                    {/* Unsplash Results */}
                    {unsplashResults.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {unsplashResults.map((photo) => (
                          <div
                            key={photo.id}
                            className="relative aspect-video cursor-pointer rounded-md overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
                            onClick={() => {
                              setSelectedImage(photo.url)
                              setUnsplashResults([])
                            }}
                          >
                            <img
                              src={photo.thumb}
                              alt={photo.description || 'Photo'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Internal Linking Suggestions */}
            {linkSuggestions.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900">🔗 Suggested Links</h3>
                <p className="text-xs text-gray-500 mb-3">Consider linking to these related posts:</p>
                <div className="space-y-2">
                  {linkSuggestions.map(post => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        <p className="text-xs text-gray-500">/{post.slug}</p>
                      </div>
                      <button
                        onClick={() => {
                          // Insert markdown link at cursor position
                          const linkMarkdown = `[${post.title}](/${post.slug})`
                          setContent(prev => prev + '\n\n' + linkMarkdown)
                        }}
                        className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Insert
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-semibold mb-3 text-gray-900">📈 SEO</h3>

              <div className="space-y-3">
                {/* Excerpt */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-600">Excerpt</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={handleGenerateExcerpt}
                      disabled={isAiLoading || !content}
                    >
                      ✨ AI Generate
                    </Button>
                  </div>
                  <textarea
                    placeholder="Brief summary of the post..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    maxLength={300}
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">{excerpt.length}/300</p>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleGenerateSEO}
                    disabled={isAiLoading || !title}
                  >
                    Generate Meta Tags with AI
                  </Button>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Meta Title</label>
                  <input
                    type="text"
                    placeholder="SEO title (50-60 chars)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60</p>
                </div>

                <div>
                  <label className="text-xs text-gray-600">Meta Description</label>
                  <textarea
                    placeholder="SEO description (150-160 chars)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160</p>
                </div>

                <div>
                  <label className="text-xs text-gray-600">OG Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Canonical URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
