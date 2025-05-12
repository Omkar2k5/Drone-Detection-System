"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Play, Square } from 'lucide-react'

interface DetectionFeedProps {
  camId: string
  camName: string
}

export default function DetectionFeed({ camId, camName }: DetectionFeedProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startDetection = async () => {
    try {
      setError(null)
      setIsRunning(true)
      
      // Start the Python detection script
      const response = await fetch('/api/startDetection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          camId: camId,
          source: camId === "1" ? "0" : camId // Use camera index or ID
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start detection')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start detection')
      setIsRunning(false)
    }
  }

  const stopDetection = async () => {
    try {
      const response = await fetch('/api/stopDetection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ camId })
      })

      if (!response.ok) {
        throw new Error('Failed to stop detection')
      }

      setIsRunning(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop detection')
    }
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (isRunning) {
        stopDetection()
      }
    }
  }, [])

  if (error) {
    return (
      <div className="aspect-video bg-zinc-950 rounded-md overflow-hidden flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setError(null)}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video bg-zinc-950 rounded-md overflow-hidden">
      {!isRunning ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={startDetection}
            className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700"
          >
            <Play className="h-6 w-6 mr-2" />
            Start Detection
          </Button>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-zinc-400">Detection running on {camName}...</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={stopDetection}
            className="absolute top-2 right-2 bg-zinc-900/80 backdrop-blur-sm border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </>
      )}
    </div>
  )
} 