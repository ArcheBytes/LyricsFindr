# LyricsFindr Backend

<div align="center">

![CI](https://github.com/ArcheBytes/LyricsFindr/actions/workflows/ci.yml/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/ArcheBytes/LyricsFindr/badge.svg?branch=main)](https://coveralls.io/github/ArcheBytes/LyricsFindr?branch=main)
![Node](https://img.shields.io/badge/node-22-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![Express](https://img.shields.io/badge/express-5.x-lightgrey)
![License](https://img.shields.io/badge/license-ISC-yellow)

</div>

REST API for searching songs and lyrics using [lrclib.net](https://lrclib.net).

## Endpoints

- `GET /api/songs/search?q={query}` — Search songs by name
- `GET /api/songs/lyrics?artist={artist}&title={title}` — Get lyrics for a song
- `GET /health` — Server health check

## Documentation

Interactive API documentation available at `http://localhost:3000/api-docs` when running locally.

## Development

This project uses Dev Containers with Podman. Open the project in VS Code and select "Reopen in Container".

```bash
npm run dev    # Start the server in development mode
npm test       # Run tests with coverage
```