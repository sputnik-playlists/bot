# Sputnik Music Spotify Playlists

Generate Spotify playlists based on Sputnik Music charts and new releases.

# Usage

## 1.

Create a Spotify app - https://developer.spotify.com
## 2.

Rename `docker-compose.override.example.yml` to `docker-compose.override.yml`
and add `CLIENT_ID`, `CLIENT_SECRET` and `CALLBACK` values.

## 3.

Create and follow an authorisation URL:

```
docker-compose run --rm node node auth.js
```

## 4.

Generate a token:

```
docker-compose run --rm node node token.js
```

You can regenerate expired tokens:

```
docker-compose run --rm node node refresh.js
```

## 4.

Configure `playlists.json`. See configuration documentation below.

## 5.

Run the application:

```
docker-compose run --rm node node app.js
```

# Playlist Configuration

Playlists are structered within an array of playlist objects.

## `name`

Name of the playlist. Simples.

## `user`

Your Spotify username.

## `gid`

Genre ID from Sputnik Music. You can find the `gid` of a genre by viewing the
source HTML of the genre select form element.

## `pid`

Period ID from Sputnik Music for `chart` collections. You can find the `pid` of
a `chart` collection by viewing the source HTML of the period (date) select
form element.

## `type`

Playlist types are broken into either a `release` or a `chart`. A `release`
represents a "new release" collection. A `chart` represents a "chart"
collection.

## `rating`

Optionally specify a rating for album selection. An album that is lower than the
specified rating will not be included in the Spotify playlist.

# Notes

- Playlists will be automatically created if they don't exist
- Tracks will be removed from playlists if they aren't included in scrape
