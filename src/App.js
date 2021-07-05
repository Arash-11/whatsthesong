import { useEffect } from 'react';
import { functions } from './firebase';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import Lobby from './pages/Lobby';
import Leaderboard from './pages/Leaderboard';
import RoomLeaderboard from './pages/RoomLeaderboard';
import { 
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect } from 'react-router-dom';

const backgroundSvg = (
  <svg className="background-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 290">
    <path fill="#24E066" fillOpacity="1" d="M0,128L80,154.7C160,181,320,235,480,240C640,245,800,203,960,197.3C1120,192,1280,224,1360,240L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
  </svg>
);

const App = () => {
  const removeUserFromRoom = async (roomId, userId) => {
    const removeUserFromRoomFunc = functions.httpsCallable('removeUserFromRoom');
    try {
      return await removeUserFromRoomFunc({ roomId, userId });
    } catch (error) {
      return console.error(error);
    }
  };

  useEffect(() => {
    const {referrer} = document;
    if (referrer.includes('/room/') || referrer.includes('/results/') || referrer.includes('/lobby/')) {
      const userId = sessionStorage.getItem('userId');
      const roomId = referrer.split('/room/')[1]
                     || referrer.split('/results/')[1]
                     || referrer.split('/lobby/')[1];
      if (roomId !== 'me') return removeUserFromRoom(roomId, userId);
    }
  });

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <LandingPage />
        </Route>
        <Route exact path="/home">
          <HomePage />
        </Route>
        <Route exact path="/room/">
          <Redirect to="/home" />
        </Route>
        <Route exact path="/room/:roomId">
          <QuizPage />
        </Route>
        <Route exact path="/lobby/">
          <Redirect to="/home" />
        </Route>
        <Route exact path="/lobby/:roomId">
          <Lobby />
        </Route>
        <Route exact path="/leaderboard">
          <Leaderboard />
        </Route>
        <Route exact path="/results/">
          <Redirect to="/home" />
        </Route>
        <Route exact path="/results/:roomId">
          <RoomLeaderboard />
        </Route>
        <Redirect to="/" />
      </Switch>
      {backgroundSvg}
    </Router>
  );
};

export default App;
