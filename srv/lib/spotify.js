const fs = require("fs")
const Spotify = require("spotify-web-api-node")

/**
 * Remove tracks from user playlist.
 *
 * Operation is batched to adhere to rate limits.
 *
 * @param uid Integer - User ID.
 * @param pid Inter - Playlist ID.
 * @param tracks Array<Object> - Tracks
 */
async function removeAllTracksFromPlaylist (uid, pid, tracks) {
  try {
    const spotify = createSpotify()
    // Batch size.
    const limit = 100
    while (tracks.length) {
      const batch = tracks.splice(0, limit)
      // Remove tracks.
      await spotify.removeTracksFromPlaylist(uid, pid, batch)
        .catch(e => console.log(e))
    }
  } catch (e) {
    throw e
  }
}

/**
 * Add tracks to playlist.
 *
 * Operation is batched to adhere to rate limits.
 *
 * @param uid Integer - Used ID.
 * @param pid Integer - Playlist ID.
 * @param tracks Array<Object> - Tracks
 */
async function addAllTracksToPlaylist (uid, pid, tracks) {
  try {
    const spotify = createSpotify()
    // Batch size.
    const limit = 100
    while (tracks.length) {
      const batch = tracks.splice(0, limit)
      // Add tracks.
      await spotify.addTracksToPlaylist(uid, pid, batch)
        .catch(e => console.log(e))
    }
  } catch (e) {
    throw e
  }
}

/**
 * Get tracks from user playlist.
 *
 * Operation is batched to adhere to rate limits.
 *
 * @param uid Integer - User ID.
 * @param pid Integer - Playlist ID.
 */
async function getAllUserPlaylistTracks (uid, pid) {
  try {
    const spotify = createSpotify()
    let tracks = []
    // Batch size.
    const limit = 100
    // Track index.
    let offset = 0
    // Empty tracks guard variable.
    let empty = false
    while (!empty) {
      let options = { limit, offset }
      // Get tracks from playlist.
      const results = await spotify.getPlaylistTracks(uid, pid, options)
        .then(response => response.body.items )
        .catch(e => console.log(e) )
      // Add playlist tracks to tracks.
      if (results && results.length) {
        tracks = tracks.concat(results)
        // Offset track index for next batch.
        offset += 100
      } else {
        empty = true
      }
    }
    return tracks
  } catch (e) {
    throw e
  }
}

/**
 * Get all user playlists.
 *
 * Operation is batched to adhere to rate limits.
 *
 * @param uid Integer - User ID.
 */
async function getAllUserPlaylists (uid) {
  try {
    const spotify = createSpotify()
    let playlists = []
    const limit = 50
    // Playlist index.
    let offset = 0
    // Empty playlist guard variable.
    let empty = false
    while (!empty) {
      let options = { limit, offset }
      // Get user playlists.
      const results = await spotify.getUserPlaylists(uid, options)
        .then(response => response.body.items )
      // Add playlists to results.
      if (results && results.length) {
        playlists = playlists.concat(results)
        // Offset playlist index for next batch.
        offset += 50
      } else {
        empty = true
      }
    }
    return playlists
  } catch (e) {
    throw e
  }
}

/**
 * Search for a user playlist by name.
 *
 * @param uid Integer - User ID.
 * @param name String - Playlist name.
 * @returns Promise - User playlists.
 */
async function searchUserPlaylists (uid, name) {
  try {
    // Search for playlists.
    return await getAllUserPlaylists(uid)
      .then(response => response.filter(playlist =>
        // Convert to lower case for flexible matching.
        name.toLowerCase() === playlist.name.toLowerCase()))
      .catch(e => console.log(e))
  } catch (e) {
    throw e
  }
}

/**
 * Synchronise tracks to playlist.
 *
 * @param playlist Object - Playlist object.
 * @param tracks Array - Track objects.
 */
async function syncPlaylist (playlist, tracks) {
  try {
    const spotify = createSpotify()
    const uid = playlist.user
    const name = playlist.name

    // Search for user playlist.
    const result = await searchUserPlaylists(uid, name)

    // Store playlist ID if available.
    let pid = result[0] ? result[0].id : null

    if (!pid) {
      // Create user playlist if it doesn't exist.
      pid = await spotify.createPlaylist(uid, name)
        .then(response => response.body.id)
        .catch(e => console.log(e))
    }

    // Exit early if playlist couldn't be created.
    if (!pid) return

    // Get all track IDs from user playlist.
    const playlistTracks = await getAllUserPlaylistTracks(uid, pid)
      .then(response => response.map(item => item.track.id))
      .catch(e => console.log(e))

    if (playlistTracks) {
      // Build remove array to store tracks in playlist that are not included
      // within tracks argument.
      const remove = playlistTracks.reduce((items, item) => {
        const index = tracks.indexOf(item)
        if (index < 0) {
          tracks.splice(index, 1)
          items.push({ uri: `spotify:track:${item}` })
        }
        return items
      }, [])

      if (remove) {
        // Remove tracks from playlist.
        await removeAllTracksFromPlaylist(uid, pid, remove)
          .catch(e => console.log(e))
      }
    }

    if (tracks.length) {
      // Build tracks to add that are not present in playlist, so duplicated
      // tracks aren't added.
      const add = tracks.reduce((items, item) => {
        const index = playlistTracks.indexOf(item)
        if (index < 0) items.push(`spotify:track:${item}`)
        return items
      }, [])

      if (add.length) {
        // Add tracks to playlist.
        await addAllTracksToPlaylist(uid, pid, add)
          .catch(e => console.log(e))
      }
    }
  } catch (e) {
    throw e
  }
}

/**
 * Search Spotify API for album tracks.
 *
 * @param album Object - Album object.
 * @returns Promise - Matched album track objects.
 */
async function searchAlbumTracks (album) {
  const spotify = createSpotify()
  try {
    const query = `album:${album.album} artist:${album.artist}`
    return await spotify.searchTracks(query)
      .then(response => {
        let tracks = []
        if (response.body.tracks.items.length) {
          // Build matched album tracks from search results.
          tracks = response.body.tracks.items.filter(track => {
            // Basic artist matching algorithm.
            const matchArtist = track.artists.some(artist =>
              artist.name.toLowerCase()
                .includes(album.artist.toLowerCase()))
            // Basic album matching algorithm
            const matchAlbum = track.album.name.toLowerCase()
              .includes(album.album.toLowerCase())
            return matchArtist && matchAlbum
          })
        }
        return tracks
      })
  } catch (e) {
    throw e
  }
}

/**
 * Create Spotify API object.
 *
 * @todo Read token from relative path?
 */
function createSpotify () {
  // Load token.
  // Token is relative from root directory, as bot is designed to run from root.
  const token = fs.readFileSync(".access.token", "utf8").trim()
  // Create Spotify API object.
  const spotify = new Spotify()
  spotify.setAccessToken(token)
  return spotify
}


module.exports = {
  syncPlaylist,
  searchAlbumTracks
}
