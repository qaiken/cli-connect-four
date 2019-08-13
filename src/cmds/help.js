const menus = {
  main: `
    connect-four [command] <options>

    play ............... start a new game
    version ............ show package version
    help ............... show help menu for a command`,

  play: `
    connect-four play <options>

    --rows, -r ..... number of rows (4-30)
    --cols, -c ..... number of columns (40-30)`
};

module.exports = (args) => {
  const subCmd = args._[0] === 'help' ? args._[1] : args._[0];

  console.log(menus[subCmd] || menus.main);
};
