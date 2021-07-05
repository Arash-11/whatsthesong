import { useState, useEffect } from 'react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import { functions } from '../../firebase';
import SpotifyLogin from '../../components/SpotifyLogin';
import TitleStatements from '../../components/TitleStatements';

const LandingPage = () => {
  const history = useHistory();
  const location = useLocation();

  const [goToHome, setGoToHome] = useState(false);
  const [showAuthErr, setShowAuthErr] = useState(false);

  useEffect(() => {
    const {search, hash, pathname} = location;
    if (hash) {
      return setGoToHome(true);
    } else if (search.includes('error')) {
      setShowAuthErr(true);
      history.replace(pathname);
    }
    // create a random room in db and then delete it - this can help prevent cold starts later
    functions.httpsCallable('createRoom')()
      .then((res) => {
        const roomId = res.data;
        functions.httpsCallable('deleteRoomInDb')({ roomId });
      })
      .catch(console.error);
  }, [goToHome, history, location]);

  const closePopup = () => setShowAuthErr(false);

  return (
    <>
      {goToHome ?
        <Redirect to={{
          pathname: "/home",
          hash: location.hash
        }} />
        :
        <TitleStatements>
          <SpotifyLogin />
          {showAuthErr && 
          <p className="auth-error-msg">
            Authentication failed. Cannot login.<button onClick={closePopup}>&times;</button>
          </p>}
        </TitleStatements>
      }      
    </>
  );
}

export default LandingPage;
