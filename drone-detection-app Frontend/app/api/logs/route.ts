import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logsDir = path.join(process.cwd(), 'public', 'logs');
    console.log('Logs directory:', logsDir);

    if (!fs.existsSync(logsDir)) {
      return NextResponse.json({ error: 'Logs directory not found' }, { status: 404 });
    }

    const files = fs.readdirSync(logsDir);

    const recordings = files
      .filter(file => file.endsWith('.mp4'))
      .map(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        const timestamp = file.split('_')[2]?.split('.')[0] || new Date().toISOString();
        const url = `/logs/${encodeURIComponent(file)}`;

        console.log('Processing file:', {
          file,
          filePath,
          size: stats.size,
          url,
          exists: fs.existsSync(filePath)
        });

        return {
          id: file,
          filename: file,
          timestamp,
          metadata: {
            timestamp,
            droneType: "Unknown",
            confidence: 0.85,
            location: "Perimeter",
            threatLevel: file.includes('High') ? 'High' : file.includes('Medium') ? 'Medium' : 'Low',
            droneCount: 1,
            coordinates: [[0, 0]]
          },
          url
        };
      });

    return NextResponse.json(recordings);
  } catch (error) {
    console.error('Error reading recordings:', error);
    return NextResponse.json({
      error: 'Failed to read recordings',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 