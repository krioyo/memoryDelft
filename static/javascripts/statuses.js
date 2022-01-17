function StatusBar(){
  this.setStatus = function(status){
    document.getElementById("status").innerHTML = status;
  }
}

const Status = {
   gameWon: "Congratulations! You won! ",
   gameLost: "Game over. You lost! ",
   playAgain: "&nbsp;<a href='/play'>Play again!</a>",
   playerAIntro: "Welcome player A, waiting for player B",
   playerBIntro: "Welcome player B, waiting for player A's turn",
   playerAturn: "It's player A's turn",
   playerBturn: "It's player B's turn",
   Acorrect: "Player A flipped corerctly",
   Bcorrect: "Player B flipped corerctly",
   aborted: "Your gaming partner is no longer available, game aborted. <a href='/play'>Play again!</a>"
}
