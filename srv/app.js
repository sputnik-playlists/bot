const fs = require("fs")
const spotifyApi = require("spotify-web-api-node")
const sputnik = require("./lib/sputnik")

const token = fs.readFileSync(".access.token", "utf8").trim()
const spotify = new spotifyApi()
spotify.setAccessToken(token)

async function removeAllTracksFromPlaylist (uid, pid, tracks) {
  try {
    const limit = 100
    while (tracks.length) {
      const remove = tracks.splice(0, limit)
      await spotify.removeTracksFromPlaylist(uid, pid, remove)
        .catch(e => {
          console.log(e)
        })
    }
  } catch (e) {
    throw e
  }
}

async function addAllTracksToPlaylist (uid, pid, tracks) {
  try {
    const limit = 100
    while (tracks.length) {
      const add = tracks.splice(0, limit)
      await spotify.addTracksToPlaylist(uid, pid, add)
        .catch(e => {
          console.log(e)
        })
    }
  } catch (e) {
    throw e
  }
}

async function getAllUserPlaylistTracks (uid, pid) {
  try {
    let tracks = []
    const limit = 100
    let offset = 0
    let empty = false
    while (!empty) {
      let options = { limit, offset }
      const results = await spotify.getPlaylistTracks(uid, pid, options)
        .then(response => response.body.items )
        .catch(e => {
          console.log(e)
        })
      if (results && results.length) {
        tracks = tracks.concat(results)
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

async function getAllUserPlaylists (uid) {
  try {
    let playlists = []
    const limit = 50
    let offset = 0
    let empty = false
    while (!empty) {
      let options = { limit, offset }
      const results = await spotify.getUserPlaylists(uid, options)
        .then(response => response.body.items )
      if (results && results.length) {
        playlists = playlists.concat(results)
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

async function searchUserPlaylists (uid, name) {
  try {
    return await getAllUserPlaylists(uid)
      .then(response => response.filter(playlist => name.toLowerCase() === playlist.name.toLowerCase()))
      .catch(e => {
        console.log(e)
      })
  } catch (e) {
    throw e
  }
}

async function syncPlaylist (playlist, tracks) {
  try {
    const uid = playlist.user
    const name = playlist.name
    const result = await searchUserPlaylists(uid, name)
    let pid = result[0] ? result[0].id : null

    if (!pid) {
      pid = await spotify.createPlaylist(uid, name)
        .then(response => response.body.id)
        .catch(e => {
          console.log(e)
        })
    }

    if (!pid) return

    const playlistTracks = await getAllUserPlaylistTracks(uid, pid)
      .then(response => response.map(item => item.track.id))
      .catch(e => {
        console.log(e)
      })

    if (playlistTracks) {
      const remove = playlistTracks.reduce((items, item) => {
        const index = tracks.indexOf(item)
        if (index < 0) {
          tracks.splice(index, 1)
          items.push({ uri: `spotify:track:${item}` })
        }
        return items
      }, [])

      if (remove) {
        await removeAllTracksFromPlaylist(uid, pid, remove)
          .catch(e => {
            console.log(e)
          })
      }
    }

    if (tracks.length) {
      const add = tracks.reduce((items, item) => {
        const index = playlistTracks.indexOf(item)
        if (index < 0) {
          items.push(`spotify:track:${item}`)
        }
        return items
      }, [])

      if (add.length) {
        await addAllTracksToPlaylist(uid, pid, add)
          .catch(e => {
            console.log(e)
          })
      }
    }
  } catch (e) {
    throw e
  }
}

async function searchAlbumTracks (album) {
  try {
    return await spotify.searchTracks(`album:${album.album} artist:${album.artist}`)
      .then(response => {
        let tracks = []
        if (response.body.tracks.items.length) {
          tracks = response.body.tracks.items.filter(track => {
            const matchArtist = track.artists.some(artist => artist.name.toLowerCase().includes(album.artist.toLowerCase()))
            const matchAlbum = track.album.name.toLowerCase().includes(album.album.toLowerCase())
            return matchArtist && matchAlbum
          })
        }
        return tracks
      })
  } catch (e) {
    throw e
  }
}

async function release (playlist) {
  try {
    let tracks = [];
    const albums = await sputnik.releaseAlbums(playlist.gid, playlist.rating)
    for (album of albums) {
      const results = await searchAlbumTracks(album)
        .then(response => {
          if (response) return response.map(item => item.id)
        })
        .catch(e => {
          console.log(e)
        })
      if (results && results.length) tracks = tracks.concat(results)
    }
    if (tracks.length) {
      await syncPlaylist(playlist, tracks)
        .catch(e => {
          console.log(e)
        })
    }
  } catch (e) {
    throw e
  }
}

async function chart (playlist) {
  try {
    let tracks = [];
    const albums = await sputnik.chartAlbums(playlist.gid, playlist.pid)
    for (album of albums) {
      const results = await searchAlbumTracks(album)
        .then(response => {
          if (response) return response.map(item => item.id)
        })
        .catch(e => {
          console.log(e)
        })
      if (results && results.length) tracks = tracks.concat(results)
    }
    if (tracks.length) {
      await syncPlaylist(playlist, tracks)
        .catch(e => {
          console.log(e)
        })
    }
  } catch (e) {
    throw e
  }
}

async function main () {
  try {
    const playlists = require("./playlists.json")
    for (playlist of playlists) {
      switch (playlist.type) {
        case "chart":
          await chart(playlist)
          break;
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
