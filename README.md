# Drone Detection System

A real-time drone detection and monitoring system built with YOLOv5 and Next.js. The system provides automated drone detection, recording, and a modern dashboard for monitoring and reviewing detection events.

## 🚀 Features

- **Real-time Detection**: Continuous monitoring using YOLOv5 for accurate drone detection
- **Threat Assessment**: Automatic threat level classification (High/Medium/Low)
- **Event Recording**: Automated video recording of detection events
- **Snapshot Capture**: Intelligent snapshot capture system with metadata
- **Modern Dashboard**: Real-time monitoring interface with:
  - Live detection feed
  - Event history
  - Threat level indicators
  - Detection analytics
  - Video playback

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 18.0 or higher
- Git
- CUDA-capable GPU (recommended) with CUDA 11.x or higher
- Webcam or IP camera

## 🛠️ Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/drone-detection-system.git
   cd drone-detection-system
   ```

2. **Set Up Python Environment**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   
   # On Windows
   .\venv\Scripts\activate
   
   # On Linux/Mac
   source venv/bin/activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd drone-detection-app\ Frontend
   npm install
   # or
   pnpm install
   ```

4. **Create Required Directories**
   ```bash
   # From project root
   mkdir logs
   mkdir -p "drone-detection-app Frontend/public/Image logs"
   ```

5. **Environment Setup**
   
   Create a `.env` file in the project root:
   ```env
   # Detection Settings
   DRONE_CONF_THRESHOLD=0.5
   DRONE_BUFFER_SECONDS=15
   DRONE_POST_DETECTION_SECONDS=7
   DRONE_RECORDING_EXTENSION=7
   DRONE_EXTENSION_WINDOW=2
   DRONE_SNAPSHOT_PROBABILITY=0.75
   
   # Paths (optional - will use defaults if not set)
   DRONE_PROJECT_ROOT=./
   ```

## 🚀 Running the System

1. **Start the Detection System**
   ```bash
   # Activate virtual environment if not already activated
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   
   # Run detection (use webcam)
   python detect.py --source 0
   
   # Or use IP camera
   python detect.py --source "rtsp://camera-ip"
   ```

2. **Launch the Frontend**
   ```bash
   cd drone-detection-app\ Frontend
   npm run dev
   # or
   pnpm dev
   ```

3. Access the dashboard at `http://localhost:3000`

## 🎯 Configuration Options

### Detection Settings
You can configure the detection system by modifying the `.env` file or passing environment variables:

- `DRONE_CONF_THRESHOLD`: Confidence threshold (0.0-1.0)
- `DRONE_BUFFER_SECONDS`: Pre-detection buffer duration
- `DRONE_POST_DETECTION_SECONDS`: Post-detection recording duration
- `DRONE_RECORDING_EXTENSION`: Additional recording time if drone remains in frame
- `DRONE_SNAPSHOT_PROBABILITY`: Probability of taking a snapshot (0.0-1.0)

### Command Line Arguments
The detection script supports various command-line arguments:

```bash
python detect.py --help
```

Common options:
- `--source`: Input source (0 for webcam, or RTSP URL)
- `--conf-thres`: Detection confidence threshold
- `--weights`: Path to custom weights file
- `--device`: Device to run on (cuda device, i.e. 0 or cpu)

## 📁 Project Structure

```
drone-detection-system/
├── detect.py                    # Main detection script
├── requirements.txt             # Python dependencies
├── .env                        # Environment configuration
├── best.pt                     # YOLOv5 model weights
├── logs/                       # Detection video storage
└── drone-detection-app Frontend/ # Frontend application
    ├── app/                    # Next.js application
    │   ├── api/               # API routes
    │   ├── components/        # React components
    │   └── dashboard/         # Dashboard pages
    ├── public/                # Static assets
    │   └── Image logs/        # Detection snapshots
    └── package.json           # Frontend dependencies
```

## 🔧 Troubleshooting

1. **No Detection Output**
   - Ensure webcam/camera is properly connected
   - Check if CUDA is properly installed for GPU support
   - Verify confidence threshold isn't too high

2. **Frontend Not Loading**
   - Check if Node.js is properly installed
   - Verify all frontend dependencies are installed
   - Check console for error messages

3. **Missing Snapshots/Recordings**
   - Verify required directories exist and have write permissions
   - Check disk space availability
   - Review application logs for errors

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📡 API Endpoints

### Core Detection APIs
- `POST /api/startDetection` - Start detection
- `POST /api/stopDetection` - Stop detection
- `GET /api/snapshots` - Fetch detection events

### Media Handling
- `GET /api/video/[filename]` - Stream video
- `GET /api/thumbnail/[filename]` - Get video thumbnail
- `GET /api/recordings` - List all recordings

## 🔐 Security Features

- CORS protection
- File path sanitization
- Proper error handling
- Secure video streaming
- Rate limiting on API routes

## 🔄 Detection Process

1. **Continuous Monitoring**
   - Real-time video feed processing
   - Frame buffer maintenance
   - YOLOv5 inference

2. **Event Detection**
   - Drone identification
   - Confidence scoring
   - Threat level assessment

3. **Recording & Storage**
   - Automatic video recording
   - Snapshot capture
   - Metadata generation

## 📊 Metadata Structure

```json
{
  "image": {
    "filename": "string",
    "timestamp": "ISO-8601",
    "dimensions": {
      "width": "number",
      "height": "number",
      "channels": "number"
    }
  },
  "detection": {
    "droneType": "string",
    "confidence": "number",
    "threatLevel": "string",
    "coordinates": "number[][]"
  },
  "system": {
    "captureTime": "ISO-8601",
    "deviceInfo": {
      "platform": "string",
      "version": "string",
      "machine": "string"
    }
  }
}
```

## 📞 Support

For issues and feature requests, please use the GitHub issue tracker. 