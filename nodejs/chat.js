var http = require('http');
var server = http.createServer().listen(4000);
console.log('listening on port 4000');
var io = require('socket.io').listen(server);
var cookie_reader = require('cookie');
var querystring = require('querystring');

var redis = require('socket.io/node_modules/redis');
var sub = redis.createClient();

//Subscribe to the Redis chat channel
sub.subscribe('chat');

//Configure socket.io to store cookie set by Django
io.configure(function(){
    io.set('authorization', function(data, accept){
        if(data.headers.cookie){
            data.cookie = cookie_reader.parse(data.headers.cookie);
            return accept(null, true);
        }
        return accept('error', false);
    });
    io.set('log level', 1);
});





var nicknames = {};
// when a user disconnects ...erase from nicknames
checkSockets = function(id){
	var dudesname = "";
	for(key in nicknames){
		if(nicknames[key] == id){
			dudesname = key;
			delete nicknames[key];
		}
	}
	return dudesname;
}

getSocketFromNameAndKick = function(name){
	var sockid = "";
	for(key in nicknames){
		if(key == name){
			io.sockets.socket(nicknames[key]).emit('kicked');
		}
	}
}


var nickname = "";
//when a client connects
io.sockets.on('connection', function (socket) {
	
	
	// var ip = socket.manager.handshaken[socket.id].address;
	// console.log(ip);
	// if(ip){
		// console.log(ip);
		// socket.emit('banned', ip.address);
	// }
    //console.log(socket.id); //later  ---- connect nickname from webpage to socket id
    //Grab message from Redis and send to client
    sub.on('message', function(channel, message){
    	//#################################################GET DATE ########################################
		var objToday = new Date(),
        weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
        dayOfWeek = weekday[objToday.getDay()],
        //domEnder = new Array( 'th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th' ),
        dayOfMonth = objToday.getDate(),
        months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
        curMonth = months[objToday.getMonth()],
        curYear = objToday.getFullYear(),
        curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()),
        curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes(),
        curSeconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds(),
        curMeridiem = objToday.getHours() > 12 ? "p.m." : "a.m.";
		// var today = curHour + ":" + curMinute + "." + curSeconds + curMeridiem + " " + dayOfWeek + " " + dayOfMonth + " of " + curMonth + ", " + curYear;
		var todays = curMonth+" "+dayOfMonth+", "+curYear+", "+curHour+":"+curMinute+" "+curMeridiem;
		message = message+":"+todays;
        socket.send(message);
    });
    
    socket.on('set nickname', function(name){
    	nickname = name;
    	socket.broadcast.emit('new user connected',name);
    	nicknames[nickname] = socket.id;
    	console.log(nicknames);
    	socket.broadcast.emit('new user', nicknames);
    	socket.emit('new user', nicknames);
    });
    //socket.sockets[socket.id].emit
    //Client is sending message through socket.io
    socket.on('send_message', function (message) {
        values = querystring.stringify({
            comment: message,
            sessionid: socket.handshake.cookie['sessionid'],
        });
        
        var options = {
            host: 'localhost',
            port: 3000,
            path: '/node_api',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': values.length
            }
        };
        
        //Send message to Django server
        var req = http.request(options, function(res){
            res.setEncoding('utf8');
            
            //Print out error message
            res.on('data', function(message){
                if(message != 'Everything worked :)'){
                    console.log('Message: ' + message);
                }
            });
        });
        
        req.write(values);
        req.end();
    });
    
    socket.on('private message', function(from, msg){
    	console.log('I received a private message by ', from, ' saying ', msg);
    });
    
    
    socket.on('kick',function(dude){
    	getSocketFromNameAndKick(dude);
    	// socket.socket(dudeSock).emit('kicked');
    });
    
    //when user disconnects
    socket.on('disconnect', function(){
		// socket.emit('user disconnected', '')

		var dude = checkSockets(socket.id);
		socket.broadcast.emit('new user', nicknames);
		socket.emit('new user', nicknames);
		socket.emit('user disconnected mother fucker', dude);
		// socket.disconnect();
		//console.log(nicknames);
		//disconnect(socket);
	})
	
    
});






























