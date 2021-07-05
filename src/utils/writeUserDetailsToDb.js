import { functions } from '../firebase';

/**
 * @param {String} username name of user
 * @param {String} uuid unique identifier created by Firebase
 * @param {String} roomId room id - will either be a unique ID or 'me'
 * @param {Boolean} isScoreZero whether to set user score in room as 0 instead of incrementing
 */
const writeUserDetailsToDb = async (username, uuid, roomId, isScoreZero) => {
  const writeUserDetailsToDbFunc = functions.httpsCallable('writeUserDetailsToDb');
  try {
    return await writeUserDetailsToDbFunc({ username, uuid, roomId, isScoreZero });
  } catch (error) {
    return console.error(error);
  }
};

export default writeUserDetailsToDb;
