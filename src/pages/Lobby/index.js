import { useState, useEffect } from 'react';
import { useHistory, useParams, Redirect } from 'react-router-dom';
import { db, functions } from '../../firebase';
import Header from '../../components/Header';
import Spinner from '../../components/Spinner';
import checkIfInRoom from '../../utils/checkIfInRoom';

const ROOM_HOST_WAITING_MSG = "You're the room host. Click button to start game once all players have joined!";
const NON_HOST_WAITING_MSG = 'Waiting for room host to start the game...';
const NO_TRACKS_AVAILABLE_MSG = 'No tracks could be found. Cannot start game.';
const PREPARING_ROOM_MSG = 'Preparing room...';

const Lobby = () => {
  const history = useHistory();
  const {roomId} = useParams();

  const [username, setUsername] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [waitingMsg, setWaitingMsg] = useState('');
  const [canGoToRoom, setCanGoToRoom] = useState(false);
  const [buttonIsAvailable, setButtonIsAvailable] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const listenForPlayersJoiningRoom = () => {
    db.ref(`room_ids/${roomId}/players`).on('value', (snapshot) => {
      const users = snapshot.val();
      setPlayers(Object.entries(users));
    });
  };

  const listenForRoomState = (userIsHost) => {
    userIsHost
      ? setWaitingMsg(ROOM_HOST_WAITING_MSG)
      : setWaitingMsg(NON_HOST_WAITING_MSG);
    db.ref(`room_ids/${roomId}/roomState`).on('value', (snapshot) => {
      const {isRoomReady} = snapshot.val();
      // make the button appear after a short delay
      setTimeout(() => setButtonIsAvailable(true), 1000);
      if (isRoomReady) setCanGoToRoom(true);
    });
  };

  const listenForTracks = () => {
    db.ref(`room_ids/${roomId}/tracks`).on('value', (snapshot) => {
      if (snapshot.exists()) {
        const tracks = snapshot.val();
        sessionStorage.setItem('tracksMixed', JSON.stringify(tracks));
      }
    });
  };

  const goToRoom = () => {
    const tracksAreNotAvailable = JSON.parse(sessionStorage.getItem('tracks')).length === 0 &&
                                  !(JSON.parse(sessionStorage.getItem('tracksMixed'))
                                  && JSON.parse(sessionStorage.getItem('tracksMixed')).length !== 0);
    if (tracksAreNotAvailable) {
      return alert(NO_TRACKS_AVAILABLE_MSG);
    }
    setShowLoadingScreen(true);
    functions.httpsCallable('setRoomStateToReady')({ roomId });
  };

  const sendDetailsToDb = async (userId, username, tracksToSendToDb, userIsHost) => {
    const sendRoomDetailsToDbFunc = functions.httpsCallable('sendRoomDetailsToDb');
    try {
      await sendRoomDetailsToDbFunc({
        roomId,
        userId,
        playerName: username,
        tracksFromClient: tracksToSendToDb
      });
      listenForPlayersJoiningRoom();
      listenForRoomState(userIsHost);
      listenForTracks();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const usernameFromSession = sessionStorage.getItem('username');
    const userIdFromSession = sessionStorage.getItem('userId');
    if (!usernameFromSession) return history.replace('/');
    setUsername(usernameFromSession);
    const tracksFromSession = JSON.parse(sessionStorage.getItem('tracks'));
    checkIfInRoom(roomId, functions)
        .then((isGoingToValidRoom) => {
          if (!isGoingToValidRoom) {
            return console.log(`Couldn't find a valid room with roomId of ${roomId}`);
          };
          setWaitingMsg('Creating room...');
          const isHostInSession = JSON.parse(sessionStorage.getItem('isHost'));
          if (isHostInSession) {
            const {hostId, room_id} = isHostInSession;
            const userIsHost = (hostId === userIdFromSession && room_id === roomId);
            if (userIsHost) setIsHost(true);
            return sendDetailsToDb(userIdFromSession, usernameFromSession, tracksFromSession, userIsHost);
          }
          sendDetailsToDb(userIdFromSession, usernameFromSession, tracksFromSession);
        })
        .catch(console.error);
    return () => setCanGoToRoom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header username={username} />
      {showLoadingScreen && <Spinner text={PREPARING_ROOM_MSG} />}
      <div className="lobby-container">
        <h1 className="waiting-msg">{waitingMsg}</h1>
        {!isHost && <p className="waiting-sub-msg">You'll be redirected to room once game starts.</p>}
        {isHost && buttonIsAvailable &&
        <button onClick={goToRoom} className="start-game-btn">Start game</button>}
        <ul className="players-list">
          {players.map((player) => (
            <li key={player[0]}>{player[1]}</li>
          ))}
        </ul>
        {canGoToRoom && <Redirect to={`/room/${roomId}`} />}
      </div>
    </>
  );
};

export default Lobby;
