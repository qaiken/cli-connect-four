module.exports = (message, shouldExit = true) => {
  console.error(message);
  shouldExit && process.exit(1);
};
