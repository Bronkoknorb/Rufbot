# Rufbot

A web/mobile app to control a Raspberry Pi based car, using simple touch/mouse gestures. Shows live video in the browser and on the phone. Pan or drag to rotate the camera. Click to steer and drive the car.

Based on the [Sunfounder Smart Video Car Kit for Raspberry Pi](https://github.com/sunfounder/Sunfounder_Smart_Video_Car_Kit_for_RaspberryPi) and [PyImageStream](https://github.com/Bronkoknorb/PyImageStream).

Installation of dependencies:

[Python 3](https://www.python.org/)

    sudo apt install python3

PIP for installing Python packages:

    sudo apt install python3-pip

[Tornado Web server](http://www.tornadoweb.org/)

    sudo pip3 install tornado

[Python Imaging Library](https://pypi.python.org/pypi/PIL) (or the [Pillow](https://python-pillow.org/) fork)

    sudo apt install python3-pil

[Pygame](https://www.pygame.org/) (used for capturing images from a Webcam)

    sudo apt install python3-pygame

Needed to control the hardware:

    sudo apt install python3-smbus
    sudo apt install python3-rpi.gpio

Start with:

    ./main.py

Or, to start in the background:

    ./start.sh

## Author

Hermann Czedik-Eysenberg  
git-dev@hermann.czedik.net
