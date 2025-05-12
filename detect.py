# YOLOv5 🚀 by Ultralytics, AGPL-3.0 license
"""
Run YOLOv5 detection inference on webcam for drone detection.
"""

import argparse
import os
import platform
import sys
from pathlib import Path
import json
from datetime import datetime, timedelta
import time
from collections import deque
import signal
import atexit
import numpy as np
import cv2
import torch
import random

FILE = Path(__file__).resolve()
ROOT = FILE.parents[0]  # YOLOv5 root directory
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))  # add ROOT to PATH
ROOT = Path(os.path.relpath(ROOT, Path.cwd()))  # relative

from models.common import DetectMultiBackend
from utils.dataloaders import IMG_FORMATS, VID_FORMATS, LoadImages, LoadScreenshots, LoadStreams
from utils.general import (
    LOGGER,
    Profile,
    check_file,
    check_img_size,
    check_imshow,
    check_requirements,
    colorstr,
    cv2,
    increment_path,
    non_max_suppression,
    print_args,
    scale_boxes,
    strip_optimizer,
    xyxy2xywh,
)
from utils.plots import Annotator, colors, save_one_box
from utils.torch_utils import select_device, smart_inference_mode

# Constants
CONF_THRESHOLD = 0.5  # 50% confidence threshold for detection
BUFFER_SECONDS = 15  # Number of seconds to buffer before detection
POST_DETECTION_SECONDS = 7  # Number of seconds to record after detection
RECORDING_EXTENSION = 7  # Additional seconds to record if drone remains in frame
EXTENSION_WINDOW = 2  # Number of seconds before timeout to check for extension
SNAPSHOT_PROBABILITY = 0.75  # 75% chance to take a snapshot

# Directory paths
LOGS_DIR = Path("C:/Projects/Drone Detection System/logs")  # Directory for storing detection videos
SNAPSHOT_DIR = Path("C:/Projects/Drone Detection System/drone-detection-app Frontend/public/Image logs")  # Directory for storing snapshots

# Global variables for recording state
is_recording = False
recording_start_time = None
current_video_writer = None
current_video_path = None
frames_to_record = 0
last_detection_time = None
max_drones_spotted = 0  # New variable to track maximum drones

def save_snapshot(frame, drone_type, confidence, detection_coords=None, frame_info=None):
    """Save a snapshot of the drone detection with metadata."""
    try:
        # Create directory if it doesn't exist
        SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
        
        # Generate filename with timestamp and detection info
        current_time = datetime.now()
        timestamp = current_time.strftime("%Y%m%d_%H%M%S")
        threat_level = "High" if confidence > 0.8 else "Medium" if confidence > 0.65 else "Low"
        filename = f"drone_snapshot_{timestamp}_{drone_type}_{threat_level}_{confidence:.2f}.jpg"
        filepath = SNAPSHOT_DIR / filename
        
        # Save the image
        cv2.imwrite(str(filepath), frame)
        LOGGER.info(f"Saved snapshot to {filepath}")
        
        # Create metadata
        metadata = {
            "image": {
                "filename": filename,
                "timestamp": current_time.isoformat(),
                "dimensions": {
                    "width": frame.shape[1],
                    "height": frame.shape[0],
                    "channels": frame.shape[2]
                },
                "format": "jpg"
            },
            "detection": {
                "droneType": drone_type,
                "confidence": float(confidence),
                "threatLevel": threat_level,
                "coordinates": detection_coords if detection_coords is not None else [],
                "frameInfo": frame_info if frame_info is not None else {}
            },
            "system": {
                "captureTime": current_time.isoformat(),
                "deviceInfo": {
                    "platform": platform.system(),
                    "version": platform.version(),
                    "machine": platform.machine()
                },
                "detectionSystem": "YOLOv5"
            }
        }
        
        # Save metadata with the same name as the image but with .json extension
        meta_filename = str(filepath).replace('.jpg', '.json')
        with open(meta_filename, 'w') as f:
            json.dump(metadata, f, indent=2)
            
    except Exception as e:
        LOGGER.error(f"Error saving snapshot: {e}")

def should_extend_recording(frames_to_record, fps):
    """Check if recording should be extended based on recent detections."""
    global last_detection_time
    if last_detection_time is None:
        return False
    
    current_time = datetime.now()
    seconds_since_last_detection = (current_time - last_detection_time).total_seconds()
    remaining_seconds = frames_to_record / fps
    
    return seconds_since_last_detection <= EXTENSION_WINDOW and remaining_seconds <= EXTENSION_WINDOW

@smart_inference_mode()
def run(
    weights=ROOT / "best.pt",  # model path
    source=0,  # webcam
    data=ROOT / "data/coco128.yaml",  # dataset.yaml path
    imgsz=(640, 640),  # inference size (height, width)
    conf_thres=CONF_THRESHOLD,  # confidence threshold
    iou_thres=0.45,  # NMS IoU threshold
    max_det=1000,  # maximum detections per image
    device="",  # cuda device, i.e. 0 or 0,1,2,3 or cpu
    view_img=True,  # show results
    classes=None,  # filter by class: --classes 0, or --classes 0 2 3
    agnostic_nms=False,  # class-agnostic NMS
    line_thickness=2,  # bounding box thickness (pixels)
    hide_labels=False,  # hide labels
    hide_conf=False,  # hide confidences
    half=False,  # use FP16 half-precision inference
    dnn=False,  # use OpenCV DNN for ONNX inference
    vid_stride=1,  # video frame-rate stride
):
    global is_recording, recording_start_time, current_video_writer, current_video_path, frames_to_record, last_detection_time, max_drones_spotted
    
    source = str(source)
    webcam = source.isnumeric()

    # Create logs directory
    LOGS_DIR.mkdir(exist_ok=True)
    SNAPSHOT_DIR.mkdir(exist_ok=True)

    # Load model
    device = select_device(device)
    model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)
    stride, names, pt = model.stride, model.names, model.pt
    imgsz = check_img_size(imgsz, s=stride)  # check image size

    # Dataloader
    if webcam:
        dataset = LoadStreams(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
        bs = len(dataset)
    else:
        dataset = LoadImages(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
        bs = 1

    # Initialize frame buffer
    frame_buffer = deque(maxlen=BUFFER_SECONDS * 30)  # Assuming 30 FPS

    # Create CV2 window
    cv2.namedWindow("Drone Detection", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Drone Detection", 1280, 720)

    # Run inference
    model.warmup(imgsz=(1 if pt or model.triton else bs, 3, *imgsz))  # warmup
    seen, dt = 0, (Profile(), Profile(), Profile())
    
    try:
        for path, im, im0s, vid_cap, s in dataset:
            with dt[0]:
                im = torch.from_numpy(im).to(model.device)
                im = im.half() if model.fp16 else im.float()  # uint8 to fp16/32
                im /= 255  # 0 - 255 to 0.0 - 1.0
                if len(im.shape) == 3:
                    im = im[None]  # expand for batch dim

            # Inference
            with dt[1]:
                pred = model(im, augment=False, visualize=False)

            # NMS
            with dt[2]:
                pred = non_max_suppression(pred, conf_thres, iou_thres, classes, agnostic_nms, max_det=max_det)

            # Process predictions
            for i, det in enumerate(pred):  # per image
                seen += 1
                if webcam:  # batch_size >= 1
                    p, im0, frame = path[i], im0s[i].copy(), dataset.count
                    s += f"{i}: "
                else:
                    p, im0, frame = path, im0s.copy(), getattr(dataset, "frame", 0)

                # Add frame to buffer
                frame_buffer.append((im0.copy(), datetime.now()))

                p = Path(p)  # to Path
                s += "%gx%g " % im.shape[2:]  # print string
                annotator = Annotator(im0, line_width=line_thickness, example=str(names))

                # Check if drone is detected with high confidence
                drone_detected = False
                max_conf = 0.0
                if len(det) > 0:
                    max_conf = float(det[:, 4].max())
                    drone_detected = max_conf >= CONF_THRESHOLD
                    # Update max_drones_spotted if current detection count is higher
                    current_drone_count = len([d for d in det if float(d[4]) >= CONF_THRESHOLD])
                    global max_drones_spotted
                    max_drones_spotted = max(max_drones_spotted, current_drone_count)

                if len(det):
                    # Rescale boxes from img_size to im0 size
                    det[:, :4] = scale_boxes(im.shape[2:], det[:, :4], im0.shape).round()

                    # Print results
                    for c in det[:, 5].unique():
                        n = (det[:, 5] == c).sum()  # detections per class
                        s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # add to string

                    # Write results
                    for *xyxy, conf, cls in reversed(det):
                        if conf >= CONF_THRESHOLD:
                            c = int(cls)  # integer class
                            # Calculate center coordinates
                            x1, y1, x2, y2 = map(int, xyxy)
                            center_x = (x1 + x2) // 2
                            center_y = (y1 + y2) // 2
                            
                            # Create label with class, confidence, and coordinates
                            label = f"{names[c]} {conf:.2f} ({center_x}, {center_y})"
                            
                            # Draw box and label
                            annotator.box_label(xyxy, label, color=colors(c, True))
                            
                            # Log detection
                            LOGGER.info(f"Drone detected! Type: {names[c]}, Confidence: {conf:.2f}, Position: ({center_x}, {center_y})")

                            # Handle recording
                            if drone_detected:
                                last_detection_time = datetime.now()
                                
                                if not is_recording:
                                    # Start new recording
                                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                                    threat_level = "High" if max_conf > 0.8 else "Medium" if max_conf > 0.65 else "Low"
                                    video_filename = f"drone_detection_{timestamp}_{names[c]}_{threat_level}.mp4"
                                    current_video_path = LOGS_DIR / video_filename
                                    
                                    # Initialize video writer
                                    fps = vid_cap.get(cv2.CAP_PROP_FPS) if vid_cap else 30
                                    w, h = im0.shape[1], im0.shape[0]
                                    current_video_writer = cv2.VideoWriter(
                                        str(current_video_path),
                                        cv2.VideoWriter_fourcc(*'mp4v'),
                                        fps,
                                        (w, h)
                                    )
                                    
                                    # Write buffered frames
                                    for buffered_frame, _ in frame_buffer:
                                        current_video_writer.write(buffered_frame)
                                    
                                    is_recording = True
                                    recording_start_time = datetime.now()
                                    frames_to_record = POST_DETECTION_SECONDS * int(fps)
                                    
                                    # Take random snapshot
                                    if random.random() < SNAPSHOT_PROBABILITY:
                                        detection_coords = det[:, :4].tolist()
                                        frame_info = {
                                            "fps": fps,
                                            "frameNumber": frame,
                                            "recordingFile": video_filename
                                        }
                                        save_snapshot(
                                            im0.copy(),
                                            names[c],
                                            float(conf),
                                            detection_coords,
                                            frame_info
                                        )
                                    
                                    # Save metadata
                                    meta = {
                                        "timestamp": datetime.now().isoformat(),
                                        "droneType": names[c],
                                        "confidence": float(max_conf),
                                        "threatLevel": threat_level,
                                        "detectionCount": len(det),
                                        "maxDronesSpotted": max_drones_spotted,
                                        "coordinates": det[:, :4].tolist()
                                    }
                                    meta_filename = video_filename.replace(".mp4", ".json")
                                    with open(LOGS_DIR / meta_filename, "w") as f:
                                        json.dump(meta, f, indent=2)

                # Write frame if recording
                if is_recording and current_video_writer is not None:
                    current_video_writer.write(im0)
                    frames_to_record -= 1
                    
                    # Check for recording extension
                    fps = vid_cap.get(cv2.CAP_PROP_FPS) if vid_cap else 30
                    if should_extend_recording(frames_to_record, fps):
                        frames_to_record = RECORDING_EXTENSION * int(fps)
                        print(f"\nExtending recording by {RECORDING_EXTENSION} seconds due to recent detection")
                    
                    # Display remaining time
                    remaining_seconds = int(frames_to_record / fps)
                    print(f"\rRecording remaining: {remaining_seconds}s", end="")
                    
                    # Check if recording should end
                    if frames_to_record <= 0:
                        current_video_writer.release()
                        current_video_writer = None
                        is_recording = False
                        print("\nRecording saved successfully")

                # Stream results
                im0 = annotator.result()
                
                # Show results in CV2 window
                cv2.imshow("Drone Detection", im0)
                
                # Break if 'q' is pressed
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    raise KeyboardInterrupt

            # Print time (inference-only)
            LOGGER.info(f"{s}{'' if len(det) else '(no detections), '}{dt[1].dt * 1E3:.1f}ms")

    except KeyboardInterrupt:
        LOGGER.info("Keyboard interrupt received. Cleaning up...")
    except Exception as e:
        LOGGER.error(f"Error during execution: {e}")
    finally:
        # Clean up
        if current_video_writer is not None:
            current_video_writer.release()
        cv2.destroyAllWindows()

def main(opt):
    check_requirements(ROOT / "requirements.txt", exclude=("tensorboard", "thop"))
    
    # Enable view_img by default
    opt.view_img = True
    
    print("* Starting drone detection...")
    print(f"* Confidence threshold set to {CONF_THRESHOLD*100}%")
    print("* Press 'q' to quit")
    
    try:
        # Run the detection
        run(**vars(opt))
    except Exception as e:
        print(f"ERROR: {e}")
        return

def parse_opt():
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", nargs="+", type=str, default=ROOT / "best.pt", help="model path")
    parser.add_argument("--source", type=str, default="0", help="webcam source")
    parser.add_argument("--data", type=str, default=ROOT / "data/coco128.yaml", help="dataset.yaml path")
    parser.add_argument("--imgsz", "--img", "--img-size", nargs="+", type=int, default=[640], help="inference size h,w")
    parser.add_argument("--conf-thres", type=float, default=CONF_THRESHOLD, help="confidence threshold")
    parser.add_argument("--iou-thres", type=float, default=0.45, help="NMS IoU threshold")
    parser.add_argument("--max-det", type=int, default=1000, help="maximum detections per image")
    parser.add_argument("--device", default="", help="cuda device, i.e. 0 or 0,1,2,3 or cpu")
    parser.add_argument("--view-img", action="store_true", help="show results")
    parser.add_argument("--classes", nargs="+", type=int, help="filter by class: --classes 0, or --classes 0 2 3")
    parser.add_argument("--agnostic-nms", action="store_true", help="class-agnostic NMS")
    parser.add_argument("--line-thickness", default=2, type=int, help="bounding box thickness (pixels)")
    parser.add_argument("--hide-labels", default=False, action="store_true", help="hide labels")
    parser.add_argument("--hide-conf", default=False, action="store_true", help="hide confidences")
    parser.add_argument("--half", action="store_true", help="use FP16 half-precision inference")
    parser.add_argument("--dnn", action="store_true", help="use OpenCV DNN for ONNX inference")
    parser.add_argument("--vid-stride", type=int, default=1, help="video frame-rate stride")
    opt = parser.parse_args()
    opt.imgsz *= 2 if len(opt.imgsz) == 1 else 1  # expand
    print_args(vars(opt))
    return opt

if __name__ == "__main__":
    opt = parse_opt()
    main(opt)
