"use client"

import { Suspense } from "react"
import DroneDetectionDashboard from "@/components/drone-detection-dashboard"
import { Loader2, ChevronLeft, Shield, Video, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface RecordingMetadata {
  timestamp: string;
  droneType: string;
  confidence: number;
  location: string;
  threatLevel: string;
  droneCount: number;
  coordinates: number[][];
}

interface Recording {
  id: string;
  filename: string;
  timestamp: string;
  metadata: RecordingMetadata | null;
  url: string;
}

function getRecordings(): Recording[] {
  // Mock data for recordings
  return [
    {
      id: "drone_detection_2023-05-15_12-30-45.mp4",
      filename: "drone_detection_2023-05-15_12-30-45.mp4",
      timestamp: "2023-05-15T12:30:45",
      metadata: {
        timestamp: "2023-05-15T12:30:45",
        droneType: "Quadcopter",
        confidence: 0.92,
        location: "North Perimeter",
        threatLevel: "Medium",
        droneCount: 1,
        coordinates: [[120, 340]]
      },
      url: "/api/recordings/video/drone_detection_2023-05-15_12-30-45.mp4"
    },
    {
      id: "drone_detection_2023-05-14_08-15-22.mp4",
      filename: "drone_detection_2023-05-14_08-15-22.mp4",
      timestamp: "2023-05-14T08:15:22",
      metadata: {
        timestamp: "2023-05-14T08:15:22",
        droneType: "Hexacopter",
        confidence: 0.88,
        location: "East Entrance",
        threatLevel: "High",
        droneCount: 2,
        coordinates: [[220, 180], [350, 210]]
      },
      url: "/api/recordings/video/drone_detection_2023-05-14_08-15-22.mp4"
    },
    {
      id: "drone_detection_2023-05-13_19-45-10.mp4",
      filename: "drone_detection_2023-05-13_19-45-10.mp4",
      timestamp: "2023-05-13T19:45:10",
      metadata: {
        timestamp: "2023-05-13T19:45:10",
        droneType: "Fixed Wing",
        confidence: 0.75,
        location: "South Perimeter",
        threatLevel: "Low",
        droneCount: 1,
        coordinates: [[450, 280]]
      },
      url: "/api/recordings/video/drone_detection_2023-05-13_19-45-10.mp4"
    }
  ];
}

export default function DashboardPage() {
  const recordings = getRecordings();

  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="h-full w-full bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-zinc-900/5 to-zinc-950 z-0"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <header>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/" passHref>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300 group"
                >
                  <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-300" />{" "}
                  Back
                </Button>
              </Link>
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-600/20 to-amber-600/20 opacity-70 blur-sm"></div>
                <h1 className="relative text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
                  Drone Detection Security
                </h1>
              </div>
            </div>
            <p className="text-zinc-400">Real-time monitoring and detection system</p>
          </header>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-zinc-800">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <span className="text-sm text-zinc-300">Live Monitoring</span>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-zinc-800">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm text-zinc-300">System Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recorded Detections</h2>
         <Link href="/cctv" passHref>
            <Button
              variant="outline"
              size="sm"
              className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300"
            >
              View CCTV Footage
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {recordings.map((recording) => (
            <Card key={recording.id} className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 overflow-hidden">
              <div className="aspect-video relative bg-zinc-950">
                <video
                  src={recording.url}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
                <div className="absolute top-2 right-2">
                  {recording.metadata?.threatLevel === 'High' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      High Threat
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm text-zinc-400">
                      {(() => {
                        try {
                          return formatDistanceToNow(new Date(recording.timestamp), { addSuffix: true });
                        } catch (error) {
                          return "Unknown time";
                        }
                      })()}
                    </span>
                  </div>
                  {recording.metadata && recording.metadata.droneCount > 1 && (
                    <span className="text-sm text-zinc-400">
                      {recording.metadata.droneCount} drones detected
                    </span>
                  )}
                </div>
                {recording.metadata && (
                  <div className="space-y-1 text-sm text-zinc-400">
                    <p>Confidence: {(recording.metadata.confidence * 100).toFixed(1)}%</p>
                    <p>Type: {recording.metadata.droneType}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center h-64">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-red-600/20 opacity-50 blur-lg animate-pulse"></div>
                <Loader2 className="h-12 w-12 animate-spin text-red-500 relative" />
              </div>
              <p className="mt-4 text-zinc-400">Loading detection data...</p>
            </div>
          }
        >
          <DroneDetectionDashboard />
        </Suspense>
      </div>
    </main>
  )
}
