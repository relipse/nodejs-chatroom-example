var appendMessage = function(msg) {
    $('.messages ul').append($('<li>').text(msg));
};

var socket = io();
var chatCommands = new ChatCommandProcessor(socket, appendMessage);


$('.chatbox form').submit(function() {
    var txt = $('.chatbox input').val();
    if (txt.indexOf('/') === 0) {
        var cmd = txt.substring(1);
        chatCommands.process(cmd);
        return;
    }

    //OTHERWISE JUST A CHAT MESSAGE
    socket.emit('chat message', $('.chatbox input').val());
    $('.chatbox input').val('');
    return false;
});
socket.on('nick given', function(nick) {
    $('.memberList .me').html(nick);
    appendMessage('You are now known as ' + nick + ', to change your nick type /nick <new-nick>');
});

socket.on('nick change accepted', function(nick) {
    $('.memberList .me').html(nick);
    appendMessage('You are now known as ' + nick);
});

socket.on('nick change rejected', function(nick) {
    appendMessage('Nick is already taken: ' + nick);
});

socket.on('chat message', function(obj) {
    appendMessage(obj.from + ': ' + obj.msg);
});

socket.on('server full', function(msg) {
    appendMessage('Server full, try again later');
})

