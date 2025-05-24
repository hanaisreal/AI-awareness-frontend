'use client'
import { useState } from 'react'

export default function VideoTest() {
  const originalVideoUrl = "https://d2qf6ukcym4kn9.cloudfront.net/final_deepfake_short-ad0e48b1-bf89-451d-aae1-7f8f43ae5f1a-2846.m4v"
  const videoUrl = `/api/stream-video?url=${encodeURIComponent(originalVideoUrl)}`
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.target as HTMLVideoElement
    const error = videoElement.error
    let errorMessage = 'Failed to load video'
    
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video playback was aborted'
          break
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error occurred while loading video'
          break
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Video decoding failed'
          break
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported'
          break
      }
    }
    
    console.error('Video error:', error)
    setError(errorMessage)
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 md:p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl p-6 sm:p-8 md:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8 text-center text-slate-800">
          Video Streaming Test
        </h1>

        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          {error ? (
            <div className="w-full h-full flex items-center justify-center text-red-500">
              Error: {error}
            </div>
          ) : (
            <video
              className="w-full h-full"
              controls
              autoPlay
              onLoadStart={() => setIsLoading(true)}
              onLoadedData={() => setIsLoading(false)}
              onError={handleVideoError}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {isLoading && !error && (
          <div className="mt-4 text-center text-gray-600">
            Loading video...
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p>Original Video URL: {originalVideoUrl}</p>
          <p>Proxied Video URL: {videoUrl}</p>
        </div>
      </div>
    </main>
  )
} 