import { useState, useEffect } from 'react';

const useAudioPlayer = () => {
  const [shouldPlaySong, setShouldPlaySong] = useState(false);
  const [audioEl, setAudioEl] = useState(null);
  const [btnEl, setBtnEl] = useState(null);

  useEffect(() => {
    if (audioEl && btnEl) {
      const startSongPlayback = () => {
        audioEl.play();
        btnEl.dataset.playing = 'true';
      };

      const stopSongPlayback = () => {
        audioEl.pause();
        btnEl.dataset.playing = 'false';
      };

      shouldPlaySong ? startSongPlayback() : stopSongPlayback();
    }
  }, [audioEl, btnEl, shouldPlaySong]);

  return [shouldPlaySong, setShouldPlaySong, setAudioEl, setBtnEl];
};

export default useAudioPlayer;
