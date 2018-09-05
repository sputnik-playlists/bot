const spotifyApi = require('spotify-web-api-node');

const auth = () => {
  const scopes = ["playlist-modify-public", "playlist-modify-private"]
  const credentials = {
    clientId : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    redirectUri : process.env.CALLBACK
  }

  const spotify = new spotifyApi(credentials)
  const auth = spotify.createAuthorizeURL(scopes, scopes)
  return auth
}

module.exports = { auth }
