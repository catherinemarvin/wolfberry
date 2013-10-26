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
  var cards = deck.get("cards");

  var currentPlayerId = 0;

  while (cards.length > 0) {
    players[currentPlayerId].receiveCard(deck.dealCard());
    if (currentPlayerId < players.length - 1) {
      currentPlayerId++;
    }
    else {
      currentPlayerId = 0;
    }
  }
};

gameSchema.methods.playedCard = function (card) {
  var currentTrick = this.get("currentTrick");
  currentTrick.push(card);
  this.set(currentTrick, currentTrick);
  return true;
};

gameSchema.methods.scoreRound = function () {
  var players = this.get("players");
  for (var i = 0; i < players.length; i++) {
    players[i].scoreTricks();
  }
};

module.exports.Game = Game;
