jest.mock('../src/utils/prompt');

const { ticks } = require('./utils');
const prompt = require('../src/utils/prompt');

const CLI = require('..');

const testOutput = (colNumbers, line, row, rowCount) => {
  expect(process.stdout.write).toHaveBeenNthCalledWith(1, '\n');

  let consoleCount = 0;

  expect(console.log).toHaveBeenNthCalledWith(++consoleCount, '\x1b[0f');

  expect(console.log).toHaveBeenNthCalledWith(++consoleCount, colNumbers);

  while (rowCount > 0) {
    expect(console.log).toHaveBeenNthCalledWith(++consoleCount, line);
    expect(console.log).toHaveBeenNthCalledWith(++consoleCount, row);
    --rowCount;
  }

  expect(console.log).toHaveBeenNthCalledWith(++consoleCount, line);
  expect(console.log).toHaveBeenNthCalledWith(++consoleCount, '\n🔴 is up!\n');

  return consoleCount;
};

describe('The play command', () => {
  const redWins = '🔴 wins!';
  const blueWins = '🔵 wins!';

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('cannot play a game on a 3x3 board', () => {
    process.argv = [
      'node',
      'connect-four',
      'play',
      '--rows',
      '3',
      '--cols',
      '3'
    ];

    expect(CLI).toThrow();
    expect(console.error).lastCalledWith('Must have 4-30 rows');
  });

  test('can play a game with a vertical winner', (done) => {
    process.argv = ['node', 'connect-four', 'play'];

    prompt
      .mockImplementationOnce(() => Promise.resolve(-1)) // red [BAD MOVE]
      .mockImplementationOnce(() => Promise.resolve(0)) // red
      .mockImplementationOnce(() => Promise.resolve(1)) // blue
      .mockImplementationOnce(() => Promise.resolve(0)) // red
      .mockImplementationOnce(() => Promise.resolve(1)) // blue
      .mockImplementationOnce(() => Promise.resolve(0)) // red
      .mockImplementationOnce(() => Promise.resolve(1)) // blue
      .mockImplementationOnce(() => Promise.resolve(0)); // red

    CLI();

    testOutput(
      '   0     1     2     3     4     5     6  ',
      '──────────────────────────────────────────',
      '│    ││    ││    ││    ││    ││    ││    │',
      6
    );

    ticks([
      () => {
        expect(console.log).toHaveBeenCalledWith(
          'Please play a number between (0-6) '
        );
        expect(prompt).toHaveBeenCalledWith(
          'Which column would you like to play? (0-6) '
        );
        expect(console.log).lastCalledWith(redWins);
        done();
      }
    ]);
  });

  test('can play a game with a horizontal winner', (done) => {
    process.argv = ['node', 'connect-four', 'play'];

    prompt
      .mockImplementationOnce(() => Promise.resolve(0)) // red
      .mockImplementationOnce(() => Promise.resolve(0)) // blue
      .mockImplementationOnce(() => Promise.resolve(0)) // red
      .mockImplementationOnce(() => Promise.resolve(0)) // blue
      .mockImplementationOnce(() => Promise.resolve(0)) // red
      .mockImplementationOnce(() => Promise.resolve(0)) // blue
      .mockImplementationOnce(() => Promise.resolve(0)) // red [BAD MOVE]
      .mockImplementationOnce(() => Promise.resolve(1)) // red
      .mockImplementationOnce(() => Promise.resolve(6)) // blue
      .mockImplementationOnce(() => Promise.resolve(2)) // red
      .mockImplementationOnce(() => Promise.resolve(5)) // blue
      .mockImplementationOnce(() => Promise.resolve(3)); // red

    CLI();

    ticks([
      () => {
        expect(console.log).toHaveBeenCalledWith('This column is full');
        expect(console.log).lastCalledWith(redWins);
        done();
      }
    ]);
  });

  test('can play a game with a diagonal-top-right winner', (done) => {
    process.argv = ['node', 'connect-four', 'play'];

    prompt
      .mockImplementationOnce(() => Promise.resolve(0)) // red
      .mockImplementationOnce(() => Promise.resolve(1)) // blue
      .mockImplementationOnce(() => Promise.resolve(1)) // red
      .mockImplementationOnce(() => Promise.resolve(2)) // blue
      .mockImplementationOnce(() => Promise.resolve(2)) // red
      .mockImplementationOnce(() => Promise.resolve(3)) // blue
      .mockImplementationOnce(() => Promise.resolve(2)) // red
      .mockImplementationOnce(() => Promise.resolve(3)) // blue
      .mockImplementationOnce(() => Promise.resolve(4)) // red
      .mockImplementationOnce(() => Promise.resolve(3)) // blue
      .mockImplementationOnce(() => Promise.resolve(3)); // red

    CLI();

    ticks([
      () => {
        expect(console.log).lastCalledWith(redWins);
        done();
      }
    ]);
  });

  test('can play a game with a diagonal-bottom-right winner', (done) => {
    process.argv = ['node', 'connect-four', 'play'];

    prompt
      .mockImplementationOnce(() => Promise.resolve(5)) // red
      .mockImplementationOnce(() => Promise.resolve(6)) // blue
      .mockImplementationOnce(() => Promise.resolve(4)) // red
      .mockImplementationOnce(() => Promise.resolve(5)) // blue
      .mockImplementationOnce(() => Promise.resolve(4)) // red
      .mockImplementationOnce(() => Promise.resolve(4)) // blue
      .mockImplementationOnce(() => Promise.resolve(3)) // red
      .mockImplementationOnce(() => Promise.resolve(3)) // blue
      .mockImplementationOnce(() => Promise.resolve(3)) // red
      .mockImplementationOnce(() => Promise.resolve(3)); // blue

    CLI();

    ticks([
      () => {
        expect(console.log).lastCalledWith(blueWins);
        done();
      }
    ]);
  });

  test('can play a game on a 10x10 board', (done) => {
    process.argv = ['node', 'connect-four', 'play', '-r', '10', '-c', '10'];

    prompt
      .mockImplementationOnce(() => Promise.resolve(0)) // red
      .mockImplementationOnce(() => Promise.resolve(1)) // blue
      .mockImplementationOnce(() => Promise.resolve(0)) // red
      .mockImplementationOnce(() => Promise.resolve(1)) // blue
      .mockImplementationOnce(() => Promise.resolve(0)) // red
      .mockImplementationOnce(() => Promise.resolve(1)) // blue
      .mockImplementationOnce(() => Promise.resolve(0)); // red

    CLI();

    testOutput(
      '   0     1     2     3     4     5     6     7     8     9  ',
      '────────────────────────────────────────────────────────────',
      '│    ││    ││    ││    ││    ││    ││    ││    ││    ││    │',
      10
    );

    ticks([
      null,
      () => {
        expect(console.log).lastCalledWith(redWins);
        done();
      }
    ]);
  });
});
