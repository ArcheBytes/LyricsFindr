import request from 'supertest';
import app from '../index';
import axios from 'axios';
import pool from '../db';

jest.mock('axios');
jest.mock('../db', () => ({
  query: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedQuery = pool.query as jest.Mock;

describe('GET /api/songs/search', () => {
  it('should return 400 if no query param', async () => {
    const res = await request(app).get('/api/songs/search');
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return results for a valid query', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: [{ id: 1, trackName: 'Bohemian Rhapsody', artistName: 'Queen' }]
      })
      .mockResolvedValueOnce({
        data: { results: [{ trackName: 'Bohemian Rhapsody', artistName: 'Queen', artworkUrl100: 'https://example.com/100x100bb.jpg' }] }
      });

    const res = await request(app).get('/api/songs/search?q=bohemian rhapsody');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].artworkUrl).toBeDefined();
  });

  it('should return 500 if external API fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API down'));

    const res = await request(app).get('/api/songs/search?q=bohemian rhapsody');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error fetching songs');
  });
});

describe('GET /api/songs/lyrics/:id', () => {
  it('should return lyrics from cache if available', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{
        lrclib_id: 1,
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        plain_lyrics: 'Is this the real life...'
      }]
    });

    const res = await request(app).get('/api/songs/lyrics/1');
    expect(res.status).toBe(200);
    expect(res.body.plainLyrics).toBeDefined();
  });

  it('should fetch from lrclib and cache if not in db', async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [] })  // cache miss
      .mockResolvedValueOnce({ rows: [] }); // insert

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        trackName: 'Bohemian Rhapsody',
        artistName: 'Queen',
        albumName: 'A Night at the Opera',
        plainLyrics: 'Is this the real life...',
        syncedLyrics: null
      }
    });

    const res = await request(app).get('/api/songs/lyrics/1');
    expect(res.status).toBe(200);
    expect(res.body.plainLyrics).toBeDefined();
  });

  it('should return 500 if external API fails', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });
    mockedAxios.get.mockRejectedValueOnce(new Error('API down'));

    const res = await request(app).get('/api/songs/lyrics/1');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error fetching lyrics');
  });
});

describe('GET /api/songs/search-by-lyrics', () => {
  it('should return 400 if no query param', async () => {
    const res = await request(app).get('/api/songs/search-by-lyrics');
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return matching songs', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ title: 'Bohemian Rhapsody', artist: 'Queen', rank: 0.9 }]
    });

    const res = await request(app).get('/api/songs/search-by-lyrics?q=real life');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return 500 if database fails', async () => {
    mockedQuery.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app).get('/api/songs/search-by-lyrics?q=real life');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error searching by lyrics');
  });
});