"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Maximize2, Minimize2, Video, Shield, AlertCircle } from "lucide-react"
import Cam1 from "@/components/cam1"

export default function CCTVPage() {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <header>
            <div className="flex items-center gap-2 mb-2">
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
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-600/20 to-amber-600/20 opacity-70 blur-sm"></div>
                <h1 className="relative text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
                  CCTV Footage
                </h1>
              </div>
            </div>
            <p className="text-zinc-400">Live camera feeds from all monitoring points</p>
          </header>

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

        {/* Camera Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Camera 1 */}
          <Card className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 overflow-hidden">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-medium">Cam 1 - Main Entrance</CardTitle>
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
            </CardHeader>
            
            <CardContent className="p-4 pt-4">
              <Cam1 />
            </CardContent>
          </Card>

          {/* Camera 2 (Placeholder) */}
          <Card className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 overflow-hidden">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-medium">Cam 2 - Perimeter East</CardTitle>
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
            </CardHeader>
            
            <CardContent className="p-4 pt-4">
              <div className="aspect-video bg-zinc-950 rounded-md overflow-hidden flex items-center justify-center">
                <div className="text-center p-4">
                  <Video className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500">Camera feed unavailable</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Camera 3 (Placeholder) */}
          <Card className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 overflow-hidden">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-medium">Cam 3 - Perimeter West</CardTitle>
              <Badge
                variant="outline"
                className="bg-red-950/50 backdrop-blur-sm text-red-400 border-red-800 flex items-center gap-1.5"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </div>
                Offline
              </Badge>
            </CardHeader>
            
            <CardContent className="p-4 pt-4">
              <div className="aspect-video bg-zinc-950 rounded-md overflow-hidden flex items-center justify-center">
                <div className="text-center p-4">
                  <AlertCircle className="h-10 w-10 text-red-700 mx-auto mb-2" />
                  <p className="text-red-500">Connection failed</p>
                  <p className="text-zinc-500 text-sm mt-1">Check camera power and network</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800 overflow-hidden mb-8">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-medium">System Status</CardTitle>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Detection System</p>
                  <p className="text-xs text-green-400">Active</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <Video className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Recording</p>
                  <p className="text-xs text-green-400">Enabled (30 FPS)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <div className="relative flex h-3 w-3 mt-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Network Status</p>
                  <p className="text-xs text-green-400">Connected (1/3 cameras)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}