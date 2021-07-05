import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { db } from '../../firebase';
import Header from '../../components/Header';
import TopScoresSorted from '../../components/TopScoresSorted';
import sortScores from '../../utils/sortScores';

const RoomLeaderboard = () => {
  const history = useHistory();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [roomScoresList, setRoomScoresList] = useState([]);

  const getRoomScores = (roomId) => {
    db.ref(`room_ids/${roomId}/scores`).on('value', (snapshot) => {
      const scoresArray = Object.entries(snapshot.val());
      const sortedScoresArray = sortScores(scoresArray);
      setRoomScoresList(sortedScoresArray);
    });
  };

  useEffect(() => {
    const usernameFromSession = sessionStorage.getItem('username');
    if (!usernameFromSession) return history.replace('/');
    if (!location.state) return history.replace('/home');
    setUsername(usernameFromSession);
    getRoomScores(location.state.roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header username={username} />
      <TopScoresSorted scoresList={roomScoresList} />
    </>
  );
};

export default RoomLeaderboard;
