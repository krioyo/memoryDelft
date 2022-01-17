//@ts-check

/**
 * In-game stat tracker.
 * Once the game is out of prototype status, this object will be backed by a database.
 */
 // this the shit voor de splash screen
const gameStatus = {
  since: Date.now() /* since we keep it simple and in-memory, keep track of when this object was created */,
  gamesInitialized: 0 /* number of games initialized */,
  gamesGoingOn: 0 /* number of games aborted */,
  longestGame: 0 /* number of games successfully completed */
};

module.exports = gameStatus;
