import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Timer = ({ isEnabled, secondsToStartFrom, funcToRunOnTimerEnd, endTimer }) => {
  const [timeLeft, setTimeLeft] = useState(secondsToStartFrom);

  useEffect(() => {
    setTimeout(() => {
      if (!timeLeft) funcToRunOnTimerEnd();
      // reset timer when we reach 0 or when timer is not enabled
      if (!timeLeft || !isEnabled) return setTimeLeft(secondsToStartFrom);
      setTimeLeft(timeLeft - 1);
    }, 1000);
  }, [timeLeft, isEnabled, funcToRunOnTimerEnd, secondsToStartFrom]);

  return (
    <div className="timer">
      {endTimer
        ? <span>0</span>
        : isEnabled
          ? <span>{timeLeft}</span>
          : <span>{secondsToStartFrom}</span>}
    </div>
  );
};

Timer.propTypes = {
  isEnabled: PropTypes.bool,
  secondsToStartFrom: PropTypes.number,
  funcToRunOnTimerEnd: PropTypes.func,
  endTimer: PropTypes.bool
};

export default Timer;
