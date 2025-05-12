```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[Dashboard UI] --> B[CCTV Monitor]
        A --> C[Detection Events]
        A --> D[System Status]
        
        subgraph "API Routes"
            E[/api/startDetection]
            F[/api/stopDetection]
            G[/api/snapshots]
            H[/api/video]
        end
        
        B --> E
        B --> F
        C --> G
        C --> H
    end
    
    subgraph "Backend (Python)"
        I[YOLOv5 Model] --> J[Detection Engine]
        J --> K[Frame Buffer]
        K --> L[Video Processor]
        
        subgraph "Storage"
            M[(Video Logs)]
            N[(Snapshot Logs)]
        end
        
        L --> M
        L --> N
    end
    
    subgraph "Input Sources"
        O[Webcam]
        P[IP Camera]
        Q[RTSP Stream]
    end
    
    O --> J
    P --> J
    Q --> J
    
    subgraph "Real-time Processing"
        R{Threat Assessment}
        S[Event Recording]
        T[Snapshot Capture]
    end
    
    J --> R
    R --> S
    R --> T
    S --> M
    T --> N
    
    style A fill:#3b82f6,stroke:#1d4ed8,color:white
    style B fill:#3b82f6,stroke:#1d4ed8,color:white
    style C fill:#3b82f6,stroke:#1d4ed8,color:white
    style D fill:#3b82f6,stroke:#1d4ed8,color:white
    style I fill:#ef4444,stroke:#b91c1c,color:white
    style J fill:#ef4444,stroke:#b91c1c,color:white
    style R fill:#f59e0b,stroke:#b45309,color:white
    style M fill:#10b981,stroke:#047857,color:white
    style N fill:#10b981,stroke:#047857,color:white

# System Components Description

## Frontend Layer
- **Dashboard UI**: Modern Next.js interface for monitoring and control
- **CCTV Monitor**: Real-time camera feed display with detection overlay
- **Detection Events**: Historical view of detection incidents
- **System Status**: Real-time system health monitoring

## API Layer
- **/api/startDetection**: Initiates drone detection for specified camera
- **/api/stopDetection**: Stops active detection process
- **/api/snapshots**: Retrieves detection event snapshots
- **/api/video**: Streams recorded detection videos

## Backend Layer
- **YOLOv5 Model**: Pre-trained model optimized for drone detection
- **Detection Engine**: Core processing unit handling real-time video analysis
- **Frame Buffer**: Maintains rolling buffer of recent frames
- **Video Processor**: Handles video recording and snapshot capture

## Storage Layer
- **Video Logs**: Stores detection event recordings
- **Snapshot Logs**: Stores detection event images with metadata

## Input Sources
- Support for multiple camera types:
  - Webcam
  - IP Camera
  - RTSP Stream

## Real-time Processing
- **Threat Assessment**: Analyzes detection confidence and classifies threat levels
- **Event Recording**: Records detection incidents with pre/post buffer
- **Snapshot Capture**: Captures and stores detection event images

## Technical Specifications

### Detection Parameters
- Confidence Threshold: 0.5 (50%)
- Buffer Duration: 15 seconds pre-detection
- Post-Detection Recording: 7 seconds
- Snapshot Probability: 75%

### Video Processing
- Resolution: 1280x720 (HD)
- Frame Rate: 30 FPS
- Format: MJPEG Stream

### Storage Paths
- Videos: `C:/Projects/Drone Detection System/logs`
- Snapshots: `C:/Projects/Drone Detection System/drone-detection-app Frontend/public/Image logs`

## Security Features
- CORS Protection
- File Path Sanitization
- Rate Limiting
- Secure Video Streaming
``` 