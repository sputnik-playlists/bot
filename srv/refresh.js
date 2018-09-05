const fs = require("fs")
const spotifyApi = require('spotify-web-api-node');

const token = fs.readFileSync(".refresh.token", "utf8").trim()

const credentials = {
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET,
  redirectUri : process.env.CALLBACK
}

const spotify = new spotifyApi(credentials)
spotify.setRefreshToken(token)

spotify.refreshAccessToken()
  .then(data => {
    fs.writeFileSync('.access.token', data.body['access_token'])
    console.log("Token refreshed")
  })
  .catch(e => {
    console.log(e)
  })
