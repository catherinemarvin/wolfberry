var should = require("should");
var hearts = require("../hearts.js");

describe("Cards", function () {
  describe("initialization", function () {
    it("should correctly set values and suits", function () {
      newCard = new hearts.Card(5, "spades");
      newCard.value.should.equal(5);
      newCard.suit.should.equal("spades");
    });
    it("should disallow improper values and suits", function () {
      (function () {
        badCard = new hearts.Card(5, "bananas");
      }).should.throwError("Invalid arguments to Card given");
    });
  });
});

describe("Deck", function () {
  describe("initialization", function () {
    it("should create a deck with 52 cards", function () {
      var deck = new hearts.Deck();
      deck.cards.length.should.equal(52);
    });
  });
  describe("dealing a card", function () {
    it("should give a card and remove it from the deck", function () {
      var deck = new hearts.Deck();
      var card = deck.dealCard();
      deck.cards.indexOf(card).should.equal(-1);
    });
  });
});

describe("Player", function () {
  describe("#receiveCard", function () {
    it("should let you receive cards and add them to your hand", function () {
      var player = new hearts.Player("Twilight", "north");
      var card1 = new hearts.Card(5, "spades");
      var card2 = new hearts.Card(10, "hearts");
      player.hand.indexOf(card1).should.equal(-1);

      player.receiveCard(card1);
      player.receiveCard(card2);

      player.hand.length.should.equal(2);
      player.hand.indexOf(card1).should.not.equal(-1);
      player.hand.indexOf(card2).should.not.equal(-1);
    });
  });

  describe("#playCard", function () {
    beforeEach(function () {
      player = new hearts.Player("Twilight", "north");
      card1 = new hearts.Card(5, "spades");
      card2 = new hearts.Card(10, "hearts");
      game = new hearts.Game();
      player.joinGame(game);

    });

    it("should let you play cards in your hand and also remove them", function () {

      player.receiveCard(card1);
      player.playCard(card1);

      player.hand.length.should.equal(0);

      (function () {
        player.playCard(card2);
      }).should.throwError("Tried to play a card not in your hand!");
    });

    it("should not let you play hearts if they have not been broken", function () {
      player.receiveCard(card1);
      player.receiveCard(card2);
      (function () {
        player.playCard(card2);
      }).should.throwError("You can't lead Hearts until it has been broken");
    });

    it("should make sure you follow suit", function () {
      player.receiveCard(card1);
      player.receiveCard(card2);

      game.currentTrick = [new hearts.Card(11, "hearts")];

      (function () {
        player.playCard(card1);
      }).should.throwError("You must follow suit if you can!");
    });
  });
  describe("#takeTrick", function () {
    it("should add the list of tricks to your hand", function () {
      var player = new hearts.Player("Twilight", "north");
      player.tricks.length.should.equal(0);

      var card1 = new hearts.Card(5, "spades");
      var card2 = new hearts.Card(6, "spades");
      var card3 = new hearts.Card(7, "spades");
      var card4 = new hearts.Card(8, "hearts");
      var trick = [card1, card2, card3, card4];

      player.takeTrick(trick);

      player.tricks.length.should.equal(4);
      player.tricks.indexOf(card1).should.not.equal(-1);
    });
  });
  describe("#scoreTricks", function () {
    it("should properly add up the total number of points", function () {
      var player = new hearts.Player("Twilight", "north");

      var card1 = new hearts.Card(5, "hearts");
      var card2 = new hearts.Card(6, "spades");
      var card3 = new hearts.Card(12, "spades");
      var card4 = new hearts.Card(8, "hearts");

      player.tricks = [card1, card2, card3, card4];

      player.score.should.equal(0);

      player.scoreTricks();

      player.score.should.equal(15);
    });
  });
});

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
