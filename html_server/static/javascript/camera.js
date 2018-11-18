var img = document.getElementById("liveImg");
var fpsText = document.getElementById("fps");

var target_fps = 24;

var request_start_time = performance.now();
var start_time = performance.now();
var time = 0;
var request_time = 0;
var time_smoothing = 0.9; // larger=more smoothing
var request_time_smoothing = 0.2; // larger=more smoothing
var target_time = 1000 / target_fps;

// TODO don't hardcode URL
var ws = new WebSocket("wss://rufbot.gerty.roga.czedik.at/websocket");
ws.binaryType = 'arraybuffer';

function requestImage() {
    request_start_time = performance.now();
    ws.send('more');
}

ws.onopen = function() {
    console.log("connection was established");
    start_time = performance.now();
    requestImage();
};

ws.onmessage = function(evt) {
    var arrayBuffer = evt.data;
    var blob  = new Blob([new Uint8Array(arrayBuffer)], {type: "image/jpeg"});
    img.src = window.URL.createObjectURL(blob);

    var end_time = performance.now();
    var current_time = end_time - start_time;
    // smooth with moving average
    time = (time * time_smoothing) + (current_time * (1.0 - time_smoothing));
    start_time = end_time;
    var fps = Math.round(1000 / time);
    fpsText.textContent = fps;

    var current_request_time = performance.now() - request_start_time;
    // smooth with moving average
    request_time = (request_time * request_time_smoothing) + (current_request_time * (1.0 - request_time_smoothing));
    var timeout = Math.max(0, target_time - request_time);

    setTimeout(requestImage, timeout);
};
