function Sync(a) {
    if (void 0 != a) this.socket = a; else {
        if (void 0 == io) throw "Pass socket to the constructor, or make sure socket.io.js is loaded";
        this.socket = io("http://" + HOSTNAME + ":" + PORT);
    }
}

function SyncServer(a, b) {
    this.io = b, Sync.call(this, a);
    var c = this;
    this.socket.on("SendEvents", function(a) {
        for (var b in a) c.eventClosure(a[b]);
    });
}

function SyncClient(a) {
    Sync.call(this, void 0);
    var b = [], c = a.events;
    if (this.event_names = b, this.events = c, void 0 == c) throw "Client options must contain events object";
    for (var d in c) b.push(d), this.socket.on(d, c[d]);
    this.emit("SendEvents", b);
}

function SyncViewer() {
    var a = this;
    SyncClient.call(this, {
        events: {
            onTap: function(a, b) {
                var c = document.querySelectorAll(".tap")[b];
                "0px 0px 42px grey" == c.style.boxShadow ? c.style.boxShadow = "0px 0px 42px transparent" : c.style.boxShadow = "0px 0px 42px grey";
            },
            onSwipeLeft: function(b) {
                a.currentSlide += 1, a.slides[a.currentSlide].style.transform = "translate3d(0%,0,0)";
            },
            onSwipeRight: function(b) {
                a.slides[a.currentSlide].style.transform = "translate3d(100%,0,0)", a.currentSlide -= 1;
            },
            onPan: function(b) {
                var c = a.testCanvas.offsetLeft;
                a.ctx.fillRect(args[0].center.x - c, args[0].center.y - 200, 2, 2);
            }
        }
    }), this.testCanvas = document.querySelector("#test-canvas"), this.ctx = this.testCanvas.getContext("2d"), 
    this.content = document.querySelector(".content"), this.slides = document.querySelectorAll(".slide"), 
    this.currentSlide = 0;
    for (var b = 1; b < this.slides.length; b++) this.slides[b].style.transform = "translate3d(100%,0,0)";
}

function SyncController() {
    if (SyncViewer.call(this), void 0 == Hammer) throw "SyncController depend on hammerjs lib. please install it before use it.";
    var a = this;
    this.hammerContent = new Hammer(this.content), this.hammerContent.on("swipeleft", function(b) {
        a.currentSlideBeforeLast() && a.emit("onSwipeLeft", b);
    }), this.hammerContent.on("swiperight", function(b) {
        a.currentSlideAfterFirst() && a.emit("onSwipeRight", b);
    });
    var b = new Hammer(this.testCanvas);
    b.get("pan").set({
        direction: Hammer.DIRECTION_ALL
    }), b.on("pan", function(b) {
        a.emit("onPan", b);
    });
    var c = document.querySelectorAll(".tap");
    Hammer.each(c, function(b, c, d) {
        var e = new Hammer(b);
        e.on("tap", function(b) {
            a.emit("onTap", b, c);
        });
    });
}

var PORT = 3e3, HOSTNAME = "localhost";

Sync.prototype.emit = function() {
    this.socket.emit.apply(this.socket, arguments);
}, Sync.prototype.broadcast = function() {
    try {
        this.socket.broadcast.emit.apply(this.socket, arguments);
    } catch (a) {
        console.log(a);
    }
}, SyncServer.prototype = Object.create(Sync.prototype), SyncServer.prototype.constructor = SyncServer, 
SyncServer.prototype.eventClosure = function(a) {
    var b = this;
    this.socket.on(a, function() {
        var c = Array.prototype.slice.call(arguments);
        c.splice(0, 0, a), b.io.emit.apply(b.io, c);
    });
}, SyncClient.prototype = Object.create(Sync.prototype), SyncClient.prototype.constructor = SyncClient, 
SyncViewer.prototype = Object.create(SyncClient.prototype), SyncViewer.prototype.constructor = SyncViewer, 
SyncViewer.prototype.currentSlideBeforeLast = function() {
    return this.currentSlide < this.slides.length - 1;
}, SyncViewer.prototype.currentSlideAfterFirst = function() {
    return this.currentSlide > 0;
}, SyncController.prototype = Object.create(SyncViewer.prototype), SyncController.prototype.constructor = SyncController;

try {
    module.exports = {
        PORT: PORT,
        HOSTNAME: HOSTNAME,
        SyncServer: SyncServer,
        SyncClient: SyncClient
    };
} catch (error) {}