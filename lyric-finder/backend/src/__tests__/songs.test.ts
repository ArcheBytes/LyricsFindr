import request from 'supertest';
import app from '../index';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GET /api/songs/search', () => {
  it('should return 400 if no query param', async () => {
    const res = await request(app).get('/api/songs/search');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Param "q" is required');
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
    expect(res.body.error).toBe('Params "artist" and "title" are required');
  });

  it('should return 400 if title param is missing', async () => {
    const res = await request(app).get('/api/songs/lyrics?artist=Queen');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Params "artist" and "title" are required');
  });

  it('should return lyrics for valid params', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        trackName: 'Bohemian Rhapsody',
        artistName: 'Queen',
        plainLyrics: 'Is this the real life...'
      }
    });

    const res = await request(app).get('/api/songs/lyrics?artist=Queen&title=Bohemian Rhapsody');
    expect(res.status).toBe(200);
    expect(res.body.plainLyrics).toBeDefined();
  });

  it('should return 500 if external API fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API down'));

    const res = await request(app).get('/api/songs/lyrics?artist=Queen&title=Bohemian Rhapsody');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error fetching lyrics');
  });
});