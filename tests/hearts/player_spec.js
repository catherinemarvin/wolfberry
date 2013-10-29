var should = require("should");
var hearts = require("../../hearts/");

describe("Player", function () {
  describe("#receiveCard", function () {
    it("should let you receive cards and add them to your hand", function () {
      var player = new hearts.Player({ name: "Twilight", position: "north" });
      var card1 = new hearts.Card({ value: 5, suit: "spades" });
      var card2 = new hearts.Card({ value: 10, suit: "hearts" });
      player.hand.indexOf(card1).should.equal(-1);

      player.receiveCard(card1);
      player.receiveCard(card2);

      player.hand.length.should.equal(2);

      console.log(player.hand);
      console.log(card1);

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
