var appendMessage = function(msg, format) {
    format = format || {'class':''};
    $('.messages ul').append($('<li class="'+format.class+'">').text(msg))
                     .scrollTop($('.messages ul')[0].scrollHeight);
};

var socket = io();
var chatCommands = new ChatCommandProcessor(socket, appendMessage);

$('.chatbox form').submit(function() {
    var txt = $('.chatbox input').val();
    //clear chat box
    $('.chatbox input').val('');

    if (txt.indexOf('/') === 0) {
        var cmd = txt.substring(1);
        chatCommands.process(cmd);
        return false; //do not submit
    }
    //OTHERWISE JUST A CHAT MESSAGE
    socket.emit('chat message', txt);
    return false;
});

socket.on('nick given', function(nick) {
    $('.memberList').html('');
    $('.memberList').append('<li class="me">'+nick+'</li>');

    appendMessage('You are now known as ' + nick + ', to change your nick type /nick <new-nick>', {class:'italic'});
});

socket.on('nick change accepted', function(nick) {
    $('.memberList .me').html(nick);
    appendMessage('You are now known as ' + nick, {class:'italic'});
});

socket.on('nick change rejected', function(reason) {
    appendMessage('Nick change rejected: ' + reason, {class:'italic'});
});

socket.on('nick change user', function(nickobj){
  $('.memberList .'+ nickobj.old).removeClass(nickobj.old).addClass(nickobj.new).html(nickobj.new);
  appendMessage(nickobj.old + ' is now known as ' + nickobj.new, {class:'italic'});
});

socket.on('chat message', function(obj) {
    appendMessage(obj.from + ': ' + obj.msg);
});

socket.on('server full', function(msg) {
    appendMessage('Server full, try again later', {class:'italic'});
})

socket.on('join', function(nick){
    $('.memberList').append('<li class="'+nick+'">'+nick+'</li>');
    appendMessage(nick+' has joined', {class:'italic'});
});

socket.on('part', function(nick){
    $('.memberList li.'+nick).remove();
    appendMessage(nick+' has left', {class:'italic'});
});

socket.on('disconnect', function(){
    $('.memberList').html('');
    $('.memberList').append('<li class="me"></li>');
    appendMessage('Disconnected. Attempting to reconnect...', {class:'italic'});
});

socket.on('nicklist', function(nicklist){
    for (var i = 0; i < nicklist.length; ++i){
        var nick = nicklist[i];
        $('.memberList').append('<li class="'+nick+'">'+nick+'</li>');
    }
});
