const axios = require("axios")
const cherio = require("cherio")
const queryString = require("querystring")

module.exports = {

  // Request albums from new releases.
  // Can be filtered by genre.
  async releaseAlbums (gid, rating = 0) {
    try {
      const url = "https://www.sputnikmusic.com/newreleases.php"
      const options = { params: { t: gid } }
      return await axios.get(url, options)
        .then(response => {
          let albums = []
          const $ = cherio.load(response.data)
          const $rows = $("table.plaincontentbox > tbody > tr > td > table > tbody > tr")
          // @todo Use this later for playlist name token replacement.
          const $title = $rows.eq(0).find("> td:first-child font").text()
          const $content = $rows.eq(1).find("table > tbody > tr > td")
          $content.each((i, elem) => {
            const $elem = $(elem)
            const artist = $elem.find("b").text()
            const album = $elem.find("font font").text()
            const foundRating = $elem.prev("td").text()
            if (artist && album && foundRating >= rating) {
              albums.push({ artist, album })
            }
          })
          return albums
        })
    } catch (e) {
      throw e
    }
  },

  // Request albums from charts.
  // Can be filtered by genre and period.
  async chartAlbums (gid, pid = 2018) {
    try {
      const url = `https://www.sputnikmusic.com/best/albums/${pid}/`
      const data = { "genreid2": gid, "year": pid }
      return await axios.post(url, queryString.stringify(data))
        .then(response => {
          let albums = []
          const $ = cherio.load(response.data)
          albums.albums = []
          $("td.blackbox").each((i, elem) => {
            const $elem = $(elem).find("font")
            const artist = $elem.eq(0).text()
            const album = $elem.eq(1).text()
            if (artist && album) {
              albums.push({ artist, album })
            }
          })
          return albums
        })
    } catch (e) {
      throw e
    }
  }

}
