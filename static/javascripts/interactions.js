function GameState(sb, socket){
  this.playerType = null;
  this.socket = socket;
  this.turnA = true;
  this.turnB = false;
  this.scoreA = 0;
  this.scoreB = 0;
  this.sb = sb;

}

GameState.prototype.increaseScoreA = function(){
  this.scoreA++;
}

GameState.prototype.increaseScoreB = function(){
  this.scoreB++;
}

GameState.prototype.getPlayerType = function(){
  return this.playerType;
}

GameState.prototype.setPlayerType = function(p){
  this.playerType = p;
}

GameState.prototype.getScoreA = function(){
  return this.scoreA;
}

GameState.prototype.getScoreB = function(){
  return this.scoreB;
}





const target = document.getElementById("hello");
const target2 = document.getElementById("hello2");
const floor = document.querySelector('.floor');

const socket = new WebSocket("ws://localhost:3000");


let totalmoves = 0;
let whosmove = "A"
let tiles = []

let frontpaths =  ['../1.jpeg','../2.jpeg','../3.jpeg','../4.jpeg']

function flip(){
  totalmoves += 1;
  let helper = this.src;
  this.src = this.alt
  this.alt = helper;

  let outgoingMsg = Messages.O_FLIP
  outgoingMsg.number = (totalmoves % 2)
  outgoingMsg.id = this.id
  socket.send("FLIP "+this.id);
  //send which tile you flippe
  //this.socket.send()
  // let outgoingMsg = Messages.O_FLIP
  // outgoingMsg.number = (totalmoves % 2)
  // outgoingMsg.id = this.id
  // socket.send(JSON.stringify(outgoingMsg)
//  let outgoingMsg = Messages.O_FLIP
//  outgoingMsg.number = (totalmoves % 2)
//  outgoingMsg.id = this.id
//  socket.send("flipped");
}

//receive that the other player has flippedd and thus render the flip for this client
function renderflip(id){
  let tiledpressed = document.getElementById(id);

  let helper = tiledpressed.src;
  tiledpressed.src = tiledpressed.alt
  tiledpressed.alt = helper;

}




function renderBoard(tiles){
  for(var i = 0; i <tiles.length; i++){
    tileonsite = document.createElement('img');
    tileonsite.src = frontpaths[i%4];
    tileonsite.alt = tiles[i];
    tileonsite.height = "100";
    tileonsite.width = "100";
    tileonsite.id = i;

    floor.appendChild(tileonsite);
    tileonsite.addEventListener('click', flip);

  }
}

//set everything up, including the WebSocket
function start() {


  /*
   * initialize all UI elements of the game:
   * - visible word board (i.e. place where the hidden/unhidden word is shown)
   * - status bar
   * - alphabet board
   *
   * the GameState object coordinates everything
   */
  // @ts-ignore
  //const sb = new StatusBar();

  //no object, just a function
  // @ts-ignore
  //createBalloons();

  //const gs = new GameState(sb, socket);


  socket.onmessage = function (event) {
    let incomingMsg = event.data;

    if(incomingMsg.split(",").length == 16){
        renderBoard(incomingMsg.split(","));
        console.log(incomingMsg.split(","));
        target.innerHTML = "Welcome";
    }

    if(incomingMsg.split(" ")[0] == "FLIP"){
        let backpressedid = incomingMsg.split(" ")[1];
        let tiledpressed = document.getElementById(backpressedid);
        renderflip(backpressedid);
        target.innerHTML = "somebody flipped";

    }


  };

  socket.onopen = function () {
    socket.send("{}");
  };

  //server sends a close event only if the game was aborted from some side
  socket.onclose = function () {
    if (gs.whoWon() == null) {
      sb.setStatus(Status["aborted"]);
    }
  }
};



start();

// socket.onopen = function () {
//
//
// };
//
// socket.onmessage = function(event){
//   let incomingMsg = event.data;
//   //set player type
//
//     if(incomingMsg.split(",").length == 16){
//         renderBoard(incomingMsg.split(","));
//         console.log(incomingMsg.split(","));
//         target.innerHTML = "Welcome";
//     }
//
//     //receive the message that the other player has flipped
//     //thus we also need to render the flip and also disable the boardArray
//
//     if(incomingMsg.split(" ")[0] == "FLIP"){
//         let backpressedid = incomingMsg.split(" ")[1];
//         let tiledpressed = document.getElementById(backpressedid);
//         renderflip(backpressedid);
//         target.innerHTML = "somebody flipped";
//
//     }
//
//
//
// //    if (incomingMsg.type == Messages.T_TEST) {
// //      target.innerHTML = incomingMsg.data;
// //    };
//
// //    if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
// //      target.innerHTML = "player "+incomingMsg.data+" connected";
// //    };
// //
// //    if(incomingMsg.type == Messages.T_BOARD){
// //      target2.innerHTML = incomingMsg.data;
// //
// //      renderBoard(incomingMsg.data);
// //      console.log(incomingMsg.datas);
// //    }
// //
// //    if (incomingMsg.type == Messages.T_FLIP){
// //      //let toflip = document.getElementById(incomingMsg.id);
// //
// //    }
//
//     //we want to check that evry two players get a new game
//     // and so a new kind of board
//     //this means we gotta copt all the player checks and game status checks.
//
//
//
// };
