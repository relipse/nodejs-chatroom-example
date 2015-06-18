var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sockets = [];

function removeSocket(socket){
	sockets.splice(sockets.indexOf(socket), 1);
}

app.use(express.static('public'));

var nick_prefixes = ['sparky', 'fido', 'wannabe', 'guest', 'frizzy', 'littlejohnny'];

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function getRandomNick() {
    return nick_prefixes[randomInt(0, nick_prefixes.length - 1)] + randomInt(1000, 99999);
}

function checkNick(nick) {
    if (!nick){ return false; }
    for (var i = 0; i < sockets.length; ++i) {
        if (sockets[i].nick && sockets[i].nick.toLowerCase() == nick.toLowerCase()) {
            return false;
        }
    }
    return true;
}

io.on('connection', function(socket) {
    console.log('a user connected');
    var nick = getRandomNick();
    var counter = 0;
    while (checkNick(nick) == false) {
        nick = getRandomNick();
        if (++counter >= 5){
        	socket.emit('server full', 'full');
        }
    }
    socket.nick = nick;
    socket.emit('nick given', nick);
    //tell everyone that I joined
    socket.broadcast.emit('join', nick);
    var othernicks = [];
    for (var i = 0; i < sockets.length; ++i){
        othernicks.push(sockets[i].nick);
    }
    socket.emit('nicklist', othernicks);

    sockets.push(socket);
    socket.on('nick change', function(nick) {
        if (!nick || nick.length < 3){
        	socket.emit('nick change rejected', 'TOO_SHORT');
        	return;
        }

        if (/[^\da-z]/img.test(nick)) {
			// Successful match
			socket.emit('nick change rejected', 'INVALID_CHARS');
			return;
		}

        if (checkNick(nick)) {
            socket.nick = nick;
            socket.emit('nick change accepted', nick);
        } else {
            socket.emit('nick change rejected', 'TAKEN');
        }
    });

    socket.on('chat message', function(msg) {
        console.log('message: ' + socket.nick + ': ' + msg);
        io.emit('chat message', {from: socket.nick, msg: msg});
    });

    socket.on('disconnect', function() {
        console.log(socket.nick + ' disconnected');
        removeSocket(socket);
        socket.broadcast.emit('part', socket.nick);
    });
});

http.listen(8888, function() {
    console.log('listening on *%d', 8888);
});
