import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { headers } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  const filename = params.filename

  try {
    // Sanitize the filename to prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename)
    const videoPath = path.join(process.cwd(), ".logs", sanitizedFilename)

    // Check if the file exists
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Get file stats
    const stat = fs.statSync(videoPath)
    const fileSize = stat.size
    const headersList = headers()

    // Handle range requests for video streaming
    const range = headersList.get("range")

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = Number.parseInt(parts[0], 10)
      const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1
      const chunksize = end - start + 1
      const file = fs.createReadStream(videoPath, { start, end })

      // Create headers for partial content
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": getContentType(filename),
      }

      return new NextResponse(file as any, {
        status: 206,
        headers,
      })
    } else {
      // Return the full file if no range is specified
      const headers = {
        "Content-Length": fileSize.toString(),
        "Content-Type": getContentType(filename),
      }

      const file = fs.createReadStream(videoPath)
      return new NextResponse(file as any, {
        status: 200,
        headers,
      })
    }
  } catch (error) {
    console.error("Error streaming video:", error)
    return NextResponse.json({ error: "Failed to stream video" }, { status: 500 })
  }
}

// Helper function to determine content type based on file extension
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()

  switch (ext) {
    case ".mp4":
      return "video/mp4"
    case ".webm":
      return "video/webm"
    case ".mov":
      return "video/quicktime"
    case ".avi":
      return "video/x-msvideo"
    case ".mkv":
      return "video/x-matroska"
    default:
      return "application/octet-stream"
  }
}
