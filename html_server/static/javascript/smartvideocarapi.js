var SmartVideoCarAPI = SmartVideoCarAPI || {};

SmartVideoCarAPI.api = (function () {
    var sendCommand = function (commandName, args) {
        $("#errormessage").text("");
        var baseurl = "/";
        switch (commandName) {
            case "motorforward":
                $.get(baseurl + "motor/forward");
                break;
            case "motorbackward":
                $.get(baseurl + "motor/backward");
                break;
            case "motorhome":
                $.get(baseurl + "motor/stop");
                $.get(baseurl + "turning/128");
                break;
            case "turnleft":
                $.get(baseurl + "turning/55");
                break;
            case "turnright":
                $.get(baseurl + "turning/200");
                break;
            case "cameraincreasey":
                $.get(baseurl + "camera/increase/y");
                break;
            case "cameradecreasey":
                $.get(baseurl + "camera/decrease/y");
                break;
            case "cameraincreasex":
                $.get(baseurl + "camera/increase/x");
                break;
            case "cameradecreasex":
                $.get(baseurl + "camera/decrease/x");
                break;
            case "camerahome":
                $.get(baseurl + "camera/home");
                break;
            default:
                $("#errormessage").text(commandName + " is not supported.");
                break;
        };
    };

    var setSpeed = function (speed) {
        var baseurl = "/";
        $.get(baseurl + "motor/set/speed/" + speed);
    };

    var init = function () {
        setSpeed(50);
    };

    return {
        sendCommand: sendCommand,
        init: init,
        setSpeed: setSpeed
    };

})(this)
