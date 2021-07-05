const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./credentials.json");
// replace `serviceAccount` with your actual credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://whatsthesong-b6126-default-rtdb.firebaseio.com",
});
// doing `database().ref()` instead of `database()` here to see if it helps with
// resolving the "client is offline" false error. We'll then use `.child()` in
// the functions instead of `.ref()`.
const db = admin.database().ref();


const updatePersonalScore = (uuid, username) => {
  return db.child(`userInfo/${uuid}`).set({
    username,
    score: admin.database.ServerValue.increment(1),
  });
};


const updateTopScore = (uuid, username) => {
  return db.child(`topScores/${uuid}`).set({
    username,
    score: admin.database.ServerValue.increment(1),
  });
};


const updateScoreInRoom = (uuid, username, roomId, isScoreZero) => {
  return db.child(`room_ids/${roomId}/scores/${uuid}`).set({
    username,
    score: isScoreZero ? 0 : admin.database.ServerValue.increment(1),
  });
};


/**
 * write username and score to db
 * @param {Object} data object containing data sent from client side
 */
exports.writeUserDetailsToDb = functions.https.onCall((data, context) => {
  const {username, uuid, roomId, isScoreZero} = data;
  // update user personal score
  updatePersonalScore(uuid, username);
  // update global top scores
  updateTopScore(uuid, username);
  // update score in room
  if (roomId !== "me") updateScoreInRoom(uuid, username, roomId, isScoreZero);
});


const generateId = () => Math.random().toString(36).substr(2, 9);


/**
 * generate room ID and create new room
 * @return string which represents the created room ID
 */
exports.createRoom = functions.https.onCall((data, context) => {
  functions.logger.info("createRoom log", {structuredData: true});
  const roomId = generateId();
  db.child(`room_ids/${roomId}`).set({roomId});
  return roomId;
});


// delete room if there are no players, ie when no 'players' object can be found
const deleteRoom = (roomId) => {
  db.child(`room_ids/${roomId}/players`).get()
      .then((snapshot) => {
        if (!snapshot.val()) return db.child(`room_ids/${roomId}`).remove();
      })
      .catch((error) => {
        console.error(error);
        return functions.logger.debug(
            `deleteRoom - could not find list of players in roomId ${roomId}`,
            {structuredData: true}
        );
      });
};


exports.deleteRoomInDb = functions.https.onCall((data, context) => {
  const {roomId} = data;
  functions.logger.info("deleteRoom log", {structuredData: true});
  return deleteRoom(roomId);
});


const getRoomIdsDataFromDb = () => (
  db.child("room_ids/").get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          const roomIds = Object.keys(snapshot.val());
          return roomIds;
        } else {
          return console.error("No data available in room_ids");
        }
      })
      .catch((error) => {
        console.error(error);
        return functions.logger.debug(
            "getRoomIdsDataFromDb - could not find room_ids",
            {structuredData: true}
        );
      })
);


const getTracksAndUsersFromRoom = (id) => (
  db.child(`room_ids/${id}`).get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          const {tracks, players} = snapshot.val();
          const songs = tracks ? tracks : [];
          const users = players ? players : {};
          return {songs, users};
        } else {
          return console.error(
              "No data available in getTracksAndUsersFromRoom function"
          );
        }
      })
      .catch((error) => {
        console.error(error);
        return functions.logger.debug(
            `getTracksAndUsersFromRoom - could not find id ${id} in room_ids`,
            {structuredData: true}
        );
      })
);


/**
 * Randomize items in array in-place using Durstenfeld shuffle.
 * @param {Array} array array to shuffle.
 * @return {Array} shuffled array.
 */
const shuffleArrayFunc = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};


/**
 * get a list of room IDs from db
 * @return Promise which resolves to an array of room IDs if available,
 *         or a string indicating no room IDs are available in db.
 */
exports.getRoomIds = functions.https.onCall((data, context) => {
  return getRoomIdsDataFromDb();
});


/**
 * validate room ID that user inputs on client side
 * @param {Object} data object containing data sent from client side
 * @return Boolean indicating if the ID input by the user is available in db
 */
exports.validateRoomId = functions.https.onCall((data, context) => {
  const {idToValidate} = data;
  functions.logger.info("validateRoomId log", {structuredData: true});
  return getRoomIdsDataFromDb()
      .then((result) => {
        if (result) return result.includes(idToValidate);
      })
      .catch((error) => {
        console.error(error);
        return functions.logger.debug(
            // eslint-disable-next-line max-len
            `validateRoomId - could not run validateRoomId() for id ${idToValidate}`,
            {structuredData: true}
        );
      });
});


/**
 * get tracks from all players in room and send them to db
 * @param {Object} data object containing data sent from client side
 * @return Promise resolving to a new array of shuffled tracks
 */
exports.sendRoomDetailsToDb = functions.https.onCall((data, context) => {
  const {roomId, userId, playerName, tracksFromClient} = data;
  functions.logger.info("sendRoomDetailsToDb log", {structuredData: true});
  return getTracksAndUsersFromRoom(roomId)
      .then((result) => {
        const {songs, users} = result;
        const newTracksArray = songs;
        if (userId in users) {
          return functions.logger.debug(
              // eslint-disable-next-line max-len
              `sendRoomDetailsToDb - userId ${userId} found in roomId ${roomId}`,
              {structuredData: true}
          );
        }
        newTracksArray.push(...tracksFromClient);
        if (newTracksArray.length >= 10) newTracksArray.length = 10;
        const shuffledArray = shuffleArrayFunc(newTracksArray);
        const newPlayers = Object.assign(users, {[userId]: playerName});
        db.child(`room_ids/${roomId}`).set({
          players: newPlayers,
          tracks: shuffledArray,
          roomState: {isRoomReady: false},
        });
        return shuffledArray;
      })
      .catch((error) => {
        console.error(error);
        return functions.logger.debug(
            "sendRoomDetailsToDb - could not get tracks and users from room",
            {structuredData: true}
        );
      });
});


/**
 * set state of room in db to 'ready'
 * @param {Object} data object containing data sent from client side
 */
exports.setRoomStateToReady = functions.https.onCall((data, context) => {
  const {roomId} = data;
  functions.logger.info("setRoomStateToReady log", {structuredData: true});
  return db.child(`room_ids/${roomId}/roomState`).set({
    isRoomReady: true,
  });
});


/**
 * remove player from room by setting the player ID to null
 * @param {Object} data object containing data sent from client side
 */
exports.removeUserFromRoom = functions.https.onCall((data, context) => {
  const {roomId, userId} = data;
  functions.logger.info("removeUserFromRoom log", {structuredData: true});
  return db.child(`room_ids/${roomId}/players`).get()
      .then((snapshot) => {
        const keyValuePairs = snapshot.val();
        for (const key in keyValuePairs) {
          if (key === userId) keyValuePairs[key] = null;
        }
        return db.child(`room_ids/${roomId}/players`).set(keyValuePairs);
      })
      .then(() => deleteRoom(roomId))
      .catch((error) => {
        console.error(error);
        return functions.logger.debug(
            // eslint-disable-next-line max-len
            `removeUserFromRoom - could not get list of players from roomId ${roomId}`,
            {structuredData: true}
        );
      });
});
