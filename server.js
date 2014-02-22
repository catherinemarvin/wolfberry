var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var engine = require("ejs-locals");
var hearts = require("./hearts");
io.set("log level", 1);

// Mongodb configuration

var mongo = require("mongoskin");
var db = mongo.db("localhost:27017/wolfberry?auto_reconnect", { safe: true });

// Express configuration

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.bodyParser());
app.use(express['static'](__dirname + "/static")); //static is a keyword so it's referenced like this for my linter (:

app.get("/", function (req, res) {
  var userAgent = req.header("user-agent");
  if (/mobile/i.test(userAgent)) {
    res.render("mobileindex");
  }
  else {
    res.render("index");
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/room/:roomId", function (req, res) {
  var roomId = parseInt(req.params.roomId, 10);
  db.collection("rooms").findOne({ roomId: roomId }, function (err, room) {
    if (!room) {
      res.redirect("/");
    }
    res.render("board", { room: roomId });
  });
});

app.post("/createRoom", function (req, res) {
  var newGame = new hearts.Game();
  db.collection("rooms").find({}, { limit: 1, sort: { roomId: -1 } }).toArray(function (err, rooms) {
    var roomId;
    if (rooms.length !== 0) {
      var room = rooms[0];
      roomId = room.roomId + 1;
    }
    else {
      roomId = 1;
    }
    db.collection("rooms").insert({ roomId: roomId, gameState: newGame }, function (err, inserted) {
      res.json({ roomId: roomId });
    });
  });
});

app.get("/joinRoom", function (req, res) {
  var roomId = parseInt(req.query.roomId, 10);
  db.collection("rooms").findOne({ roomId: roomId}, function (err, room) {
    if (room) {
      res.render("player", { room: roomId });
    }
    else {
      res.status(404);
      res.render("404", { error: "room not found" });
    }
  });
});

io.sockets.on("connection", function (socket) {
  socket.on("start game", function (room) {
    var roomId = parseInt(room, 10);
    db.collection("rooms").findOne({ roomId: roomId }, function (err, roomObj) {
      if (roomObj) {
        var gameState = roomObj.gameState;
        gameState.__proto__ = hearts.Game.prototype;

        for (var i = 0; i < gameState.players.length; i++) {
          var player = gameState.players[i];
          player.__proto__ = hearts.Player.prototype;
        }
        try {
          gameState.startGame();
        }
        catch (e) {
          console.log(e);
          io.sockets['in'](room).emit("failure", e);
          return;
        }
        roomObj.gameStarted = true;
        db.collection("rooms").update({ roomId: roomId }, roomObj, {}, function (err, room) {
          var playerSocketIds = gameState.players.map(function (player) {
            return player.name;
          });

          var roomSocketIds = io.sockets.clients(room).map(function (client) {
            return client.id;
          });

          for (var i = 0; i < roomSocketIds.length; i++) {
            var client = roomSocketIds[i];
            var playerIndex = playerSocketIds.indexOf(client);
            if (playerIndex >= 0) {
              var player = gameState.players[playerIndex];
              io.sockets.socket(player.name).emit("gameStart", player);
            }
            else {
              io.sockets.socket(client).emit("boardGameStart", gameState);
            }
          }
        });
      }
      else {
        console.log("Couldn't find a room");
      }
    });
  });
  socket.on("boardCheckAndJoinRoom", function (data) {
    var roomId = parseInt(data, 10);
    db.collection("rooms").findOne({ roomId: roomId }, function (err, room) {
      if (!room) {
        socket.emit("error", "Room doesn't exist");
        roomId = null;
      }
      socket.emit("boardJoinRoomConfirmation", roomId);
    });
  });
  socket.on("boardJoinRoom", function (data) {
    var roomId = parseInt(data.room, 10);
    db.collection("rooms").findOne({ roomId: roomId }, function (err, room) {
      if (room) {
        socket.join(roomId);
      }
    });
  });

  socket.on("joinRoom", function (data) {
    var roomId = parseInt(data.room, 10);
    db.collection("rooms").findOne({ roomId: roomId }, function (err, room) {
      if (room) {
        var game = room.gameState;
        game.__proto__ = hearts.Game.prototype;

        var player = new hearts.Player(socket.id);
        game.addPlayer(player);
      }
      db.collection("rooms").update({ roomId: roomId }, room, {}, function (err, room) {
        socket.join(roomId);
        db.collection("players").insert({ playerId: socket.id, player: player }, function (err, inserted) {
        });
      });
    });
  });

  // Don't bother storing the cards people want to pass in the DB, it can just live in memory.

  // passCards looks like this;
  // { roomId: { socketId: cards } }
  socket.on("passCards", function (data) {
    var cards = data.cards;
    var room = data.room;
    var roomId = parseInt(room, 10);

    var roomPasses = passCards[room];
    if (!roomPasses) {
      passCards[room] = {}
      roomPasses = passCards[room];
    }
    roomPasses[socket.id] = cards;

    db.collection("rooms").findOne({ roomId: roomId }, function (err, room) {
      var game = room.gameState;
      game.__proto__ = hearts.Game.prototype;
      var players = game.players;

      var passedPlayer = players.filter(function (player) {
        return player.name === socket.id;
      })[0];

      if (!passedPlayer) {
        throw new Error("Somehow, couldn't locate the player that passed the cards?");
      }

      passedPlayer.__proto__ = hearts.Player.prototype;

      for (var i = 0; i < cards.length; i++) {
        passedPlayer.removeCard(cards[i]);
      }

      db.collection("rooms").update( { roomId: roomId }, room, {}, function (err, updated) {
        if (Object.keys(roomPasses).length == 4) {
          // We've received all the cards to be passed
          for (var i = 0; i < players.length; i++) {
            var player = players[i];
            player.__proto__ = hearts.Player.prototype;

            var cardsToPass = roomPasses[player.name];
            var positionToPassTo = leftPass[player.position];

            var playerToPassTo = players.filter(function (player) {
              return player.position === positionToPassTo;
            })[0];
            var socketToPassTo = playerToPassTo.name;

            for (var j = 0; j < cardsToPass.length; j++) {
              var cardToPass = cardsToPass[j];
              playerToPassTo.__proto__ = hearts.Player.prototype;
              playerToPassTo.receiveCard(cardToPass);
            }

            io.sockets.socket(socketToPassTo).emit("receiveCards", cardsToPass);
          }
          db.collection("rooms").update( { roomId: roomId }, room, {}, function (err, updated) {
            leadTwoOfClubs(roomId);
          });
        }
      });
    });
  });
  socket.on("playCard", function (data) {
    var roomId = parseInt(data.room,10);
    var card = data.card;

    db.collection("rooms").findOne({ roomId: roomId }, function (err, room) {
      var game = room.gameState;
      game.__proto__ = hearts.Game.prototype;
      for (var i = 0; i < game.players.length; i++) {
        game.players[i].__proto__ = hearts.Player.prototype;
      }

      var player = game.players.filter(function (player) {
        return player.name === socket.id;
      })[0];

      game.playedCard(player, card, function (err, nextPlayer, endOfRound) {
        if (!err && endOfRound) {
          console.log("End of the round!");
          game.scoreRound();
          db.collection("rooms").update({ roomId: roomId }, room, {}, function (err, updated) {
            socket.emit("legalPlay", { legal: true });
            notifyBoard(data.room, game, {
              socketEvent: "roundEnded",
              socketData: { players: game.players }
            });
          });
        }
        else if (!err) {
          db.collection("rooms").update( { roomId: roomId }, room, {}, function (err, updated) {
            socket.emit("legalPlay", { legal: true });
            notifyPlayer(nextPlayer, room);
            notifyBoard(data.room, game, {
              socketEvent: "cardPlayed",
              socketData: { player: player, card: card, currentTrick: game.currentTrick }
            });
          });
        }
        else {
        console.log("Illegal move");
        socket.emit("legalPlay", { legal: false, error: err.toString() });
        }
      });
    });
  });
});

var notifyPlayer = function (player, room) {
  var socketToPassTo = player.name;
  io.sockets.socket(socketToPassTo).emit("yourTurn");
};

var notifyBoard = function (room, game, msg) {
  var roomSocketIds = io.sockets.clients(room).map(function (client) {
    return client.id;
  });

  var playerSocketIds = game.players.map(function (player) {
    return player.name;
  });

  var boardSocketId = roomSocketIds.filter(function (socketId) {
    return playerSocketIds.indexOf(socketId) < 0;
  });

  var socketEvent = msg.socketEvent;
  var socketData = msg.socketData;

  io.sockets.socket(boardSocketId).emit(socketEvent, socketData);
};

// Kick off the round by telling the player with the two of clubs to lead.
var leadTwoOfClubs = function (roomId) {
  db.collection("rooms").findOne({ roomId: roomId }, function (err, room) {
    var game = room.gameState;
    var players = game.players;

    var starter = players.filter(function (player) {
      return player.hand.filter(function (card) {
        return card.value === 2 && card.suit === "clubs";
      }).length > 0;
    })[0];

    io.sockets.socket(starter.name).emit("yourTurn");
  });
};

var leftPass = {
  north: "east",
  east: "south",
  south: "west",
  west: "north"
}

var passCards = {};
server.listen(3000);
console.log("Server started.");
