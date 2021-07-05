import getSpotifyUserTopTracks from './getSpotifyUserTopTracks';
import shuffleArrayFunc from './shuffleArrayFunc';

/**
 * randomize tracks in array
 * @param {String} access_token logged in user's Spotify access token.
 * @param {Number} numberOfTracksToGet number of tracks to fetch.
 * @param {Function} callbackFunc function to run when user's songs' details have been successfully fetched.
 * @return Promise that resolves to an array with the tracks' order shuffled.
 */
const randomizeTracks = async (access_token, numberOfTracksToGet, callbackFunc) => {
  const tracksArray = [];
  const allTracks = await getSpotifyUserTopTracks(access_token, numberOfTracksToGet, callbackFunc);
  // only get tracks that have a preview_url
  const tenTracks = allTracks.items.filter(track => track.preview_url);
  // get the top 10 tracks from the filtered tracks, if available
  if (tenTracks.length > 10) tenTracks.length = 10;
  tenTracks.forEach(track => {
    const {name, id, preview_url} = track;
    const artist = track.artists[0].name;
    return tracksArray.push({name, id, preview_url, artist});
  });

  return shuffleArrayFunc(tracksArray);
};

export default randomizeTracks;
