var express    = require('express');
var app        = express();
var server     = require('http').Server(app);
var io         = require('socket.io').listen(server);
var sync       = require('./public/js/Sync.js');
var SyncServer = sync.SyncServer;
var PORT       = 3000;

io.on('connection', function (socket) {
    var syncServer = new SyncServer(socket, io);
});

var static_dirs = [
    '/public/',
    '/node_modules/socket.io/node_modules/socket.io-client/',
    '/bower_components/'
];
for (var i in static_dirs) {
    app.use(express.static(__dirname+static_dirs[i]));
}
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/html/index.html');
});

app.get('/viewer', function(req, res){
    res.sendFile(__dirname + '/public/html/viewer.html');
});

app.get('/controller', function(req, res){
    res.sendFile(__dirname + '/public/html/controller.html');
});


server.listen(PORT);
console.log('Server listening on port ' + PORT);