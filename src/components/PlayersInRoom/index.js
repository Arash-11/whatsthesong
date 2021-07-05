import { useState, useEffect } from 'react';
import { db } from '../../firebase';

const PlayersInRoom = ({ roomId }) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    db.ref(`room_ids/${roomId}/players`).on('value', (snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();
        setPlayers(Object.entries(users));
      }
    });
  }, [roomId]);

  return (
    <section className="players-container">
      <ul>
        {players.map((player) => (
          <li key={player[0]}>
            <span className="player-name">{player[1]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PlayersInRoom;
