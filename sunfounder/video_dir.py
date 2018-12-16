#!/usr/bin/env python

from .PCA9685 import PWM
import time
import os

DIR = os.path.dirname(os.path.realpath(__file__))

Current_x = 0
Current_y = 0

start_x = 0
start_y = 0

def setup(pwm_in):
    global Xmin, Ymin, Xmax, Ymax, home_x, home_y, pwm
    Xmin = 212
    Xmax = 700
    Ymin = 130
    Ymax = 550
    home_x = 470
    home_y = 200
    pwm = pwm_in


def move_decrease_x():
    global Current_x
    Current_x += 25
    if Current_x > Xmax:
        Current_x = Xmax
    move()

def move_increase_x():
    global Current_x
    Current_x -= 25
    if Current_x <= Xmin:
        Current_x = Xmin
    move()

def move_increase_y():
    global Current_y
    Current_y += 25
    if Current_y > Ymax:
        Current_y = Ymax
    move()

def move_decrease_y():
    global Current_y
    Current_y -= 25
    if Current_y <= Ymin:
        Current_y = Ymin
    move()

def home_x_y():
    global Current_x
    global Current_y
    Current_x = home_x
    Current_y = home_y
    move()

def move():
    print("move: " + str(Current_x) + " " + str(Current_y))
    pwm.write(14, 0, Current_x)
    pwm.write(15, 0, Current_y)

def pan_start():
    global start_x
    global start_y
    start_x = Current_x
    start_y = Current_y

def pan_move(x, y):
    global Current_x
    global Current_y
    Current_x = max(Xmin, min(start_x + x, Xmax))
    Current_y = max(Ymin, min(start_y + y, Ymax))
    move()

def test():
    while True:
        home_x_y()
        time.sleep(0.5)
        for i in range(0, 9):
            move_increase_x()
            move_increase_y()
            time.sleep(0.5)
        for i in range(0, 9):
            move_decrease_x()
            move_decrease_y()
            time.sleep(0.5)

if __name__ == '__main__':
    setup()
    home_x_y()
