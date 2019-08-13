const CLI = require('../src');
const { version } = require('../package.json');

describe('The version command', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log');
  });

  test('runs with version argument', () => {
    process.argv = ['node', 'connect-four', 'version'];
    CLI();
    expect(console.log).toBeCalledWith(`v${version}`);
  });
});
