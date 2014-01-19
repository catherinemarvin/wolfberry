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

    var userAgent = req.header("user-agent");
    if (/mobile/i.test(userAgent)) {
      res.render("mobileboard", { room: roomId });
    }
    else {
      res.render("board", { room: roomId });
    }
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
      console.log("room not found!");
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
        }
        roomObj.gameStarted = true;
        db.collection("rooms").update({ roomId: roomId }, roomObj, {}, function (err, room) {
          console.log(io.sockets.clients(room));
          for (var i = 0; i < gameState.players.length; i++) {
            var player = gameState.players[i];
            io.sockets.socket(player.name).emit("gameStart", player.hand);
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
        console.log("This room doesn't exist!");
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
});


server.listen(3000);
console.log("Server started.");
