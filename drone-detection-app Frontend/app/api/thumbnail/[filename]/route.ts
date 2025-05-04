import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { generateThumbnail } from "@/lib/thumbnail-generator"

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

    // Generate or retrieve thumbnail
    const thumbnailBuffer = await generateThumbnail(videoPath)

    // Return the thumbnail
    return new NextResponse(thumbnailBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error generating thumbnail:", error)
    return NextResponse.json({ error: "Failed to generate thumbnail" }, { status: 500 })
  }
}
