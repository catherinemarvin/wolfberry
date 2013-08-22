var should = require("should");
var hearts = require("../../hearts/");

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
