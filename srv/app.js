const spotify = require("./lib/spotify")
const sputnik = require("./lib/sputnik")
const mailgun = require("./lib/mailgun")

/**
 * Sync Sputnik releases with user playlist.
 *
 * @todo Add arg docs.
 *
 * @param playlist Object - Playlist definition.
 * @return Object - Results object.
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

    // Sync found tracks.
    const results = await spotify.syncPlaylist(playlist, tracks)
      .catch(e => console.log(e))

    // Return results object,
    return { ratio, ...results }
  } catch (e) {
    throw e
  }
}

/**
 * Sync Sputnik chart with user playlist.
 *
 * @todo Add arg docs.
 *
 * @param playlist Object - Playlist definition.
 * @return Object - Results object.
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

    // Sync found tracks.
    const results = await spotify.syncPlaylist(playlist, tracks)
      .catch(e => console.log(e))

    // Return results object,
    return { ratio, ...results }
  } catch (e) {
    throw e
  }
}

/**
 * Send report mail.
 *
 * Mail will only be sent if configured and enabled.
 *
 * @param results Array - Playlist definitions & results.
 */
const sendReport = results => {
  let message = "<h1>Playlists Report</h1>"

  results.forEach(result => {
    message += `<p><strong>${result.playlist.name}</strong></p>`
    message += `<ul>`
    message += `<li>Success Ratio: ${result.result.ratio}%</li>`
    message += `<li>Added: ${result.result.added}</li>`
    message += `<li>Removed: ${result.result.removed}</li>`
    message += `</ul>`
  })

  mailgun.send(message)
}

/**
 * Entry function.
 */
async function main () {
  let results = []
  try {
    // Load playlists.
    const playlists = require("./playlists.json")
    for (playlist of playlists) {
      let result;
      switch (playlist.type) {
        // Process Sputnik chart.
        case "chart":
          result = await chart(playlist)
          results.push({ playlist, result })
          break;
        // Process Sputnik release.
        case "release":
          result = await release(playlist)
          results.push({ playlist, result })
          break;
      }
    }
    sendReport(results)
  } catch (e) {
    throw e
  }
}

main()
