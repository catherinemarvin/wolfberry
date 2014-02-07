var Player = require("./player").Player;
var Deck = require("./deck").Deck;

var Game = function () {
  this.players = [];
  this.currentTrick = [];
  this.penaltyCardPlayed = false;
  this.firstTrick = true;
  this.currentPlayer = null;
  this.started = false;
  this.deck = new Deck();
  this.ledCard = null;
  this.trickCardToPlayer = {};
  return this;
};

Game.prototype.addPlayer = function (player) {
  if (this.players.indexOf(player) != -1) {
    throw new Error("You're trying to add a player that's already here!");
  }
  if (this.players.map(function (x) { return x.position; }).indexOf(player.position) !== -1) {
    throw new Error("You're trying to add a player in the same position");
  }

  var self = this;
  if (player.position === undefined) {
    var suits = ["north", "south", "east", "west"];
    player.position = suits.filter(function (suit) {
      return self.players.map(function (p) { return p.position; }).indexOf(suit) === -1;
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

  if (player.playCard(card)) {
    // check for whether or not this card is a legal move

    var ledCard = this.currentTrick[0];
    if (ledCard) {
      var ledSuit = ledCard.suit;
      if (card.suit !== ledSuit) {
        matchingSuitCards = player.hand.filter(function (card) {
          return card.suit === ledSuit;
        });
        if (matchingSuitCards.length !== 0) {
          throw new Error("You must follow suit if you can!");
        }
      }
    }
    else {
      if (this.firstTrick) {
        if (card.suit !== "clubs" || card.value !== 2) {
          throw new Error("You must lead with the 2 of clubs");
        }
      }
      if (card.suit === "hearts" && !this.penaltyCardPlayed) {
        throw new Error("Can't lead hearts until it has been broken");
      }
      this.ledCard = card;
    }

    if (card.suit === "hearts") {
      this.penaltyCardPlayed = true;
    }

    var cardTransform = card.value + card.suit;
    this.trickCardToPlayer[cardTransform] = player;
  }
  else {
    throw new Error("Illegal");
  }

  this.currentTrick.push(card);

  if (this.currentTrick.length == this.players.length) {
    this.finishTrick();
  }
  return true;
};

// give tricks to the correct player
Game.prototype.finishTrick = function () {
  var ledCard = this.ledCard;
  var winningCard = this.currentTrick.filter(function (card) {
    return card.suit === ledCard.suit;
  }).reduce(function (prev, curr) {
    if (curr.value > prev.value) {
      return curr;
    }
    else {
      return prev;
    }
  });

  var cardTransform = winningCard.value + winningCard.suit;
  this.trickCardToPlayer[cardTransform].takeTrick(this.currentTrick);
  this.currentTrick = [];
  this.ledCard = null;
  this.penaltyCardPlayed = false;
  this.firstTrick = false;
  this.trickCardToPlayer = {};
}

Game.prototype.scoreRound = function () {
  for (var i = 0; i < this.players.length; i++) {
    players[i].scoreTricks();
  }
};

module.exports.Game = Game;
