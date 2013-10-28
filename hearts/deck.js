var SUITS = ["clubs", "diamonds", "hearts", "spades"];
var VALUES = [1,2,3,4,5,6,7,8,9,10,11,12,13];

var mongoose = require("mongoose");
var Card = require("./card").Card;
var Schema = mongoose.Schema;

var deckSchema = new Schema({
  cards: [{ type: Schema.Types.ObjectId, ref: "Card" }]
});

deckSchema.methods.prepare = function () {
  var cards = [];
  for (var i = 0; i < SUITS.length; i++) {
    for (var j = 0; j < VALUES.length; j++) {
      cards.push(new Card({ value: VALUES[j], suit: SUITS[i]}));
    }
  }
  shuffle(cards);
  this.set("cards", cards);
};

deckSchema.methods.dealCard = function () {
  var cards = this.get("cards");
  var topCard = cards.shift();
  this.set("cards", cards);
  return topCard;
}

// Helper method: shuffles the array.
var shuffle = function (cards) {
  var m = cards.length, temp, i;

  while (m) {
    i = Math.floor(Math.random() * m--);
    temp = cards[m];
    cards[m] = cards[i];
    cards[i] = temp;
  }
}

var Deck = mongoose.model("Deck", deckSchema);

module.exports.Deck = Deck;
