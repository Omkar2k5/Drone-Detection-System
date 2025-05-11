import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  context: { params: { filename: string } }
) {
  try {
    const { filename } = await Promise.resolve(context.params);
    const decodedFilename = decodeURIComponent(filename);
    const logsDir = path.join(process.cwd(), 'public', 'logs');
    const filePath = path.join(logsDir, decodedFilename);

    console.log('Serving video:', {
      filename: decodedFilename,
      filePath,
      exists: fs.existsSync(filePath)
    });

    if (!fs.existsSync(filePath)) {
      console.error('Video not found:', filePath);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      if (start >= fileSize) {
        return NextResponse.json({ error: 'Requested range not satisfiable' }, { status: 416 });
      }

      const file = fs.createReadStream(filePath, { start, end });
      const headers = new Headers({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=31536000'
      });

      return new NextResponse(file as any, { status: 206, headers });
    }

    // For non-range requests, read the entire file
    const file = fs.createReadStream(filePath);
    const headers = new Headers({
      'Content-Length': fileSize.toString(),
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000'
    });

    return new NextResponse(file as any, { status: 200, headers });
  } catch (error) {
    console.error('Error serving video:', error);
    return NextResponse.json({ 
      error: 'Failed to serve video',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 