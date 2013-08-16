var Card = function (value, suit) {
  SUITS = ["diamonds", "hearts", "spades", "diamonds"];
  VALUES = [1,2,3,4,5,6,7,8,9,10,11,12,13];
  if (SUITS.indexOf(suit) == -1 || VALUES.indexOf(value) == -1) {
    throw "Invalid arguments to Card given";
  }
  this.value = value;
  this.suit = suit;
  return this;
};

module.exports.Card = Card;
