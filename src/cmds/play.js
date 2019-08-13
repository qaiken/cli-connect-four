const Game = require('../game');

module.exports = function(args) {
  let rows = args.rows || args.r || 6;
  let cols = args.cols || args.c || 7;

  const game = new Game({ rows, cols });
  game.start();
};
