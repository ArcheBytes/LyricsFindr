import request from 'supertest';
import app from '../index';
import axios from 'axios';
import pool from '../db';

jest.mock('axios');
jest.mock('../db', () => ({
  query: jest.fn()
}));

const mockedQuery = pool.query as jest.Mock;
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GET /api/songs/search', () => {
  it('should return 400 if no query param', async () => {
    const res = await request(app).get('/api/songs/search');
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return results for a valid query', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ id: 1, trackName: 'Bohemian Rhapsody', artistName: 'Queen' }]
    });

    const res = await request(app).get('/api/songs/search?q=bohemian rhapsody');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return 500 if external API fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API down'));

    const res = await request(app).get('/api/songs/search?q=bohemian rhapsody');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error fetching songs');
  });
});

describe('GET /api/songs/lyrics', () => {
  it('should return 400 if artist param is missing', async () => {
    const res = await request(app).get('/api/songs/lyrics?title=Bohemian Rhapsody');
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 if title param is missing', async () => {
    const res = await request(app).get('/api/songs/lyrics?artist=Queen');
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return lyrics from cache if available', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        plain_lyrics: 'Is this the real life...'
      }]
    } as any);

    const res = await request(app).get('/api/songs/lyrics?artist=Queen&title=Bohemian Rhapsody');
    expect(res.status).toBe(200);
    expect(res.body.plain_lyrics).toBeDefined();
  });

  it('should fetch from lrclib and cache if not in db', async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [] } as any)  // cache miss
      .mockResolvedValueOnce({ rows: [] } as any); // insert

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        trackName: 'Bohemian Rhapsody',
        artistName: 'Queen',
        albumName: 'A Night at the Opera',
        plainLyrics: 'Is this the real life...',
        syncedLyrics: null
      }
    });

    const res = await request(app).get('/api/songs/lyrics?artist=Queen&title=Bohemian Rhapsody');
    expect(res.status).toBe(200);
    expect(res.body.plainLyrics).toBeDefined();
  });

  it('should return 500 if external API fails', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as any);
    mockedAxios.get.mockRejectedValueOnce(new Error('API down'));

    const res = await request(app).get('/api/songs/lyrics?artist=Queen&title=Bohemian Rhapsody');
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
    } as any);

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