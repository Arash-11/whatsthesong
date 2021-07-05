// user-top-read: Read access to a user's top artists and tracks.
const scopes = 'user-top-read';
const my_client_id = 'b0af4cd077a441e2b754c822ee0bb144';
const redirectUri = window.location.href;

const authUrl = 'https://accounts.spotify.com/authorize' +
  '?response_type=token' +
  '&client_id=' + my_client_id +
  (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
  '&redirect_uri=' + encodeURIComponent(redirectUri) +
  '&show_dialog=true';

const SpotifyLogin = () => (
  <a href={authUrl} className="spotify-login-btn">
    login with spotify
  </a>
);

export default SpotifyLogin;
