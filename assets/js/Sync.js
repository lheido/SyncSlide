var PORT = 3000;
var HOSTNAME = 'localhost';

/*
 * Mother Class !
 */
function Sync(socket) {
    if (socket != undefined) {
        this.socket = socket;    
    } else {
        if (io == undefined) {
            throw 'Pass socket to the constructor, or make sure socket.io.js is loaded';
        }
        this.socket = io('http://'+HOSTNAME+':'+PORT);
    }
}

/*
 * Convenient function to emit message.
 */
Sync.prototype.emit = function() {
    this.socket.emit.apply(this.socket, arguments);
}

/*
 * Convenient function to broadcast message. (using only on server side)
 */
Sync.prototype.broadcast = function() {
    try {
        this.socket.broadcast.emit.apply(this.socket, arguments);
    } catch (error) {
        console.log(error);
    }
}

/*
 * Provide simple and generic server listener.
 */
function SyncServer(socket, io) {
    this.io = io;
    Sync.call(this, socket);
    var self = this;
    this.socket.on('SendEvents', function(events){
        //listen interface events
        for (var i in events) {
            self.eventClosure(events[i]);
        }
    });
}
SyncServer.prototype = Object.create(Sync.prototype);
SyncServer.prototype.constructor = SyncServer;

/**
 * define closure because js is so cool...
 */
SyncServer.prototype.eventClosure = function(event) {
    var self = this;
    this.socket.on(event, function(){
//        self.broadcast(event, args);
        var args = Array.prototype.slice.call(arguments);
        args.splice(0, 0, event);
        self.io.emit.apply(self.io, args);
    });
}

/*
 * Provide Basic client class.
 * options arg must contain an events object:
 *   {
 *       events: {
 *          eventMethod: function(){ do something... }
 *       }
 *   }
 */
function SyncClient(options) {
    Sync.call(this, undefined);
    var eventNames = [], events = options.events;
    this.event_names = eventNames;
    this.events = events;
    if (events == undefined) {
        throw 'Client options must contain events object';
    }
    for (var event in events) {
        eventNames.push(event);
        this.socket.on(event, events[event]);
    }
    this.emit('SendEvents', eventNames);
}
SyncClient.prototype = Object.create(Sync.prototype);
SyncClient.prototype.constructor = SyncClient;

/**
 * Client viewer
 * Initialize the slides position.
 */
function SyncViewer(option) {
    if (typeof(option)==='undefined') option = {};
    var self = this;
    var opt = Hammer.extend({
        events: {
            onTap: function(evt, index) {
                var elt = document.querySelectorAll('.tap')[index];
                elt.classList.toggle('tapped');
            },
            onSwipeLeft: function(evt) {
                self.currentSlide += 1;
                self.slides[self.currentSlide].style.transform = 'translate3d(0%,0,0)';
            },
            onSwipeRight: function(evt) {
                self.slides[self.currentSlide].style.transform = 'translate3d(100%,0,0)';
                self.currentSlide -= 1;
            },
            getCurrentSlide: function(evt) {
                if (self.currentSlideAfterFirst()) {
                    self.emit('sendCurrentSlide', self.currentSlide);
                }
            },
            sendCurrentSlide: function(index) {
                self.currentSlide = index;
                self.slides[index].style.transform = 'translate3d(0%,0,0)';
            }
        }
    }, option);
    SyncClient.call(this, opt);
    this.slides = document.querySelectorAll('.slide');
    this.currentSlide = 0;
    //init slides position
    for (var i = 1; i < this.slides.length; i++) {
        this.slides[i].style.transform = 'translate3d(100%,0,0)';
    }
    this.emit('getCurrentSlide');
}
SyncViewer.prototype = Object.create(SyncClient.prototype);
SyncViewer.prototype.constructor = SyncViewer;

//define some usefull conditions
SyncViewer.prototype.currentSlideBeforeLast = function() {
    return this.currentSlide < this.slides.length - 1;
}
SyncViewer.prototype.currentSlideAfterFirst = function() {
    return this.currentSlide > 0;
}


/**
 * Client controller
 * Initialize the hammerjs slider events
 */
function SyncController(option) {
    if (typeof(option)==='undefined') option = {};
    var self = this;
    var opt = Hammer.extend({
        hammer: {
            '.content': {
                swipeleft: function(evt, index) {
                    if (self.currentSlideBeforeLast()){
                        self.emit('onSwipeLeft', evt);    
                    }
                },
                swiperight: function(evt, index) {
                    if (self.currentSlideAfterFirst()) {
                        self.emit('onSwipeRight', evt);    
                    }
                }
            },
            '.tap': {
                tap: function(evt, index) {
                    self.emit('onTap', evt, index);
                }
            }
        }
    }, option);
    SyncViewer.call(this, opt);
    if (Hammer == undefined) {
        throw "SyncController depend on hammerjs lib. please install it before use it.";
    }
    for (var select in opt.hammer) {
        //closure
        (function(selector){
            var elts = document.querySelectorAll(selector);
            Hammer.each(elts, function(item, index, src){
                var ham = new Hammer(item);
                var events = opt.hammer[selector];//<-- need closure
                for (var event in events) {
                    (function(event, callback) {
                        ham.on(event, function(e){
                            callback(e, index);//<-- need closure
                        });
                    })(event, events[event]);
                }
            });
        })(select);
    }
    
}
SyncController.prototype = Object.create(SyncViewer.prototype);
SyncController.prototype.constructor = SyncController;

/*
 * Export Class as a module to use require() on server side.
 */
try {
    module.exports = {
        PORT: PORT,
        HOSTNAME: HOSTNAME,
        SyncServer : SyncServer,
        SyncClient : SyncClient
    }
} catch (error) {}