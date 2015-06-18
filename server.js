var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sockets = [];

app.use(express.static('public'));

var nick_prefixes = ['sparky', 'fido', 'wannabe', 'guest', 'frizzy', 'littlejohnny'];

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function getRandomNick() {
    return nick_prefixes[randomInt(0, nick_prefixes.length - 1)] + randomInt(1000, 99999);
}

function checkNick(nick) {
    for (var i = 0; i < sockets.length; ++i) {
        if (sockets.nick.toLowerCase() == nick.toLowerCase()) {
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
    sockets.push(socket);
    socket.on('nick change', function(nick) {
        if (checkNick(nick)) {
            socket.nick = nick;
            socket.emit('nick change accepted', nick);
        } else {
            socket.emit('nick change rejected', nick);
        }
    });
    socket.on('chat message', function(msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

http.listen(8888, function() {
    console.log('listening on *%d', 8888);
});
