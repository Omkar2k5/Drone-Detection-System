import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import { existsSync } from 'fs'

// Store running processes
const processes: { [key: string]: any } = {}

export async function POST(request: Request) {
  try {
    const { camId, source } = await request.json()

    // Kill any existing process for this camera
    if (processes[camId]) {
      processes[camId].kill()
      delete processes[camId]
    }

    // Base directory for the project
    const baseDir = 'C:/Projects/Drone Detection System'

    // Define paths
    const detectPyPath = path.join(baseDir, 'detect.py')
    const weightsPath = path.join(baseDir, 'best.pt')
    const dataPath = path.join(baseDir, 'data/coco128.yaml')

    // Verify files exist
    if (!existsSync(detectPyPath)) {
      throw new Error('Could not find detect.py')
    }
    if (!existsSync(weightsPath)) {
      throw new Error('Could not find best.pt weights file')
    }

    console.log('Starting detection with path:', detectPyPath)

    // Create the command to run - using pushd/popd for directory change
    const pythonCommand = `pushd "${baseDir}" && python "${detectPyPath}" --source ${source} --weights "${weightsPath}" --data "${dataPath}" --conf-thres 0.5 --view-img && popd`
    
    console.log('Running command:', pythonCommand)

    // Start the process in a new visible window
    const pythonProcess = spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/K', pythonCommand], {
      shell: true,
      detached: true,
      windowsVerbatimArguments: true
    })

    // Store the process
    processes[camId] = pythonProcess

    // Handle process errors
    pythonProcess.on('error', (err) => {
      console.error(`Failed to start process: ${err}`)
      throw err
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error starting detection:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Failed to start detection: ${errorMessage}` },
      { status: 500 }
    )
  }
} 