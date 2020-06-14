(function () {
  const wsProtocol = location.protocol === "https:" ? "wss://" : "ws://";

  let path = location.pathname;
  if (path.endsWith("index.html")) {
    path = path.substring(0, path.length - "index.html".length);
  }
  if (!path.endsWith("/")) {
    path = path + "/";
  }
  const commandWS = new WebSocket(
    wsProtocol + location.host + path + "command"
  );

  commandWS.onopen = function () {
    console.log("command connection established");
  };

  commandWS.onmessage = function (evt) {
    console.log("received command message");
  };

  class Car {
    constructor() {
      this.locked = true;
    }

    toggle_lock() {
      if (this.locked) {
        this.locked = false;
      } else {
        this.locked = true;
      }
    }

    video_pan_start() {
      if (!this.locked) {
        commandWS.send("video_pan_start");
      }
    }

    video_pan_move(deltaX, deltaY) {
      if (!this.locked) {
        const command = "video_pan_move(" + deltaX + "," + deltaY + ")";
        commandWS.send(command);
      }
    }

    drive_fwd() {
      commandWS.send("drive_fwd");
    }

    drive_fwd_left() {
      commandWS.send("drive_fwd_left");
    }

    drive_fwd_right() {
      commandWS.send("drive_fwd_right");
    }

    drive_bwd() {
      commandWS.send("drive_bwd");
    }

    drive_bwd_left() {
      commandWS.send("drive_bwd_left");
    }

    drive_bwd_right() {
      commandWS.send("drive_bwd_right");
    }

    drive_stop() {
      commandWS.send("drive_stop");
    }
  }

  const car = new Car();

  const element = document.getElementById("gestureHandler");

  const mc = new Hammer(element);

  // let the pan gesture support all directions.
  // this will block the vertical scrolling on a touch-device while on the element
  mc.get("pan").set({ direction: Hammer.DIRECTION_ALL });

  mc.get("tap").set({ taps: 2 });

  mc.on("tap", function (ev) {
    car.toggle_lock();
  });

  mc.on("panstart", function (ev) {
    car.video_pan_start();
  });

  mc.on("panmove", function (ev) {
    // TODO work with floats and normalize distance
    const deltaX = Math.round(ev.deltaX / 2);
    const deltaY = Math.round(ev.deltaY / 2);
    car.video_pan_move(deltaX, deltaY);
  });

  function handleDriveStartEvent(relativeX, relativeY) {
    if (relativeY < 0.5) {
      if (relativeX < 0.3333) {
        car.drive_fwd_left();
      } else if (relativeX < 0.6666) {
        car.drive_fwd();
      } else {
        car.drive_fwd_right();
      }
    } else {
      if (relativeX < 0.3333) {
        car.drive_bwd_right();
      } else if (relativeX < 0.6666) {
        car.drive_bwd();
      } else {
        car.drive_bwd_left();
      }
    }
  }

  element.addEventListener("mousedown", function (e) {
    const relativeX = e.clientX / e.target.offsetWidth;
    const relativeY = e.clientY / e.target.offsetHeight;
    handleDriveStartEvent(relativeX, relativeY);
  });
  element.addEventListener("mouseup", function (e) {
    car.drive_stop();
  });
  element.addEventListener("touchstart", function (e) {
    if (e.touches.length === 1) {
      const relativeX = e.touches[0].clientX / e.target.offsetWidth;
      const relativeY = e.touches[0].clientY / e.target.offsetHeight;
      handleDriveStartEvent(relativeX, relativeY);
    }
  });
  element.addEventListener("touchend", function (e) {
    car.drive_stop();
  });
})();
