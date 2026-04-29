# LyricsFindr Backend

![CI](https://github.com/ArcheBytes/LyricsFindr/actions/workflows/ci.yml/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/ArcheBytes/LyricsFindr/badge.svg?branch=main)](https://coveralls.io/github/ArcheBytes/LyricsFindr?branch=main)

API REST para buscar canciones y letras usando [lrclib.net](https://lrclib.net).

## Endpoints

- `GET /api/songs/search?q={query}` — Busca canciones por nombre
- `GET /api/songs/lyrics?artist={artist}&title={title}` — Obtiene la letra de una canción
- `GET /health` — Estado del servidor

## Desarrollo

Este proyecto usa Dev Containers con Podman. Abre el proyecto en VS Code y selecciona "Reopen in Container".

\`\`\`bash
npm run dev    # Arranca el servidor en modo desarrollo
npm test       # Ejecuta los tests con cobertura
\`\`\`
