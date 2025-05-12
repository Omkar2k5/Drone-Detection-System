"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, ChevronLeft, Shield, Video, AlertTriangle } from "lucide-react"
import DetectionEvent from "../components/detection-event"

interface Snapshot {
  filename: string;
  timestamp: string;
  metadata: {
    image: {
      filename: string;
      timestamp: string;
      dimensions: {
        width: number;
        height: number;
        channels: number;
      };
    };
    detection: {
      droneType: string;
      confidence: number;
      threatLevel: string;
      coordinates: number[][];
      frameInfo: any;
    };
    system: {
      captureTime: string;
      deviceInfo: {
        platform: string;
        version: string;
        machine: string;
      };
    };
  };
  imagePath: string;
}

export default function DashboardPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch snapshots
        const snapshotsResponse = await fetch('/api/snapshots');
        if (!snapshotsResponse.ok) {
          throw new Error(`Failed to fetch snapshots: ${snapshotsResponse.statusText}`);
        }
        const snapshotsData = await snapshotsResponse.json();
        setSnapshots(snapshotsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Sort snapshots by timestamp
  const sortedSnapshots = [...snapshots].sort(
    (a, b) => new Date(b.metadata.image.timestamp).getTime() - new Date(a.metadata.image.timestamp).getTime()
  );

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
          <h2 className="text-xl font-semibold">Detection Events</h2>
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
        ) : sortedSnapshots.length === 0 ? (
          <div className="text-zinc-400 text-center py-8">No detection events found</div>
        ) : (
          <div className="space-y-6">
            {sortedSnapshots.map((snapshot) => (
              <DetectionEvent
                key={snapshot.filename}
                timestamp={snapshot.metadata.image.timestamp}
                droneType={snapshot.metadata.detection.droneType}
                confidence={snapshot.metadata.detection.confidence}
                threatLevel={snapshot.metadata.detection.threatLevel}
                maxDronesSpotted={snapshot.metadata.detection.coordinates.length}
                coordinates={snapshot.metadata.detection.coordinates}
                imagePath={snapshot.imagePath}
                metadata={snapshot.metadata}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
