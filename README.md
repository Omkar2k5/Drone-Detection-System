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

## 📁 Project Structure

```
Drone Detection System/
├── detect.py                    # Main detection script
├── requirements.txt             # Python dependencies
├── best.pt                      # YOLOv5 model weights
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

## 🛠️ Technical Stack

### Backend (Python)
- YOLOv5 for object detection
- OpenCV for video processing
- Python 3.8+
- CUDA support for GPU acceleration

### Frontend (Next.js)
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- Framer Motion for animations

## 🚦 System Requirements

- Python 3.8 or higher
- Node.js 18.0 or higher
- CUDA-capable GPU (recommended)
- Webcam or IP camera
- Windows 10/11 or Linux

## 📥 Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd "Drone Detection System"
   ```

2. **Set Up Python Environment**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd "drone-detection-app Frontend"
   npm install
   # or
   pnpm install
   ```

## 🎯 Configuration

### Detection Settings (detect.py)
- `CONF_THRESHOLD`: 0.5 (50% confidence threshold)
- `BUFFER_SECONDS`: 15 (Pre-detection buffer)
- `POST_DETECTION_SECONDS`: 7 (Post-detection recording)
- `SNAPSHOT_PROBABILITY`: 0.75 (75% chance to capture snapshot)

### Directory Paths
- Videos: `C:/Projects/Drone Detection System/logs`
- Snapshots: `C:/Projects/Drone Detection System/drone-detection-app Frontend/public/Image logs`

## 🚀 Running the System

1. **Start the Detection System**
   ```bash
   python detect.py --source 0  # Use webcam
   # or
   python detect.py --source "rtsp://camera-ip"  # Use IP camera
   ```

2. **Launch the Frontend**
   ```bash
   cd "drone-detection-app Frontend"
   npm run dev
   # or
   pnpm dev
   ```

3. Access the dashboard at `http://localhost:3000`

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the AGPL-3.0 License - see the LICENSE file for details.

## 🔧 Troubleshooting

- **No Detection**: Verify camera connection and CUDA setup
- **Recording Issues**: Check directory permissions
- **API Errors**: Verify port availability and file paths
- **Performance Issues**: Adjust confidence threshold and frame buffer

## 📞 Support

For issues and feature requests, please use the GitHub issue tracker. 