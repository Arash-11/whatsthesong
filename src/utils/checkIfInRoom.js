/**
 * check if player is in a room or playing alone
 * @param {Object} idFromClient ID sent from client that may or may not be a room ID
 * @param {Functions} firebaseFunctions this will be firebase.functions()
 * @return Promise that resolves to a Boolean
 */
const checkIfInRoom = async (idFromClient, firebaseFunctions) => {
  const validateRoomId = firebaseFunctions.httpsCallable('validateRoomId');
  try {
    const result = await validateRoomId({ idToValidate: idFromClient });
    return result.data;
  } catch (error) {
    return console.error(error);
  }
};

export default checkIfInRoom;
