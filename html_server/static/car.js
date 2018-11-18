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
