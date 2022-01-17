function GameState(sb, socket){
  this.playerType = null;
  this.socket = socket;
  this.turnA = true;
  this.turnB = false;
  this.scoreA = 0;
  this.scoreB = 0;
  //this.scoreB = 0;
  this.sb = sb;

  this.flips = [];

  this.idflips = [];

  this.idmatched = [];

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

const player1score = document.getElementById("player1score");
const player2score = document.getElementById("player2score");


const socket = new WebSocket("ws://localhost:3000");
const gs = new GameState(socket);


let totalmoves = 0;
let whosmove = "A"
let tiles = []

let frontpaths =  ['./1.jpeg','./2.jpeg','./3.jpeg','./4.jpeg']

function nonmatchflip(domtile){
  let helper = domtile.src;
  domtile.src = domtile.alt
  domtile.alt = helper;
  //for non match flips we can add back the eventlistern
  // domtile.addEventListener("click", flip);
  // domtile.addEventListener("click", checkmatch);
  socket.send("FLIP "+domtile.id);
}

function flip(){

  totalmoves += 1;
  let helper = this.src;
  this.src = this.alt
  this.alt = helper;

  gs.idflips.push(this.id);
  gs.flips.push(this);

  //if current user flips tile the tile must also become unclickable for curerntuder
  //until checkmatch is done
  this.removeEventListener("click", flip);
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

function makeunclickable(){
  for(let i = 0; i<16; i++){
    let tiledeactivate = document.getElementById(i);
    tiledeactivate.removeEventListener("click", flip);
    tiledeactivate.removeEventListener("click", checkmatch);
  }
}

function makeclickable(){
  for(let i = 0; i<16; i++){
    if(gs.idmatched.includes(i)){
      continue;
    }
    let tileactivate = document.getElementById(i);
    tileactivate.addEventListener("click", flip);
    tileactivate.addEventListener("click", checkmatch);
  }
}

function checkmatch(){
  //while check matching all the other tile must become unclickable
   let firstflip = gs.flips[0];
   let secondflip = gs.flips[1]

   let firstid = gs.idflips[0];
   let secondid = gs.idflips[1];
   if(gs.flips.length == 2){
     gs.flips = [];
     gs.idflips = [];

     if(firstflip.src == secondflip.src){
       let score = gs.playerType == "A" ? gs.scoreA : gs.scoreB;
       score++
       socket.send("PLAYERMATCHED "+gs.playerType+" "+firstid+" "+secondid+" "+score);
       gs.idmatched.push(firstid);
       gs.idmatched.push(secondid);
       if(gs.playerType == "A"){
         gs.scoreA++
         playerAscore.innerHTML = gs.scoreA;
       }else{
         gs.scoreB++
         playerBscore.innerHTML = gs.scoreB;
       }
       target.innerHTML = "Player "+gs.playerType+" matched!"
       checkwin(gs);


       //we must remove checkmatch for both of them
       firstflip.removeEventListener('click', checkmatch);
       secondflip.removeEventListener('click', checkmatch);
       //now we can make all the other things clickable again

     }else{
       makeunclickable();
       socket.send("NONMATCH");
       setTimeout(function(){
       nonmatchflip(firstflip);
       nonmatchflip(secondflip);

       makeclickable();
     }, 700)
     }


   }

}

function checkwin(gs){
  if((gs.scoreA+gs.scoreB )==8){
    clearInterval(timerId);
    target.innerHTML = "GAME OVER"
    if(gs.scoreA == gs.scoreB){
      target2.innerHTML = "IT'S A TIE";
    }else if (gs.scoreA>gs.scoreB){
      target2.innerHTML = "\nPLAYER A WINS"
    }else{
      target2.innerHTML = "\nPLAYER B WINS"
    }
    makeunclickable();
    socket.send("GAME OVER")
  }
}



function renderBoard(tiles){
  for(var i = 0; i <tiles.length; i++){
    tileonsite = document.createElement('img');
    tileonsite.src = frontpaths[i%4];
    tileonsite.alt = tiles[i];
    tileonsite.height = "100";
    tileonsite.width = "100";
    tileonsite.id = i;
    tileonsite.class = "tile"

    floor.appendChild(tileonsite);
    tileonsite.addEventListener('click', flip);
    tileonsite.addEventListener('click', checkmatch);

  }
}

var timerId = null;
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

    //first we need the game state to know fo which player it is
    //And send some text to the A screen
    if(incomingMsg == "A" || incomingMsg == "B"){
      gs.playerType = incomingMsg;
    }

    if(incomingMsg == "A"){
      makeunclickable();
      target.innerHTML = "You are Player A, waiting for player B";
    }

    if(incomingMsg == "B" || incomingMsg == "B connected"){
      target.innerHTML = "Player B connected";
      makeunclickable();



      setTimeout(function(){
        target.innerHTML = "START!";
        makeclickable();
        var start = Date.now();
        const timerFunction = function(){
          var delta = Date.now() - start;
          document.getElementById("timer-text").innerHTML = Math.floor(delta/1000);
        };
        timerId = setInterval(timerFunction, 1000);




      }, 3000);
    }


    // if(incomingMsg == "B connected"){
    //   makeclickable();
    // }


    //A has been notified that B has joined the game
    // we have to let the game know that its now A's turn
    //because the game state begins with A turn being true we don't have to write
    //code for this
    // we have to indicate to A client that it's his turn


    if(incomingMsg.split(" ")[0] == "FLIP"){
        let backpressedid = incomingMsg.split(" ")[1];
        let tiledpressed = document.getElementById(backpressedid);
        renderflip(backpressedid);
        target.innerHTML = "somebody flipped";

    }

    //if player match remove the event listerner from the tiles

    if(incomingMsg.split(" ")[0] == "PLAYERMATCHED"){

        gs.idmatched.push(parseInt(incomingMsg.split(" ")[2]));
        gs.idmatched.push(parseInt(incomingMsg.split(" ")[3]));
        for(let i = 2; i<4; i++){
          let tilematched  = document.getElementById(incomingMsg.split(" ")[i]);
          tilematched.removeEventListener('click', flip);

          tilematched.removeEventListener('click', checkmatch);

        }
        if(incomingMsg.split(" ")[1] == "A"){
          playerAscore.innerHTML = incomingMsg.split(" ")[4];
          gs.scoreA = parseInt(incomingMsg.split(" ")[4]);
          target.innerHTML = "Player A matched!"
        }else{
          playerBscore.innerHTML = incomingMsg.split(" ")[4];
          gs.scoreB = parseInt(incomingMsg.split(" ")[4]);
          target.innerHTML = "Player B matched!"
        }
        checkwin(gs);


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
