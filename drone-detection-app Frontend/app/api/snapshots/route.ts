import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface SnapshotMetadata {
  image: {
    filename: string
    timestamp: string
    dimensions: {
      width: number
      height: number
      channels: number
    }
  }
  detection: {
    droneType: string
    confidence: number
    threatLevel: string
    coordinates: number[][]
    frameInfo: any
  }
  system: {
    captureTime: string
    deviceInfo: {
      platform: string
      version: string
      machine: string
    }
    detectionSystem: string
  }
}

interface Snapshot {
  filename: string
  imagePath: string
  metadata: SnapshotMetadata
}

export async function GET() {
  try {
    // Path to the Image logs directory
    const logsDir = path.join(process.cwd(), 'public', 'Image logs')

    // Create directory if it doesn't exist
    try {
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
      }
    } catch (error) {
      console.error('Error creating directory:', error)
      return NextResponse.json(
        { error: 'Failed to access or create logs directory' },
        { status: 500 }
      )
    }

    // Read all files in the directory
    let files
    try {
      files = fs.readdirSync(logsDir)
    } catch (error) {
      console.error('Error reading directory:', error)
      return NextResponse.json(
        { error: 'Failed to read logs directory' },
        { status: 500 }
      )
    }

    // If no files exist yet, return empty array
    if (!files || files.length === 0) {
      return NextResponse.json([])
    }

    // Filter and pair image files with their metadata
    const snapshots = files
      .filter(file => file.endsWith('.jpg'))
      .map(imageFile => {
        const metadataFile = imageFile.replace('.jpg', '.json')
        const imagePath = `/Image logs/${imageFile}`

        try {
          // Read and parse metadata if it exists
          if (files.includes(metadataFile)) {
            const rawMetadata = JSON.parse(
              fs.readFileSync(path.join(logsDir, metadataFile), 'utf-8')
            ) as SnapshotMetadata
            
            // Structure the response to match the dashboard's expected format
            const snapshot: Snapshot = {
              filename: imageFile,
              imagePath,
              metadata: {
                image: {
                  filename: rawMetadata.image.filename,
                  timestamp: rawMetadata.image.timestamp,
                  dimensions: rawMetadata.image.dimensions
                },
                detection: {
                  droneType: rawMetadata.detection.droneType,
                  confidence: rawMetadata.detection.confidence,
                  threatLevel: rawMetadata.detection.threatLevel,
                  coordinates: rawMetadata.detection.coordinates,
                  frameInfo: rawMetadata.detection.frameInfo
                },
                system: rawMetadata.system
              }
            }
            return snapshot
          }
          return null
        } catch (error) {
          console.error(`Error reading metadata for ${imageFile}:`, error)
          return null
        }
      })
      .filter((snapshot): snapshot is Snapshot => snapshot !== null) // Type guard to remove nulls

    // Sort by timestamp (newest first)
    snapshots.sort((a, b) => {
      const dateA = new Date(a.metadata.image.timestamp)
      const dateB = new Date(b.metadata.image.timestamp)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json(snapshots)
  } catch (error) {
    console.error('Error fetching snapshots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    )
  }
} 