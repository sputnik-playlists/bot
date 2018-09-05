const fs = require("fs")
const spotifyApi = require('spotify-web-api-node');

const credentials = {
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET,
  redirectUri : process.env.CALLBACK
}

const spotify = new spotifyApi(credentials)
const code = fs.readFileSync(".code", "utf8")

spotify.authorizationCodeGrant(code)
  .then(function(data) {
    fs.writeFileSync('.expire.token', data.body['expires_in'])
    fs.writeFileSync('.access.token', data.body['access_token'])
    fs.writeFileSync('.refresh.token', data.body['refresh_token'])
  })
  .catch(e => {
    console.log(e)
  })
