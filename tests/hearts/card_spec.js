var should = require("should");
var hearts = require("../../hearts/");

describe("Cards", function () {
  describe("initialization", function () {
    it("should correctly set values and suits", function () {
      newCard = new hearts.Card({ value: 5, suit: "spades"});
      newCard.get("value").should.equal(5);
      newCard.get("suit").should.equal("spades");
    });
    it("should disallow improper values and suits", function () {
      badCard = new hearts.Card({ value: 5, suit: "bananas"});
      badCard.validate(function (err) {
        err.should.not.be.empty
      });
    });
  });
});
