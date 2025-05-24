import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoUrl = searchParams.get('url')

  if (!videoUrl) {
    return new NextResponse('Video URL is required', { status: 400 })
  }

  try {
    console.log('Fetching video from:', videoUrl)
    
    const response = await fetch(videoUrl, {
      headers: {
        'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
        'Range': 'bytes=0-',
      },
    })
    
    if (!response.ok) {
      console.error('Video fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
      throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`)
    }

    // Get the video content type
    const contentType = response.headers.get('content-type') || 'video/mp4'
    console.log('Video content type:', contentType)

    // Get the content length
    const contentLength = response.headers.get('content-length')
    console.log('Content length:', contentLength)

    // Create a new response with the video stream
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
      'Accept-Ranges': 'bytes',
    }

    if (contentLength) {
      headers['Content-Length'] = contentLength
    }

    return new NextResponse(response.body, { headers })
  } catch (error) {
    console.error('Error streaming video:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error streaming video', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
      'Access-Control-Max-Age': '86400',
    },
  })
} 