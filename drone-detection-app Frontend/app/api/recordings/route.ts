import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get the absolute path to the logs directory in public folder
    const logsDir = path.join(process.cwd(), 'public', 'logs');
    
    // Check if directory exists
    if (!fs.existsSync(logsDir)) {
      console.error('Logs directory not found:', logsDir);
      return NextResponse.json({ error: 'Logs directory not found' }, { status: 404 });
    }

    // Read all files in the directory
    const files = fs.readdirSync(logsDir);
    console.log('Found files:', files);

    // Filter and process MP4 files
    const recordings = files
      .filter(file => file.toLowerCase().endsWith('.mp4'))
      .map(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        // Extract timestamp from filename
        const timestamp = file.split('_')[2]?.split('.')[0] || new Date().toISOString();
        
        // Create relative URL to the video file - use the dedicated video API instead of static path
        const url = `/api/video/${encodeURIComponent(file)}`;

        // Extract metadata from filename
        const filenameParts = file.split('_');
        const droneType = filenameParts[3]?.split('.')[0] || 'Unknown';
        const threatLevel = file.includes('High') ? 'High' : file.includes('Medium') ? 'Medium' : 'Low';

        console.log('Processing recording:', {
          file,
          size: stats.size,
          url,
          exists: fs.existsSync(filePath),
          isFile: stats.isFile(),
          permissions: stats.mode,
          lastModified: stats.mtime
        });
        return {
          id: file,
          filename: file,
          timestamp,
          size: stats.size,
          metadata: {
            timestamp,
            droneType,
            confidence: 0.85,
            location: "Perimeter",
            threatLevel,
            droneCount: 1,
            coordinates: [[0, 0]],
            fileInfo: {
              size: stats.size,
              lastModified: stats.mtime,
              permissions: stats.mode
            }
          },
          url
        };
      });

    console.log('Returning recordings:', recordings.length);
    return NextResponse.json(recordings);
  } catch (error) {
    console.error('Error in recordings API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch recordings',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 