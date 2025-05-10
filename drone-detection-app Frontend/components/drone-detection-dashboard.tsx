"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Grid3X3, List, Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react"
import VideoPlayer from "@/components/video-player"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

// Type definitions
type DroneDetection = {
  id: string
  url: string
  thumbnail: string
  timestamp: string
  filename: string
  detectionInfo: {
    droneType: string
    confidence: number
    location: string
    threatLevel: "Low" | "Medium" | "High"
  }
}

export default function DroneDetectionDashboard() {
  const [videos, setVideos] = useState<DroneDetection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isConnected, setIsConnected] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)
  const isMobile = useMobile()

  // Function to fetch videos (mock data)
  const fetchVideos = async () => {
    try {
      setIsPolling(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockData: DroneDetection[] = [
        {
          id: "drone1",
          url: "/videos/drone1.mp4",
          thumbnail: "/images/drone-thumbnail1.jpg",
          timestamp: "2023-06-15T14:30:00",
          filename: "drone_detection_20230615_143000.mp4",
          detectionInfo: {
            droneType: "Quadcopter",
            confidence: 0.92,
            location: "North Perimeter",
            threatLevel: "Medium"
          }
        },
        {
          id: "drone2",
          url: "/videos/drone2.mp4",
          thumbnail: "/images/drone-thumbnail2.jpg",
          timestamp: "2023-06-14T09:15:00",
          filename: "drone_detection_20230614_091500.mp4",
          detectionInfo: {
            droneType: "Hexacopter",
            confidence: 0.88,
            location: "East Entrance",
            threatLevel: "High"
          }
        },
        {
          id: "drone3",
          url: "/videos/drone3.mp4",
          thumbnail: "/images/drone-thumbnail3.jpg",
          timestamp: "2023-06-13T18:45:00",
          filename: "drone_detection_20230613_184500.mp4",
          detectionInfo: {
            droneType: "Fixed Wing",
            confidence: 0.75,
            location: "South Perimeter",
            threatLevel: "Low"
          }
        }
      ];
      
      setVideos(mockData);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Failed to fetch detection videos. Please try again.");
      setIsLoading(false);
    } finally {
      setIsPolling(false);
    }
  }

  // Initialize WebSocket connection
  useEffect(() => {
    // Try to establish WebSocket connection
    try {
      // In a production environment, use a real WebSocket URL
      // socketRef.current = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws`);

      // For demonstration, we'll simulate a connection
      const mockConnect = setTimeout(() => {
        setIsConnected(true)
        fetchVideos()

        // Simulate receiving a new detection after 8 seconds
        setTimeout(() => {
          if (isConnected) {
            // This would normally come from the WebSocket
            fetchVideos() // Refetch to get any new videos
          }
        }, 8000)
      }, 2000)

      return () => {
        clearTimeout(mockConnect)
        if (socketRef.current) {
          socketRef.current.close()
        }
      }
    } catch (error) {
      console.error("WebSocket connection error:", error)
      setIsConnected(false)
    }
  }, [])

  // Fallback to polling if WebSocket is not connected
  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    if (!isConnected && !isLoading && !error) {
      pollInterval = setInterval(() => {
        fetchVideos()
      }, 10000) // Poll every 10 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [isConnected, isLoading, error])

  // Render empty state
  if (!isLoading && videos.length === 0 && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="bg-zinc-900/80 backdrop-blur-sm p-8 rounded-xl border border-zinc-800 shadow-xl max-w-md transform transition-all duration-500 hover:scale-105 hover:shadow-red-900/5">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-zinc-800/50 opacity-50 blur-lg"></div>
            <AlertCircle className="h-12 w-12 text-zinc-500 mx-auto relative" />
          </div>
          <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            No Detections Found
          </h3>
          <p className="text-zinc-400 mb-6">
            No drone detections have been recorded yet. New detections will appear here automatically.
          </p>
          <Button
            variant="outline"
            onClick={fetchVideos}
            disabled={isPolling}
            className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 transition-all duration-300 group"
          >
            {isPolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                Check Again
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <Alert
        variant="destructive"
        className="bg-red-950/80 backdrop-blur-sm border-red-900 shadow-lg max-w-2xl mx-auto transform transition-all duration-500 hover:shadow-red-900/20"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button
          variant="outline"
          onClick={fetchVideos}
          className="mt-4 bg-red-900/80 hover:bg-red-800 border-red-800 transition-all duration-300 group"
          disabled={isPolling}
        >
          {isPolling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Retry
            </>
          )}
        </Button>
      </Alert>
    )
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-red-600/10 opacity-50 blur-xl animate-pulse"></div>
          <Loader2 className="h-16 w-16 animate-spin text-red-500 relative" />
        </div>
        <p className="mt-6 text-zinc-400 animate-pulse">Loading detection data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold mr-3">Drone Detections</h2>
          {isConnected ? (
            <Badge
              variant="outline"
              className="bg-green-950/50 backdrop-blur-sm text-green-400 border-green-800 flex items-center gap-1.5"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <Wifi className="h-3 w-3 mr-0.5" />
              Live
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-950/50 backdrop-blur-sm text-amber-400 border-amber-800 flex items-center gap-1.5"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animation-delay-500"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </div>
              <WifiOff className="h-3 w-3 mr-0.5" />
              Polling
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={cn(
              "bg-zinc-900/80 backdrop-blur-sm border-zinc-800 hover:bg-zinc-800 transition-all duration-300",
              viewMode === "grid" && "bg-zinc-800 border-zinc-700 shadow-inner shadow-black/20",
            )}
          >
            <Grid3X3
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                viewMode === "grid" ? "text-red-500" : "text-zinc-400",
              )}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("list")}
            className={cn(
              "bg-zinc-900/80 backdrop-blur-sm border-zinc-800 hover:bg-zinc-800 transition-all duration-300",
              viewMode === "list" && "bg-zinc-800 border-zinc-700 shadow-inner shadow-black/20",
            )}
          >
            <List
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                viewMode === "list" ? "text-red-500" : "text-zinc-400",
              )}
            />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {viewMode === "grid" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {videos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {videos.map((video, index) => (
              <VideoListItem key={video.id} video={video} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Video Card Component for Grid View
function VideoCard({ video, index }: { video: DroneDetection; index: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className="overflow-hidden bg-zinc-900/80 backdrop-blur-sm border-zinc-800 h-full flex flex-col shadow-lg hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 hover:border-zinc-700">
        <div className="relative overflow-hidden group">
          <VideoPlayer
            src={video.url}
            thumbnail={video.thumbnail}
            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <Badge
            className={cn(
              "absolute top-2 right-2 z-10 shadow-lg transition-all duration-300 group-hover:scale-110",
              video.detectionInfo.threatLevel === "High"
                ? "bg-red-600"
                : video.detectionInfo.threatLevel === "Medium"
                  ? "bg-amber-600"
                  : "bg-green-600",
            )}
          >
            {video.detectionInfo.threatLevel} Threat
          </Badge>
        </div>

        <div className="p-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                {video.detectionInfo.droneType}
              </h3>
              <p className="text-sm text-zinc-400">{new Date(video.timestamp).toLocaleString()}</p>
            </div>
            <Badge variant="outline" className="bg-zinc-800 border-zinc-700 shadow-inner shadow-black/10">
              {(video.detectionInfo.confidence * 100).toFixed(0)}% Confidence
            </Badge>
          </div>

          <p className="text-sm text-zinc-300 mt-2">
            <span className="text-zinc-500">Location:</span> {video.detectionInfo.location}
          </p>
          <p className="text-sm text-zinc-500 mt-1 truncate" title={video.filename}>
            File: {video.filename}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

// Video List Item Component for List View
function VideoListItem({ video, index }: { video: DroneDetection; index: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{ x: -5, scale: 1.01 }}
    >
      <Card className="overflow-hidden bg-zinc-900/80 backdrop-blur-sm border-zinc-800 shadow-lg hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 hover:border-zinc-700">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 lg:w-1/4 overflow-hidden group">
            <VideoPlayer
              src={video.url}
              thumbnail={video.thumbnail}
              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="p-4 md:w-2/3 lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
              <div>
                <h3 className="font-medium bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  {video.detectionInfo.droneType}
                </h3>
                <p className="text-sm text-zinc-400">{new Date(video.timestamp).toLocaleString()}</p>
              </div>

              <div className="flex mt-2 sm:mt-0 space-x-2">
                <Badge
                  className={cn(
                    "shadow-lg transition-all duration-300",
                    video.detectionInfo.threatLevel === "High"
                      ? "bg-red-600"
                      : video.detectionInfo.threatLevel === "Medium"
                        ? "bg-amber-600"
                        : "bg-green-600",
                  )}
                >
                  {video.detectionInfo.threatLevel} Threat
                </Badge>
                <Badge variant="outline" className="bg-zinc-800 border-zinc-700 shadow-inner shadow-black/10">
                  {(video.detectionInfo.confidence * 100).toFixed(0)}% Confidence
                </Badge>
              </div>
            </div>

            <p className="text-sm text-zinc-300 mt-2">
              <span className="text-zinc-500">Location:</span> {video.detectionInfo.location}
            </p>
            <p className="text-sm text-zinc-500 mt-1 truncate" title={video.filename}>
              File: {video.filename}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
