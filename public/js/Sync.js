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

function SyncViewer(a) {
    "undefined" == typeof a && (a = {
        events: {}
    });
    var b = this, c = Sync.mergeOptions({
        onTap: function(a, b) {
            var c = document.querySelectorAll(".tap")[b];
            c.classList.toggle("tapped");
        },
        onSwipeLeft: function(a) {
            b.currentSlide += 1, b.slides[b.currentSlide].style.transform = "translate3d(0%,0,0)";
        },
        onSwipeRight: function(a) {
            b.slides[b.currentSlide].style.transform = "translate3d(100%,0,0)", b.currentSlide -= 1;
        },
        getCurrentSlide: function(a) {
            b.currentSlideAfterFirst() && b.emit("sendCurrentSlide", b.currentSlide);
        },
        sendCurrentSlide: function(a) {
            b.currentSlide = a;
            for (var c = 0; a >= c; c++) b.slides[c].style.transform = "translate3d(0%,0,0)";
        }
    }, a.events);
    SyncClient.call(this, {
        events: c
    }), this.slides = document.querySelectorAll(".slide"), this.currentSlide = 0;
    for (var d = 1; d < this.slides.length; d++) this.slides[d].style.transform = "translate3d(100%,0,0)";
    this.emit("getCurrentSlide");
}

function SyncController(a) {
    "undefined" == typeof a && (a = {});
    var b = this;
    "undefined" == typeof a.events && (a.events = {}), "undefined" == typeof a.hammer && (a.hammer = {});
    var c = Sync.mergeOptions({
        ".content": {
            swipeleft: function(a, c) {
                b.currentSlideBeforeLast() && b.emit("onSwipeLeft", a);
            },
            swiperight: function(a, c) {
                b.currentSlideAfterFirst() && b.emit("onSwipeRight", a);
            }
        },
        ".tap": {
            tap: function(a, c) {
                b.emit("onTap", a, c);
            }
        }
    }, a.hammer);
    if (console.log(c, a.hammer), SyncViewer.call(this, {
        events: a.events,
        hammer: c
    }), void 0 == Hammer) throw "SyncController depend on hammerjs lib. please install it before use it.";
    for (var d in c) !function(a) {
        var b = document.querySelectorAll(a);
        Hammer.each(b, function(b, d, e) {
            var f = new Hammer(b), g = c[a];
            for (var h in g) !function(a, b) {
                f.on(a, function(a) {
                    b(a, d);
                });
            }(h, g[h]);
        });
    }(d);
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
}, Sync.mergeOptions = function(a, b) {
    var c = {};
    for (var d in a) "undefined" == typeof b[d] ? c[d] = a[d] : "object" == typeof a[d] && "object" == typeof b[d] ? c[d] = Sync.mergeOptions(a[d], b[d]) : c[d] = b[d];
    for (var d in b) "undefined" == typeof a[d] && (c[d] = b[d]);
    return c;
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