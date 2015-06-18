ChatCommandProcessor = function(socket, statuswriter){
	this.socket = socket;
	this.statuswriter = statuswriter;
};

ChatCommandProcessor.prototype.process = function(cmd){
 cmdargs = cmd.toLowerCase().split(' ');
 switch(cmdargs[0]){
    case 'nick':
      this.socket.emit('nick change', cmdargs[1]);
    break;
    case 'help':
      this.statuswriter('Valid commands are nick, help');
    break;
 }
}
