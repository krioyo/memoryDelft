const websocket = require("ws");

function tile(front, back){
  this.front = front   //string url of front image
  this.back = back    //string url of back image
  this.DomElement = {}
  this.DomElement.src = this.front;
  this.DomElement.alt = this.back;
  this.DomElement.width="100";
  this.DomElement.height="100";

  this.getFront = function(){
    return this.front;
  }

  this.getBack = function(){
    return this.Back;
  }

  this.getDomElement = function(){
    return this.DomElement;
  }

  //equality check

  this.equals = function(that){
    return (this.front === that.front)
  }
}

const game = function(gameID) {
  this.playerA = null;
  this.playerB = null;
  this.id = gameID;
  this.boardArray = [];
  this.startTime = 0;
  this.gameState = "0 JOINT"; //"A" means A won, "B" means B won, "ABORTED" means the game was aborted
};





/*
 * All valid transition states are keys of the transitionStates object.
 */

game.prototype.transitionStates = {
      "0 JOINT": 0,
      "1 JOINT": 1,
      "2 JOINT": 2,
      "CHAR GUESSED": 3,
      "A": 4, //A won
      "B": 5, //B won
      "ABORTED": 6
};

/*
 * Not all game states can be transformed into each other; the transitionMatrix object encodes the valid transitions.
 * Valid transitions have a value of 1. Invalid transitions have a value of 0.
 */

game.prototype.transitionMatrix = [
  [0, 1, 0, 0, 0, 0, 0], //0 JOINT
  [1, 0, 1, 0, 0, 0, 0], //1 JOINT
  [0, 0, 0, 1, 0, 0, 1], //2 JOINT (note: once we have two players, there is no way back!)
  [0, 0, 0, 1, 1, 1, 1], //CHAR GUESSED
  [0, 0, 0, 0, 0, 0, 0], //A WON
  [0, 0, 0, 0, 0, 0, 0], //B WON
  [0, 0, 0, 0, 0, 0, 0] //ABORTED
];

/**
 * Determines whether the transition from state `from` to `to` is valid.
 * @param {string} from starting transition state
 * @param {string} to ending transition state
 * @returns {boolean} true if the transition is valid, false otherwise
 */
game.prototype.isValidTransition = function(from, to) {
  let i, j;
  if (!(from in game.prototype.transitionStates)) {
    return false;
  } else {
    i = game.prototype.transitionStates[from];
  }

  if (!(to in game.prototype.transitionStates)) {
    return false;
  } else {
    j = game.prototype.transitionStates[to];
  }

  return game.prototype.transitionMatrix[i][j] > 0;
};



/**
 * Updates the game status to `w` if the state is valid and the transition to `w` is valid.
 * @param {string} w new game status
 */
game.prototype.setStatus = function(w) {
  if (
    game.prototype.isValidState(w) &&
    game.prototype.isValidTransition(this.gameState, w)
  ) {
    this.gameState = w;
    console.log("[STATUS] %s", this.gameState);
  } else {
    return new Error(
      `Impossible status change from ${this.gameState} to ${w}`
    );
  }
};


/**
 * Update the word to guess in this game.
 * @param {array} frontimages array with the front images
 * @param {array} backimages already shuffled array with the back images

 * @returns
 */
game.prototype.setboardArray = function(frontimages, backimages) {


  //two possible options for the current game state:
  //1 JOINT, 2 JOINT
  // if (this.gameState != "1 JOINT" && this.gameState != "2 JOINT") {
  //   return new Error(
  //     `Trying to set board, but game status is ${this.gameState}`
  //   );
  // }

  for (let i =0; i<backimages.length; i++){
    this.boardArray.push(new tile(frontimages[i%4], backimages[i]));
  }
};

/**
 * Determines whether the state `s` is valid.
 * @param {string} s state to check
 * @returns {boolean}
 */
game.prototype.isValidState = function(s) {
  return s in game.prototype.transitionStates;
};


/**
 * Retrieves the word to guess.
 * @returns {array} the word to guess
 */
game.prototype.getboardArray = function() {
  return this.boardArray;
};


/**
 * Checks whether the game is full.
 * @returns {boolean} returns true if the game is full (2 players), false otherwise
 */
game.prototype.hasTwoConnectedPlayers = function() {
  return this.gameState == "2 JOINT";
};

/**
 * Adds a player to the game. Returns an error if a player cannot be added to the current game.
 * @param {websocket} p WebSocket object of the player
 * @returns {(string|Error)} returns "A" or "B" depending on the player added; returns an error if that isn't possible
 */
game.prototype.addPlayer = function(p) {
  if (this.gameState != "0 JOINT" && this.gameState != "1 JOINT") {
    return new Error(
      `Invalid call to addPlayer, current state is ${this.gameState}`
    );
  }

  const error = this.setStatus("1 JOINT");
  if (error instanceof Error) {
    this.setStatus("2 JOINT");
  }

  if (this.playerA == null) {
    this.playerA = p;
    return "A";
  } else {
    this.playerB = p;
    return "B";
  }
};

module.exports = game;
