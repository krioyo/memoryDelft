const http = require('http');
const fs = require('fs');
const express = require('express');
const websocket = require('ws');

const messages = require("./static//messages");

const Game = require("./game.js");
const indexRouter = require("./routes/index");
const gameStatus = require("./statTracker");    ///tracks stats javascript
const app = express();

#comment

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/static"));

app.get("/play", indexRouter);
app.get("/", indexRouter);



const server = http.createServer(app).listen(process.env.PORT || 3000);

//helper function that shuffles ararys
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

//the fronts and back url's of all the images
const frontpaths = ['./1.jpeg','./2.jpeg','./3.jpeg','./4.jpeg']
const backpathsurls = ['./backs/A.png', './backs/B.png', './backs/C.png', './backs/D.png','./backs/E.png','./backs/F.png', './backs/G.png', './backs/H.png'];
const backpaths = new Array(2).fill(backpathsurls).flat();
shuffleArray(backpaths);



//websocket shit
const wss = new websocket.Server({ server });

let currentGame = new Game(gameStatus.gamesInitialized);
currentGame.setboardArray(frontpaths, backpaths);
// initialize the game geef het gamide van de hoeveelste game dat ooitbegonnen is op
// de website gameStatus.gamesInitialized++ increased deze getal;


let connectionID = 0; //each websocket receives a unique ID

const websockets = {}; //property: websocket, value: game
let matches = 0;


wss.on("connection", function (ws) {
  /*
   * let's slow down the server response time a bit to
   * make the change visible on the client side
   */
   // two player game: every two players are added to the same game;
   let con = ws
   con["id"] = connectionID++;
   const playerType = currentGame.addPlayer(con);
   websockets[con["id"]] = currentGame;

   console.log(
    `Player ${con["id"]} placed in game ${currentGame.id} as ${playerType}`
    );

    /*
    * inform the client about its assigned player type
    */




    let msgboard = backpaths.toString();

    //send the generated board to the client
    con.send(msgboard);

    //wend which player the client is to the client
    con.send(playerType);


    // connectoin of B is special since this is when the game start so we  send an
    //extra message for this event
    if (playerType == "B"){
      currentGame.playerA.send("B connected");
      currentGame.startTime = Date.now();
    }


    /*
   * once we have two players, there is no way back;
   * a new game object is created;
   * if a player now leaves, the game is aborted (player is not preplaced)
   */
    if (currentGame.hasTwoConnectedPlayers()) {
      shuffleArray(backpaths);
      currentGame = new Game(gameStatus.gamesInitialized++);
      currentGame.setboardArray(frontpaths, backpaths);
      gameStatus.gamesGoingOn++;

    }
    //websockets[con.id] = currentGame;

    //ws.send(JSON.stringify(currentGame.getboardArray));
    console.log("Thanks for the message. --Your server.");
  //  con.send((playerType == "A") ? messages.S_PLAYER_A : messages.S_PLAYER_B);
  //  console.log(
  //   `Player ${con["id"]} placed in game ${currentGame.id} as ${playerType}`
  // );


  // nrplayers += 1;
  // if(nrplayers == 1 ){
  //     ws.send(nrplayers);
  //     setTimeout(function (){
  //         ws.send(nrplayers)}, 10000);
  //     };
  //
  // //ws.send(nrplayer);
  // if(nrplayers >= 2){
  //   for(let i = 1; i <=nrplayers; i++){
  //       ws.send(i);
  //   }
  // }

  // setTimeout(function () {
  //   console.log("Connection state: " + ws.readyState);
    //ws.send("Thanks for the message. --Your server.");
//    for(let i = 1; i<=nrplayers+1; i++){
//        ws.send(i);
//    }
    //ws.send(nrplayers);
//    for(let i = 0; i < nrplayers; i++){
//        ws.send(i);
//    }
  //   console.log("Connection state: " + ws.readyState);
  // }, 10000);

  con.on("message", function incoming(message) {

    let incomingMsg = message.toString();


    const gameObj = websockets[con["id"]];
    //let outgoingMsg = messages.O_TEST;

    //boolean to check if message received is from player A or not
    const isPlayerA = gameObj.playerA == con ? true : false;

    if(incomingMsg == "GAME OVER"){

      //because server will get game over message from both clients
      gameStatus.gamesGoingOn -= 0.5;
      const time = Math.floor((Date.now()-gameObj.startTime) /1000);
      const longestime = gameStatus.longestGame;
      if(longestime < time){
        gameStatus.longestGame = time
      }
      }

    if(incomingMsg.split(" ")[0] == "FLIP"){
      if(isPlayerA){
        gameObj.playerB.send(incomingMsg);
      }else{
        gameObj.playerA.send(incomingMsg);
      }

        //gameObj.playerA.send(incomingMsg);
      }
    if(incomingMsg.split(" ")[0] == "PLAYERMATCHED"){
      matches += 1;
      if(matches == 8){
        gameObj.playerB.send("GAME OVER");
        gameObj.playerA.send("GAME OVER");
      }

      if(isPlayerA){
        gameObj.playerB.send(incomingMsg);
      }else{
        gameObj.playerA.send(incomingMsg);
      }

        //gameObj.playerA.send(incomingMsg);
      }

    if(incomingMsg.split(" ")[0] == "SCORE"){
      console.log("scored")
      if(isPlayerA){
        gameObj.playerB.send(incomingMsg);
      }else{
        gameObj.playerA.send(incomingMsg);
      }

        //gameObj.playerA.send(incomingMsg);
      }


//    if (message.type == messages.FLIP) {
//        con.send(outgoingMsg);
//
//    }




    //if player A made the move
    // if (isPlayerA) {
    //   /*
    //    * player A cannot do a lot, just send the target word;
    //    * if player B is already available, send message to B
    //    */
    //   if (message.type == messages.FLIP) {
    //     if (gameObj.hasTwoConnectedPlayers()) {
    //       gameObj.playerB.send(outgoingMsg);
    //     }
    //   }
    // }
    //ws.send("user"+message.user "says:" + message.msg);
    //ws.close();
    //you can also send shit back remmevber
  });

  con.on("close", function(code){
    console.log(`${con["id"]} disconnected....`)


    if((gameStatus.gamesGoingOn-1)<0){
      gameStatus.gamesGoingOn = 0;
    }else{
      gameStatus.gamesGoingOn -= 1;
    }
  });
});




// app.get("/1.png", function (req, res) {
//   res.writeHead(200, { 'content-type': 'image/png' })
//   fs.createReadStream('./static/1.png').pipe(res)
// });
//
// server.listen(process.env.PORT || 3000)
