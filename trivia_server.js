let http = require('http');
let fs = require('fs');
let path = require('path');

//serverside variables
let questions = [0,20];  
let msgs = []; 
let secs; 
let html; 
let players = []; 
let qnum =0; 
let numplayers = 0; 
let timeleft = 20; 
let stats = {}; 
let winner; 
let higestscore = -600; 
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let timer; 


//Helper function for sending 404 message
function send404(response) {
	response.writeHead(404, { 'Content-Type': 'text/plain' });
	response.write('Error 404: Resource not found.');
	response.end();
}



//crates the server 
let server = http.createServer(function (req, res) {
	if (req.method == 'GET') {
		// loads the initial page
		if (req.url == '/') {
			stream = fs.createReadStream("trivia.html");
			stream.pipe(res);
		}
		// gets the javascript for the html
		else if (req.url == '/trivia.js') {
			fs.readFile('trivia.js', function (err, data){
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				res.write(data);
				res.end();
			})
		}
		//gets the check mark pic
		else if (req.url == '/check.png') {
			res.writeHead(200, {'Content-Type': 'image/png'});
			stream = fs.createReadStream("check.png");
			stream.pipe(res);
		}
		//gets the x pic
		else if (req.url == '/x.png') {
			res.writeHead(200, {'Content-Type': 'image/png'});
			stream = fs.createReadStream("x.png");
			stream.pipe(res);
		}
		//path for the statistics page
		else if (req.url == '/stats') {
			res.writeHead(200, {'Content-Type': 'text/html'})
			createstats(); 
			res.write(html); 
			res.end; 
			
		}
		//handesls other invalid requests
		else {
			send404(res); 
		}
	}else{ 
		send404(res);
	}
});
server.listen(3000);
console.log("server Running at port 3000");



const io = require ('socket.io')(server); 


io.on ('connection', socket => {
	console.log("connection was made");
// serverside socket	

//logs when someone disconnects
//resets the round dependant variables when every one leaves
	socket.on('disconnect', () => {
		console.log(socket.username + " : " + "disconnected");  
		numplayers--;
		if (numplayers == 0) {
			Test = {"Test" : []};
			qnum = 0 ; 
			numplayers= 0;
			msgs = [];
			questions = [0,20];
			players = [];
			clearTimeout(timer);
			timeleft =20; 
		}
	}); 
	
	//player joins the game 
	socket.on ("join" , name => {
		
		//variable setting
		socket.username = name; 
		players.push(name); 
		questions[0] = qnum; 
		questions [1] = timeleft; 
		socket.score = 0 ; 
		console.log (socket.username + " : " + "connected"); 
		
		//calls the joined and  msginit sockets to initialize all the messages on the chat window
		io.emit('joined', socket.username);
		socket.emit('msgInit', JSON.stringify({messages: msgs}));
		
		//
		numplayers++;// updates the number of players in the game
		
		// update the stats object to hold user info
		stats[name] = new Object(); 
		stats[name].score = 0; 
		stats[name].QuestionsRight = 0; 
		stats[name].QuestionsWrong = 0;
		stats[name].gameswon = 0;
		stats[name].name = name;
		
		//call to initialize the the screeen displaying the players that are playing 
		io.emit('playerinit', JSON.stringify({P:[players,stats]})); 
		
		createstats(); // creates the stats html to reflect the new data
		
		
		// get 5 questions from server
		//console.log (stats); 
		if (numplayers ==1) {
			let body = ''; 
			let xhttp = new XMLHttpRequest(); 
			xhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200){
				body = JSON.parse(this.responseText);
				socket.emit('start' , JSON.stringify({Q: [qnum,20,body.results]}));
				questions.push (body.results); 
			}
			}
			xhttp.open("GET", "https://opentdb.com/api.php?amount=5", true);
			xhttp.send();
			winner= name; 
			countdown();
		}
		else {
			socket.emit('start' , JSON.stringify({Q : questions}));
		}
		// send array data out
	})
	
	//send a message to the clientside
	socket.on("sendmsg", message => {
		message = socket.username + ": " + message; 
		msgs.push(message);
		io.emit("newmsg", message);
	})
	
	// when the player submits this stores the data 
	socket.on('submit', score => {
		
		//updates the number of questions a user got right or wrong on the stats object
		if (stats[socket.username].score > score) {
			stats[socket.username].QuestionsWrong++; 
		}
		else if (stats[socket.username].score > score) {
			stats[socket.username].QuestionsRight++; 
		}
		
		// updates the players current score on the stats object
		stats[socket.username].score = score; 
		
		// if it is the last question compute the winner
		if (qnum ==4){
			if (score > higestscore) {
				higestscore =score; 
				winner  = socket.username;
			}
		}
		
		// sends info to all other users 
		//tells them when a player has answered a question
		//tells them their score
		let message = socket.username +  " Has answered the question. they now have a score of " + score; 
		msgs.push(message);
		io.emit("newmsg", message);	
		io.emit('playerinit', JSON.stringify({P:[players,stats]}));
	})
	
	//old code
/* 	socket.on('newround',() => {
			qnum = 0 ; 
			questions = [0,20];
			clearTimeout(timer);
			timeleft =20; 
			winner = players[0];
			stats[socket.username].score = 0; 
		
			let body = ''; 
			let xhttp = new XMLHttpRequest(); 
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200){
					body = JSON.parse(this.responseText);
					questions.push (body.results); 
					//console.log(body.results); 
					socket.emit('start' , JSON.stringify({Q: [qnum,20,body.results]}));
				}
			}
			xhttp.open("GET", "https://opentdb.com/api.php?amount=5", true);
			xhttp.send();
			countdown();
	}) */
	
	/* socket.on('settime' time =>{
		timeleft = message
		
	})
	socket.on('setnum' () =>{
		
		
	}) */
	
	
	
});


// creates a timer for each question 
// when the timer reaches 0 the user is served with the next question
// when the timer reaches 0 on the last question serves the user with thw winners info 
// this subseqently starts the next round after 5 seconds 
function countdown () {
	io.emit ('settime', timeleft); 
	timeleft--; 
	timer =setTimeout (countdown,1000); 
	if (timeleft<0 && qnum==4){
		stats[winner].gameswon ++;
		io.emit('winner', JSON.stringify({Q:[winner,stats[winner].score]}));
		setTimeout(newround,5000);  
		clearTimeout(timer); 
	}
	if (timeleft<0) { 
		qnum+=1; 
		timeleft = 20; 
		io.emit ('setQuestion', qnum); 
	}

}



// creates an html stats page using the javascript object stats 
function createstats() {
	html = ''; 
	html += '<html> <head> </head> <body>'  ;
	html+= '<h1>Game Stats </h1>' ; 
	
	players.forEach(elem => {
		let info = stats[elem]; 
		html+= '<br>' ; 
		html+= '<div>' + info.name+ ': </div>'
		html+= '<div> Questions answered correctly: ' + info.QuestionsRight+ ' </div>'
		html+= '<div> Questions answered incorrectly: ' + info.QuestionsWrong+ '</div>'
		html+= '<div> Games Won : ' + info.gameswon+ ' </div>'
		
		
	})
	
	
	html+= '<a href = "/"> Back <a>';
	html+= '</body></html>'

}	



// when a new round starts gets new questions and outputs it to all the players
function newround () {
		// reseting all round related variables 
			qnum = 0 ; 
			questions = [0,20];
			clearTimeout(timer);
			timeleft =20; 
			winner = players[0];
			players.forEach(elem => {
				stats[elem].score = 0; 
				
			})
			
			// gets 5 new questions from open tb 
			let body = ''; 
			let xhttp = new XMLHttpRequest(); 
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200){
					body = JSON.parse(this.responseText);
					questions.push (body.results); 
					//console.log(body.results); 
					io.emit('start' , JSON.stringify({Q: [qnum,20,body.results]})); // send the question number , the timeleft and the Question object to the users
				}
			}
			xhttp.open("GET", "https://opentdb.com/api.php?amount=5", true);
			xhttp.send();
			io.emit('playerinit', JSON.stringify({P:[players,stats]}));
			countdown();
	
}