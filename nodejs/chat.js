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


/**
 *	http://i.imgur.com/Milbonj.png
	http://i.imgur.com/JuRsEok.png
	http://i.imgur.com/2UVXvfz.png
	http://i.imgur.com/FYMBfYt.png
	http://i.imgur.com/BYCh9Kh.png
	http://i.imgur.com/CdY8fg2.png
	http://i.imgur.com/T0ZZt1i.png 
 */

var emblem_links = {' ':'http://i.imgur.com/T0ZZt1i.png',
					'BRONZE':'http://i.imgur.com/CdY8fg2.png',
					'SILVER':'http://i.imgur.com/BYCh9Kh.png',
					'GOLD':'http://i.imgur.com/FYMBfYt.png',
					'PLATINUM':'http://i.imgur.com/2UVXvfz.png',
					'DIAMOND':'http://i.imgur.com/JuRsEok.png',
					'CHALLENGER':'http://i.imgur.com/Milbonj.png'}

var nicknames = {};
//var inroom = {'lobby':{},'duos':{}};
var emblems = {}; //{'travatticus': 'http://url.to.img.png', 'crazyskateface':'http://url.to.img.png'}
var info = {};  //{'crazyskateface': ['BRONZE', 1, 'primRole', 'secRole']}    0tier  1div  2prim  3sec
// when a user disconnects ...erase from nicknames
checkSockets = function(id){
	var dudesname = "";
	for(key in nicknames){
		if(nicknames[key] == id){
			dudesname = key;
			delete nicknames[key];
			console.log('deleting '+dudesname+' from the roster');
			console.log(nicknames);
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
var rooms = ['lobby','duos','teams','bronze','silver','gold','platinum','diamond','challenger']
//when a client connects
io.sockets.on('connection', function (socket) {
	
	var subnickname = "";
	var room = "lobby";
	var mod = false;
	// var ip = socket.manager.handshaken[socket.id].address;
	// console.log(ip);
	// if(ip){
		// console.log(ip);
		// socket.emit('banned', ip.address);
	// }
	//socket.join(room);
	
	socket.on('joinRoom', function(roomName,fn){
		var restriction = [' ','BRONZE','SILVER','GOLD','PLATINUM','DIAMOND','CHALLENGER'];
		var restricted = false;
		var clientEmblem_url = emblems[subnickname];
		var resLevel = 0;
		//console.log(roomName.toUpperCase());
		//console.log(restriction.indexOf(roomName.toUpperCase()));
		if(restriction.indexOf(roomName.toUpperCase()) != -1){ //if the room name is not on the restricted list
			for(i in restriction){
				//console.log(i);
				if(clientEmblem_url == emblem_links[restriction[i]] ){
					restricted = true;
					//console.log('restricted!');
					break;
				}
				resLevel++;
				
			}
		}
		//console.log(mod);
		if(restricted){
			var roomResLevel = restriction.indexOf(roomName.toUpperCase());
			//console.log(subnickname+ "'s rank = " + resLevel+' and room rank = '+ roomResLevel + ' mod: '+ mod);
			if(mod == 'True'){
				socket.leave(room);
				var last = room;
				//console.log(inroom[room]);
				room = roomName;
				socket.join(roomName);
				io.sockets.in(last).emit("new user",getClientsIn(last),emblems);
				io.sockets.in(room).emit("new user",getClientsIn(room),emblems);
				fn(true);
			}
			else if(roomResLevel <= 1){
				socket.leave(room);
				var last = room;
				//console.log(inroom[room]);
				room = roomName;
				socket.join(roomName);
				io.sockets.in(last).emit("new user",getClientsIn(last),emblems);
				io.sockets.in(room).emit("new user",getClientsIn(room),emblems);
				fn(true);
			}
			else if(resLevel == roomResLevel ){
				socket.leave(room);
				var last = room;
				//console.log(inroom[room]);
				room = roomName;
				socket.join(roomName);
				io.sockets.in(last).emit("new user",getClientsIn(last),emblems);
				io.sockets.in(room).emit("new user",getClientsIn(room),emblems);
				fn(true);
			}
			else if(resLevel < roomResLevel && resLevel <5){
				socket.emit("alert","You are not high enough rank to go to that room");
				fn(false);
			}
			else{
				socket.leave(room);
				var last = room;
				//console.log(inroom[room]);
				room = roomName;
				socket.join(roomName);
				io.sockets.in(last).emit("new user",getClientsIn(last),emblems);
				io.sockets.in(room).emit("new user",getClientsIn(room),emblems);
				fn(true);
			}
		}
		else{
			console.log('else joining');
			socket.leave(room);
			var last = room;
			//console.log(inroom[room]);
			room = roomName;
			socket.join(roomName);
			io.sockets.in(last).emit("new user",getClientsIn(last),emblems);
			io.sockets.in(room).emit("new user",getClientsIn(room),emblems);
			fn(true);
		}
		
	});
	
    //console.log(socket.id); //later  ---- connect nickname from webpage to socket id
    //Grab message from Redis and send to client
    sub.on('message', function(channel, message){
    	
    	//determine room the message client is currently in and only send to that room
    	var name = message.split(":");
    	var name = name[0];
    	console.log(name + ' is name of client sending message ' +message);
    	var roomOfClient = getRoomOfClient(name);
    	
    	// make sure the room you're sending to is the room the client is currently in!
    	if(room == roomOfClient){
	    	//################GET DATE ############
			var todays = getNow()
			message = message+":"+todays;
			if(info[name] != null && info[name] != []){
				console.log(info[name]+' isnt null');
				message = message+':'+info[name][0]+':'+info[name][1]+':'+info[name][2]+':'+info[name][3]; //should be tier:div:prim:sec
			}else{
				console.log('info[name] is null?');
			}
			//console.log('sending '+emblems[name[0]]);
			
	        socket.in(room).send(message);
	        //io.sockets.in(room).send(message);
	        //socket.broadcast.to(room).send(message);
	        //console.log(subnickname +' said: '+message+ ' in room '+ room);
	        }
    });
    
    socket.on('set nickname', function(name,isMod){
    	
    	nickname = name;
    	subnickname = name;
    	mod = isMod;
    	socket.join(room);
    	socket.broadcast.to(room).emit('new user connected',name);
    	nicknames[nickname] = socket.id;
    	var emblem_url = "";
    	values = querystring.stringify({
            comment: name,
            sessionid: socket.handshake.cookie['sessionid'],
        });
    	var options = {
    		host: 'localhost',port:3000,path: '/node_emblem',method: 'POST',headers:{'Content-Type': 'application/x-www-form-urlencoded','Content-Length':values.length}
    	};
    	var req = http.request(options, function(res){
    		res.setEncoding('utf8');
    		res.on('data', function(emblem){
    			// console.log("HWWEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
    			//console.log(emblem);
    			emblemw = emblem.split(":");
    			emblemw = emblemw[0]+':'+emblemw[1];
    			infow = emblem.substring(emblemw.length+1);
    			
		    	emblems[name] = emblemw;
		    	
		    	infow = infow.split(":");
		    	
		    	
		    	info[subnickname] = [];
		    	info[subnickname][0] = infow[0];
		    	info[subnickname][1] = infow[1];
		    	info[subnickname][2] = infow[2];
		    	info[subnickname][3] = infow[3];
		    	//console.log(info);
		    		    	//socket.broadcast.to(room).emit('new user', inroom[room],emblems);
		    	//socket.emit('new user', nicknames, emblems);
		    	
		    	
		    	io.sockets.in(room).emit('new user', getClientsIn(room),emblems);
		    	//getClientsIn(room);
    		});
    	});
    	req.write(values);
    	req.end();
    });
    
    //socket.sockets[socket.id].emit
    //Client is sending message through socket.io
    socket.on('send_message', function (message) {
        values = querystring.stringify({
            comment: message,
            sessionid: socket.handshake.cookie['sessionid'],
        });
        var options = {
            host: 'localhost',port: 3000,path: '/node_api',method: 'POST',headers: {'Content-Type': 'application/x-www-form-urlencoded','Content-Length': values.length}
        };
        //Send message to Django server
        var req = http.request(options, function(res){
            res.setEncoding('utf8');
            //Print out error message
            res.on('data', function(message){
                // if(message != 'Everything worked :)'){
                    // console.log('Message: ' + message);
                    //info[subnickname] = message;
                    console.log(info);
                
            });
        });
        req.write(values);
        req.end();
    });
    
    
    
    
    socket.on('private message', function(from, msg, fn){
    	//console.log('I received a private message by ', from, ' saying ', msg);
    	//io.sockets.socket(socket.id).emit(msg);
    	var lst = msg.split(" ");
    	var wandname = lst[0]+' '+lst[1];
    	var to = getClientId(lst[1]);
    	var message= msg.substring(wandname.length+1);
    	console.log('private message to ' + lst[1] +': '+to);
    	
    	var g = from+': '+message + ':'+getNow();
    	io.sockets.socket(to).emit('private', g)
    	if(lst[1] in nicknames){
    		fn(true);
    	}else{
    		fn(false);
    	}
    });
    
    socket.on('kick',function(dude){
    	getSocketFromNameAndKick(dude);
    	console.log('going to kick ' +dude);
    	// socket.socket(dudeSock).emit('kicked');
    });
    
    //when user disconnects
    socket.on('disconnect', function(){
		// socket.emit('user disconnected', '')

		var dude = checkSockets(socket.id);
		socket.broadcast.to(room).emit('new user', nicknames, emblems);
		//socket.emit('new user', nicknames,emblems);
		socket.broadcast.to(room).emit('user disconnected mother fucker', dude);
		//socket.disconnect();
		//console.log(nicknames);
		//disconnect(socket);
	})
	
    
});

function getNow(){
	var objToday = new Date(),
    weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
    dayOfWeek = weekday[objToday.getDay()],
    //domEnder = new Array( 'th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th' ),
    dayOfMonth = objToday.getDate(),
    months = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'),
    curMonth = months[objToday.getMonth()],
    curYear = objToday.getFullYear(),
    curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()),
    curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes(),
    curSeconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds(),
    curMeridiem = objToday.getHours() > 12 ? "p.m." : "a.m.";
	// var today = curHour + ":" + curMinute + "." + curSeconds + curMeridiem + " " + dayOfWeek + " " + dayOfMonth + " of " + curMonth + ", " + curYear;
	var todays = curMonth+" "+dayOfMonth+", "+curYear+", "+curHour+":"+curMinute+" "+curMeridiem;
	return todays;
}


function getClientId(name){
	for(key in nicknames){
		if(key == name){
			return nicknames[key]
		}
	}
	return null;
}

function getClientsIn(room){
	var clients = io.sockets.clients(room);
	var clientList = {}
	//console.log(clients[0]['id']);
	for(i in clients){
		var getName = getNickname(clients[i]['id']);
		//console.log('get nickname ');
		//console.log(!(getName in clientList) && getName != "undefined" && getName != undefined);
		if(!(getName in clientList) && getName != "undefined" && getName != undefined){
			clientList[getName] = clients[i]['id'];
		}
		
	}
	//console.log(clientList);
	//console.log('in room '+ room);
	return clientList;
	
}


function getNickname(id){
	for(key in nicknames){
		if(nicknames[key] == id){
			//console.log('returning '+ key);
			return key;
		}
	}
}


function getRoomOfClient(name){
	var id = "";
	for(key in nicknames){
		if(key == name){
			id = nicknames[key];
		}
	}
	var room = {};
	var roomm = "";
	room = io.sockets.manager.roomClients[id];
	//console.log(room);
	for(key in room){
		if(key == ''){
			//console.log('not this room');
		}else{
			roomm = key.substring(1);
			//console.log(roomm);
			return roomm;
		}
	}
}




















