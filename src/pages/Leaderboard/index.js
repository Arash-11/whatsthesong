import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import Header from '../../components/Header';
import TopScoresSorted from '../../components/TopScoresSorted';
import sortScores from '../../utils/sortScores';

const Leaderboard = () => {
  const [username, setUsername] = useState('');
  const [scoresList, setScoresList] = useState([]);

  const listenForTopScores = () => {
    db.ref('topScores').on('value', (snapshot) => {
      const scoresArray = Object.entries(snapshot.val());
      const sortedScoresArray = sortScores(scoresArray);
      setScoresList(sortedScoresArray);
    });
  };

  useEffect(() => {
    const usernameFromSession = sessionStorage.getItem('username');
    setUsername(usernameFromSession);
    listenForTopScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header username={username} />
      <h1 className="leaderboard-title">Leaderboard</h1>
      <TopScoresSorted scoresList={scoresList} />
    </>
  );
};

export default Leaderboard;
