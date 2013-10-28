var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var playerSchema = new Schema({
  name: String,
  position: String,
  hand: [{ type: Schema.Types.ObjectId, ref: "Card" }],
  tricks: [{ type: Schema.Types.ObjectId, ref: "Card" }],
  game: { type: Schema.Types.ObjectId, ref: "Game" },
  score: Number
});

playerSchema.methods.receiveCard = function (card) {
  var hand = this.get("hand");
  hand.push(card);
};

playerSchema.methods.playCard = function (card) {
};

Player.prototype.playCard = function (card) {
  var index = this.hand.indexOf(card);
  if (index == -1) {
    throw new Error("Tried to play a card not in your hand!");
  }

  // Logic about whether or not this card is a legal move.

  ledCard = this.game.currentTrick[0];

  if (ledCard) {
    var ledSuit = ledCard.suit;
    if (card.suit !== ledSuit) {
      matchingSuitCards = this.hand.filter(function (card) {
        return card.suit === ledSuit;
      });
      if (matchingSuitCards.length !== 0) {
        throw new Error("You must follow suit if you can!");
      }
    }
  }
  else { // you are the first card to lead
    if (card.suit === "hearts" && this.game.penaltyCardPlayed !== true) {
      throw new Error("You can't lead Hearts until it has been broken");
    }
  }
  this.hand.splice(index, 1);
};

Player.prototype.scoreTricks = function () {
  var newScore = this.tricks.reduce(function (prev, current) {
    if (current.suit === "hearts") {
      return prev + 1;
    }
    else if (current.suit === "spades" && current.value === 12) {
      return prev + 13;
    }
    else return prev;
  }, 0);
  this.score = newScore + this.score;
};

Player.prototype.takeTrick = function (trick) {
  this.tricks = this.tricks.concat(trick);
};

Player.prototype.joinGame = function (game) {
  this.game = game;
};

module.exports.Player = Player;
