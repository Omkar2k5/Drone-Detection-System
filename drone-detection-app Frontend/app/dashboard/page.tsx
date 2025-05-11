"use client"

import { Suspense, useEffect, useState } from "react"
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
  size: number;
  metadata: RecordingMetadata | null;
  url: string;
}

export default function DashboardPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecordings() {
      try {
        console.log('Fetching recordings...');
        const response = await fetch('/api/recordings');
        if (!response.ok) {
          throw new Error(`Failed to fetch recordings: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Received recordings:', data);
        setRecordings(data);
      } catch (err) {
        console.error('Error fetching recordings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recordings');
      } finally {
        setLoading(false);
      }
    }

    fetchRecordings();
  }, []);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    const recording = recordings.find(r => r.url === video.src);
    
    console.error('Video loading error:', {
      src: video.src,
      recording: recording ? {
        id: recording.id,
        filename: recording.filename,
        size: recording.size,
        metadata: recording.metadata
      } : null,
      error: error ? {
        code: error.code,
        message: error.message
      } : null,
      networkState: video.networkState,
      readyState: video.readyState,
      currentSrc: video.currentSrc,
      duration: video.duration,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      paused: video.paused,
      ended: video.ended,
      seeking: video.seeking,
      currentTime: video.currentTime
    });

    // Try to recover by reloading the video
    if (video.networkState === 3) { // NETWORK_NO_SOURCE
      video.load();
    }
  };

  const handleSourceError = (e: React.SyntheticEvent<HTMLSourceElement, Event>) => {
    const source = e.currentTarget;
    const parentVideo = source.parentElement as HTMLVideoElement;
    const error = parentVideo?.error;
    const recording = recordings.find(r => r.url === source.src);
    
    console.error('Source error:', {
      src: source.src,
      type: source.type,
      recording: recording ? {
        id: recording.id,
        filename: recording.filename,
        size: recording.size,
        metadata: recording.metadata
      } : null,
      parent: source.parentElement?.tagName,
      parentSrc: parentVideo?.src,
      parentError: error ? {
        code: error.code,
        message: error.message
      } : null,
      networkState: parentVideo?.networkState,
      readyState: parentVideo?.readyState
    });

    // Try to recover by reloading the video
    if (parentVideo && parentVideo.networkState === 3) {
      parentVideo.load();
    }
  };

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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : recordings.length === 0 ? (
          <div className="text-zinc-400 text-center py-8">No recordings found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recordings.map((recording) => (
              <Card key={recording.id} className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 overflow-hidden">
                <div className="aspect-video relative bg-zinc-950">
                  <video
                    key={recording.id}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    onError={handleVideoError}
                    playsInline
                    src={recording.url}
                  >
                    Your browser does not support the video tag.
                  </video>
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
                  </div>
                  <div className="text-sm text-zinc-400">
                    {recording.filename}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Size: {(recording.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
