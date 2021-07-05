/**
 * gets logged in user's Spotify profile details.
 * @param {String} access_token logged in user's Spotify access token.
 * @param {Function} callbackFunc function to run when user's details have been successfully fetched.
 * @return Promise that resolves to a JSON object with user's profile details.
 */
const getSpotifyUserProfile = (access_token, callbackFunc) => (
  fetch('https://api.spotify.com/v1/me', {
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

export default getSpotifyUserProfile;
