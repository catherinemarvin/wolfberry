var Player = require("./player").Player;
var Deck = require("./deck").Deck;

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var gameSchema = new Schema({
  players: Array,
  currentTrick: Array,
  penaltyCardPlayed: Boolean,
  firstTrick: Array,
  currentPlayer: Schema.Types.Mixed,
  deck: Schema.Types.Mixed
});

gameSchema.methods.prepare = function () {
  this.deck = new Deck();
};

gameSchema.methods.addPlayer = function (player) {
  var players = this.get("players");

  if (players.indexOf(player) != -1) {
    throw new Error("You're trying to add a player that's already here!");
  }
  if (players.map(function (x) { return x.get("position"); }).indexOf(player.get("position")) != -1) {
    throw new Error("You're trying to add a player in the same position");
  }

  players.push(player);
  this.set("players", players);
};

gameSchema.methods.startGame = function () {
  var players = this.get("players");

  if (players.length != 4) {
    throw new Error("You can't start a game unless you have four players");
  }

  var currentPlayerId = 0;

  var deck = this.get("deck");
  var cards = this.get("cards");
};

Game.prototype.startGame = function () {
  if (this.players.length != 4) {
    throw new Error("You can't start a game unless you have four players");
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
