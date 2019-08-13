module.exports = function buildArray(length, getValue) {
  const result = [];

  while (result.length < length) {
    result.push(getValue());
  }

  return result;
};
