const ticks = (callbacks = []) => {
  if (callbacks.length < 1) {
    return null;
  }
  setTimeout(() => {
    const cb = callbacks.shift();
    if (cb) {
      cb();
    }
    ticks(callbacks);
  });
};

exports.ticks = ticks;
