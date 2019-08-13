const { path } = require('ramda');
const error = require('./utils/error');
const prompt = require('./utils/prompt');
const buildArray = require('./utils/build-array');
const clearScreen = require('./utils/clear-screen');
const Player = require('./player');

class Game {
  constructor({ rows = 6, cols = 7 }) {
    if (!this.hasValidLength(rows)) {
      error(`Must have ${Game.minLength}-${Game.maxLength} rows`);
      return null;
    }

    if (!this.hasValidLength(cols)) {
      error(`Must have ${Game.minLength}-${Game.maxLength} columns`);
      return null;
    }

    this.redPlayer = new Player({ title: 'red', icon: '\uD83D\uDD34' });
    this.bluePlayer = new Player({ title: 'blue', icon: '\uD83D\uDD35' });

    this.rows = rows;
    this.cols = cols;
    this.winner = null;
    this.currentPlayer = this.redPlayer;
    this.board = buildArray(rows, () => null).map(() =>
      buildArray(cols, () => ({ occupant: null }))
    );
  }

  hasValidLength(length) {
    return length >= 4 && length <= 30;
  }

  start() {
    clearScreen();
    this.move();
  }

  async move() {
    this.printBoard();
    this.printCurrentPlayer();

    const { colIdx, rowIdx } = await this.getMove();

    this.placeDisc(rowIdx, colIdx);

    if (this.hasWinner(rowIdx, colIdx)) {
      clearScreen();
      this.printBoard();
      this.declareWinner();
      return null;
    }

    this.changePlayers();
    clearScreen();
    this.move();
  }

  displayInputError() {
    const lastColIdx = this.cols - 1;
    console.log(`Please play a number between (0-${lastColIdx}) `);
  }

  async getMove() {
    const lastColIdx = this.cols - 1;

    let colIdx = await prompt(
      `Which column would you like to play? (0-${lastColIdx}) `
    );

    if (colIdx === '') {
      this.displayInputError();
      return this.getMove();
    }

    colIdx = Number(colIdx);

    if (isNaN(colIdx) || colIdx < 0 || colIdx > lastColIdx) {
      this.displayInputError();
      return this.getMove();
    }

    const { isValid, rowIdx } = this.getPlayableRowIdxFromColIdx(colIdx);

    if (!isValid) {
      console.log('This column is full');
      return this.getMove();
    }

    return { colIdx, rowIdx };
  }

  getDiscTitle(rowIdx, colIdx) {
    return path([rowIdx, colIdx, 'occupant', 'title'])(this.board);
  }

  isVerticalWinner(rowIdx, colIdx) {
    const title = this.getDiscTitle(rowIdx, colIdx);
    let inARow = 0;

    while (this.getDiscTitle(rowIdx, colIdx) === title) {
      ++inARow;
      ++rowIdx;
    }

    return inARow === 4;
  }

  isHorizontalWinner(rowIdx, colIdx) {
    const title = this.getDiscTitle(rowIdx, colIdx);

    let leftColIdx = colIdx - 1;
    let inARowLeft = 0;

    while (this.getDiscTitle(rowIdx, leftColIdx) === title) {
      ++inARowLeft;
      --leftColIdx;
    }

    let rightColIdx = colIdx + 1;
    let inARowRight = 0;

    while (this.getDiscTitle(rowIdx, rightColIdx) === title) {
      ++inARowRight;
      ++rightColIdx;
    }

    const inARow = inARowLeft + 1 + inARowRight;

    return inARow >= 4;
  }

  isDiagonalBottomRightWinner(rowIdx, colIdx) {
    const title = this.getDiscTitle(rowIdx, colIdx);

    let leftRowIdx = rowIdx - 1;
    let leftColIdx = colIdx - 1;
    let inARowTopLeft = 0;

    while (this.getDiscTitle(leftRowIdx, leftColIdx) === title) {
      ++inARowTopLeft;
      --leftRowIdx;
      --leftColIdx;
    }

    let rightRowIdx = rowIdx + 1;
    let rightColIdx = colIdx + 1;
    let inARowBottomRight = 0;

    while (this.getDiscTitle(rightRowIdx, rightColIdx) === title) {
      ++inARowBottomRight;
      ++rightRowIdx;
      ++rightColIdx;
    }

    const inARow = inARowTopLeft + 1 + inARowBottomRight;

    return inARow >= 4;
  }

  isDiagonalTopRightWinner(rowIdx, colIdx) {
    const title = this.getDiscTitle(rowIdx, colIdx);

    let leftRowIdx = rowIdx + 1;
    let leftColIdx = colIdx - 1;
    let inARowBottomLeft = 0;

    while (this.getDiscTitle(leftRowIdx, leftColIdx) === title) {
      ++inARowBottomLeft;
      ++leftRowIdx;
      --leftColIdx;
    }

    let rightRowIdx = rowIdx - 1;
    let rightColIdx = colIdx + 1;
    let inARowTopRight = 0;

    while (this.getDiscTitle(rightRowIdx, rightColIdx) === title) {
      ++inARowTopRight;
      --rightRowIdx;
      ++rightColIdx;
    }

    const inARow = inARowBottomLeft + 1 + inARowTopRight;

    return inARow >= 4;
  }

  hasWinner(rowIdx, colIdx) {
    return (
      this.isVerticalWinner(rowIdx, colIdx) ||
      this.isHorizontalWinner(rowIdx, colIdx) ||
      this.isDiagonalBottomRightWinner(rowIdx, colIdx) ||
      this.isDiagonalTopRightWinner(rowIdx, colIdx)
    );
  }

  declareWinner() {
    this.winner = this.currentPlayer;
    console.log(`${this.winner.icon} wins!`);
  }

  changePlayers() {
    this.currentPlayer =
      this.currentPlayer.title === this.redPlayer.title
        ? this.bluePlayer
        : this.redPlayer;
  }

  getPlayableRowIdxFromColIdx(colIdx) {
    for (let rowIdx = this.board.length - 1; rowIdx >= 0; --rowIdx) {
      const square = this.board[rowIdx][colIdx];

      if (square.occupant) {
        continue;
      }

      return { isValid: true, rowIdx };
    }

    return { isValid: false, rowIdx: null };
  }

  placeDisc(rowIdx, colIdx) {
    this.board[rowIdx][colIdx].occupant = this.currentPlayer;
  }

  printLine() {
    console.log(Game.squareTop.repeat(this.cols));
  }

  buildColOutput(output, col) {
    output += col.occupant
      ? this.printSquare(col.occupant.icon)
      : this.printSquare('  ');
    return output;
  }

  printRow(row) {
    this.printLine();
    const rowOutput = row.reduce(this.buildColOutput.bind(this), '');
    console.log(rowOutput);
  }

  printColNumbers() {
    let output = '';
    let col = 0;

    while (col < this.cols) {
      let colIdx = col++;
      colIdx = String(colIdx).length === 1 ? ` ${colIdx}` : colIdx;
      output += `  ${colIdx}  `;
    }

    console.log(output);
  }

  printSquare(occupant) {
    return `\u2502 ${occupant} \u2502`;
  }

  printBoard() {
    process.stdout.write('\n');
    this.printColNumbers();
    this.board.forEach(this.printRow.bind(this));
    this.printLine();
  }

  printCurrentPlayer() {
    console.log(`\n${this.currentPlayer.icon} is up!\n`);
  }
}

Game.squareTop = '\u2500'.repeat(6);
Game.minLength = 4;
Game.maxLength = 30;

module.exports = Game;
