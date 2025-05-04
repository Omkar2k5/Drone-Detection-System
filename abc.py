import streamlit as st
from streamlit_webrtc import VideoTransformerBase, webrtc_streamer
import cv2
import torch
from PIL import Image

# Load YOLOv5 model
model = torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt', source='github')

# Define the classes you want to detect
classes = ['Drone']

# Define a VideoTransformer class for processing video frames
class VideoTransformer(VideoTransformerBase):
    def transform(self, frame):
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # Convert frame to RGB format
        img = Image.fromarray(frame)  # Convert frame to PIL Image

        # Run inference on the frame
        results = model(img, size=640)

        # Process the results and draw bounding boxes on the frame
        for result in results.xyxy[0]:
            x1, y1, x2, y2, conf, cls = result.tolist()
            if conf > 0.5 and classes[int(cls)] in classes:
                # Draw the bounding box
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)

                # Display the confidence score above the box
                text_conf = "{:.2f}%".format(conf * 100)
                cv2.putText(frame, text_conf, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

                # Display a warning message
                cv2.putText(frame, "Warning: Drone Detected!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        return cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)  # Convert frame back to BGR format

def main():
    st.title("Drone Detection with YOLOv5")

    # Create a WebRTC streamer
    webrtc_ctx = webrtc_streamer(key="example", video_transformer_factory=VideoTransformer)

if __name__ == "__main__":
    main()
