import cv2
import numpy as np
import time
import threading
from flask import Flask, Response
from flask_cors import CORS

# Global variables
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
camera = None
latest_frame = None
frame_lock = threading.Lock()

def capture_frames():
    """Capture frames from the camera in a separate thread."""
    global latest_frame, camera
    
    # Initialize the camera
    camera = cv2.VideoCapture(0)  # Use camera ID 0 (default)
    
    if not camera.isOpened():
        print("ERROR: Could not open camera")
        return
        
    print(f"Camera opened successfully")
    
    try:
        while True:
            # Read a frame
            ret, frame = camera.read()
            
            if not ret or frame is None:
                print("WARNING: Could not read frame")
                time.sleep(0.1)
                continue
                
            # Add timestamp to the frame
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            cv2.putText(frame, timestamp, (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Update the latest frame
            with frame_lock:
                latest_frame = frame.copy()
                
            # Sleep to control frame rate
            time.sleep(0.033)  # ~30 FPS
    except Exception as e:
        print(f"Error in capture_frames: {e}")
    finally:
        if camera is not None:
            camera.release()
            print("Camera released")

def generate_frames():
    """Generate frames for MJPEG streaming."""
    global latest_frame
    
    # Create a test pattern
    test_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(test_frame, "Initializing camera...", (50, 240), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    cv2.rectangle(test_frame, (20, 20), (620, 460), (0, 0, 255), 2)
    
    # Send the test frame first
    ret, buffer = cv2.imencode('.jpg', test_frame)
    if ret:
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    
    # Main streaming loop
    while True:
        with frame_lock:
            if latest_frame is not None:
                # Make a copy to avoid threading issues
                frame_to_send = latest_frame.copy()
            else:
                # Create a waiting message
                frame_to_send = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(frame_to_send, "Waiting for camera...", (50, 240), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                cv2.rectangle(frame_to_send, (20, 20), (620, 460), (0, 255, 0), 2)
        
        # Encode the frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame_to_send, [cv2.IMWRITE_JPEG_QUALITY, 90])
        if not ret:
            continue
            
        # Yield the frame in MJPEG format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
               
        # Control the frame rate
        time.sleep(0.033)  # ~30 FPS

@app.route('/video_feed')
def video_feed():
    """Route for video streaming."""
    response = Response(generate_frames(),
                mimetype='multipart/x-mixed-replace; boundary=frame')
    # Add headers to prevent caching and allow cross-origin requests
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/test_image')
def test_image():
    """Route for testing if the camera is working."""
    global latest_frame
    
    with frame_lock:
        if latest_frame is not None:
            # Create a copy of the latest frame
            test_frame = latest_frame.copy()
        else:
            # Create a test pattern
            test_frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(test_frame, "Camera not initialized", (50, 240), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.rectangle(test_frame, (20, 20), (620, 460), (0, 0, 255), 2)
    
    # Add timestamp
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    cv2.putText(test_frame, timestamp, (10, 30), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    
    # Convert to JPEG
    ret, jpeg = cv2.imencode('.jpg', test_frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
    
    # Return as a single image
    response = Response(jpeg.tobytes(), mimetype='image/jpeg')
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/')
def index():
    """Route for the index page."""
    return """
    <html>
      <head>
        <title>Camera Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background-color: #f0f0f0; }
          h1 { color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
          .stream { width: 100%; border: 1px solid #ddd; }
          .info { margin-top: 20px; padding: 10px; background-color: #fff; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Camera Test</h1>
          <div>
            <img src="/video_feed" class="stream" alt="Camera Stream">
          </div>
          <div class="info">
            <p>If you can see the camera feed above, the streaming is working correctly.</p>
            <p>You can also test a single frame at <a href="/test_image" target="_blank">/test_image</a></p>
          </div>
        </div>
      </body>
    </html>
    """

if __name__ == '__main__':
    # Start the camera capture thread
    capture_thread = threading.Thread(target=capture_frames, daemon=True)
    capture_thread.start()
    
    # Start the Flask server
    print("Starting Flask server at http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, threaded=True, debug=False)