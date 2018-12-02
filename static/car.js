(function () {

const wsProtocol = (location.protocol === "https:") ? "wss://" : "ws://";

const path = location.pathname;
if(path.endsWith("index.html"))
{
    path = path.substring(0, path.length - "index.html".length);
}
if(!path.endsWith("/")) {
    path = path + "/";
}
const commandWS = new WebSocket(wsProtocol + location.host + path + "command");

commandWS.onopen = function() {
    console.log("command connection established");
};

commandWS.onmessage = function(evt) {
    console.log("received command message");
};

class Car {

  constructor() {
    this.locked = true;
  }

  toggle_lock() {
    if(this.locked) {
        this.locked = false;
    } else {
        this.locked = true;
    }
  }

  video_pan_start() {
    if(!this.locked) {
        commandWS.send("video_pan_start");
    }
  }

  video_pan_move(deltaX, deltaY) {
    if(!this.locked) {
        const command = "video_pan_move(" + deltaX + "," + deltaY +")";
        commandWS.send(command);
    }
  }

}

const car = new Car();

const element = document.getElementById("gestureHandler");

const mc = new Hammer(element);

// let the pan gesture support all directions.
// this will block the vertical scrolling on a touch-device while on the element
mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

mc.get('tap').set({ taps: 2 });

mc.on("tap", function(ev) {
    car.toggle_lock();
});

mc.on("panstart", function(ev) {
    car.video_pan_start();
});

mc.on("panmove", function(ev) {
    // TODO don't do rounding but work with floats
    const deltaX = Math.round(ev.deltaX / 2);
    const deltaY = Math.round(ev.deltaY / 2);
    car.video_pan_move(deltaX, deltaY)
});

}());
