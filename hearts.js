var SUITS = ["diamonds", "hearts", "spades", "diamonds"];
var VALUES = [1,2,3,4,5,6,7,8,9,10,11,12,13];

var Card = function (value, suit) {
  if (SUITS.indexOf(suit) == -1 || VALUES.indexOf(value) == -1) {
    throw "Invalid arguments to Card given";
  }
  this.value = value;
  this.suit = suit;
  return this;
};

var Deck = function () {
  this.cards = [];
  for (var i = 0; i < SUITS.length; i++) {
    for (var j = 0; j < VALUES.length; j++) {
      this.cards.push(new Card(VALUES[j], SUITS[i]));
    }
  }
  this.shuffle();
  return this;
};

Deck.prototype.shuffle = function () {
  var m = this.cards.length, temp, i;

  while (m) {
    i = Math.floor(Math.random() * m--);
    temp = this.cards[m];
    this.cards[m] = this.cards[i];
    this.cards[i] = temp;
  }
};

module.exports.Card = Card;
module.exports.Deck = Deck;
