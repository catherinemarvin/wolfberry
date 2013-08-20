var SUITS = ["clubs", "hearts", "spades", "diamonds"];
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
  this.game = null;
  this.score = 0;

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

Game.prototype.playedCard = function (player, card) {
  if (this.currentTrick.length >= this.players.length) {
    throw new Error("You're trying to play more cards on this trick than the number of players");
  }
  if (this.currentTrick.indexOf(card) != -1) {
    throw new Error("You're trying to play a card that's already been played");
  }

  this.currentTrick.push(card);
  return true;
};

Game.prototype.scoreRound = function () {
  for (var i = 0; i < this.players.length; i++) {
    players[i].scoreTricks();
  }
};

module.exports.Card = Card;
module.exports.Deck = Deck;
module.exports.Player = Player;
module.exports.Game = Game;
