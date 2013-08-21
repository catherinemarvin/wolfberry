var should = require("should");
var card = require("../../hearts/card.js");

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
