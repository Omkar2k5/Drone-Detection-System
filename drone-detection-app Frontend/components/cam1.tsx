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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  
  // Function to handle image load success
  const handleImageLoad = () => {
    setIsLoading(false)
    setIsConnected(true)
    setError(null)
  }
  
  // Function to handle image load error
  const handleImageError = () => {
    setIsLoading(false)
    setIsConnected(false)
    setError("Failed to connect to camera stream")
  }
  
  // Function to retry connection
  const retryConnection = () => {
    setIsLoading(true)
    setError(null)
    
    // Force reload the image by updating the src with a cache-busting parameter
    if (imgRef.current) {
      const timestamp = new Date().getTime()
      imgRef.current.src = `${streamUrl}?t=${timestamp}`
    }
  }
  
  // Set up initial connection
  useEffect(() => {
    // Add a small delay to allow the component to mount
    const timer = setTimeout(() => {
      if (imgRef.current) {
        imgRef.current.src = streamUrl
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [streamUrl])
  
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
            className="bg-red-950/50 backdrop-blur-sm text-red-400 border-red-800 flex items-center gap-1.5"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animation-delay-500"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </div>
            Offline
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pt-4">
        <div className="relative aspect-video bg-zinc-950 rounded-md overflow-hidden">
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
              <div className="relative">
                <div className="absolute -inset-8 rounded-full bg-red-600/10 opacity-50 blur-xl animate-pulse"></div>
                <Loader2 className="h-10 w-10 animate-spin text-red-500 relative" />
              </div>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
              <div className="text-center p-4">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                <p className="text-red-400 mb-3">{error}</p>
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
          />
        </div>
      </CardContent>
    </Card>
  )
}