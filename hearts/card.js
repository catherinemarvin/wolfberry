var SUITS = ["clubs", "hearts", "spades", "diamonds"];
var VALUES = [1,2,3,4,5,6,7,8,9,10,11,12,13];

var mongoose = require("mongoose");
var cardSchema = new mongoose.Schema({
  value: { type: Number, min: 1, max: 13 },
  suit: { type: String, match: /clubs|hearts|spades|diamonds/ }
});

var Card = mongoose.model("Card", cardSchema);

module.exports.Card = Card;
