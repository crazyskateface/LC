var user_list = [];
var ding = new Audio("/static/noti.mp3");

var emblems;

var items = {'[rabadonsdeathcap]':'<a href="#" class="infoz" style="color:red;">[rabadonsdeathcap]<span><img src="http://1.bp.blogspot.com/-Kf_QOGy89Uo/UL7IVIaCYmI/AAAAAAAAAzw/_GTz_see6Gc/s1600/rabadon\'s+deathcap.png"></span></a>',
 			 '[voidstaff]':'<a href="#" class="infoz" style="color:red;">[voidstaff]<span><img src="http://media-titanium.cursecdn.com/attachments/46/145/void.png"></span></a>',
 			 //'[]':'<a href="#" class="infoz"><span><img src=""></span></a>'

};
var current_scroll = 0;


$(document).ready(function(){
	
	var name = document.getElementById("name").value;
	var brauns =document.getElementById("brauns").value;
	var room="lobby";
	var socket = io.connect('ec2-54-86-25-186.compute-1.amazonaws.com',{port: 80,'sync disconnect on unload':true});
	var box = document.getElementById('comments');
	var ndata = "";
	socket.on('connect', function(){
		
		socket.emit('set nickname', name,brauns);
		//socket.emit('joinRoom','lobby');
		box.scrollTop = box.scrollHeight;
		console.log("connect"); 
		$("#users").empty();
		$('#users').append('<h4>'+room+'</h4>');
		
	});
	
	
	
	socket.on('new user connected',function(name){
		console.log('new user connected to client name: ' + name);
		$('#comments').append('<br />'+name+' has connected to the chat!!');
		box.scrollTop = box.scrollHeight;
	});
	var entry_el = $('#comment');
	
	box.scrollTop = box.scrollHeight;
	current_scroll = box.scrollHeight;
	
	
	//WHEN USER RECEIVES A MESSAGE FROM NODEJS
	socket.on('message', function(message){
		//escape html chars
		var data = message.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
		
		
		
		
		//append message to the bottom of the list
		//   root: msg:May 2, 2014, 6:02 PM
		ndata = data.split(":");
		//ndata[0] is the user name
		//root
		//msg
		//May2, 2014, 6
		//02 PM
		//BRONZE
		//1
		//adc
		//adc
		var cdata = ndata.splice(1,ndata.length-7); 
		var date = ndata.splice(1,ndata.length-5);
		var tier = ndata[1];
		var div = ndata[2];
		var prim = ndata[3];
		var sec = ndata[4];
		
		console.log(date);
		cdata = matches(cdata.join(":").toString()); //msg
		var date = date.join(":");
		console.log(emblems);
		var emblem = emblems[ndata[0]];  //ndata[0] is name    emblems[name] = bronzeEmblem ie
		
		var alerted = false;
		
		
		$('#comments').append('<br /><img src="'+emblem+'" height="20" width="20"><strong><a class="infoz" href="/user/'+ndata[0]+'/">'+ndata[0]+'<span>IGN: '+ndata[0]+'<br />Rank: <img src="'+emblem+'"> '+tier+' '+div+'<br />Primary Role: '+prim+'<br />Secondary Role: '+sec+'</span></a></strong>:' +cdata + '<small>'+getNow()+'</small>' );
		
		
		//window.scrollBy(0, 10000000000);
		//ding.volume = 0.0;
		ding.play();
		console.log(current_scroll);
		console.log(box.scrollHeight);
		if (current_scroll > (box.scrollHeight -380)){
			box.scrollTop = box.scrollHeight;
		}
		
		entry_el.focus();
	});
	
	
	
	entry_el.keypress(function(event){
		//when enter is pressed send input value to node server
		if(event.keyCode !=13) return;
		var msg = entry_el.attr('value');
		if(msg.substring(0,2) == '/w'){
			
			socket.emit('private message',name, msg,function(data){
				
				console.log(data);
				var lst = msg.split(" ");
				var wandname = lst[0]+' '+lst[1];
				var ndata = msg.substring(wandname.length);
				if(data){
					
					$('#comments').append('<br /><span style="color:purple;"><strong>To: <a href="/user/'+lst[1]+'/" style="color:purple;">'+lst[1]+'</a></strong>:' +ndata +'<small>'+getNow()+'</small></span>' );
				}else{
					$('#comments').append('<br /><span style="color:purple;">User '+lst[1]+' is not signed in!</span>' );
				}
				box.scrollTop = box.scrollHeight;
			entry_el.focus();
			});
			console.log('Private message!!! = '+msg);
			//clear input value
			
			entry_el.attr('value', '');
		}
		else if(msg){
			socket.emit('send_message', msg, function(data){
				console.log(data);
			});
			
			//clear input value
			entry_el.attr('value', '');
		}
	});
	
	
	
	
	//########################################################               NEW USERS    LIST
	//This is where the user list is changed
	socket.on('new user', function(users,emblems_fromNode){
		emblems = emblems_fromNode;
		$("#users").empty();
		$('#users').append('<h4>'+room+'</h4>');
		
		for(var user in users){
			
				console.log(user+' joined');
				
				$('#users').append('<br /><a href="#" id="user-link" onClick="$(\'#'+user+'-hide\').slideToggle();"><img src="'+emblems[user]+'" height="20" width="20">'+user+'</a><div id="'+user+'-hide" style="display:none;"><a href="/user/'+user+'/" target="_blank">Profile</a> <a href="#" onClick="$(\'#comment\').empty();$(\'#comment\').val(\'/w '+user+' \');$(\'#comment\').focus();">Whisper</a> </div>');                                
			
		}
		user_list = users;
	});
	
	
	
	
	
	
	socket.on('user disconnected mother fucker', function(dude){
		$('#comments').append('<br />'+dude+' disconnected! ...that loser.');
		console.log(dude+' disconnected');
	});
	var kickButton = document.getElementById("kick");
	if(kickButton != null){
		kickButton.onclick = function () {                         // add dude name in params for buttons
			var dudek = $("#kickbox").val();
			socket.emit('kick', dudek);
		};
	};
	
	socket.on("alert",function(message){
		alert(message);
		alerted = true;
	});
	
	socket.on('kicked', function(){
		socket.disconnect()
		alert("You've been kicked!!!");
		window.location = "/logout/";
	});
	socket.on('banned', function(ip){
		//socket.disconnect();
		//alert("You're banned! "+ip);
		//window.location = "/";
	})
	
	
	
	$("#rooms").on('change', function(){
		var thisval = this.value;
		alert('Changing to room:' + thisval);
		$("#users").empty();
		$('#users').append('<h4>'+room+'</h4>');
		socket.emit('joinRoom', thisval, function (data) {
	      if(data){
	      	room = thisval;
	      	$("#comments").empty();
			$("#comments").append('You have entered the '+thisval+' room!');
			
			box.scrollTop = box.scrollHeight;
			// $("#comments").append('<div class="row" style="bottom:0;position:absolute;width:100%;"><div class="col-md-12" ><input type="text" class="form-control input-sm" id="comment" name="comment" style="float:left;margin-left:-15px;width:104%;background-color:white;"/></div></div>');
			// entry_el = $("#comment");
			entry_el.focus();
			changeUsersListDammit(thisval);
			
	      }else{
	      	$('#rooms').val(room);
	      }
	    });	
		
		
		function changeUsersListDammit(room){
			var parent = $("#users");
			$("h4", parent).text(room);
		}
		//window.location = '/room/'+this.value+'/';
	});
	
	
	socket.on('private',function(message){
		
		//escape html chars
		var data = message.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
		
		//data = 0 from  1 message
		
		ndata = data.split(":");
		var cdata = ndata.splice(1,ndata.length-3);
		var date = ndata.splice(ndata.length-2,ndata.length);
		console.log(date);
		cdata = cdata.join(":"); //msg
		var date = date.join(":");
		var emblem = emblems[ndata[0]];  //ndata[0] is name    emblems[name] = bronzeEmblem ie
		var alerted = false;
		
		if(cdata.match("PJSalt")){
			console.log('pissin me off');
			$('#comments').append('<br /><span style="color:purple;"><img src="'+emblem+'" height="20" width="20"><strong>From <a href="/user/'+ndata[0]+'/" style="color:purple;">'+ndata[0]+'</a></strong>:' +'<img src="http://www.ilest4h.fr/files/faces/PJSalt.png"><small>'+getNow()+'</small></span>' );
		}else{
			$('#comments').append('<br /><span style="color:purple;"><img src="'+emblem+'" height="20" width="20"><strong>From <a href="/user/'+ndata[0]+'/" style="color:purple;">'+ndata[0]+'</a></strong>:' +cdata + '<small>'+getNow()+'</small></span>' );
		}
		
		//window.scrollBy(0, 10000000000);
		ding.play();
		box.scrollTop = box.scrollHeight;
		entry_el.focus();
	});
	
	
	
	//###############END SOCKET DESIGN
	
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
	
	function matches(stuff) {
	    var str = stuff;
	    var matching = str.match(/\[\w+\]/gi);
	    if(matching != null){
		    for(var i=0; i<matching.length;i++){
		        var matchone = matching[i];
		        
			    var name = matchone;
		        name = name.replace("[","");
		        name = name.replace("]","");
		        matchone = items[matchone];
		        if(matchone != null && matchone != undefined){
			        var regexe = new RegExp("\\["+name+"\\]","gi");
			        str = str.replace(regexe, matchone);
		    	}
		    }
		  }
		
	    return str;
	    //document.getElementById("demo").innerHTML = str;
	}
	
	
	
	window.onload = function(){
		$("#comments").append('Welcome to the lobby '+name+'!');
	}
	
	window.addEventListener('beforeunload',function(event){
		//socket.disconnect();
	});
	
	$(function() {
		$( "#box" ).resizable();
	});	
	
	
	$(function()
	  {
	     $("a#nuts").click(function()
	                         {
	                            $("#options-hide").slideToggle();
	                            return false;
	                         }); 
	  });
	  
	 //mute volume
	 $(function(){
	 	$("#mute").click(function(){
	 		if(ding.volume > 0.0){
	 			ding.volume = 0.0;
	 			ding.muted = true;
	 			$('#mute').val("unmute");console.log("muting");
	 		}else{
	 			ding.volume= 1.0; 
	 			ding.muted = false;
	 			$('#mute').val("mute");
	 		}
	 	});
	 });
	 
	 document.getElementById('comments').addEventListener('scroll',function(){

	    current_scroll = this.scrollTop;
	    console.log('current_scroll '+ current_scroll.toString());
	    console.log('scrollTop '+this.scrollTop.toString());
	    console.log('heigh '+ this.scrollHeight.toString());
		    
		    
		 });		
		 
		 
		
}); // END READY-NESS