import { useState, useEffect, useRef } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import { functions } from '../../firebase';
import Header from '../../components/Header';
import RoomIdModal from '../../components/RoomIdModal';
import getSpotifyUserProfile from '../../utils/getSpotifyUserProfile';
import randomizeTracks from '../../utils/randomizeTracks';

const NO_DATA_STRING = 'No data available';

const HomePage = () => {
  const history = useHistory();
  const location = useLocation();

  const access_token = useRef();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const numberOfTracksToGet = 50;
  const [showRoomIdModal, setShowRoomIdModal] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [willJoinRoom, setWillJoinRoom] = useState(false);
  const [noRoomIdInDb, setNoRoomIdInDb] = useState(false);
  const [disableLink, setDisableLink] = useState(false);

  const saveDataInSession = (username, id, tracks) => {
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('userId', id);
    sessionStorage.setItem('tracks', JSON.stringify(tracks));
  };

  const getUsernameAndRandomizeTracks = async () => {
    const {display_name, id} = await getSpotifyUserProfile(access_token.current, null);
    const randomTracksArray = await randomizeTracks(access_token.current, numberOfTracksToGet, null);
    setUsername(display_name);
    setUserId(id);
    saveDataInSession(display_name, id, randomTracksArray);
  };

  const openRoomIdModal = (e) => {
    const {innerText} = e.target;
    setShowRoomIdModal(true);
    // includes is case sensitive - make sure it's 'Create' and not 'create'
    if (innerText.includes('Create')) {
      setWillJoinRoom(false);
      setNoRoomIdInDb(false);
      functions.httpsCallable('createRoom')()
          .then((result) => {
            const room_id = result.data;
            setRoomId(room_id);
            sessionStorage.setItem('isHost', JSON.stringify({
              "hostname": username,
              "hostId": userId,
              "room_id": room_id
            }));
          })
          .catch(console.error);
    } else {
      setWillJoinRoom(true);
      functions.httpsCallable('getRoomIds')()
          .then((result) => {
            if (result.data === NO_DATA_STRING) return setNoRoomIdInDb(true);
          })
          .catch(console.error);
    }
  };

  const closeModal = () => setShowRoomIdModal(false);

  useEffect(() => {
    // remove lastQuizNumber and previousQuizNumber session storage when a user lands on this page (Home),
    // so that user can restart quiz from scratch.
    sessionStorage.removeItem('lastQuizNumber');
    sessionStorage.removeItem('previousQuizNumber');
    sessionStorage.removeItem('tracksMixed');
    const username = sessionStorage.getItem('username');
    const userId = sessionStorage.getItem('userId');

    if (location.hash.includes('access_token')) {
      access_token.current = location.hash.split('=')[1].split('&')[0];
      history.replace(location.pathname);
      getUsernameAndRandomizeTracks();
    } else {
      if (!username) return history.replace('/');
      setUsername(username);
      setUserId(userId);
    }
    // disable "Challenge yourself" card if there are no tracks in session
    const tracksFromSession = JSON.parse(sessionStorage.getItem('tracks'));
    if (tracksFromSession && tracksFromSession.length === 0) {
      setDisableLink(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header username={username} />
      <section className="selection-cards-container">
        <div className="challenge-room-card-wrapper">
          <Link to="/room/me" className={`challenge-room-card card ${disableLink ? "disable_link" : ""}`}>
            <span>&#x1F3AF;</span>
            Challenge yourself
          </Link>
          {disableLink && <p>No top tracks could be found.</p>}
        </div>
        <button onClick={openRoomIdModal} className="create-room-card card">
          <span>&#x1F528;</span>
          Create a room
        </button>
        <button onClick={openRoomIdModal} className="join-room-card card">
          <span>&#x1F680;</span>
          Join a room
        </button>
        {showRoomIdModal && 
        <RoomIdModal
          closeModal={closeModal}
          id={roomId}
          willJoinRoom={willJoinRoom}
          noRoomIdInDb={noRoomIdInDb}
        />}
      </section>
    </>
  );
};

export default HomePage;
