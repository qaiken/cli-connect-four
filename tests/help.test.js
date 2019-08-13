const CLI = require('../src');

describe('The help command', () => {
  const helpMenu = `
    connect-four [command] <options>

    play ............... start a new game
    version ............ show package version
    help ............... show help menu for a command`;

  beforeEach(() => {
    jest.spyOn(console, 'log');
  });

  test('runs when no arguments are present', () => {
    process.argv = [];
    CLI();
    expect(console.log).toBeCalledWith(helpMenu);
  });

  test('runs with help argument', () => {
    process.argv = ['node', 'connect-four', 'help'];
    CLI();
    expect(console.log).toBeCalledWith(helpMenu);
  });

  test('runs with --help flag', () => {
    process.argv = ['node', 'connect-four', '-help'];
    CLI();
    expect(console.log).toBeCalledWith(helpMenu);
  });

  test('runs with -h flag', () => {
    process.argv = ['node', 'connect-four', '-h'];
    CLI();
    expect(console.log).toBeCalledWith(helpMenu);
  });
});

describe('The play help command', () => {
  const helpMenu = `
    connect-four play <options>

    --rows, -r ..... number of rows (4-30)
    --cols, -c ..... number of columns (40-30)`;

  beforeEach(() => {
    jest.spyOn(console, 'log');
  });

  test('runs with --help flag', () => {
    process.argv = ['node', 'connect-four', 'play', '--help'];
    CLI();
    expect(console.log).toBeCalledWith(helpMenu);
  });

  test('runs with -h flag', () => {
    process.argv = ['node', 'connect-four', 'play', '-h'];
    CLI();
    expect(console.log).toBeCalledWith(helpMenu);
  });
});
