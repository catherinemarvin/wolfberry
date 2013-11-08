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
    console.log("get room");
    console.log(room);
    if (!room) {
      console.log("This room doesn't exist!");
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
  socket.emit("news", { hello: "world!" });
  socket.on("my other event", function (data) {
    console.log(data);
  });
  socket.on("start game", function (room) {
    var roomId = parseInt(room, 10);
    db.collection("rooms").findOne({ roomId: roomId }, function (err, roomObj) {
      if (roomObj) {
        var gameState = roomObj.gameState;
        try {
          gameState.start();
        }
        catch (e) {
          io.sockets['in'](room).emit("failure", e);
        }
        roomObj.gameStarted = true;
        db.collection("rooms").update({ roomId: roomId }, roomObj, {}, function (err, room) {
          io.sockets['in'](room).emit("gameStart");
        });
      }
      else {
        console.log("Couldn't find a room");
      }
    });
  });
  socket.on("boardJoinRoom", function (data) {
    var roomId = parseInt(data, 10);
    db.collection("rooms").findOne({ roomId: roomId }, function (err, room) {
      if (!room) {
        console.log("This room doesn't exist!");
        roomId = null;
      }
      console.log("beep boop");
      socket.emit("boardJoinRoomConfirmation", roomId);
    });
  });
  socket.on("joinRoom", function (data) {
    var roomId = parseInt(data.room, 10);
    var playerId = data.playerId;
    var boardId = data.boardId;
    db.collection("rooms").findOne({ roomId: roomId}, function (err, room) {
      if (playerId) {
        var game = room.gameState;
        hearts.Game.addPlayer(game,playerId);
      }
      db.collection("rooms").update({ roomId: roomId }, room, {}, function (err, room) {
        socket.join(roomId);
      });
    });
  });
});


server.listen(3000);
console.log("Server started.");
