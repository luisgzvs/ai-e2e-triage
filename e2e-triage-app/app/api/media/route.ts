import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filePath = searchParams.get('path');

  if (!filePath) {
    return new NextResponse('Missing path parameter', { status: 400 });
  }

  // Basic security check: ensure it's within the test-results directory
  const testResultsDir = path.resolve(process.cwd(), '../e2e-tests/test-results');
  const absoluteFilePath = path.resolve(filePath);

  if (!absoluteFilePath.startsWith(testResultsDir)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!fs.existsSync(absoluteFilePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  try {
    const stat = fs.statSync(absoluteFilePath);
    const file = fs.readFileSync(absoluteFilePath);

    let contentType = 'application/octet-stream';
    if (absoluteFilePath.endsWith('.webm')) contentType = 'video/webm';
    else if (absoluteFilePath.endsWith('.png')) contentType = 'image/png';
    else if (absoluteFilePath.endsWith('.jpg') || absoluteFilePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (absoluteFilePath.endsWith('.md')) contentType = 'text/markdown';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving media file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
