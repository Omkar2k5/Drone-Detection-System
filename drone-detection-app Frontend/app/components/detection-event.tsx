"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { AlertTriangle, Camera, Crosshair, Plane, Info, Shield } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface DetectionEventProps {
  timestamp: string
  droneType: string
  confidence: number
  threatLevel: string
  maxDronesSpotted: number
  coordinates: number[][]
  imagePath: string
  metadata: any
}

export default function DetectionEvent({
  timestamp,
  droneType,
  confidence,
  threatLevel,
  maxDronesSpotted,
  coordinates,
  imagePath,
  metadata
}: DetectionEventProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-800'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-800'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-800'
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-300">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              Detection Event - {new Date(timestamp).toLocaleString()}
            </CardTitle>
            <Badge
              variant="outline"
              className={`${getThreatLevelColor(threatLevel)} flex items-center gap-1.5`}
            >
              {threatLevel === 'High' && <AlertTriangle className="h-3 w-3" />}
              {threatLevel} Threat
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Snapshot Image */}
            <div className="relative group">
              <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden">
                <img
                  src={imagePath}
                  alt="Detection Snapshot"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800">
                  <Camera className="h-3 w-3 mr-1" />
                  Snapshot
                </Badge>
              </div>
            </div>

            {/* Metadata Display */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-zinc-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                    <Plane className="h-4 w-4" />
                    Drone Type
                  </div>
                  <div className="text-white font-medium">{droneType}</div>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                    <Shield className="h-4 w-4" />
                    Confidence
                  </div>
                  <div className="text-white font-medium">{(confidence * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                    <Crosshair className="h-4 w-4" />
                    Max Drones
                  </div>
                  <div className="text-white font-medium">{maxDronesSpotted}</div>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                    <Info className="h-4 w-4" />
                    Time
                  </div>
                  <div className="text-white font-medium">
                    {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-zinc-800/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                  <Crosshair className="h-4 w-4" />
                  Detection Coordinates
                </div>
                <div className="text-xs text-zinc-500 space-y-1">
                  {coordinates.map((coord, index) => (
                    <div key={index}>
                      Drone {index + 1}: ({coord[0]}, {coord[1]})
                    </div>
                  ))}
                </div>
              </div>

              {/* Expandable Raw Metadata */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-zinc-800/50 p-3 rounded-lg text-left transition-all duration-300 hover:bg-zinc-800/70"
              >
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>Raw Metadata</span>
                  <span className="text-xs">{isExpanded ? 'Hide' : 'Show'}</span>
                </div>
                {isExpanded && (
                  <pre className="mt-2 text-xs text-zinc-500 overflow-x-auto">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                )}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 