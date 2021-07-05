import { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { AiFillPlayCircle } from 'react-icons/ai';
import { AiFillPauseCircle } from 'react-icons/ai';
import { Redirect } from 'react-router-dom';
import Header from '../../components/Header';
import Timer from '../../components/Timer';
import PlayersInRoom from '../../components/PlayersInRoom';
import processSongName from '../../utils/processSongName';
import writeUserDetailsToDb from '../../utils/writeUserDetailsToDb';
import useAudioPlayer from '../../hooks/useAudioPlayer';

const secondsToStartFrom = 15;
const restrictedTrackLength = 7;

const QuizPage = () => {
  const history = useHistory();
  const {roomId} = useParams();

  const audioElement = useRef();
  const playButton = useRef();
  const currentAudioElement = audioElement.current;
  const currentPlayButton = playButton.current;

  const [shouldPlaySong, setShouldPlaySong, setAudioEl, setBtnEl] = useAudioPlayer();

  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [quizNumber, setQuizNumber] = useState(1);
  const [btnText, setBtnText] = useState('Continue');

  const [shouldStartTimer, setShouldStartTimer] = useState(false);
  const [endTimer, shouldEndTimer] = useState(false);

  const [userAnswer, setUserAnswer] = useState('');
  const [correctSongTitleShort, setCorrectSongTitleShort] = useState('');
  const [correctSongTitleLong, setCorrectSongTitleLong] = useState('');
  const [artist, setArtist] = useState('');
  const [currentTrackSrc, setCurrentTrackSrc] = useState('');

  const [showResultMatches, setShowResultMatches] = useState(false);
  const [showResultDifferent, setShowResultDifferent] = useState(false);

  const [redirectToLeaderboard, setRedirectToLeaderboard] = useState(false);
  const [redirectToRoomLeaderboard, setRedirectToRoomLeaderboard] = useState(false);

  const goToNextPage = () => {
    if (quizNumber === 10) {
      return roomId === 'me'
        ? setRedirectToLeaderboard(true)
        : setRedirectToRoomLeaderboard(true);
    }
    setQuizNumber(quizNumber + 1);
    setUserAnswer('');
    shouldEndTimer(false);
    showResultMatches
      ? setShowResultMatches(false)
      : setShowResultDifferent(false);
  }

  const submitAnswer = useCallback((e) => {
    if (e) e.preventDefault();
    // if timer is at 0, make sure an answer doesn't get submitted again
    if (endTimer) return;
    setShouldPlaySong(false);
    setShouldStartTimer(false);
    shouldEndTimer(true);
    // record current quiz number to prevent user from retaking same quiz after page refresh
    sessionStorage.setItem('previousQuizNumber', JSON.stringify({userId, quizNumber}));
    // wait 1 second before showing answers
    setTimeout(() => {
      const normalizedSongTitle = correctSongTitleShort.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
      if (processSongName(userAnswer) === normalizedSongTitle) {
        setShowResultMatches(true);
        writeUserDetailsToDb(username, userId, roomId);
      } else {
        if (quizNumber === 1) writeUserDetailsToDb(username, userId, roomId, true);
        setShowResultDifferent(true);
      }
    }, 1000);
  }, [endTimer, setShouldPlaySong, userAnswer, correctSongTitleShort, username, userId, quizNumber, roomId]);

  const togglePlayback = useCallback(() => {
    setShouldStartTimer(true);
    setShouldPlaySong(!shouldPlaySong);
  }, [setShouldPlaySong, shouldPlaySong]);

  // iOS doesn't allow audio playback unless its initiated by the user manually - `handleTouchStart` is the workaround for my use case
  const handleTouchStart = useCallback(() => {
    currentAudioElement.play();
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
  }, [currentAudioElement]);

  const restrictPlaybackTime = () => {
    if (currentAudioElement.currentTime >= restrictedTrackLength) {
      setShouldPlaySong(false);
      currentAudioElement.currentTime = 0;
    }
  };

  const handleInputChange = (e) => {
    const {value} = e.target;
    setUserAnswer(value);
  };

  useEffect(() => {
    setAudioEl(currentAudioElement);
    setBtnEl(currentPlayButton);
  }, [currentAudioElement, currentPlayButton, setAudioEl, setBtnEl]);

  useEffect(() => {
    const usernameFromSession = sessionStorage.getItem('username');
    if (!usernameFromSession) return history.replace('/');
    setUsername(usernameFromSession);
    setUserId(sessionStorage.getItem('userId'));
    const previousQuizNumber = JSON.parse(sessionStorage.getItem('previousQuizNumber'));
    // start quiz from the page after the one the user was on before the page was refreshed
    if (previousQuizNumber) setQuizNumber(previousQuizNumber.quizNumber + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // checking 'username' in session again - if not available, redirect user to LandingPage
    if (!sessionStorage.getItem('username')) return history.replace('/');
    const tracksFromSession = roomId === 'me'
      ? JSON.parse(sessionStorage.getItem('tracks'))
      : JSON.parse(sessionStorage.getItem('tracksMixed'));
    const {name, preview_url, artist} = tracksFromSession[quizNumber - 1];
    setCorrectSongTitleShort(processSongName(name));
    setCorrectSongTitleLong(name);
    setArtist(artist);
    setCurrentTrackSrc(preview_url);
    if (quizNumber === 10) {
      roomId === 'me'
        ? setBtnText('Go to leaderboard')
        : setBtnText('See results');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizNumber]);


  return (
    <>
      <Header username={username} />
      <section className="quiz-page-container">

        <div className="quiz-container">
          <p className="quiz-number">{quizNumber} out of 10</p>
          <div className="quiz-controls">
            <audio
              src={currentTrackSrc}
              onTimeUpdate={restrictPlaybackTime}
              crossOrigin="anonymous"
              ref={audioElement}
              type="audio/mpeg" />
            <button
              className={`play-btn ${endTimer ? "disable" : ""}`}
              onClick={togglePlayback}
              onTouchStart={handleTouchStart}
              data-playing="false"
              ref={playButton}>
              {shouldPlaySong
                ? <AiFillPauseCircle className="control-circle" />
                : <AiFillPlayCircle className="control-circle" />}
            </button>
            {shouldPlaySong && <img src="https://open.scdn.co/cdn/images/equaliser-animated-green.73b73928.gif"   alt="Gif of a green animated equaliser" />}
            <Timer 
              isEnabled={shouldStartTimer}
              secondsToStartFrom={secondsToStartFrom}
              funcToRunOnTimerEnd={submitAnswer}
              endTimer={endTimer} />
          </div>

          <form className="song-submit-form" onSubmit={submitAnswer}>
            <label htmlFor='song-answer'>Type in your answer here</label>
            <input
              type="text"
              value={userAnswer}
              placeholder="name of song"
              onChange={handleInputChange}
              name="song title"
              id="song-answer" />
            <button className={endTimer ? 'no-pointer' : ''}>Submit</button>
          </form>

          {showResultMatches && 
          <div className="result-matches result">
            <h3 className="song-title">{correctSongTitleLong}<span className="artist">by {artist}</span></h3>
            <p>Nice! You get 1 point.</p>
          </div>}

          {showResultDifferent && 
          <div className="result-different result">
            <h3 className="song-title">{correctSongTitleLong}<span className="artist">by {artist}</span></h3>
            <p>Sorry, no points for you this time.</p>
          </div>}

          {(showResultMatches || showResultDifferent) && 
          <button className="continue-btn" onClick={goToNextPage}>{btnText}</button>}
        </div>

        {roomId !== 'me' && <PlayersInRoom roomId={roomId} />}
      </section>

      {redirectToLeaderboard && <Redirect to="/leaderboard" />}
      {redirectToRoomLeaderboard && <Redirect to={{
        pathname: `/results/${roomId}`,
        state: { roomId: roomId }
      }} />}
    </>
  );
};

export default QuizPage;
