var should = require("should");
var hearts = require("../../hearts/");

describe("Game", function () {
  describe("#addPlayer", function () {
    it("should add new player", function () {
      var game = new hearts.Game();
      var player1 = new hearts.Player("Applejack", "north");
      var player2 = new hearts.Player("Pinkie", "north");
      game.addPlayer(player1);
      game.players.length.should.equal(1);
    });
    it("should not let you add an already-added player", function () {
      var game = new hearts.Game();
      var player1 = new hearts.Player("Applejack", "north");
      var player2 = new hearts.Player("Pinkie", "north");
      game.addPlayer(player1);
      (function () {
        game.addPlayer(player1);
      }).should.throwError("You're trying to add a player that's already here!");
    });
    it("should not let you add a player at the same position", function () {
      var game = new hearts.Game();
      var player1 = new hearts.Player("Applejack", "north");
      var player2 = new hearts.Player("Pinkie", "north");
      game.addPlayer(player1);
      (function () {
        game.addPlayer(player2);
      }).should.throwError("You're trying to add a player in the same position");
    });
    it("should let you add a position-less player and put him in a place", function () {
      var game = new hearts.Game();
      var player1 = new hearts.Player("John");
      game.addPlayer(player1);
      player1.position.should.not.equal(undefined);
    });
  });
  describe("#startGame", function () {
    it("should set the game up properly", function () {
      var game = new hearts.Game();
      var player1 = new hearts.Player("Twilight", "north");
      var player2 = new hearts.Player("Rainbow", "west");
      var player3 = new hearts.Player("Rarity", "south");
      var player4 = new hearts.Player("Fluttershy", "east");

      game.addPlayer(player1);
      game.addPlayer(player2);
      game.addPlayer(player3);
      game.addPlayer(player4);

      game.startGame();

      player1.hand.length.should.equal(13);
      player2.hand.length.should.equal(13);
      player3.hand.length.should.equal(13);
      player4.hand.length.should.equal(13);
    });
    it("should not start a game with less than four people", function () {
      var game = new hearts.Game();
      (function () {
        game.startGame();
      }).should.throwError("You can't start a game unless you have four players");
    });
    it("should not start a game that has already started", function () {
      var game = new hearts.Game();
      var player1 = new hearts.Player("Twilight", "north");
      var player2 = new hearts.Player("Rainbow", "west");
      var player3 = new hearts.Player("Rarity", "south");
      var player4 = new hearts.Player("Fluttershy", "east");

      game.addPlayer(player1);
      game.addPlayer(player2);
      game.addPlayer(player3);
      game.addPlayer(player4);

      game.startGame();
      (function () {
        game.startGame();
      }).should.throwError("You can't start a game that has already started");
    });
  });
  describe("#playedCard", function () {
    it("should let you play a legal card", function () {
      var game = new hearts.Game();
      var card1 = new hearts.Card(5, "spades");
      var player1 = new hearts.Player("Twilight", "north");
      game.addPlayer(player1);
      game.playedCard(player1, card1);

      game.currentTrick.indexOf(card1).should.equal(0);
    });

    it("should not let you play a card that's already been played", function () {
      var game = new hearts.Game();
      var card1 = new hearts.Card(5, "spades");
      var player1 = new hearts.Player("Twilight", "north");
      var player2 = new hearts.Player("Rarity", "south");
      game.addPlayer(player1);
      game.addPlayer(player2);

      game.playedCard(card1);
      (function () {
        game.playedCard(card1);
      }).should.throwError("You're trying to play a card that's already been played");
    });
    it("should not let you play a card if it exceeds the number of players", function () {
      var game = new hearts.Game();
      var player1 = new hearts.Player("Twilight", "north");
      var card1 = new hearts.Card(5, "spades");
      var card2 = new hearts.Card(10, "hearts");
      game.addPlayer(player1);

      game.playedCard(card1);
      (function () {
        game.playedCard(card2);
      }).should.throwError("You're trying to play more cards on this trick than the number of players");
    });
  });
});
