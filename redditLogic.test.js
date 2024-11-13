const axios = require('axios');
const { getRedditOAuthToken, getTopPosts, getTopUsers } = require('./redditLogic'); // Adjust as necessary
jest.mock('axios');

describe('Reddit API Functions', () => {
  const mockAccessToken = 'mockAccessToken';
  const mockTopPostsData = {
    data: {
      children: [
        { data: { author: 'user1', title: 'Post 1' } },
        { data: { author: 'user2', title: 'Post 2' } },
        { data: { author: 'user1', title: 'Post 3' } },
      ],
    },
  };

  beforeAll(() => {
    process.env.REDDIT_CLIENT_ID = 'testClientId';
    process.env.REDDIT_CLIENT_SECRET = 'testClientSecret';
    process.env.REDDIT_OAUTH_URL = 'https://www.reddit.com/api/v1/access_token';
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    delete process.env.REDDIT_CLIENT_ID;
    delete process.env.REDDIT_CLIENT_SECRET;
    delete process.env.REDDIT_OAUTH_URL;
    delete process.env.NODE_ENV;
  });

  describe('getRedditOAuthToken', () => {
    it('should return an OAuth token on success', async () => {
      axios.post.mockResolvedValue({ data: { access_token: mockAccessToken } });

      const token = await getRedditOAuthToken();
      expect(token).toBe(mockAccessToken);
    });

    it('should throw an error if the OAuth request fails', async () => {
      axios.post.mockRejectedValue(new Error('OAuth request failed'));

      await expect(getRedditOAuthToken()).rejects.toThrow('OAuth request failed');
    });
  });

describe('getTopPosts', () => {
    it('should return top posts when accessToken is valid', async () => {
        axios.get.mockResolvedValue({
            headers: { 'x-ratelimit-remaining': 10, 'x-ratelimit-reset': 60 },
            data: {
                data: {
                    children: [
                        { kind: 't3', data: { id: 'abc123', title: 'Post 1', author: 'user1' } },
                        { kind: 't3', data: { id: 'def456', title: 'Post 2', author: 'user2' } }
                    ]
                }
            }
        });
    
        const result = await getTopPosts('validAccessToken');
    
        expect(result).toEqual([
            { kind: 't3', data: { id: 'abc123', title: 'Post 1', author: 'user1' } },
            { kind: 't3', data: { id: 'def456', title: 'Post 2', author: 'user2' } }
        ]);
    });

    it('should throw an error if the request for top posts fails', async () => {
        // Mock axios.get to return an unexpected response structure
        axios.get.mockResolvedValueOnce({
            headers: {
                'x-ratelimit-remaining': 10,
                'x-ratelimit-reset': 60,
            },
            data: {
                data: null,  // Simulate missing 'children' property
            }
        });
    
        // Expect the function to throw an error with the updated message
        await expect(getTopPosts('mockAccessToken')).rejects.toThrow("Unexpected response structure: 'children' data missing");
    });
      
});

  describe('getTopUsers', () => {
    it('should return users sorted by post count', async () => {
        axios.get.mockResolvedValueOnce({
            headers: {
                'x-ratelimit-remaining': 10,  // Mock rate limit remaining
                'x-ratelimit-reset': 60       // Mock rate limit reset time
            },
            data: {
                data: {
                    children: [
                        { data: { author: 'user1', title: 'Post 1' } },
                        { data: { author: 'user2', title: 'Post 2' } },
                        { data: { author: 'user1', title: 'Post 3' } },
                        { data: { author: 'user3', title: 'Post 4' } },
                        { data: { author: 'user2', title: 'Post 5' } },
                        { data: { author: 'user1', title: 'Post 6' } }
                    ]
                }
            }
        });
    
        const topUsers = await getTopUsers('mockAccessToken');
        
        expect(topUsers).toEqual([
            { user: 'user1', count: 3 },
            { user: 'user2', count: 2 },
            { user: 'user3', count: 1 }
        ]);
    });

    it('should throw an error if fetching top users fails', async () => {
      axios.get.mockRejectedValue(new Error('Failed to fetch top posts'));

      await expect(getTopUsers(mockAccessToken)).rejects.toThrow('Failed to fetch top posts');
    });
  });
});
