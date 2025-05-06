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
import datetime
from collections import deque
import signal
import atexit
from contextlib import contextmanager

import torch

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

# Constants for video logging
LOGS_DIR = Path("logs")  # Directory for storing detection videos and metadata
BUFFER_SECONDS = 30  # Number of seconds to buffer before detection
POST_DETECTION_SECONDS = 7  # Number of seconds to record after detection
RECORDING_EXTENSION = 7  # Additional seconds to record if drone remains in frame
MIN_CONFIDENCE_THRESHOLD = 0.5  # Minimum confidence threshold for drone detection
EXTENSION_WINDOW = 2  # Number of seconds before timeout to check for extension

# Add new global variables for tracking recording state
is_recording = False
recording_start_time = None
current_video_writer = None
current_video_path = None
frames_to_record = 0
last_countdown_display = 0  # Track last countdown display time
last_detection_time = None  # Track last drone detection time

def display_countdown(remaining_seconds):
    """Display countdown in terminal."""
    global last_countdown_display
    current_time = datetime.datetime.now()
    if isinstance(last_countdown_display, datetime.datetime):
        if (current_time - last_countdown_display).total_seconds() >= 1:  # Update every second
            print(f"\rRecording remaining time: {remaining_seconds} seconds", end="", flush=True)
            last_countdown_display = current_time
    else:
        last_countdown_display = current_time
        print(f"\rRecording remaining time: {remaining_seconds} seconds", end="", flush=True)

@contextmanager
def safe_video_writer():
    """Context manager to safely handle video writing and cleanup."""
    global current_video_writer, is_recording
    try:
        yield
    finally:
        if current_video_writer is not None:
            try:
                current_video_writer.release()
                LOGGER.info(f"Successfully saved video to {current_video_path}")
            except Exception as e:
                LOGGER.error(f"Error while saving video: {e}")
            finally:
                current_video_writer = None
                is_recording = False
                print("\n")  # New line after countdown

def cleanup_video_writer():
    """Cleanup function to be called on exit."""
    global current_video_writer, is_recording
    if current_video_writer is not None:
        try:
            current_video_writer.release()
            LOGGER.info(f"Successfully saved video to {current_video_path}")
        except Exception as e:
            LOGGER.error(f"Error while saving video: {e}")
        finally:
            current_video_writer = None
            is_recording = False

def signal_handler(signum, frame):
    """Handle termination signals."""
    LOGGER.info(f"Received signal {signum}. Cleaning up...")
    cleanup_video_writer()
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)
if platform.system() != 'Windows':
    signal.signal(signal.SIGQUIT, signal_handler)

# Register cleanup function
atexit.register(cleanup_video_writer)

def should_extend_recording(frames_to_record, fps):
    """Check if recording should be extended based on recent detections."""
    global last_detection_time
    if last_detection_time is None:
        return False
    
    current_time = datetime.datetime.now()
    seconds_since_last_detection = (current_time - last_detection_time).total_seconds()
    remaining_seconds = frames_to_record / fps
    
    # Extend if drone was detected in the last EXTENSION_WINDOW seconds
    return seconds_since_last_detection <= EXTENSION_WINDOW and remaining_seconds <= EXTENSION_WINDOW

@smart_inference_mode()
def run(
    weights=ROOT / "best.pt",  # model path
    source=0,  # webcam
    data=ROOT / "data/coco128.yaml",  # dataset.yaml path
    imgsz=(640, 640),  # inference size (height, width)
    conf_thres=0.25,  # confidence threshold
    iou_thres=0.45,  # NMS IoU threshold
    max_det=1000,  # maximum detections per image
    device="",  # cuda device, i.e. 0 or 0,1,2,3 or cpu
    view_img=True,  # show results
    save_txt=False,  # save results to *.txt
    save_conf=False,  # save confidences in --save-txt labels
    save_crop=False,  # save cropped prediction boxes
    nosave=False,  # do not save images/videos
    classes=None,  # filter by class: --classes 0, or --classes 0 2 3
    agnostic_nms=False,  # class-agnostic NMS
    augment=False,  # augmented inference
    visualize=False,  # visualize features
    update=False,  # update all models
    project=ROOT / "runs/detect",  # save results to project/name
    name="exp",  # save results to project/name
    exist_ok=False,  # existing project/name ok, do not increment
    line_thickness=3,  # bounding box thickness (pixels)
    hide_labels=False,  # hide labels
    hide_conf=False,  # hide confidences
    half=False,  # use FP16 half-precision inference
    dnn=False,  # use OpenCV DNN for ONNX inference
    vid_stride=1,  # video frame-rate stride
):
    global is_recording, recording_start_time, current_video_writer, current_video_path, frames_to_record
    
    with safe_video_writer():
        source = str(source)
        save_img = not nosave and not source.endswith(".txt")  # save inference images
        webcam = source.isnumeric() or source.endswith(".streams")

        # Create logs directory
        LOGS_DIR.mkdir(exist_ok=True)

        # Directories
        save_dir = increment_path(Path(project) / name, exist_ok=exist_ok)  # increment run
        (save_dir / "labels" if save_txt else save_dir).mkdir(parents=True, exist_ok=True)  # make dir

        # Load model
        device = select_device(device)
        model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)
        stride, names, pt = model.stride, model.names, model.pt
        imgsz = check_img_size(imgsz, s=stride)  # check image size

        # Dataloader
        bs = 1  # batch_size
        if webcam:
            view_img = check_imshow(warn=True)
            dataset = LoadStreams(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
            bs = len(dataset)
        vid_path, vid_writer = [None] * bs, [None] * bs

        # Initialize frame buffer for each stream
        frame_buffers = [deque(maxlen=BUFFER_SECONDS * 30) for _ in range(bs)]  # Assuming 30 FPS

        # Run inference
        model.warmup(imgsz=(1 if pt or model.triton else bs, 3, *imgsz))  # warmup
        seen, windows, dt = 0, [], (Profile(), Profile(), Profile())
        
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
                    visualize = increment_path(save_dir / Path(path).stem, mkdir=True) if visualize else False
                    pred = model(im, augment=augment, visualize=visualize)

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
                    frame_buffers[i].append((im0.copy(), datetime.datetime.now()))

                    p = Path(p)  # to Path
                    save_path = str(save_dir / p.name)  # im.jpg
                    txt_path = str(save_dir / "labels" / p.stem) + ("" if dataset.mode == "image" else f"_{frame}")  # im.txt
                    s += "%gx%g " % im.shape[2:]  # print string
                    gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]  # normalization gain whwh
                    imc = im0.copy() if save_crop else im0  # for save_crop
                    annotator = Annotator(im0, line_width=line_thickness, example=str(names))
                    
                    # Check if drone is detected with high confidence
                    drone_detected = False
                    max_conf = 0.0
                    if len(det) > 0:
                        max_conf = float(det[:, 4].max())
                        drone_detected = max_conf > MIN_CONFIDENCE_THRESHOLD
                    
                    if drone_detected:
                        # Update last detection time
                        last_detection_time = datetime.datetime.now()
                        
                        # Get detection info
                        timestamp = datetime.datetime.now().isoformat()
                        drone_count = len(det)
                        
                        # Determine threat level based on confidence
                        threat_level = "High" if max_conf > 0.8 else "Medium" if max_conf > 0.5 else "Low"
                        
                        # Get drone type (assuming single class for now)
                        drone_type = names[int(det[0, 5])] if len(det) > 0 else "Unknown"
                        
                        # Get location (you can modify this based on your needs)
                        location = "Unknown"  # You can add logic to determine location

                        # Start or extend recording if not already recording
                        if not is_recording:
                            # Create video filename
                            safe_time = timestamp.replace(":", "-").replace(".", "-")
                            video_filename = f"drone_detection_{safe_time}_{drone_type}_{threat_level}.mp4"
                            current_video_path = LOGS_DIR / video_filename

                            # Initialize video writer
                            fps = vid_cap.get(cv2.CAP_PROP_FPS) if vid_cap else 30
                            w, h = im0.shape[1], im0.shape[0]
                            current_video_writer = cv2.VideoWriter(str(current_video_path), cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
                            
                            # Write buffered frames
                            for frame, _ in frame_buffers[i]:
                                current_video_writer.write(frame)
                            
                            is_recording = True
                            recording_start_time = datetime.datetime.now()
                            frames_to_record = POST_DETECTION_SECONDS * int(fps)

                            # Write metadata
                            meta = {
                                "timestamp": timestamp,
                                "droneType": drone_type,
                                "confidence": float(max_conf),
                                "location": location,
                                "threatLevel": threat_level,
                                "droneCount": int(drone_count),
                                "coordinates": det[:, :4].tolist()  # Store all detection coordinates
                            }
                            
                            meta_filename = video_filename.replace(".mp4", ".meta")
                            with open(LOGS_DIR / meta_filename, "w") as f:
                                json.dump(meta, f)

                    # Write frame if recording
                    if is_recording and current_video_writer is not None:
                        current_video_writer.write(im0)
                        frames_to_record -= 1
                        
                        # Calculate and display remaining time
                        fps = vid_cap.get(cv2.CAP_PROP_FPS) if vid_cap else 30
                        remaining_seconds = int(frames_to_record / fps)
                        display_countdown(remaining_seconds)
                        
                        # Check if recording should be extended
                        if should_extend_recording(frames_to_record, fps):
                            frames_to_record = RECORDING_EXTENSION * int(fps)
                            print(f"\nExtending recording by {RECORDING_EXTENSION} seconds due to recent detection")
                        
                        # Check if recording should end
                        if frames_to_record <= 0:
                            current_video_writer.release()
                            is_recording = False
                            current_video_writer = None
                            current_video_path = None
                            last_detection_time = None
                            print("\nRecording completed and saved successfully.")

                    # Print results
                    if len(det):
                        for c in det[:, 5].unique():
                            n = (det[:, 5] == c).sum()  # detections per class
                            s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # add to string

                        # Write results
                        for *xyxy, conf, cls in reversed(det):
                            if save_txt:  # Write to file
                                xywh = (xyxy2xywh(torch.tensor(xyxy).view(1, 4)) / gn).view(-1).tolist()  # normalized xywh
                                line = (cls, *xywh, conf) if save_conf else (cls, *xywh)  # label format
                                with open(f"{txt_path}.txt", "a") as f:
                                    f.write(("%g " * len(line)).rstrip() % line + "\n")

                            if save_img or save_crop or view_img:  # Add bbox to image
                                c = int(cls)  # integer class
                                # Calculate center coordinates of the bounding box
                                x1, y1, x2, y2 = map(int, xyxy)
                                center_x = (x1 + x2) // 2
                                center_y = (y1 + y2) // 2
                                
                                # Create label with class, confidence, and coordinates
                                label = None if hide_labels else (
                                    f"{names[c]} {conf:.2f} ({center_x}, {center_y})" 
                                    if not hide_conf 
                                    else f"{names[c]} ({center_x}, {center_y})"
                                )
                                annotator.box_label(xyxy, label, color=colors(c, True))
                            if save_crop:
                                save_one_box(xyxy, imc, file=save_dir / "crops" / names[c] / f"{p.stem}.jpg", BGR=True)

                    # Stream results
                    im0 = annotator.result()
                    if view_img:
                        if platform.system() == "Linux" and p not in windows:
                            windows.append(p)
                            cv2.namedWindow(str(p), cv2.WINDOW_NORMAL | cv2.WINDOW_KEEPRATIO)  # allow window resize (Linux)
                            cv2.resizeWindow(str(p), im0.shape[1], im0.shape[0])
                        cv2.imshow(str(p), im0)
                        cv2.waitKey(1)  # 1 millisecond

                    # Save results (image with detections)
                    if save_img:
                        if dataset.mode == "image":
                            cv2.imwrite(save_path, im0)
                        else:  # 'video' or 'stream'
                            if vid_path[i] != save_path:  # new video
                                vid_path[i] = save_path
                                if isinstance(vid_writer[i], cv2.VideoWriter):
                                    vid_writer[i].release()  # release previous video writer
                                if vid_cap:  # video
                                    fps = vid_cap.get(cv2.CAP_PROP_FPS)
                                    w = int(vid_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                                    h = int(vid_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                                else:  # stream
                                    fps, w, h = 30, im0.shape[1], im0.shape[0]
                                save_path = str(Path(save_path).with_suffix(".mp4"))  # force *.mp4 suffix on results videos
                                vid_writer[i] = cv2.VideoWriter(save_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
                            vid_writer[i].write(im0)

                # Print time (inference-only)
                LOGGER.info(f"{s}{'' if len(det) else '(no detections), '}{dt[1].dt * 1E3:.1f}ms")

        except KeyboardInterrupt:
            LOGGER.info("Keyboard interrupt received. Cleaning up...")
        except Exception as e:
            LOGGER.error(f"Error during execution: {e}")
        finally:
            # Clean up video writers
            for writer in vid_writer:
                if writer is not None:
                    writer.release()

        # Print results
        t = tuple(x.t / seen * 1E3 for x in dt)  # speeds per image
        LOGGER.info(f"Speed: %.1fms pre-process, %.1fms inference, %.1fms NMS per image at shape {(1, 3, *imgsz)}" % t)
        if save_txt or save_img:
            s = f"\n{len(list(save_dir.glob('labels/*.txt')))} labels saved to {save_dir / 'labels'}" if save_txt else ""
            LOGGER.info(f"Results saved to {colorstr('bold', save_dir)}{s}")
        if update:
            strip_optimizer(weights[0])  # update model (to fix SourceChangeWarning)

def parse_opt():
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", nargs="+", type=str, default=ROOT / "best.pt", help="model path")
    parser.add_argument("--source", type=str, default="0", help="webcam source")
    parser.add_argument("--data", type=str, default=ROOT / "data/coco128.yaml", help="dataset.yaml path")
    parser.add_argument("--imgsz", "--img", "--img-size", nargs="+", type=int, default=[640], help="inference size h,w")
    parser.add_argument("--conf-thres", type=float, default=0.25, help="confidence threshold")
    parser.add_argument("--iou-thres", type=float, default=0.45, help="NMS IoU threshold")
    parser.add_argument("--max-det", type=int, default=1000, help="maximum detections per image")
    parser.add_argument("--device", default="", help="cuda device, i.e. 0 or 0,1,2,3 or cpu")
    parser.add_argument("--view-img", action="store_true", help="show results")
    parser.add_argument("--save-txt", action="store_true", help="save results to *.txt")
    parser.add_argument("--save-conf", action="store_true", help="save confidences in --save-txt labels")
    parser.add_argument("--save-crop", action="store_true", help="save cropped prediction boxes")
    parser.add_argument("--nosave", action="store_true", help="do not save images/videos")
    parser.add_argument("--classes", nargs="+", type=int, help="filter by class: --classes 0, or --classes 0 2 3")
    parser.add_argument("--agnostic-nms", action="store_true", help="class-agnostic NMS")
    parser.add_argument("--augment", action="store_true", help="augmented inference")
    parser.add_argument("--visualize", action="store_true", help="visualize features")
    parser.add_argument("--update", action="store_true", help="update all models")
    parser.add_argument("--project", default=ROOT / "runs/detect", help="save results to project/name")
    parser.add_argument("--name", default="exp", help="save results to project/name")
    parser.add_argument("--exist-ok", action="store_true", help="existing project/name ok, do not increment")
    parser.add_argument("--line-thickness", default=3, type=int, help="bounding box thickness (pixels)")
    parser.add_argument("--hide-labels", default=False, action="store_true", help="hide labels")
    parser.add_argument("--hide-conf", default=False, action="store_true", help="hide confidences")
    parser.add_argument("--half", action="store_true", help="use FP16 half-precision inference")
    parser.add_argument("--dnn", action="store_true", help="use OpenCV DNN for ONNX inference")
    parser.add_argument("--vid-stride", type=int, default=1, help="video frame-rate stride")
    opt = parser.parse_args()
    opt.imgsz *= 2 if len(opt.imgsz) == 1 else 1  # expand
    print_args(vars(opt))
    return opt

def main(opt):
    check_requirements(ROOT / "requirements.txt", exclude=("tensorboard", "thop"))
    run(**vars(opt))

if __name__ == "__main__":
    opt = parse_opt()
    main(opt)
