var mongoose = require("mongoose");
var cardSchema = new mongoose.Schema({
  value: { type: Number, min: 1, max: 13 },
  suit: { type: String, match: /clubs|hearts|spades|diamonds/ }
});

var Card = mongoose.model("Card", cardSchema);

module.exports.cardSchema = cardSchema;

module.exports.Card = Card;
