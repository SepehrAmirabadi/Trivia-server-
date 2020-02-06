//initiates client side variables 

let socket = null; 
let questionlist = []; 
let qanswered = [false,false,false,false,false]; 
let score = 0; 
let qnum=0; 
let timeleft = 20 ;
let player; 
let players =0; 
let stats; 


// Starts the program when a player chooses to join
function joinGame() {
	let name = document.getElementById("name").value; 
	if (name.length > 0 && socket == null) {
		socket = io();
		
		//server info and request handeling
		socket.on ('newmsg', newMessage); 
		socket.on('joined', userJoined); 
		socket.on('start', qload);
		socket.on('msgInit', msgInit);
		socket.on('playerinit',playerinit);
		socket.on('settime', setTime);
		socket.on('setQuestion',setNum);
		socket.on ('winner', win); 
		socket.emit("join" ,name); 
	}
	else {
		//ensures the name is not blank 
		alert (" you need to enter a name");
	}
	
}

// outputs who the winner is and resets variables needed for the nextround
function win(data) {
	console.log ("we got here");
	winnerdata = JSON.parse (data).Q; 
	let winscore = winnerdata[1]; 
	let winner = winnerdata[0]; 
	tempElem =document.getElementById("testbody");
	tempElem.innerHTML = null;
	let text = document.createTextNode("The winner is " + winner + " with a score of " +winscore); 
	tempElem.appendChild (text);  
	score =0; 
	qanswered = [false,false,false,false,false];
	let num = document.getElementById("count"); 
	num.innerHTML = "Next Round will Start shortly" ; 
}

// sends the message to the server so that it can be echoed to the other users
function sendMessage() {
	let msg = document.getElementById("message").value;
	if (msg.length >0) {
		socket.emit ('sendmsg', msg); 
	}
	document.getElementById("message").value = '';
}

//prints new messages that are recieved 
function newMessage (message) {
	let newLi = document.createElement("li");
	let text = document.createTextNode(message);
	newLi.appendChild(text);
	document.getElementById("messages").appendChild(newLi);
}

//initializes messages when someone joins the server
function msgInit(data) {
	let msg = JSON.parse(data).messages;
	msg.forEach(elem => {
		newMessage(elem);
	})
}

//initializes the info of the other players
function playerinit (data) {
	document.getElementById("playerstatus").innerHTML = 'Players: <br>';
	players = JSON.parse(data).P [0];
	stats = JSON.parse(data).P [1];
	players.forEach(elem => {
		newPlayer(elem);
	})
}

//helper for playerinit
function newPlayer (name) {
	let newLI2 = document.createElement("div");
	newLI2.id = socket.username;
	let text2 = document.createTextNode(name + ": " + stats[name].score); 
	newLI2.appendChild(text2);
	document.getElementById("playerstatus").appendChild(newLI2);
}
 
// lets the other users know when someone joined the game
function userJoined(name){
	console.log("User joined: " + name);
	let newLI = document.createElement("li");
	let text = document.createTextNode(name +" joined the Game.");
	newLI.appendChild(text);
	document.getElementById("messages").appendChild(newLI);
	document.getElementById("name").value = ''; 
	document.getElementById("Score").innerHTML = "Your Score is " + score ;
}



/* function newround () { 
	socket.emit ('newround');
}   */


// loads the first question when the server sends it 
//gives values to the client side variables
function qload(data) {
	document.getElementById("Score").innerHTML = "Your Score is " + score ; // resest the score on the screen at the beginning of a new round
	let questions = JSON.parse (data).Q [2]; 
	timeleft= JSON.parse (data).Q [1]; 
	qnum = JSON.parse(data).Q[0]; 
	questionlist = JSON.parse(data).Q; 
	//console.log(JSON.parse(data).Q);
	//countdown(timeleft, "count");
	tempHtml = '';
	let currentQ; 
	
	// iterates through the information in the js object and concotenates a html string in the trivia format
		
		currentQ = questions[qnum];
		tempHtml+= '<div id  = Question' +qnum + ' >' // used for orignization and later accsess 
		tempHtml+= '<div><p>'+ currentQ.category + ': <br>' +  currentQ.question+'</p> </div>' // prints the  category and the question to the html page
		
		
		let rand = Math.floor((Math.random()*currentQ.incorrect_answers.length+1)); // determies the position that the correct answer will be placed in the html 
		
		// places the correc and incorrect options in a random order
		// assigns the elements an id based on the question number and the option number. this is used for navigation in later functions
		for (let j = 0; j< currentQ.incorrect_answers.length;j++) {
			if(rand == j){
				tempHtml += '<div><p><input type = "radio" name = Q' + qnum + ' id = "Q' + qnum + 'option'+ currentQ.incorrect_answers.length + '" value = "' + currentQ.correct_answer + '" >' + currentQ.correct_answer + '</input></p></div>';
			}
			tempHtml += '<div><p><input type = "radio" name = Q' + qnum +' id = "Q' + qnum + 'option'+ j + '" value = "' + currentQ.incorrect_answers[j] + '" >' + currentQ.incorrect_answers[j] + '</input></div><p>';
			if ((j == currentQ.incorrect_answers.length-1) && (rand ==currentQ.incorrect_answers.length)){
				tempHtml += '<div><p><input type = "radio" name = Q'+ qnum+ ' id = "Q' + qnum + 'option'+ currentQ.incorrect_answers.length + '" value = "' + currentQ.correct_answer + '" >' + currentQ.correct_answer + '</input></div><p>';
			}
		}
		
		
	tempHtml+= '</div>'
	tempHtml+= '<div><button onclick = "Submit()"> Submit</button></div>'; // inserting buttons to html 
	document.getElementById("testbody").innerHTML = tempHtml;  // sending htmls to the test body div of trivia.html
	
}

// loads the subsequent question as the question number(qnum) changes
function altqload () {
	//console.log ("this happened");
	let questions = questionlist[2];
	qnum++;
	//countdown(20, "count");
	tempHtml = '';
	let currentQ; 
	
	// iterates through the information in the js object and concotenates a html string in the trivia format
		
		currentQ = questions[qnum];
		tempHtml+= '<div id  = Question' +qnum + ' >' // used for orignization and later accsess 
		tempHtml+= '<div><p>'+ currentQ.category + ': <br>' +  currentQ.question+'</p> </div>' // prints the  category and the question to the html page
		//console.log(qnum);
		
		let rand = Math.floor((Math.random()*currentQ.incorrect_answers.length+1)); // determies the position that the correct answer will be placed in the html 
		
		// places the correc and incorrect options in a random order
		// assigns the elements an id based on the question number and the option number. this is used for navigation in later functions
		for (let j = 0; j< currentQ.incorrect_answers.length;j++) {
			if(rand == j){
				tempHtml += '<div><p><input type = "radio" name = Q' + qnum + ' id = "Q' + qnum + 'option'+ currentQ.incorrect_answers.length + '" value = "' + currentQ.correct_answer + '" >' + currentQ.correct_answer + '</input></p></div>';
			}
			tempHtml += '<div><p><input type = "radio" name = Q' + qnum +' id = "Q' + qnum + 'option'+ j + '" value = "' + currentQ.incorrect_answers[j] + '" >' + currentQ.incorrect_answers[j] + '</input></div><p>';
			if ((j == currentQ.incorrect_answers.length-1) && (rand ==currentQ.incorrect_answers.length)){
				tempHtml += '<div><p><input type = "radio" name = Q'+ qnum+ ' id = "Q' + qnum + 'option'+ currentQ.incorrect_answers.length + '" value = "' + currentQ.correct_answer + '" >' + currentQ.correct_answer + '</input></div><p>';
			}
		}
		
		
	tempHtml+= '</div>'
	tempHtml+= '<div><button onclick = "Submit()"> Submit</button></div>'; // inserting buttons to html 
	document.getElementById("testbody").innerHTML = tempHtml;  // sending htmls to the test body div of trivia.html
	
	
}


// when the user submits the question this checks to see if their ans was correct and relays that info to the server
function Submit() {
	let incomp; 
	//makes sure the timelimit has not been passed
	//also makes sure that they can only answer once
	if (qanswered [qnum] ==false && timeleft>0) {
		let questions = questionlist[2]; 
		
		//checks to see if the question has been answered 
		for (let j =0  ; j < (questions[qnum].incorrect_answers.length + 1 ); j++) {
			tempElem = document.getElementById("Q" + qnum + "option" + j); 
			//console.log(tempElem);
			if (tempElem.checked == true) {
				document.getElementById("Question"+qnum).style.color = "black";
				break;
			}
			else {
				if (j == questions[qnum].incorrect_answers.length) {
					document.getElementById("Question"+qnum).style.color = "red";
					incomp = true; 
				}
			}
		}
		
		//makes sure the user actually answers the question before continuing
		if (incomp == true) {
			alert ("you must answer the question"); 
			
		}
		else {
				// iterates through the question list and checks to see if the answer was correct
			for (let j =0  ; j < (questions[qnum].incorrect_answers.length + 1 ); j++) {
						tempElem = document.getElementById("Q" + qnum + "option" + j); 
						if (tempElem.checked == true) {
							if (tempElem.value == questions[qnum].correct_answer) {
								// gives the user a score based on how much time remains
									if (timeleft>15) {
										score+=175; 
									}
									else if (timeleft>10) {
										score+=150
									}
									else if (timeleft>5) {
										score+= 125; 
									}
									else {
										score+=100;
									}
									document.getElementById("Q" + qnum + "option" + j).parentNode.innerHTML += '<img style = "right-side" src = "check.png" height = 20 width = 20 >' 
									document.getElementById("Q" + qnum + "option" + j).checked = true; // for some reason the upper code unchecks the items so we have to reset it
								}
								else {
									score-=100;
									document.getElementById("Q" + qnum + "option" + j).parentNode.innerHTML += '<img style = "right-side" src = "x.png" height = 20 width = 20 >'
									document.getElementById("Q" + qnum + "option" + j).checked = true;  // for some reason the upper code unchecks the items so we have to reset it
								}
						}
			}
			
			//updates the score on the screen 
			document.getElementById("Score").innerHTML = "Your Score is " + score ;
			qanswered[qnum] = true; // sets the state of this question as anwered
			socket.emit ("answered", score); // use this to tell the other users about your progress
		}
		socket.emit('submit', score);  // sends the users new score to the server
	}
	else {
		if (timeleft<=0) {
			alert ("you are out of time"); // lets the user know times up 
		}
		else {
			alert("you cannot answer more than once"); // lets the userknow theyve alredy answered
		}
	}
}

// gets the time left on a question from the server
//ensures that useres that join in the middle of the round are in sync wtih the other users 
function setTime(data){
	timeleft = data; 
	let num = document.getElementById("count"); 
	num.innerHTML = " " +timeleft + " seconds left"; 
	if (timeleft<=0 && qnum<4) {
		altqload(); 
	}
	//console.log(timeleft);
}

//gets the questionnumber from the server
//ensures everyone is on the same question 
function setNum (data) {
	qnum = data; 
	//console.log(qnum); 
}




















//old code

/* function userJoined () {
	
	
}

function display () {
	
	
}
function load() {
	tempHtml = '';
	let currentQ; 
	
	// iterates through the information in the js object and concotenates a html string in the trivia format
	for (let i = 0 ; i < tests["Test "+pickedtest].length; i++){
		
		currentQ = tests["Test"][i]
		tempHtml+= '<div id  = Question' +i + ' >' // used for orignization and later accsess 
		tempHtml+= '<div><p>'+ currentQ.category + ': <br>' +  currentQ.question+'</p> </div>' // prints the  category and the question to the html page
		
		
		let rand = Math.floor((Math.random()*currentQ.incorrect_answers.length+1)); // determies the position that the correct answer will be placed in the html 
		
		// places the correc and incorrect options in a random order
		// assigns the elements an id based on the question number and the option number. this is used for navigation in later functions
		for (let j = 0; j< currentQ.incorrect_answers.length;j++) {
			if(rand == j){
				tempHtml += '<div><p><input type = "radio" name = Q' + i + ' id = "Q' + i + 'option'+ currentQ.incorrect_answers.length + '" value = "' + currentQ.correct_answer + '" >' + currentQ.correct_answer + '</input></p></div>';
			}
			tempHtml += '<div><p><input type = "radio" name = Q' + i +' id = "Q' + i + 'option'+ j + '" value = "' + currentQ.incorrect_answers[j] + '" >' + currentQ.incorrect_answers[j] + '</input></div><p>';
			if ((j == currentQ.incorrect_answers.length-1) && (rand ==currentQ.incorrect_answers.length)){
				tempHtml += '<div><p><input type = "radio" name = Q'+ i+ ' id = "Q' + i + 'option'+ currentQ.incorrect_answers.length + '" value = "' + currentQ.correct_answer + '" >' + currentQ.correct_answer + '</input></div><p>';
			}
		}
		
		
	}
	tempHtml+= '</div>'
	tempHtml+= '<div><button onclick = "Submit()"> Submit</button></div>'; // inserting buttons to html 
	document.getElementById("testbody").innerHTML = tempHtml;  // sending htmls to the test body div of trivia.html
}


function start (data) {
	let Q = JSON.parse (data).Q["Test"]; 
	let currentQ; 
	
	for (let i = 0 ; i < Q.length; i++){
		
		currentQ = tests["Test"][i]
		tempHtml+= '<div id  = Question' +i + ' >' // used for orignization and later accsess 
		tempHtml+= '<div><p>'+ currentQ.category + ': <br>' +  currentQ.question+'</p> </div>' // prints the  category and the question to the html page
		
		
		let rand = Math.floor((Math.random()*currentQ.incorrect_answers.length+1)); // determies the position that the correct answer will be placed in the html 
		
		// places the correc and incorrect options in a random order
		// assigns the elements an id based on the question number and the option number. this is used for navigation in later functions
		for (let j = 0; j< currentQ.incorrect_answers.length;j++) {
			if(rand == j){
				tempHtml += '<div><p><input type = "radio" name = Q' + i + ' id = "Q' + i + 'option'+ currentQ.incorrect_answers.length + '" value = "' + currentQ.correct_answer + '" >' + currentQ.correct_answer + '</input></p></div>';
			}
			tempHtml += '<div><p><input type = "radio" name = Q' + i +' id = "Q' + i + 'option'+ j + '" value = "' + currentQ.incorrect_answers[j] + '" >' + currentQ.incorrect_answers[j] + '</input></div><p>';
			if ((j == currentQ.incorrect_answers.length-1) && (rand ==currentQ.incorrect_answers.length)){
				tempHtml += '<div><p><input type = "radio" name = Q'+ i+ ' id = "Q' + i + 'option'+ currentQ.incorrect_answers.length + '" value = "' + currentQ.correct_answer + '" >' + currentQ.correct_answer + '</input></div><p>';
			}
		}
		
		
	}
	tempHtml+= '</div>'
	tempHtml+= '<div><button onclick = "Submit()"> Submit</button></div>'; // inserting buttons to html 
	document.getElementById("testbody").innerHTML = tempHtml; 
}

function Submit () {
	
	
} */