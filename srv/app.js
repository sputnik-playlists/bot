const spotify = require("./lib/spotify")
const sputnik = require("./lib/sputnik")

/**
 * Sync Sputnik releases with user playlist.
 *
 * @todo Add arg docs.
 *
 * @param playlist
 */
async function release (playlist) {
  try {
    let hit = 0
    let tracks = []
    // Hunt Sputnik for release albums.
    const albums = await sputnik.releaseAlbums(playlist.gid, playlist.rating)

    for (album of albums) {
      // Search Spotify for album tracks.
      const results = await spotify.searchAlbumTracks(album)
        .then(response => {
          if (response) {
            if (response.length) hit++
            return response.map(item => item.id)
          }
        })
        .catch(e => console.log(e))

      // Append matched tracks.
      if (results && results.length) tracks = tracks.concat(results)
    }

    // Album success ratio.
    const ratio = Math.round(
      (hit / albums.length) * 100)
    // console.log(ratio)

    if (tracks.length) {
      // Sync found tracks.
      await spotify.syncPlaylist(playlist, tracks)
        .catch(e => console.log(e))
    }
  } catch (e) {
    throw e
  }
}

/**
 * Sync Sputnik chart with user playlist.
 *
 * @todo Add arg docs.
 *
 * @param playlist
 */
async function chart (playlist) {
  try {
    let hit = 0
    let tracks = []
    // Hunt Sputnik for chart albums.
    const albums = await sputnik.chartAlbums(playlist.gid, playlist.pid)
    for (album of albums) {
      // Search Spotify for album tracks.
      const results = await spotify.searchAlbumTracks(album)
        .then(response => {
          if (response) {
            if (response.length) hit++
            return response.map(item => item.id)
          }
        })
        .catch(e => console.log(e))
      // Append matched tracks.
      if (results && results.length) tracks = tracks.concat(results)
    }

    // Album success ratio.
    const ratio = Math.round(
      (hit / albums.length) * 100)
    // console.log(ratio)

    if (tracks.length) {
      // Sync found tracks.
      await spotify.syncPlaylist(playlist, tracks)
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
