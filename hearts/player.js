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
  var cards = this.get("hand");

  var index = this.hand.indexOf(card);

  if (index == -1) {
    throw new Error("Tried to play a card not in your hand!");
  }

  var ledCard = this.get("game").currentTrick[0];

  if (ledCard) {
    var ledSuit = ledCard.get("suit");
    if (card.get("suit") !== ledSuit) {
      matchingSuitCards = this.get("hand").filter(function (card) {
        return card.get("suit") === ledSuit;
      });
      if (matchingSuitCards.length !== 0) {
        throw new Error("You must follow suit if you can!");
      }
    }
  }
  else { // you are the first card to lead
    if (card.get("suit") === "hearts" && this.get("game").penaltyCardPlayed !== true) {
      throw new Error("You can't lead Hearts until it has been broken");
    }
  }
  var hand = this.get("hand");
  hand.splice(index, 1);
  this.set("hand", hand);
};

playerSchema.methods.playCard = function () {
  var newScore = this.get("tricks").reduce(function (prev, current) {
    if (current.get("suit") === "hearts") {
      return prev + 1;
    }
    else if (current.suit === "spades" && current.get("value") === 12) {
      return prev + 13;
    }
    else return prev;
  }, 0);
  this.set("score", newScore + this.get("score"));
};

playerSchema.methods.takeTrick = function (trick) {
  var tricks = this.get("tricks");
  tricks.concat(trick);
  this.set("tricks", tricks);
};

playerSchema.methods.joinGame = function (game) {
  this.set("game", game);
};

var Player = mongoose.model("Player", playerSchema);

module.exports.Player = Player;
