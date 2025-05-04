import { NextResponse } from "next/server"
import { readLogFolder } from "@/lib/file-utils"

export async function GET() {
  try {
    // Read videos from the .logs folder
    const videos = await readLogFolder()

    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error fetching drone detections:", error)
    return NextResponse.json({ error: "Failed to fetch drone detection videos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // In a real application, this would validate and store the new detection
    // For demonstration, we just return the data with an ID

    const newDetection = {
      id: Date.now().toString(),
      ...data,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(newDetection, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process detection data" }, { status: 400 })
  }
}
