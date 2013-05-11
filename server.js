var app = require("express")();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

io.set("log level", 1);

app.get("/", function (req, res) {
  res.sendfile(__dirname + "/index.html");
});

io.sockets.on("connection", function (socket) {
  socket.emit("news", { hello: "world" });
  socket.on("my other event", function (data) {
    console.log(data);
  });
});

server.listen(80);
console.log("Server started.");
