const processSongName = (songName) => {
  const splitStr = (char) => {
    if (songName.includes(char)) {
      songName = songName.split(char)[0];
    }
    return songName;
  }
  splitStr('(');
  splitStr('-');

  return songName.toLowerCase().trim();
}

export default processSongName;
