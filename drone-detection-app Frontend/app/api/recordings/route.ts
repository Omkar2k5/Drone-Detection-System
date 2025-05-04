import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the logs directory using absolute path
    const logsDir = path.resolve(process.cwd(), '..', '..', 'logs');
    console.log('Logs directory:', logsDir); // Debug log
    
    // Read all files in the logs directory
    const files = fs.readdirSync(logsDir);
    console.log('Files found:', files); // Debug log
    
    // Filter for video files and their metadata
    const recordings = files
      .filter(file => file.endsWith('.mp4'))
      .map(videoFile => {
        const metaFile = videoFile.replace('.mp4', '.meta');
        const metaPath = path.join(logsDir, metaFile);
        
        let metadata = null;
        if (fs.existsSync(metaPath)) {
          try {
            metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
          } catch (error) {
            console.error(`Error reading metadata for ${metaFile}:`, error);
          }
        }

        // Extract timestamp from filename
        const timestamp = videoFile.split('_')[2].replace('.mp4', '');
        
        return {
          id: videoFile,
          filename: videoFile,
          timestamp: timestamp,
          metadata: metadata,
          url: `/api/recordings/video/${encodeURIComponent(videoFile)}`,
        };
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Sort by timestamp, newest first

    return NextResponse.json({ recordings });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
} 