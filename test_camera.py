import cv2
import time
import numpy as np

def test_camera(camera_id=0):
    """Test if the camera is working correctly."""
    print(f"Testing camera with ID: {camera_id}")
    
    # Try to open the camera
    cap = cv2.VideoCapture(camera_id)
    
    if not cap.isOpened():
        print(f"ERROR: Could not open camera {camera_id}")
        return False
    
    print(f"Camera {camera_id} opened successfully")
    
    # Get camera properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    print(f"Camera properties: {width}x{height} @ {fps} FPS")
    
    # Try to read a frame
    ret, frame = cap.read()
    
    if not ret or frame is None:
        print("ERROR: Could not read frame from camera")
        cap.release()
        return False
    
    print(f"Successfully read frame with shape: {frame.shape}")
    
    # Create a window to display the frame
    window_name = "Camera Test"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    
    # Display the frame
    cv2.imshow(window_name, frame)
    print("Displaying frame for 3 seconds...")
    cv2.waitKey(3000)  # Wait for 3 seconds
    
    # Try to read 10 more frames to test continuous capture
    print("Testing continuous capture (10 frames)...")
    for i in range(10):
        ret, frame = cap.read()
        if not ret or frame is None:
            print(f"ERROR: Failed to read frame {i+1}")
            break
            
        # Add frame number and timestamp
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, f"Frame {i+1} - {timestamp}", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    
        # Display the frame
        cv2.imshow(window_name, frame)
        cv2.waitKey(100)  # Wait for 100ms
        
        print(f"Frame {i+1} captured successfully")
    
    # Release the camera and close the window
    cap.release()
    cv2.destroyAllWindows()
    
    print("Camera test completed successfully")
    return True

if __name__ == "__main__":
    # Test the default camera (usually 0)
    test_camera(0)
    
    # Uncomment to test other camera IDs if needed
    # test_camera(1)