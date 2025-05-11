import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename);
    const logsDir = 'C:\\Projects\\Drone Detection System\\logs';
    const filePath = path.join(logsDir, filename);
    
    console.log('Requested file:', filename);
    console.log('Full file path:', filePath);

    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    // Read the first few bytes to detect the file type
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    // Check for MP4 signature
    const isMP4 = buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70;
    const contentType = isMP4 ? 'video/mp4' : 'application/octet-stream';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      };

      return new NextResponse(file as any, { status: 206, headers: head });
    }

    const file = fs.createReadStream(filePath);
    const head = {
      'Content-Length': fileSize.toString(),
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000',
    };

    return new NextResponse(file as any, { status: 200, headers: head });
  } catch (error) {
    console.error('Error serving video:', error);
    return NextResponse.json(
      { error: 'Failed to serve video' },
      { status: 500 }
    );
  }
} 