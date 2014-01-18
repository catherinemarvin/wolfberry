var Player = require("./player").Player;
var Deck = require("./deck").Deck;

var Game = function () {
  this.players = [];
  this.currentTrick = [];
  this.penaltyCardPlayed = false;
  this.firstTrick = [];
  this.currentPlayer = null;
  this.started = false;
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

  var self = this;
  if (player.position === undefined) {
    var suits = ["north", "south", "east", "west"];
    player.position = suits.filter(function (suit) {
      return self.players.map(function (p) { return p.position; }).indexOf(suits) === -1;
    })[0];
  }
  this.players.push(player);
};

Game.prototype.startGame = function () {
  if (this.players.length != 4) {
    throw new Error("You can't start a game unless you have four players");
  }

  if (this.started) {
    throw new Error("You can't start a game that has already started");
  }

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
  randomInt = Math.floor(Math.random() * 4);
  this.currentPlayer = this.players[randomInt];
  this.started = true;
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

module.exports.Game = Game;
