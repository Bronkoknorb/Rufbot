(function () {
  const wsProtocol = location.protocol === "https:" ? "wss://" : "ws://";

  let path = location.pathname;
  if (path.endsWith("index.html")) {
    path = path.substring(0, path.length - "index.html".length);
  }
  if (!path.endsWith("/")) {
    path = path + "/";
  }

  let commandWS;

  function connect() {
    commandWS = new WebSocket(wsProtocol + location.host + path + "command");

    commandWS.onopen = function () {
      console.log("command connection established");
    };
  }

  connect();

  class Car {
    constructor() {
      this.mode = "locked";
    }

    setMode(mode) {
      this.mode = mode;
    }

    isCameraMode() {
      return this.mode === "camera";
    }

    isDriveMode() {
      return this.mode === "drive";
    }

    video_reset() {
      if (!this.isCameraMode()) return;
      commandWS.send("video_reset");
    }

    video_pan_start() {
      if (!this.isCameraMode()) return;
      commandWS.send("video_pan_start");
    }

    video_pan_move(deltaX, deltaY) {
      if (!this.isCameraMode()) return;

      const command = "video_pan_move(" + deltaX + "," + deltaY + ")";
      commandWS.send(command);
    }

    drive_fwd() {
      if (!this.isDriveMode()) return;

      commandWS.send("drive_fwd");
    }

    drive_fwd_left() {
      if (!this.isDriveMode()) return;

      commandWS.send("drive_fwd_left");
    }

    drive_fwd_right() {
      if (!this.isDriveMode()) return;

      commandWS.send("drive_fwd_right");
    }

    drive_bwd() {
      if (!this.isDriveMode()) return;

      commandWS.send("drive_bwd");
    }

    drive_bwd_left() {
      if (!this.isDriveMode()) return;

      commandWS.send("drive_bwd_left");
    }

    drive_bwd_right() {
      if (!this.isDriveMode()) return;

      commandWS.send("drive_bwd_right");
    }

    drive_stop() {
      if (!this.isDriveMode()) return;

      commandWS.send("drive_stop");
    }
  }

  const car = new Car();

  const buttonLock = document.getElementById("button-lock");
  const buttonDrive = document.getElementById("button-drive");
  const buttonCamera = document.getElementById("button-camera");
  const driveOverlay = document.getElementById("driveOverlay");
  buttonLock.addEventListener("click", (e) => {
    car.setMode("locked");
    handleModeChange();
  });
  buttonDrive.addEventListener("click", (e) => {
    car.setMode("drive");
    handleModeChange();
  });
  buttonCamera.addEventListener("click", (e) => {
    car.setMode("camera");
    handleModeChange();
  });
  function handleModeChange() {
    buttonLock.classList.remove("enabled");
    buttonDrive.classList.remove("enabled");
    buttonCamera.classList.remove("enabled");
    driveOverlay.classList.add("hidden");
    if (car.isCameraMode()) {
      buttonCamera.classList.add("enabled");
    } else if (car.isDriveMode()) {
      buttonDrive.classList.add("enabled");
      driveOverlay.classList.remove("hidden");
    } else {
      buttonLock.classList.add("enabled");
    }
  }
  handleModeChange();

  const element = document.getElementById("gestureHandler");

  const mc = new Hammer(element);

  // let the pan gesture support all directions.
  // this will block the vertical scrolling on a touch-device while on the element
  mc.get("pan").set({ direction: Hammer.DIRECTION_ALL });

  mc.get("tap").set({ taps: 2 });

  mc.on("tap", function (ev) {
    car.video_reset();
  });

  mc.on("panstart", function (ev) {
    car.video_pan_start();
  });

  mc.on("panmove", function (ev) {
    const deltaX = ev.deltaX / ev.target.clientWidth;
    const deltaY = ev.deltaY / ev.target.clientHeight;
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

  element.addEventListener("click", function (e) {
    if (commandWS.readyState === WebSocket.CLOSED) {
      console.log("Reconnecting to command Websocket");
      connect();
    }
  });

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
