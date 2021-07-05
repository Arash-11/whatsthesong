/**
 * gets logged in user's top Spotify tracks.
 * @param {String} access_token logged in user's Spotify access token.
 * @param {Number} limit number of tracks to get. Minimum is 1, maximum is 50.
 * @param {Function} callbackFunc function to run when user's songs' details have been successfully fetched.
 * @return Promise that resolves to a JSON object with user's top tracks' details.
 */
const getSpotifyUserTopTracks = (access_token, limit, callbackFunc) => (
  fetch(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    })
    .then((res) => res.json())
    .then((data) => callbackFunc ? callbackFunc(data) : data)
    .catch((error) => console.error(error))
);

export default getSpotifyUserTopTracks;
