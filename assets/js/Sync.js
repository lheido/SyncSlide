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
        this.socket = io('http://localhost:3000');
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
    this.socket.on(event, function(args){
//        self.broadcast(event, args);
        self.io.emit(event, args);
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
function SyncViewer() {
    var self = this;
    SyncClient.call(this, {
        events: {
            onTap: function(evt) {},
            onSwipeLeft: function(evt) {
                self.currentSlide += 1;
                self.slides[self.currentSlide].style.transform = 'translate3d(0%,0,0)';
            },
            onSwipeRight: function(evt) {
                self.slides[self.currentSlide].style.transform = 'translate3d(100%,0,0)';
                self.currentSlide -= 1;
            }
//            onPanStart: function(evt) {
//                if (self.currentSlide < self.slides.length) {
//                    self.slides[self.currentSlide].style.transitionDuration = '0s';
//                }
//            },
//            onPanLeft: function(evt) {
//                var nextSlide = self.currentSlide + 1;
//                if (nextSlide <= self.slides.length) {
//                    self.slides[nextSlide].style.transform = 'translate3d('+(evt.pos*100)+'%,0,0)';
//                }
//            },
//            onPanRight: function(evt) {
//                if (self.currentSlide > 0) {
//                    self.slides[self.currentSlide].style.transform = 'translate3d('+(evt.pos*100)+'%,0,0)';
//                }
//            },
//            onPanEnd: function(evt) {
//                if (self.currentSlide < self.slides.length) {
//                    if (evt.deltaX < 0) {
//                        //panleft
//                        if (self.currentSlideBeforeLast()) {
//                            self.currentSlide += 1;
//                            self.slides[self.currentSlide].style.transitionDuration = '300ms';
//                            if (evt.pos <= 0.5) {
//                                self.slides[self.currentSlide].style.transform = 'translate3d(0%,0,0)';
//                            } else {
//                                self.slides[self.currentSlide].style.transform = 'translate3d(100%,0,0)';
//                                self.currentSlide -= 1;
//                            }
//                        }
//                    } else {
//                        //panright
//                        if (self.currentSlideAfterFirst()) {
//                            self.slides[self.currentSlide].style.transitionDuration = '300ms';
//                            if (evt.pos >= 0.5) {
//                                self.slides[self.currentSlide].style.transform = 'translate3d(100%,0,0)';
//                                self.currentSlide -= 1;
//                            } else {
//                                self.slides[self.currentSlide].style.transform = 'translate3d(0%,0,0)';
//                            }
//                            
//                        }
//                    }
//                    console.log(self.currentSlide);
//                }
//            }
        }
    });
    this.content = document.querySelector('.content');
    this.slides = document.querySelectorAll('.slide');
    this.currentSlide = 0;
    //init slides position
    for (var i = 1; i < this.slides.length; i++) {
        this.slides[i].style.transform = 'translate3d(100%,0,0)';
    }
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
function SyncController() {
    SyncViewer.call(this);
    if (Hammer == undefined) {
        throw "SyncController depend on hammerjs lib. please install it before use it.";
    }
    var self = this;
    this.hammerContent = new Hammer(this.content);
    this.hammerContent.on('swipeleft', function(evt){
        if (self.currentSlideBeforeLast()){
            self.emit('onSwipeLeft', evt);    
        }
    });
    this.hammerContent.on('swiperight', function(evt){
        if (self.currentSlideAfterFirst()) {
            self.emit('onSwipeRight', evt);    
        }
    });
//    this.hammerContent.on('panstart', function(evt){
//        self.emit('onPanStart', evt);
//    });
//    this.hammerContent.on('panleft', function(evt){
//        evt.pos = evt.center.x / window.innerWidth;
////        evt.pos = (window.innerWidth - (window.innerWidth - evt.center.x)) / 100;
//        if (self.currentSlideBeforeLast()) {
//            self.emit('onPanLeft', evt);
//        }
//    });
//    this.hammerContent.on('panright', function(evt){
//        evt.pos = evt.center.x / window.innerWidth;
////        evt.pos = (window.innerWidth - (window.innerWidth - evt.center.x)) / 100;
//        if (self.currentSlideAfterFirst()) {
//            self.emit('onPanRight', evt);
//        }
//    });
//    this.hammerContent.on('panend', function(evt){
//        evt.pos = evt.center.x / window.innerWidth;
////        evt.pos = (window.innerWidth - (window.innerWidth - evt.center.x)) / 100;
//        if (self.currentSlide < self.slides.length) {
//            self.emit('onPanEnd', evt);
//        }
//    });
    
}
SyncController.prototype = Object.create(SyncViewer.prototype);
SyncController.prototype.constructor = SyncController;

/*
 * Export Class as a module to use require() on server side.
 */
try {
    module.exports = {
        SyncServer : SyncServer,
        SyncClient : SyncClient
    }
} catch (error) {}