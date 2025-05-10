"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react"
import Cam1 from "@/components/cam1"

export default function CameraPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false)
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`)
        })
      }
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="h-full w-full bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-zinc-900/5 to-zinc-950 z-0"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" passHref>
              <Button
                variant="outline"
                size="sm"
                className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300 group"
              >
                <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-300" />{" "}
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Live Camera Feed</h1>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4 mr-2" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen
              </>
            )}
          </Button>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Cam1 className="w-full" />
          
          <div className="mt-6 p-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg">
            <h2 className="text-lg font-medium mb-2">Camera Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-400">Camera ID: <span className="text-white">CAM_1</span></p>
                <p className="text-zinc-400">Location: <span className="text-white">Main Entrance</span></p>
                <p className="text-zinc-400">Status: <span className="text-green-400">Active</span></p>
              </div>
              <div>
                <p className="text-zinc-400">Resolution: <span className="text-white">1280x720</span></p>
                <p className="text-zinc-400">Frame Rate: <span className="text-white">30 FPS</span></p>
                <p className="text-zinc-400">Stream Type: <span className="text-white">MJPEG</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}