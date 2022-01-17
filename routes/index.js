const express = require("express");
const router = express.Router();

const gameStatus = require("../statTracker");
/* GET home page
router.get("/splash", function(req, res) {
  res.sendFile("splash.html", { root: "./public" });
});
*/

/* Pressing the 'PLAY' button, returns this page */
router.get("/play", function(req, res) {
  res.sendFile("game.html", { root: "./static" });
});

/* GET home page */
router.get("/", function(req, res) {
  res.render("splash.ejs", {
    gamesInitialized: gameStatus.gamesInitialized,
    gamesGoingOn: gameStatus.gamesGoingOn,
    longestGame: gameStatus.longestGame,
  });
});

module.exports = router;
