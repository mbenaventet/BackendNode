const request = require('supertest');
const express = require('express');
const redditAPI = require('./redditAPI'); // path to your redditAPI.js file
const { getRedditOAuthToken, getTopPosts, getTopUsers } = require('./redditLogic');

// Mock the external functions
jest.mock('./redditLogic', () => ({
  getRedditOAuthToken: jest.fn(),
  getTopPosts: jest.fn(),
  getTopUsers: jest.fn(),
}));

// Create an instance of the Express app
const app = express();
app.use(redditAPI);

describe('Reddit Routes', () => {
  describe('GET /api/science/top-posts', () => {
    it('should return top posts when the API call is successful', async () => {
      // Mock the functions to return fake data
      getRedditOAuthToken.mockResolvedValue('mockAccessToken');
      getTopPosts.mockResolvedValue({
        children: ['post1', 'post2'],
        rate_limit_remaining: 10,
        rate_limit_reset: 30,
      });

      // Simulate the request
      const response = await request(app).get('/api/science/top-posts');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        children: ['post1', 'post2'],
        rate_limit_remaining: 10,
        rate_limit_reset: 30,
      });
      expect(getRedditOAuthToken).toHaveBeenCalled();
      expect(getTopPosts).toHaveBeenCalledWith('mockAccessToken');
    });

    it('should return a 500 error when fetching top posts fails', async () => {
      // Mock the functions to simulate an error
      getRedditOAuthToken.mockResolvedValue('mockAccessToken');
      getTopPosts.mockRejectedValue(new Error('API request failed'));

      // Simulate the request
      const response = await request(app).get('/api/science/top-posts');

      // Assertions
      expect(response.status).toBe(500);
      expect(response.text).toBe('Internal server error');
    });
  });

  describe('GET /api/science/top-users', () => {
    it('should return top users when the API call is successful', async () => {
      // Mock the functions to return fake data
      getRedditOAuthToken.mockResolvedValue('mockAccessToken');
      getTopUsers.mockResolvedValue([
        { username: 'user1', postCount: 100 },
        { username: 'user2', postCount: 50 },
      ]);

      // Simulate the request
      const response = await request(app).get('/api/science/top-users');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { username: 'user1', postCount: 100 },
        { username: 'user2', postCount: 50 },
      ]);
      expect(getRedditOAuthToken).toHaveBeenCalled();
      expect(getTopUsers).toHaveBeenCalledWith('mockAccessToken');
    });

    it('should return a 500 error when fetching top users fails', async () => {
      // Mock the functions to simulate an error
      getRedditOAuthToken.mockResolvedValue('mockAccessToken');
      getTopUsers.mockRejectedValue(new Error('API request failed'));

      // Simulate the request
      const response = await request(app).get('/api/science/top-users');

      // Assertions
      expect(response.status).toBe(500);
      expect(response.text).toBe('Internal server error');
    });
  });
});
