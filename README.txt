Name: Sepehr eslami amirabadi
Id :101112474 

Instructions: 
- run trivia_server.js
- then open as many localhost:3000 instances as you want
- make sure to close all localhost 3000 pages before running the server
	- if you dont it automatically connects you to the server as undefined and causes issues
- after running the server open localhost:3000
- enter your name then click join 
- then answer the questions and click submit 
- you will not be allowed to submit more than once 
- to use the messenger simply click of the text window, type and click send
- to acsess the stas page click on the statistics link


Design choices: 

- i was pressed for time so it is pretty ugly (sorry about that) but it functions properly
- some info is stored client side so that too many requests dont have to be made to the server
- the timer is displayed in the top right side of the page
- if someone deos not answer a question before the time runs out they dont lose or gain any points 
-the right side of the page is used for messaging
- there is a link to the statistics page at the bottom but you will no be able to return to the game when you click on it 
- after a round finishes the server waits 5 seconds allowing the users to read the winners name then it loads the next round
- keep in mind since i implemented the countdown extention the next question will be loaded when the timer
expires instead of when everyone has answered




Extensions add to server: 

Countdown timer for Questions 
-each question is given 20 seconds 
- after the timer ends the next question is loaded automatically 
- if the user answers in less than 5 seconds they get 175 points 
- if the user answers in less than 10 seconds they get 150 points 
- if the user answers in less than 15 seconds they get 125 points 
- otherwise they get the typical 100 points 
- if its wrong they lose 100 points regardless of the time


Stats page: 
- lists stats
- entering the page causes the player to be removed from the game so only check it when you are done playing


Chat window
- the right side of the page is dedicated to the messaging system
- allows users to send each other messages
- informs players when a new user joins 
- informs players whn someone answers a question 