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
      deck = new hearts.Deck();
      deck.cards.length.should.equal(52);
    });
  });
  describe("dealing a card", function () {
    it("should give a card and remove it from the deck", function () {
      deck = new hearts.Deck();
      var card = deck.dealCard();
      deck.cards.indexOf(card).should.equal(-1);
    });
  });
});
