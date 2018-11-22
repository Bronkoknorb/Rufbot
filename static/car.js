var wsProtocol = (location.protocol === "https:") ? "wss://" : "ws://";

var path = location.pathname;
if(path.endsWith("index.html"))
{
    path = path.substring(0, path.length - "index.html".length);
}
if(!path.endsWith("/")) {
    path = path + "/";
}
var commandWS = new WebSocket(wsProtocol + location.host + path + "command");

commandWS.onopen = function() {
    console.log("command connection established");
};

commandWS.onmessage = function(evt) {
    console.log("received command message");
};

var element = document.getElementById("gestureHandler");

const mc = new Hammer(element);

// let the pan gesture support all directions.
// this will block the vertical scrolling on a touch-device while on the element
mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

mc.on("panstart", function(ev) {
    commandWS.send("video_pan_start");
});

mc.on("panmove", function(ev) {
    // TODO don't do rounding but work with floats
    const deltaX = Math.round(ev.deltaX / 2);
    const deltaY = Math.round(ev.deltaY / 2);
    const command = "video_pan_move(" + deltaX + "," + deltaY +")";
    commandWS.send(command);
});
