import cv2
import torch
import numpy as np
from PIL import Image
import threading
import time
import os

# Load YOLOv5 model
model = torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt', source='github')

# Set video source (webcam or video file)
cap = cv2.VideoCapture(0)

# Define the classes you want to detect
classes = ['Drone']

# Load beep sound
if os.name == 'nt':
    import winsound
    beep_sound = lambda: winsound.Beep(1000, 500)  # frequency in Hz, duration in ms
else:
    beep_sound = lambda: os.system('afplay beep.wav')  # Adjust the command based on your system

# Function for video processing
def process_video():
    while True:
        # Read frame from video source
        ret, frame = cap.read()

        # Convert the frame to a format that YOLOv5 can process
        img = Image.fromarray(frame[...,::-1])

        # Run inference on the frame
        results = model(img, size=640)

        # Flag to indicate if drone is detected in restricted area
        drone_detected = False

        # Process the results and draw bounding boxes on the frame
        for result in results.xyxy[0]:
            x1, y1, x2, y2, conf, cls = result.tolist()
            if conf > 0.5 and classes[int(cls)] in classes:
                # Draw the bounding box
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)

                # Display the confidence score above the box
                text_conf = "{:.2f}%".format(conf * 100)
                cv2.putText(frame, text_conf, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

                # Display the bounding box coordinates below the box
                text_coords = "({}, {})".format(int((x1 + x2) / 2), int(y2))
                cv2.putText(frame, text_coords, (int(x1), int(y2) + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

                # Set flag to indicate drone detection
                drone_detected = True

                # Display a warning message
                cv2.putText(frame, "Warning: Drone Detected Under Restricted Area!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # Display the resulting frame
        cv2.imshow('frame', frame)

        # If drone is detected, play beep sound
        if drone_detected:
            beep_sound()

        # Wait for key press to exit
        if cv2.waitKey(1) == ord('q'):
            break

# Start video processing thread
video_thread = threading.Thread(target=process_video)
video_thread.start()

# Main thread continues to execute
while True:
    # You can add any additional processing here if needed
    time.sleep(1)  # Sleep to reduce CPU usage

# Release the video source and close the window
cap.release()
cv2.destroyAllWindows()
