#!/usr/bin/env python3

import argparse
import os
import io
import re

import tornado.ioloop
import tornado.web
import tornado.websocket

from PIL import Image

import pygame.camera
import pygame.image

import sunfounder.video_dir as video_dir
import sunfounder.car_dir as car_dir
import sunfounder.motor as motor
from sunfounder.PCA9685 import PWM

parser = argparse.ArgumentParser(description='Start the Rufbot server.')

parser.add_argument('--port', default=8888, type=int, help='Web server port (default: 8888)')
parser.add_argument('--camera', default=0, type=int, help='Camera index, first camera is 0 (default: 0)')
parser.add_argument('--width', default=640, type=int, help='Width (default: 640)')
parser.add_argument('--height', default=480, type=int, help='Height (default: 480)')
parser.add_argument('--quality', default=70, type=int, help='JPEG Quality 1 (worst) to 100 (best) (default: 70)')
parser.add_argument('--stopdelay', default=7, type=int, help='Delay in seconds before the camera will be stopped after '
                                                             'all clients have disconnected (default: 7)')
args = parser.parse_args()

class Camera:

    def __init__(self, index, width, height, quality, stopdelay):
        print("Initializing camera...")
        pygame.camera.init()
        camera_name = pygame.camera.list_cameras()[index]
        self._cam = pygame.camera.Camera(camera_name, (width, height))
        print("Camera initialized")
        self.is_started = False
        self.stop_requested = False
        self.quality = quality
        self.stopdelay = stopdelay

    def request_start(self):
        if self.stop_requested:
            print("Camera continues to be in use")
            self.stop_requested = False
        if not self.is_started:
            self._start()

    def request_stop(self):
        if self.is_started and not self.stop_requested:
            self.stop_requested = True
            print("Stopping camera in " + str(self.stopdelay) + " seconds...")
            tornado.ioloop.IOLoop.current().call_later(self.stopdelay, self._stop)

    def _start(self):
        print("Starting camera...")
        self._cam.start()
        print("Camera started")
        self.is_started = True

    def _stop(self):
        if self.stop_requested:
            print("Stopping camera now...")
            self._cam.stop()
            print("Camera stopped")
            self.is_started = False
            self.stop_requested = False

    def get_jpeg_image_bytes(self):
        img = self._cam.get_image()
        imgstr = pygame.image.tostring(img, "RGB", False)
        pimg = Image.frombytes("RGB", img.get_size(), imgstr)
        with io.BytesIO() as bytesIO:
            pimg.save(bytesIO, "JPEG", quality=self.quality, optimize=True)
            return bytesIO.getvalue()


camera = Camera(args.camera, args.width, args.height, args.quality, args.stopdelay)


class ImageWebSocket(tornado.websocket.WebSocketHandler):
    clients = set()

    def check_origin(self, origin):
        # Allow access from every origin
        return True

    def open(self):
        ImageWebSocket.clients.add(self)
        print("WebSocket opened from: " + self.request.remote_ip)
        camera.request_start()

    def on_message(self, message):
        jpeg_bytes = camera.get_jpeg_image_bytes()
        self.write_message(jpeg_bytes, binary=True)

    def on_close(self):
        ImageWebSocket.clients.remove(self)
        print("WebSocket closed from: " + self.request.remote_ip)
        if len(ImageWebSocket.clients) == 0:
            camera.request_stop()


class Car:
    def __init__(self):
        busnum = 1  # Edit busnum to 0, if you use Raspberry Pi 1 or 0
        pwm = PWM(bus_number=busnum)  # Initialize the servo controller.

        video_dir.setup(pwm)
        video_dir.home_x_y()

        car_dir.setup(pwm)
        car_dir.home()

        motor.setup(pwm)  # Initialize the Raspberry Pi GPIO connected to the DC motor.
        motor.setSpeed(100)

    def drive_fwd(self):
        car_dir.home()
        motor.forward()

    def drive_fwd_left(self):
        car_dir.turn_left()
        motor.forward()

    def drive_fwd_right(self):
        car_dir.turn_right()
        motor.forward()

    def drive_bwd(self):
        car_dir.home()
        motor.backward()

    def drive_bwd_left(self):
        car_dir.turn_left()
        motor.backward()

    def drive_bwd_right(self):
        car_dir.turn_right()
        motor.backward()

    def drive_stop(self):
        motor.stop()


car = Car()

def handle_command(command):
    print("Handling command " + command)
    if command == "forward":
        motor.forward()
    elif command == "backward":
        motor.backward()
    elif command == "video_right":
        video_dir.move_increase_x()
    elif command == "video_left":
        video_dir.move_decrease_x()
    elif command == "video_up":
        video_dir.move_increase_y()
    elif command == "video_down":
        video_dir.move_decrease_y()
    elif command == "video_reset":
        video_dir.home_x_y()
    elif command == "video_pan_start":
        video_dir.pan_start()
    elif command.startswith("video_pan_move"):
        match = re.search("video_pan_move\((-?[\d.]+),(-?[\d.]+)\)", command)
        if match:
            video_dir.pan_move(float(match.group(1)), float(match.group(2)))
        else:
            print("ERROR: Unexpected command " + command)
    elif command == "drive_fwd":
        car.drive_fwd()
    elif command == "drive_fwd_left":
        car.drive_fwd_left()
    elif command == "drive_fwd_right":
        car.drive_fwd_right()
    elif command == "drive_bwd":
        car.drive_bwd()
    elif command == "drive_bwd_left":
        car.drive_bwd_left()
    elif command == "drive_bwd_right":
        car.drive_bwd_right()
    elif command == "drive_stop":
        car.drive_stop()
    else:
        print("ERROR: Unexpected command " + command)

class CommandWebSocket(tornado.websocket.WebSocketHandler):

    def check_origin(self, origin):
        # Allow access from every origin
        return True

    def on_message(self, message):
        handle_command(message)


class CommandHandler(tornado.web.RequestHandler):
    def get(self, command):
        handle_command(command)
        self.write("Accepted command " + command)


script_path = os.path.dirname(os.path.realpath(__file__))
static_path = script_path + '/static/'

DEBUG = False

app = tornado.web.Application([
        (r"/video", ImageWebSocket),
        (r"/cmd/([^/]+)", CommandHandler),
        (r"/command", CommandWebSocket),
        (r"/(.*)", tornado.web.StaticFileHandler, {'path': static_path, 'default_filename': 'index.html'}),
    ], debug=DEBUG)
app.listen(args.port)

print("Starting server: http://localhost:" + str(args.port) + "/")

tornado.ioloop.IOLoop.current().start()
