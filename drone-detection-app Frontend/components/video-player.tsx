"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

interface VideoPlayerProps {
  src: string
  thumbnail?: string
  className?: string
}

export default function VideoPlayer({ src, thumbnail, className }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setIsLoading(false)
    }
  }

  // Handle video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime)
    }
  }

  // Handle play/pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err)
          setError("Failed to play video")
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  // Handle mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  // Handle seek
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setProgress(value[0])
    }
  }

  // Handle fullscreen
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  // Handle video error
  const handleError = () => {
    setIsLoading(false)
    setError("Failed to load video")
  }

  // Show controls on hover
  const showControlsTemporarily = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  return (
    <div
      className={cn("relative group", className)}
      onMouseEnter={showControlsTemporarily}
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10 backdrop-blur-sm">
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-red-600/20 opacity-50 blur-lg animate-pulse"></div>
            <Loader2 className="w-10 h-10 animate-spin text-red-500 relative" />
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-10 backdrop-blur-sm">
          <div className="text-center p-6 bg-zinc-900/90 rounded-lg border border-red-900 shadow-lg max-w-xs">
            <div className="text-red-500 mb-3 flex flex-col items-center">
              <AlertCircle className="h-8 w-8 mb-2" />
              <div>Error: {error}</div>
            </div>
            <button
              onClick={() => {
                setError(null)
                setIsLoading(true)
                if (videoRef.current) {
                  videoRef.current.load()
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {thumbnail && !isPlaying && !error && (
        <div className="absolute inset-0 bg-black">
          <img
            src={thumbnail || "/placeholder.svg"}
            alt="Video thumbnail"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-red-600/30 group"
            >
              <Play className="w-8 h-8 text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
        onClick={togglePlay}
        playsInline
      />

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 transition-all duration-500",
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center space-x-2 mb-1">
          <Slider
            value={[progress]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-grow"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-500 transition-colors focus:outline-none group"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
              ) : (
                <Play className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
              )}
            </button>

            <div className="flex items-center space-x-2 group">
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-500 transition-colors focus:outline-none"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                ) : (
                  <Volume2 className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                )}
              </button>
              <div className="w-16 hidden group-hover:block transition-all duration-300">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="hover:scale-y-125 transition-transform"
                />
              </div>
            </div>

            <div className="text-xs text-white">
              {formatTime(progress)} / {formatTime(duration)}
            </div>
          </div>

          <button
            onClick={handleFullscreen}
            className="text-white hover:text-red-500 transition-colors focus:outline-none group"
          >
            <Maximize className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
