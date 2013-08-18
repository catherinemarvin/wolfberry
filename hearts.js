var SUITS = ["diamonds", "hearts", "spades", "diamonds"];
var VALUES = [1,2,3,4,5,6,7,8,9,10,11,12,13];

var Card = function (value, suit) {
  if (SUITS.indexOf(suit) == -1 || VALUES.indexOf(value) == -1) {
    throw new Error("Invalid arguments to Card given");
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

Deck.prototype.dealCard = function () {
  return this.cards.shift();
};

var Player = function (name, position) {
  this.name = name;
  this.position = position;
  this.hand = [];
  this.tricks = [];

  return this;
};

Player.prototype.receiveCard = function (card) {
  this.hand.push(card);
};

Player.prototype.playCard = function (card) {
  var index = this.hand.indexOf(card);
  if (index == -1) {
    throw new Error("Tried to play a card not in your hand!");
  }
  this.hand.splice(index, 1);
};

var Game = function () {
  this.players = [];
  this.currentTrick = [];
  this.penaltyCardPlayed = false;
  this.firstTrick = [];
  this.currentPlayer = null;
  this.deck = new Deck();
  return this;
};

Game.prototype.addPlayer = function (player) {
  if (this.players.indexOf(player) != -1) {
    throw new Error("You're trying to add a player that's already here!");
  }
  if (this.players.map(function (x) { return x.position; }).indexOf(player.position) != -1) {
    throw new Error("You're trying to add a player in the same position");
  }
  this.players.push(player);
};

Game.prototype.startGame = function () {
  var currentPlayerId = 0;
  while (this.deck.cards.length > 0) {
    card = this.deck.cards.shift();
    this.players[currentPlayerId].receiveCard(card);
    if (currentPlayerId < this.players.length - 1) {
      currentPlayerId++;
    }
    else {
      currentPlayerId = 0;
    }
  }
};

module.exports.Card = Card;
module.exports.Deck = Deck;
module.exports.Player = Player;
module.exports.Game = Game;
