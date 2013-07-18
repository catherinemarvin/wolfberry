var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var engine = require("ejs-locals");

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
    res.render("mobile");
  }
  else {
    res.render("index");
  }
});

app.get("/room/:roomId", function (req, res) {
  var roomId = parseInt(req.params.roomId, 10);
  res.render("board", { room: roomId });
  db.collection("rooms").findOne({ roomId: roomId }, function (err, room) {
    console.log(room);
    if (!room) {
      console.log("This room doesn't exist!");
    }
    res.render("board", { room: roomId});
  });
});

app.post("/createRoom", function (req, res) {
  console.log("Creating a room!");
  db.collection("rooms").find({}, { limit: 1, sort: { roomId: -1 } }).toArray(function (err, rooms) {
    console.log(rooms);
    var roomId;
    if (rooms.length !== 0) {
      var room = rooms[0];
      roomId = room.roomId + 1;
    } 
    else {
      roomId = 1;
    }
    db.collection("rooms").insert({ roomId: roomId, players: {} }, function (err, inserted) {
      console.log(inserted);
      res.json({ roomId: roomId });
    });
  });
});

app.get("/joinRoom", function (req, res) {
  console.log("Joining a room!");
  console.log(req.query);
  var roomId = parseInt(req.query.roomId, 10);
  console.log("Joining room " + roomId);
  db.collection("rooms").findOne({ roomId: roomId}, function (err, room) {
    if (room) {
      res.render("mobileboard", { room: roomId });
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
});

server.listen(3000);
console.log("Server started.");
