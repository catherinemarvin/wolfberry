[ "card",
  "deck",
  "game",
  "player"
].forEach(function (path) {
  var module = require("./" + path);
  for (var i in module) {
    exports[i] = module[i];
  }
});

module.exports = exports;
