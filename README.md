# Sputnik Music Spotify Playlists

Generate Spotify playlists based on Sputnik Music charts and new releases.

# Usage

## 1.

Create a Spotify app - https://developer.spotify.com

You must also specify a valid Redirect URI in your app settings to:

```
http://localhost:8080/success
```

## 2.

Rename `docker-compose.override.example.yml` to `docker-compose.override.yml`
and add `CLIENT_ID`, `CLIENT_SECRET` and `CALLBACK` values.

eg:

```
CLIENT_ID=123456789abcdefghijklmnophijklmn
CLIENT_SECRET=123456789abcdefghijklmnophijklmn
CALLBACK=http://localhost:8080/success
```

## 3.

Install dependencies:

```
docker-compose run --rm node yarn install
```

## 4.

Authorise your app. First, start the auth server.

```
docker-compose up -d
```

1. Browse to `http://localhost:8080`, follow the provided link.
2. Authorise the app
3. You should be redirected to a success message.

## 5.

Generate a token:

```
docker-compose run --rm node node token.js
```

You can regenerate expired tokens:

```
docker-compose run --rm node node refresh.js
```

## 6.

Configure `playlists.json`. See configuration documentation below.

## 7.

Run the bot:

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

## Mailgun Support

You can send reports via [Mailgun](https://www.mailgun.com) after the
bot has run.

Configure the following in `config.json`:

```
{
  "mail": {
    "enable": true,
    "apiKey": "<api-key>",
    "domain": "<domain>",
    "from": "<from>",
    "to": "<to>",
    "subject": "<to>"
  }
}
```

# Notes

- Playlists will be automatically created if they don't exist
- Tracks will be removed from playlists if they aren't included in scrape

## Genre ID's

21 - Alternative Rock
58 - Electronic
4 - Hip-Hop
7 - Jazz
1 - Metal
14 - Pop
3 - Punk
30 - Rock
33 - Ambient
29 - Americana
47 - Black Metal
24 - Bluegrass
20 - Blues
96 - Breaks
31 - Britpop
17 - Classical
25 - Country
11 - Death Metal
34 - Doom Metal
63 - Downtempo
36 - Dream Pop
37 - Drone
32 - Drum and Bass
5 - Dubstep
16 - Emo
43 - Experimental
10 - Folk
41 - Folk Punk
8 - Funk
64 - Garage
86 - Gothic
48 - Grime
61 - Grind
22 - Grunge
95 - Hard Rock
55 - Hardcore
82 - Heavy Metal
62 - House
74 - IDM
42 - Indie Folk
2 - Indie Pop
49 - Indie Rock
56 - Industrial
19 - Jam Rock
97 - Jazz Fusion
27 - Lo-fi
93 - Math Rock
173 - Melodic Death Metal
26 - Metalcore
13 - Minimal
181 - New Age
98 - Noise Rock
28 - Nu-metal
12 - Pop Punk
54 - Pop Rock
59 - Post Hardcore
38 - Post Metal
52 - Post Punk
6 - Post Rock
40 - Power Metal
15 - Progressive Metal
23 - Progressive Rock
18 - Psychedelic
84 - R&B
51 - Reggae
35 - Shoegaze
57 - Ska
66 - Sludge Metal
53 - Soul
50 - Soundtrack
65 - Stoner Rock
67 - Techno
39 - Thrash Metal
68 - Trance
60 - Trip Hop

# Todo

- Replace username config with environment variable
- Refresh token after each sync?
