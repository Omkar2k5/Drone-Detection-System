import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const filePath = path.join(process.cwd(), 'public', 'logs', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Video file not found:', filePath);
      return NextResponse.json({ error: 'Video file not found' }, { status: 404 });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Get range header
    const range = request.headers.get('range');
    if (!range) {
      // If no range header, return the entire file
      const fileStream = fs.createReadStream(filePath);
      return new NextResponse(fileStream as any, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': fileSize.toString(),
          'Accept-Ranges': 'bytes'
        }
      });
    }

    // Parse range header
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    // Create read stream for the requested range
    const fileStream = fs.createReadStream(filePath, { start, end });

    // Return partial content
    return new NextResponse(fileStream as any, {
      status: 206,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': chunkSize.toString(),
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes'
      }
    });
  } catch (error) {
    console.error('Error serving video:', error);
    return NextResponse.json({ 
      error: 'Failed to serve video',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
