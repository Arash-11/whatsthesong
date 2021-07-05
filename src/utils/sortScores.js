/**
 * sort nested array of entries from highest score to lowest
 * @param {Array} originalArr original nested array - this is the result of Object data in db getting converted into an array
 * @param {Array} arrToInsert new array to insert into the original nested array
 * @return original nested array that's sorted, with the new array to insert included, or the original nested array sorted
 */
const sortScores = (originalArr, arrToInsert) => {
  if (!arrToInsert || arrToInsert.length === 0) {
    return originalArr.sort((a, b) => a[1].score < b[1].score ? 1 : -1);
  }
  const lowerThanScore = originalArr.find((arr) => arr[1].score < arrToInsert[1].score);
  const position = originalArr.indexOf(lowerThanScore);
  originalArr.splice(position, 0, arrToInsert);
  return originalArr;
};

export default sortScores;
