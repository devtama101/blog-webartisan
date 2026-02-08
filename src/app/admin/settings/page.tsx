"use client"

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [image, setImage] = useState("")
  const [imagePreview, setImagePreview] = useState("")

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Blog settings fields
  const [blogName, setBlogName] = useState("WebArtisan Blog")
  const [blogTitle, setBlogTitle] = useState("Tools & Craft")
  const [blogDescription, setBlogDescription] = useState("Thoughts on development, design, and the future of the web.")
  const [loadingBlogSettings, setLoadingBlogSettings] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
      setImage(session.user.image || "")
      setImagePreview(session.user.image || "")
    }

    // Fetch blog settings
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.blogName) setBlogName(data.blogName)
        if (data.blogTitle) setBlogTitle(data.blogTitle)
        if (data.blogDescription) setBlogDescription(data.blogDescription)
      })
      .catch(console.error)
  }, [session, status, router])

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showMessage("error", "Please select an image file")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showMessage("error", "Image must be less than 2MB")
      return
    }

    setUploadingImage(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        setImagePreview(base64)
        setImage(base64)
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch {
      showMessage("error", "Failed to process image")
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImage("")
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('[SETTINGS] Submitting:', {
      name,
      email,
      currentEmail: session?.user?.email,
      imageLength: image?.length || 0
    })

    try {
      const res = await fetch("/api/auth/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, image })
      })

      const data = await res.json()
      console.log('[SETTINGS] Response:', res.status, data)

      if (!res.ok) {
        showMessage("error", data.error || "Failed to update profile")
        setLoading(false)
        return
      }

      showMessage("success", "Profile updated successfully!")

      // Wait for database to settle, then reload
      setTimeout(() => {
        window.location.href = window.location.pathname + "?refreshed=" + Date.now()
      }, 500)
    } catch (err) {
      console.error('[SETTINGS] Error:', err)
      showMessage("error", "Something went wrong")
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      showMessage("error", "New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        showMessage("error", data.error || "Failed to update password")
      } else {
        showMessage("success", "Password updated successfully")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch {
      showMessage("error", "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleBlogSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingBlogSettings(true)

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogName,
          blogTitle,
          blogDescription
        })
      })

      const data = await res.json()

      if (!res.ok) {
        showMessage("error", data.error || "Failed to update blog settings")
      } else {
        showMessage("success", "Blog settings updated successfully")
      }
    } catch {
      showMessage("error", "Something went wrong")
    } finally {
      setLoadingBlogSettings(false)
    }
  }

  // Generate avatar URL from initials if no image
  const getAvatarUrl = (name: string, img: string) => {
    if (img) return img
    const initials = name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
    return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}`
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-background border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>

        {/* Avatar Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Profile Photo</label>
          <div className="flex items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative">
              <img
                src={getAvatarUrl(name, imagePreview)}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-muted bg-muted"
              />
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Upload Buttons */}
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {uploadingImage ? "Uploading..." : "Upload Photo"}
              </button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  Remove Photo
                </button>
              )}
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-background border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Blog Settings Section */}
      <div className="bg-background border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Blog Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Customize the blog homepage header and branding
        </p>

        <form onSubmit={handleBlogSettingsUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Blog Name</label>
            <input
              type="text"
              value={blogName}
              onChange={(e) => setBlogName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="WebArtisan Blog"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The brand name shown in the navigation bar
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Homepage Title</label>
            <input
              type="text"
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Tools & Craft"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The main heading on the blog homepage
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Homepage Description</label>
            <textarea
              value={blogDescription}
              onChange={(e) => setBlogDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Thoughts on development, design, and the future of the web."
            />
            <p className="text-xs text-muted-foreground mt-1">
              The subtitle shown below the homepage title
            </p>
          </div>

          <button
            type="submit"
            disabled={loadingBlogSettings}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loadingBlogSettings ? "Saving..." : "Save Blog Settings"}
          </button>
        </form>
      </div>
    </div>
  )
}
