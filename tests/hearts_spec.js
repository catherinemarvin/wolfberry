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
      try {
        badCard = new hearts.Card(5, "bananas");
      }
      catch (e) {
        e.should.equal("Invalid arguments to Card given");
      }
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
    it("should let you play cards in your hand and also remove them", function () {
      var player = new hearts.Player("Twilight", "north");
      var card1 = new hearts.Card(5, "spades");
      var card2 = new hearts.Card(10, "hearts");

      player.receiveCard(card1);

      player.playCard(card1);

      player.hand.length.should.equal(0);

      try {
        player.playCard(card2);
      }
      catch (e) {
        e.should.equal("Tried to play a card not in your hand!");
      }
    });
  });
});

describe("Game", function () {
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
});
