var http = require("http")
  , express = require("express")
  , app = express()
  , server = http.createServer(app)
  , io = require("socket.io").listen(server)
  , SERVER_PORT = process.env["PORT"] || 5678
;

app.use(express.static(__dirname + "/public"));
app.use(express.bodyParser());

// Start the server on the provided `SERVER_PORT`.
server.listen(parseInt(SERVER_PORT));

io.sockets.on("connection", function (socket) {
  // Emit the `draw` event with coordinates,
  // so the client can draw the line segment.
  socket.on("draw", function (info) {
    socket.broadcast.emit("draw", info);
  });

  // Broadcast the `reset` event, which
  // will clear the board.
  socket.on("reset", function(){
    socket.broadcast.emit("reset");
  });
});
