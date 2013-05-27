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
  var roomId = req.params.roomId;

  db.collection("rooms").findOne({ id: roomId }, function (err, room) {
    console.log(room);
    if (!room) {
      db.collection("rooms").insert({ id: roomId }, function (err, inserted) {
        console.log(err);
      });
    }
  });
  res.render("board", { room: roomId });
});

io.sockets.on("connection", function (socket) {
  socket.emit("news", { hello: "world!" });
  socket.on("my other event", function (data) {
    console.log(data);
  });
});

server.listen(3000);
console.log("Server started.");
