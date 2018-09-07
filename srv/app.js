const fs = require("fs")
const SpotifyNode = require("spotify-web-api-node")

const spotifyBatch = require("./lib/spotify")
const sputnik = require("./lib/sputnik")

// Load token.
const token = fs.readFileSync(".access.token", "utf8").trim()

// Create Spotify API object.
const Spotify = new SpotifyNode()
Spotify.setAccessToken(token)

/**
 * Sync Sputnik releases with user playlist.
 *
 * @todo Replace for loop with forEach?
 * @todo Add arg docs.
 *
 * @param playlist
 */
async function release (playlist) {
  try {
    let tracks = []
    // Hunt Sputnik for release albums.
    const albums = await sputnik.releaseAlbums(playlist.gid, playlist.rating)

    for (album of albums) {
      // Search Spotify for album tracks.
      const results = await spotifyBatch.searchAlbumTracks(album)
        .then(response => {
          if (response) return response.map(item => item.id)
        })
        .catch(e => console.log(e))

      // Append matched tracks.
      if (results && results.length) tracks = tracks.concat(results)
    }

    if (tracks.length) {
      // Sync found tracks.
      await spotifyBatch.syncPlaylist(playlist, tracks)
        .catch(e => console.log(e))
    }
  } catch (e) {
    throw e
  }
}

/**
 * Sync Sputnik chart with user playlist.
 *
 * @todo Replace for loop with forEach?
 * @todo Add arg docs.
 *
 * @param playlist
 */
async function chart (playlist) {
  try {
    let tracks = []
    // Hunt Sputnik for chart albums.
    const albums = await sputnik.chartAlbums(playlist.gid, playlist.pid)
    for (album of albums) {
      // Search Spotify for album tracks.
      const results = await spotifyBatch.searchAlbumTracks(album)
        .then(response => {
          if (response) return response.map(item => item.id)
        })
        .catch(e => console.log(e))
      // Append matched tracks.
      if (results && results.length) tracks = tracks.concat(results)
    }

    if (tracks.length) {
      // Sync found tracks.
      await spotifyBatch.syncPlaylist(playlist, tracks)
        .catch(e => console.log(e))
    }
  } catch (e) {
    throw e
  }
}

/**
 * Entry function.
 */
async function main () {
  try {
    // Load playlists.
    const playlists = require("./playlists.json")
    for (playlist of playlists) {
      switch (playlist.type) {
        // Process Sputnik chart.
        case "chart":
          await chart(playlist)
          break;
        // Process Sputnik release.
        case "release":
          await release(playlist)
          break;
      }
    }
  } catch (e) {
    throw e
  }
}

main()
