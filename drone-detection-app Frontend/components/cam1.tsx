"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Cam1Props {
  streamUrl?: string
  className?: string
}

export default function Cam1({ 
  streamUrl = "http://localhost:8000/video_feed", 
  className 
}: Cam1Props) {
  const testImageUrl = "http://localhost:8000/test_image"
  const statusUrl = "http://localhost:8000/camera_status"
  
  const actualStreamUrl = `${streamUrl}?t=${new Date().getTime()}`
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [hasImage, setHasImage] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  
  const handleImageLoad = () => {
    setIsLoading(false)
    setIsConnected(true)
    setError(null)
    setHasImage(true)
    console.log("Stream connected successfully")
  }
  
  const handleImageError = () => {
    console.error("Failed to connect to stream:", streamUrl)
    
    // Try the test image endpoint
    if (imgRef.current) {
      const testUrl = `${testImageUrl}?t=${new Date().getTime()}`
      console.log(`Trying test image: ${testUrl}`)
      imgRef.current.src = testUrl
    }
    
    // Only show error if both stream and test image fail
    setTimeout(() => {
      if (!hasImage) {
        setIsLoading(false)
        setIsConnected(false)
        setError("Failed to connect to camera stream")
      }
    }, 2000)
  }
  
  const retryConnection = () => {
    setIsLoading(true)
    setError(null)
    setHasImage(false)
    
    // Check camera status first
    fetch(statusUrl)
      .then(response => response.json())
      .then(data => {
        if (data.camera_status) {
          if (imgRef.current) {
            const newStreamUrl = `${streamUrl}?t=${new Date().getTime()}`
            imgRef.current.src = newStreamUrl
            console.log(`Connecting to stream: ${newStreamUrl}`)
          }
        } else {
          throw new Error("Camera not initialized")
        }
      })
      .catch(err => {
        console.error("Error checking camera status:", err)
        if (imgRef.current) {
          const testUrl = `${testImageUrl}?t=${new Date().getTime()}`
          imgRef.current.src = testUrl
        }
      })
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (imgRef.current) {
        imgRef.current.src = actualStreamUrl
        console.log(`Connecting to stream: ${actualStreamUrl}`)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [actualStreamUrl])
  
  return (
    <Card className={cn(
      "overflow-hidden bg-zinc-900/80 backdrop-blur-sm border-zinc-800 shadow-lg hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 hover:border-zinc-700",
      className
    )}>
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium">Cam 1</CardTitle>
        {isConnected ? (
          <Badge
            variant="outline"
            className="bg-green-950/50 backdrop-blur-sm text-green-400 border-green-800 flex items-center gap-1.5"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            Live
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-amber-950/50 backdrop-blur-sm text-amber-400 border-amber-800 flex items-center gap-1.5"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </div>
            Connecting...
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pt-4">
        <div className="relative aspect-video bg-zinc-950 rounded-md overflow-hidden">
          {/* Loading state */}
          {isLoading && !hasImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
              <div className="relative">
                <div className="absolute -inset-8 rounded-full bg-red-600/10 opacity-50 blur-xl animate-pulse"></div>
                <Loader2 className="h-10 w-10 animate-spin text-red-500 relative" />
              </div>
            </div>
          )}
          
          {/* Error state */}
          {error && !hasImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
              <div className="text-center p-4">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                <p className="text-red-400 mb-3">{error}</p>
                <p className="text-zinc-400 text-sm mb-4">
                  Make sure the Python server is running:<br />
                  <code className="bg-zinc-800 px-2 py-1 rounded text-xs">python detect.py</code>
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={retryConnection}
                  className="bg-red-950/50 hover:bg-red-900/50 border-red-800 text-red-400"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
              </div>
            </div>
          )}
          
          {/* The actual stream */}
          <img
            ref={imgRef}
            className="w-full h-full object-cover"
            alt="Camera 1 Feed"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ 
              minHeight: '240px',
              backgroundColor: '#000',
              border: '1px solid #333'
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}