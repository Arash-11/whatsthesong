/**
 * randomize items in array in-place using Durstenfeld shuffle, an optimized version of Fisher-Yates algorithm
 * @param {Array} array array to shuffle.
 * @return shuffled array.
 */
const shuffleArrayFunc = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default shuffleArrayFunc;
