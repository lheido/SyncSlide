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
function SyncServer(socket) {
    Sync.call(this, socket);
    var self = this;
    this.socket.on('SendEvents', function(events){
        //listen interface events
        for (var i in events) {
            self.socket.on(events[i], function(args){
                self.broadcast(events[i], args);
            });
        }
    });
}
SyncServer.prototype = Object.create(Sync.prototype);
SyncServer.prototype.constructor = SyncServer;

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
    var event_names = [], events = options.events;
    if (events == undefined) {
        throw 'Client options must contain events object';
    }
    for (var event in events) {
        event_names.push(event);
        this.socket.on(event, events[event]);
    }
    this.emit('SendEvents', event_names);
}
SyncClient.prototype = Object.create(Sync.prototype);
SyncClient.prototype.constructor = SyncClient;

/*
 * Export Class as a module to use require() on server side.
 */
try {
    module.exports = {
        SyncServer : SyncServer,
        SyncClient : SyncClient
    }
} catch (error) {}