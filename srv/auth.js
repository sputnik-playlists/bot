const spotifyApi = require('spotify-web-api-node');
const scopes = ["playlist-modify-public"]

const credentials = {
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET,
  redirectUri : process.env.CALLBACK
}

const spotify = new spotifyApi(credentials)

const auth = spotify.createAuthorizeURL(scopes, "")

console.log(auth)
