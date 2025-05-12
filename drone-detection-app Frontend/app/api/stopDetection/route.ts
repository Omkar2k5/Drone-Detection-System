import { NextResponse } from 'next/server'

// Reference to the processes object from startDetection
declare const processes: { [key: string]: any }

export async function POST(request: Request) {
  try {
    const { camId } = await request.json()

    if (processes[camId]) {
      processes[camId].kill()
      delete processes[camId]
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'No running process found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error stopping detection:', error)
    return NextResponse.json(
      { error: 'Failed to stop detection' },
      { status: 500 }
    )
  }
} 